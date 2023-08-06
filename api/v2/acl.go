package v2

import (
	"context"
	"net/http"
	"strings"

	"github.com/boojack/slash/api/auth"
	"github.com/boojack/slash/internal/util"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
	"github.com/golang-jwt/jwt/v4"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

var authenticationAllowlistMethods = map[string]bool{
	"/memos.api.v2.UserService/GetUser": true,
}

// IsAuthenticationAllowed returns whether the method is exempted from authentication.
func IsAuthenticationAllowed(fullMethodName string) bool {
	if strings.HasPrefix(fullMethodName, "/grpc.reflection") {
		return true
	}
	return authenticationAllowlistMethods[fullMethodName]
}

// ContextKey is the key type of context value.
type ContextKey int

const (
	// The key name used to store user id in the context
	// user id is extracted from the jwt token subject field.
	UserIDContextKey ContextKey = iota
)

type claimsMessage struct {
	Name string `json:"name"`
	jwt.RegisteredClaims
}

// GRPCAuthInterceptor is the auth interceptor for gRPC server.
type GRPCAuthInterceptor struct {
	Store  *store.Store
	secret string
}

// NewGRPCAuthInterceptor returns a new API auth interceptor.
func NewGRPCAuthInterceptor(store *store.Store, secret string) *GRPCAuthInterceptor {
	return &GRPCAuthInterceptor{
		Store:  store,
		secret: secret,
	}
}

// AuthenticationInterceptor is the unary interceptor for gRPC API.
func (in *GRPCAuthInterceptor) AuthenticationInterceptor(ctx context.Context, request any, serverInfo *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "failed to parse metadata from incoming context")
	}
	accessToken, err := getTokenFromMetadata(md)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, err.Error())
	}

	userID, err := in.authenticate(ctx, accessToken)
	if err != nil {
		if IsAuthenticationAllowed(serverInfo.FullMethod) {
			return handler(ctx, request)
		}
		return nil, err
	}

	accessTokens, err := in.Store.GetUserAccessTokens(ctx, userID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get user access tokens")
	}
	if !validateAccessToken(accessToken, accessTokens) {
		return nil, status.Errorf(codes.Unauthenticated, "invalid access token")
	}

	// Stores userID into context.
	childCtx := context.WithValue(ctx, UserIDContextKey, userID)
	return handler(childCtx, request)
}

func (in *GRPCAuthInterceptor) authenticate(ctx context.Context, accessTokenStr string) (int32, error) {
	if accessTokenStr == "" {
		return 0, status.Errorf(codes.Unauthenticated, "access token not found")
	}
	claims := &claimsMessage{}
	_, err := jwt.ParseWithClaims(accessTokenStr, claims, func(t *jwt.Token) (any, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Name {
			return nil, status.Errorf(codes.Unauthenticated, "unexpected access token signing method=%v, expect %v", t.Header["alg"], jwt.SigningMethodHS256)
		}
		if kid, ok := t.Header["kid"].(string); ok {
			if kid == "v1" {
				return []byte(in.secret), nil
			}
		}
		return nil, status.Errorf(codes.Unauthenticated, "unexpected access token kid=%v", t.Header["kid"])
	})
	if err != nil {
		return 0, status.Errorf(codes.Unauthenticated, "Invalid or expired access token")
	}
	if !audienceContains(claims.Audience, auth.AccessTokenAudienceName) {
		return 0, status.Errorf(codes.Unauthenticated,
			"invalid access token, audience mismatch, got %q, expected %q. you may send request to the wrong environment",
			claims.Audience,
			auth.AccessTokenAudienceName,
		)
	}

	userID, err := util.ConvertStringToInt32(claims.Subject)
	if err != nil {
		return 0, status.Errorf(codes.Unauthenticated, "malformed ID %q in the access token", claims.Subject)
	}
	user, err := in.Store.GetUser(ctx, &store.FindUser{
		ID: &userID,
	})
	if err != nil {
		return 0, status.Errorf(codes.Unauthenticated, "failed to find user ID %q in the access token", userID)
	}
	if user == nil {
		return 0, status.Errorf(codes.Unauthenticated, "user ID %q not exists in the access token", userID)
	}
	if user.RowStatus == store.Archived {
		return 0, status.Errorf(codes.Unauthenticated, "user ID %q has been deactivated by administrators", userID)
	}

	return userID, nil
}

func getTokenFromMetadata(md metadata.MD) (string, error) {
	authorizationHeaders := md.Get("Authorization")
	if len(md.Get("Authorization")) > 0 {
		authHeaderParts := strings.Fields(authorizationHeaders[0])
		if len(authHeaderParts) != 2 || strings.ToLower(authHeaderParts[0]) != "bearer" {
			return "", errors.Errorf("authorization header format must be Bearer {token}")
		}
		return authHeaderParts[1], nil
	}
	// check the HTTP cookie
	var accessToken string
	for _, t := range append(md.Get("grpcgateway-cookie"), md.Get("cookie")...) {
		header := http.Header{}
		header.Add("Cookie", t)
		request := http.Request{Header: header}
		if v, _ := request.Cookie(auth.AccessTokenCookieName); v != nil {
			accessToken = v.Value
		}
	}
	return accessToken, nil
}

func audienceContains(audience jwt.ClaimStrings, token string) bool {
	for _, v := range audience {
		if v == token {
			return true
		}
	}
	return false
}

func validateAccessToken(accessTokenString string, userAccessTokens []*storepb.AccessTokensUserSetting_AccessToken) bool {
	for _, userAccessToken := range userAccessTokens {
		if accessTokenString == userAccessToken.AccessToken {
			return true
		}
	}
	return false
}
