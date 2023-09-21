package v2

import "strings"

var allowedMethodsWhenUnauthorized = map[string]bool{
	"/slash.api.v2.WorkspaceService/GetWorkspaceProfile": true,
}

// isUnauthorizeAllowedMethod returns true if the method is allowed to be called when the user is not authorized.
func isUnauthorizeAllowedMethod(methodName string) bool {
	if strings.HasPrefix(methodName, "/grpc.reflection") {
		return true
	}
	return allowedMethodsWhenUnauthorized[methodName]
}

var allowedMethodsOnlyForAdmin = map[string]bool{
	"/slash.api.v2.UserService/CreateUser":                  true,
	"/slash.api.v2.UserService/DeleteUser":                  true,
	"/slash.api.v2.WorkspaceService/UpdateWorkspaceSetting": true,
}

// isOnlyForAdminAllowedMethod returns true if the method is allowed to be called only by admin.
func isOnlyForAdminAllowedMethod(methodName string) bool {
	return allowedMethodsOnlyForAdmin[methodName]
}
