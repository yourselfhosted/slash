package v1

import "strings"

var allowedMethodsWhenUnauthorized = map[string]bool{
	"/slash.api.v1.WorkspaceService/GetWorkspaceProfile":  true,
	"/slash.api.v1.WorkspaceService/GetWorkspaceSetting":  true,
	"/slash.api.v1.AuthService/GetAuthStatus":             true,
	"/slash.api.v1.AuthService/SignIn":                    true,
	"/slash.api.v1.AuthService/SignInWithSSO":             true,
	"/slash.api.v1.AuthService/SignUp":                    true,
	"/slash.api.v1.AuthService/SignOut":                   true,
	"/slash.api.v1.ShortcutService/GetShortcut":           true,
	"/slash.api.v1.ShortcutService/GetShortcutByName":     true,
	"/slash.api.v1.CollectionService/GetCollectionByName": true,
}

// isUnauthorizeAllowedMethod returns true if the method is allowed to be called when the user is not authorized.
func isUnauthorizeAllowedMethod(methodName string) bool {
	if strings.HasPrefix(methodName, "/grpc.reflection") {
		return true
	}
	return allowedMethodsWhenUnauthorized[methodName]
}

var allowedMethodsOnlyForAdmin = map[string]bool{
	"/slash.api.v1.UserService/CreateUser":                  true,
	"/slash.api.v1.UserService/DeleteUser":                  true,
	"/slash.api.v1.WorkspaceService/UpdateWorkspaceSetting": true,
	"/slash.api.v1.SubscriptionService/UpdateSubscription":  true,
}

// isOnlyForAdminAllowedMethod returns true if the method is allowed to be called only by admin.
func isOnlyForAdminAllowedMethod(methodName string) bool {
	return allowedMethodsOnlyForAdmin[methodName]
}
