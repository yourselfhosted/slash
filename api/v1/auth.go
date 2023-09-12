package v1

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/boojack/slash/api/auth"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignUpRequest struct {
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (s *APIV1Service) registerAuthRoutes(g *echo.Group, secret string) {
	g.POST("/auth/signin", func(c echo.Context) error {
		ctx := c.Request().Context()
		signin := &SignInRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(signin); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("malformatted signin request, err: %s", err))
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			Email: &signin.Email,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find user by email %s", signin.Email)).SetInternal(err)
		}
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("user not found with email %s", signin.Email))
		} else if user.RowStatus == store.Archived {
			return echo.NewHTTPError(http.StatusForbidden, fmt.Sprintf("user has been archived with email %s", signin.Email))
		}

		// Compare the stored hashed password, with the hashed version of the password that was received.
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(signin.Password)); err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "unmatched email and password")
		}

		accessToken, err := auth.GenerateAccessToken(user.Email, user.ID, time.Now().Add(auth.AccessTokenDuration), secret)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to generate tokens, err: %s", err)).SetInternal(err)
		}
		if err := s.UpsertAccessTokenToStore(ctx, user, accessToken); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to upsert access token, err: %s", err)).SetInternal(err)
		}

		cookieExp := time.Now().Add(auth.CookieExpDuration)
		setTokenCookie(c, auth.AccessTokenCookieName, accessToken, cookieExp)
		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.POST("/auth/signup", func(c echo.Context) error {
		ctx := c.Request().Context()
		enableSignUpSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSAPCE_SETTING_ENABLE_SIGNUP,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to get workspace setting, err: %s", err)).SetInternal(err)
		}
		if enableSignUpSetting != nil && !enableSignUpSetting.GetEnableSignup() {
			return echo.NewHTTPError(http.StatusForbidden, "sign up has been disabled")
		}

		signup := &SignUpRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(signup); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("malformatted signup request, err: %s", err)).SetInternal(err)
		}

		passwordHash, err := bcrypt.GenerateFromPassword([]byte(signup.Password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate password hash").SetInternal(err)
		}

		create := &store.User{
			Email:        signup.Email,
			Nickname:     signup.Nickname,
			PasswordHash: string(passwordHash),
		}
		existingUsers, err := s.Store.ListUsers(ctx, &store.FindUser{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find existing users, err: %s", err)).SetInternal(err)
		}
		// The first user to sign up is an admin by default.
		if len(existingUsers) == 0 {
			create.Role = store.RoleAdmin
		} else {
			create.Role = store.RoleUser
		}

		user, err := s.Store.CreateUser(ctx, create)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to create user, err: %s", err)).SetInternal(err)
		}

		accessToken, err := auth.GenerateAccessToken(user.Email, user.ID, time.Now().Add(auth.AccessTokenDuration), secret)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to generate tokens, err: %s", err)).SetInternal(err)
		}
		if err := s.UpsertAccessTokenToStore(ctx, user, accessToken); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to upsert access token, err: %s", err)).SetInternal(err)
		}

		cookieExp := time.Now().Add(auth.CookieExpDuration)
		setTokenCookie(c, auth.AccessTokenCookieName, accessToken, cookieExp)
		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.POST("/auth/logout", func(c echo.Context) error {
		RemoveTokensAndCookies(c)
		c.Response().WriteHeader(http.StatusOK)
		return nil
	})
}

func (s *APIV1Service) UpsertAccessTokenToStore(ctx context.Context, user *store.User, accessToken string) error {
	userAccessTokens, err := s.Store.GetUserAccessTokens(ctx, user.ID)
	if err != nil {
		return errors.Wrap(err, "failed to get user access tokens")
	}
	userAccessToken := storepb.AccessTokensUserSetting_AccessToken{
		AccessToken: accessToken,
		Description: "Account sign in",
	}
	userAccessTokens = append(userAccessTokens, &userAccessToken)
	if _, err := s.Store.UpsertUserSetting(ctx, &storepb.UserSetting{
		UserId: user.ID,
		Key:    storepb.UserSettingKey_USER_SETTING_ACCESS_TOKENS,
		Value: &storepb.UserSetting_AccessTokens{
			AccessTokens: &storepb.AccessTokensUserSetting{
				AccessTokens: userAccessTokens,
			},
		},
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to upsert user setting, err: %s", err)).SetInternal(err)
	}
	return nil
}

// RemoveTokensAndCookies removes the jwt token from the cookies.
func RemoveTokensAndCookies(c echo.Context) {
	cookieExp := time.Now().Add(-1 * time.Hour)
	setTokenCookie(c, auth.AccessTokenCookieName, "", cookieExp)
}

// setTokenCookie sets the token to the cookie.
func setTokenCookie(c echo.Context, name, token string, expiration time.Time) {
	cookie := new(http.Cookie)
	cookie.Name = name
	cookie.Value = token
	cookie.Expires = expiration
	cookie.Path = "/"
	// Http-only helps mitigate the risk of client side script accessing the protected cookie.
	cookie.HttpOnly = true
	cookie.SameSite = http.SameSiteStrictMode
	c.SetCookie(cookie)
}
