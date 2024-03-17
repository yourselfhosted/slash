# api/v1/common.proto
## Version: version not set

---
## AuthService

### /api/v1/auth/signin

#### POST
##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| email | query |  | No | string |
| password | query |  | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1SignInResponse](#v1signinresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/auth/signout

#### POST
##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1SignOutResponse](#v1signoutresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/auth/signup

#### POST
##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| email | query |  | No | string |
| nickname | query |  | No | string |
| password | query |  | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1SignUpResponse](#v1signupresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/auth/status

#### POST
##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetAuthStatusResponse](#v1getauthstatusresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

---
## CollectionService

### /api/v1/collections

#### GET
##### Summary

ListCollections returns a list of collections.

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1ListCollectionsResponse](#v1listcollectionsresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### POST
##### Summary

CreateCollection creates a collection.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| collection | body |  | Yes | [apiv1Collection](#apiv1collection) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1CreateCollectionResponse](#v1createcollectionresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/collections/{collection.id}

#### PUT
##### Summary

UpdateCollection updates a collection.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| collection.id | path |  | Yes | integer |
| collection | body |  | Yes | { **"creatorId"**: integer, **"createdTime"**: dateTime, **"updatedTime"**: dateTime, **"name"**: string, **"title"**: string, **"description"**: string, **"shortcutIds"**: [ integer ], **"visibility"**: [apiv1Visibility](#apiv1visibility) } |
| updateMask | query |  | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1UpdateCollectionResponse](#v1updatecollectionresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/collections/{id}

#### GET
##### Summary

GetCollection returns a collection by id.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetCollectionResponse](#v1getcollectionresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### DELETE
##### Summary

DeleteCollection deletes a collection by id.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1DeleteCollectionResponse](#v1deletecollectionresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

---
## ShortcutService

### /api/v1/shortcuts

#### GET
##### Summary

ListShortcuts returns a list of shortcuts.

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1ListShortcutsResponse](#v1listshortcutsresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### POST
##### Summary

CreateShortcut creates a shortcut.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| shortcut | body |  | Yes | [apiv1Shortcut](#apiv1shortcut) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1CreateShortcutResponse](#v1createshortcutresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/shortcuts/{id}

#### GET
##### Summary

GetShortcut returns a shortcut by id.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetShortcutResponse](#v1getshortcutresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### DELETE
##### Summary

DeleteShortcut deletes a shortcut by name.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1DeleteShortcutResponse](#v1deleteshortcutresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/shortcuts/{id}/analytics

#### GET
##### Summary

GetShortcutAnalytics returns the analytics for a shortcut.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetShortcutAnalyticsResponse](#v1getshortcutanalyticsresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/shortcuts/{shortcut.id}

#### PUT
##### Summary

UpdateShortcut updates a shortcut.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| shortcut.id | path |  | Yes | integer |
| shortcut | body |  | Yes | { **"creatorId"**: integer, **"createdTime"**: dateTime, **"updatedTime"**: dateTime, **"rowStatus"**: [apiv1RowStatus](#apiv1rowstatus), **"name"**: string, **"link"**: string, **"title"**: string, **"tags"**: [ string ], **"description"**: string, **"visibility"**: [apiv1Visibility](#apiv1visibility), **"viewCount"**: integer, **"ogMetadata"**: [apiv1OpenGraphMetadata](#apiv1opengraphmetadata) } |
| updateMask | query |  | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1UpdateShortcutResponse](#v1updateshortcutresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

---
## UserService

### /api/v1/users

#### GET
##### Summary

ListUsers returns a list of users.

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1ListUsersResponse](#v1listusersresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### POST
##### Summary

CreateUser creates a new user.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| user | body |  | Yes | [v1User](#v1user) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1CreateUserResponse](#v1createuserresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/users/{id}

#### GET
##### Summary

GetUser returns a user by id.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetUserResponse](#v1getuserresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### DELETE
##### Summary

DeleteUser deletes a user by id.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path |  | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1DeleteUserResponse](#v1deleteuserresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/users/{id}/access_tokens

#### GET
##### Summary

ListUserAccessTokens returns a list of access tokens for a user.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path | id is the user id. | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1ListUserAccessTokensResponse](#v1listuseraccesstokensresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### POST
##### Summary

CreateUserAccessToken creates a new access token for a user.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path | id is the user id. | Yes | integer |
| body | body |  | Yes | [UserServiceCreateUserAccessTokenBody](#userservicecreateuseraccesstokenbody) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1CreateUserAccessTokenResponse](#v1createuseraccesstokenresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/users/{id}/access_tokens/{accessToken}

#### DELETE
##### Summary

DeleteUserAccessToken deletes an access token for a user.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path | id is the user id. | Yes | integer |
| accessToken | path | access_token is the access token to delete. | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1DeleteUserAccessTokenResponse](#v1deleteuseraccesstokenresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/users/{user.id}

#### PATCH
##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| user.id | path |  | Yes | integer |
| user | body |  | Yes | { **"rowStatus"**: [apiv1RowStatus](#apiv1rowstatus), **"createdTime"**: dateTime, **"updatedTime"**: dateTime, **"role"**: [v1Role](#v1role), **"email"**: string, **"nickname"**: string, **"password"**: string } |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1UpdateUserResponse](#v1updateuserresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

---
## UserSettingService

### /api/v1/users/{id}/settings

#### GET
##### Summary

GetUserSetting returns the user setting.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path | id is the user id. | Yes | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetUserSettingResponse](#v1getusersettingresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### PATCH
##### Summary

UpdateUserSetting updates the user setting.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| id | path | id is the user id. | Yes | integer |
| userSetting | body | user_setting is the user setting to update. | Yes | [apiv1UserSetting](#apiv1usersetting) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1UpdateUserSettingResponse](#v1updateusersettingresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

---
## WorkspaceService

### /api/v1/workspace/profile

#### GET
##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetWorkspaceProfileResponse](#v1getworkspaceprofileresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

### /api/v1/workspace/setting

#### GET
##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetWorkspaceSettingResponse](#v1getworkspacesettingresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### PATCH
##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| setting | body | The user setting. | Yes | [apiv1WorkspaceSetting](#apiv1workspacesetting) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1UpdateWorkspaceSettingResponse](#v1updateworkspacesettingresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

---
## SubscriptionService

### /v1/subscription

#### GET
##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1GetSubscriptionResponse](#v1getsubscriptionresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

#### PATCH
##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ------ |
| body | body |  | Yes | [v1UpdateSubscriptionRequest](#v1updatesubscriptionrequest) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | A successful response. | [v1UpdateSubscriptionResponse](#v1updatesubscriptionresponse) |
| default | An unexpected error response. | [rpcStatus](#rpcstatus) |

---
### Models

#### GetShortcutAnalyticsResponseAnalyticsItem

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string |  | No |
| count | integer |  | No |

#### UserServiceCreateUserAccessTokenBody

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| description | string | description is the description of the access token. | No |
| expiresAt | dateTime | expires_at is the expiration time of the access token. If expires_at is not set, the access token will never expire. | No |

#### UserSettingColorTheme

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| UserSettingColorTheme | string |  |  |

#### UserSettingLocale

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| UserSettingLocale | string |  |  |

#### apiv1AutoBackupWorkspaceSetting

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| enabled | boolean | Whether auto backup is enabled. | No |
| cronExpression | string | The cron expression for auto backup. For example, "0 0 0 ** *" means backup at 00:00:00 every day. See https://en.wikipedia.org/wiki/Cron for more details. | No |
| maxKeep | integer | The maximum number of backups to keep. | No |

#### apiv1Collection

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | integer |  | No |
| creatorId | integer |  | No |
| createdTime | dateTime |  | No |
| updatedTime | dateTime |  | No |
| name | string |  | No |
| title | string |  | No |
| description | string |  | No |
| shortcutIds | [ integer ] |  | No |
| visibility | [apiv1Visibility](#apiv1visibility) |  | No |

#### apiv1OpenGraphMetadata

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| title | string |  | No |
| description | string |  | No |
| image | string |  | No |

#### apiv1RowStatus

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| apiv1RowStatus | string |  |  |

#### apiv1Shortcut

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | integer |  | No |
| creatorId | integer |  | No |
| createdTime | dateTime |  | No |
| updatedTime | dateTime |  | No |
| rowStatus | [apiv1RowStatus](#apiv1rowstatus) |  | No |
| name | string |  | No |
| link | string |  | No |
| title | string |  | No |
| tags | [ string ] |  | No |
| description | string |  | No |
| visibility | [apiv1Visibility](#apiv1visibility) |  | No |
| viewCount | integer |  | No |
| ogMetadata | [apiv1OpenGraphMetadata](#apiv1opengraphmetadata) |  | No |

#### apiv1UserSetting

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | integer | id is the user id. | No |
| locale | [UserSettingLocale](#usersettinglocale) | locale is the user locale. | No |
| colorTheme | [UserSettingColorTheme](#usersettingcolortheme) | color_theme is the user color theme. | No |

#### apiv1Visibility

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| apiv1Visibility | string |  |  |

#### apiv1WorkspaceSetting

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| licenseKey | string |  | No |
| enableSignup | boolean | Whether to enable other users to sign up. | No |
| instanceUrl | string | The instance URL. | No |
| customStyle | string | The custom style. | No |
| customScript | string | The custom script. | No |
| autoBackup | [apiv1AutoBackupWorkspaceSetting](#apiv1autobackupworkspacesetting) |  | No |
| defaultVisibility | [apiv1Visibility](#apiv1visibility) | The default visibility of shortcuts and collections. | No |

#### protobufAny

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| @type | string |  | No |

#### rpcStatus

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | integer |  | No |
| message | string |  | No |
| details | [ [protobufAny](#protobufany) ] |  | No |

#### v1CreateCollectionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| collection | [apiv1Collection](#apiv1collection) |  | No |

#### v1CreateShortcutResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| shortcut | [apiv1Shortcut](#apiv1shortcut) |  | No |

#### v1CreateUserAccessTokenResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| accessToken | [v1UserAccessToken](#v1useraccesstoken) |  | No |

#### v1CreateUserResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | [v1User](#v1user) |  | No |

#### v1DeleteCollectionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| v1DeleteCollectionResponse | object |  |  |

#### v1DeleteShortcutResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| v1DeleteShortcutResponse | object |  |  |

#### v1DeleteUserAccessTokenResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| v1DeleteUserAccessTokenResponse | object |  |  |

#### v1DeleteUserResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| v1DeleteUserResponse | object |  |  |

#### v1GetAuthStatusResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | [v1User](#v1user) |  | No |

#### v1GetCollectionByNameResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| collection | [apiv1Collection](#apiv1collection) |  | No |

#### v1GetCollectionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| collection | [apiv1Collection](#apiv1collection) |  | No |

#### v1GetShortcutAnalyticsResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| references | [ [GetShortcutAnalyticsResponseAnalyticsItem](#getshortcutanalyticsresponseanalyticsitem) ] |  | No |
| devices | [ [GetShortcutAnalyticsResponseAnalyticsItem](#getshortcutanalyticsresponseanalyticsitem) ] |  | No |
| browsers | [ [GetShortcutAnalyticsResponseAnalyticsItem](#getshortcutanalyticsresponseanalyticsitem) ] |  | No |

#### v1GetShortcutByNameResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| shortcut | [apiv1Shortcut](#apiv1shortcut) |  | No |

#### v1GetShortcutResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| shortcut | [apiv1Shortcut](#apiv1shortcut) |  | No |

#### v1GetSubscriptionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| subscription | [v1Subscription](#v1subscription) |  | No |

#### v1GetUserResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | [v1User](#v1user) |  | No |

#### v1GetUserSettingResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| userSetting | [apiv1UserSetting](#apiv1usersetting) |  | No |

#### v1GetWorkspaceProfileResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| profile | [v1WorkspaceProfile](#v1workspaceprofile) | The workspace profile. | No |

#### v1GetWorkspaceSettingResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| setting | [apiv1WorkspaceSetting](#apiv1workspacesetting) | The user setting. | No |

#### v1ListCollectionsResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| collections | [ [apiv1Collection](#apiv1collection) ] |  | No |

#### v1ListShortcutsResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| shortcuts | [ [apiv1Shortcut](#apiv1shortcut) ] |  | No |

#### v1ListUserAccessTokensResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| accessTokens | [ [v1UserAccessToken](#v1useraccesstoken) ] |  | No |

#### v1ListUsersResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| users | [ [v1User](#v1user) ] |  | No |

#### v1PlanType

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| v1PlanType | string |  |  |

#### v1Role

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| v1Role | string |  |  |

#### v1SignInResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | [v1User](#v1user) |  | No |

#### v1SignOutResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| v1SignOutResponse | object |  |  |

#### v1SignUpResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | [v1User](#v1user) |  | No |

#### v1Subscription

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| plan | [v1PlanType](#v1plantype) |  | No |
| startedTime | dateTime |  | No |
| expiresTime | dateTime |  | No |

#### v1UpdateCollectionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| collection | [apiv1Collection](#apiv1collection) |  | No |

#### v1UpdateShortcutResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| shortcut | [apiv1Shortcut](#apiv1shortcut) |  | No |

#### v1UpdateSubscriptionRequest

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| licenseKey | string |  | Yes |

#### v1UpdateSubscriptionResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| subscription | [v1Subscription](#v1subscription) |  | No |

#### v1UpdateUserResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | [v1User](#v1user) |  | No |

#### v1UpdateUserSettingResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| userSetting | [apiv1UserSetting](#apiv1usersetting) |  | No |

#### v1UpdateWorkspaceSettingResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| setting | [apiv1WorkspaceSetting](#apiv1workspacesetting) | The user setting. | No |

#### v1User

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | integer |  | No |
| rowStatus | [apiv1RowStatus](#apiv1rowstatus) |  | No |
| createdTime | dateTime |  | No |
| updatedTime | dateTime |  | No |
| role | [v1Role](#v1role) |  | No |
| email | string |  | No |
| nickname | string |  | No |
| password | string |  | No |

#### v1UserAccessToken

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| accessToken | string |  | No |
| description | string |  | No |
| issuedAt | dateTime |  | No |
| expiresAt | dateTime |  | No |

#### v1WorkspaceProfile

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| mode | string | Current workspace mode: dev, prod. | No |
| version | string | Current workspace version. | No |
| plan | [v1PlanType](#v1plantype) | The workspace plan. | No |
| enableSignup | boolean | Whether to enable other users to sign up. | No |
| customStyle | string | The custom style. | No |
| customScript | string | The custom script. | No |
