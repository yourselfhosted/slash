# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [api/v2/common.proto](#api_v2_common-proto)
    - [RowStatus](#slash-api-v2-RowStatus)
    - [Visibility](#slash-api-v2-Visibility)
  
- [api/v2/user_service.proto](#api_v2_user_service-proto)
    - [CreateUserAccessTokenRequest](#slash-api-v2-CreateUserAccessTokenRequest)
    - [CreateUserAccessTokenResponse](#slash-api-v2-CreateUserAccessTokenResponse)
    - [CreateUserRequest](#slash-api-v2-CreateUserRequest)
    - [CreateUserResponse](#slash-api-v2-CreateUserResponse)
    - [DeleteUserAccessTokenRequest](#slash-api-v2-DeleteUserAccessTokenRequest)
    - [DeleteUserAccessTokenResponse](#slash-api-v2-DeleteUserAccessTokenResponse)
    - [DeleteUserRequest](#slash-api-v2-DeleteUserRequest)
    - [DeleteUserResponse](#slash-api-v2-DeleteUserResponse)
    - [GetUserRequest](#slash-api-v2-GetUserRequest)
    - [GetUserResponse](#slash-api-v2-GetUserResponse)
    - [ListUserAccessTokensRequest](#slash-api-v2-ListUserAccessTokensRequest)
    - [ListUserAccessTokensResponse](#slash-api-v2-ListUserAccessTokensResponse)
    - [ListUsersRequest](#slash-api-v2-ListUsersRequest)
    - [ListUsersResponse](#slash-api-v2-ListUsersResponse)
    - [UpdateUserRequest](#slash-api-v2-UpdateUserRequest)
    - [UpdateUserResponse](#slash-api-v2-UpdateUserResponse)
    - [User](#slash-api-v2-User)
    - [UserAccessToken](#slash-api-v2-UserAccessToken)
  
    - [Role](#slash-api-v2-Role)
  
    - [UserService](#slash-api-v2-UserService)
  
- [api/v2/auth_service.proto](#api_v2_auth_service-proto)
    - [SignInRequest](#slash-api-v2-SignInRequest)
    - [SignInResponse](#slash-api-v2-SignInResponse)
    - [SignOutRequest](#slash-api-v2-SignOutRequest)
    - [SignOutResponse](#slash-api-v2-SignOutResponse)
    - [SignUpRequest](#slash-api-v2-SignUpRequest)
    - [SignUpResponse](#slash-api-v2-SignUpResponse)
  
    - [AuthService](#slash-api-v2-AuthService)
  
- [api/v2/collection_service.proto](#api_v2_collection_service-proto)
    - [Collection](#slash-api-v2-Collection)
    - [CreateCollectionRequest](#slash-api-v2-CreateCollectionRequest)
    - [CreateCollectionResponse](#slash-api-v2-CreateCollectionResponse)
    - [DeleteCollectionRequest](#slash-api-v2-DeleteCollectionRequest)
    - [DeleteCollectionResponse](#slash-api-v2-DeleteCollectionResponse)
    - [GetCollectionByNameRequest](#slash-api-v2-GetCollectionByNameRequest)
    - [GetCollectionByNameResponse](#slash-api-v2-GetCollectionByNameResponse)
    - [GetCollectionRequest](#slash-api-v2-GetCollectionRequest)
    - [GetCollectionResponse](#slash-api-v2-GetCollectionResponse)
    - [ListCollectionsRequest](#slash-api-v2-ListCollectionsRequest)
    - [ListCollectionsResponse](#slash-api-v2-ListCollectionsResponse)
    - [UpdateCollectionRequest](#slash-api-v2-UpdateCollectionRequest)
    - [UpdateCollectionResponse](#slash-api-v2-UpdateCollectionResponse)
  
    - [CollectionService](#slash-api-v2-CollectionService)
  
- [api/v2/shortcut_service.proto](#api_v2_shortcut_service-proto)
    - [CreateShortcutRequest](#slash-api-v2-CreateShortcutRequest)
    - [CreateShortcutResponse](#slash-api-v2-CreateShortcutResponse)
    - [DeleteShortcutRequest](#slash-api-v2-DeleteShortcutRequest)
    - [DeleteShortcutResponse](#slash-api-v2-DeleteShortcutResponse)
    - [GetShortcutAnalyticsRequest](#slash-api-v2-GetShortcutAnalyticsRequest)
    - [GetShortcutAnalyticsResponse](#slash-api-v2-GetShortcutAnalyticsResponse)
    - [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v2-GetShortcutAnalyticsResponse-AnalyticsItem)
    - [GetShortcutRequest](#slash-api-v2-GetShortcutRequest)
    - [GetShortcutResponse](#slash-api-v2-GetShortcutResponse)
    - [ListShortcutsRequest](#slash-api-v2-ListShortcutsRequest)
    - [ListShortcutsResponse](#slash-api-v2-ListShortcutsResponse)
    - [OpenGraphMetadata](#slash-api-v2-OpenGraphMetadata)
    - [Shortcut](#slash-api-v2-Shortcut)
    - [UpdateShortcutRequest](#slash-api-v2-UpdateShortcutRequest)
    - [UpdateShortcutResponse](#slash-api-v2-UpdateShortcutResponse)
  
    - [ShortcutService](#slash-api-v2-ShortcutService)
  
- [api/v2/subscription_service.proto](#api_v2_subscription_service-proto)
    - [GetSubscriptionRequest](#slash-api-v2-GetSubscriptionRequest)
    - [GetSubscriptionResponse](#slash-api-v2-GetSubscriptionResponse)
    - [Subscription](#slash-api-v2-Subscription)
    - [UpdateSubscriptionRequest](#slash-api-v2-UpdateSubscriptionRequest)
    - [UpdateSubscriptionResponse](#slash-api-v2-UpdateSubscriptionResponse)
  
    - [PlanType](#slash-api-v2-PlanType)
  
    - [SubscriptionService](#slash-api-v2-SubscriptionService)
  
- [api/v2/user_setting_service.proto](#api_v2_user_setting_service-proto)
    - [GetUserSettingRequest](#slash-api-v2-GetUserSettingRequest)
    - [GetUserSettingResponse](#slash-api-v2-GetUserSettingResponse)
    - [UpdateUserSettingRequest](#slash-api-v2-UpdateUserSettingRequest)
    - [UpdateUserSettingResponse](#slash-api-v2-UpdateUserSettingResponse)
    - [UserSetting](#slash-api-v2-UserSetting)
  
    - [UserSetting.ColorTheme](#slash-api-v2-UserSetting-ColorTheme)
    - [UserSetting.Locale](#slash-api-v2-UserSetting-Locale)
  
    - [UserSettingService](#slash-api-v2-UserSettingService)
  
- [api/v2/workspace_service.proto](#api_v2_workspace_service-proto)
    - [AutoBackupWorkspaceSetting](#slash-api-v2-AutoBackupWorkspaceSetting)
    - [GetWorkspaceProfileRequest](#slash-api-v2-GetWorkspaceProfileRequest)
    - [GetWorkspaceProfileResponse](#slash-api-v2-GetWorkspaceProfileResponse)
    - [GetWorkspaceSettingRequest](#slash-api-v2-GetWorkspaceSettingRequest)
    - [GetWorkspaceSettingResponse](#slash-api-v2-GetWorkspaceSettingResponse)
    - [UpdateWorkspaceSettingRequest](#slash-api-v2-UpdateWorkspaceSettingRequest)
    - [UpdateWorkspaceSettingResponse](#slash-api-v2-UpdateWorkspaceSettingResponse)
    - [WorkspaceProfile](#slash-api-v2-WorkspaceProfile)
    - [WorkspaceSetting](#slash-api-v2-WorkspaceSetting)
  
    - [WorkspaceService](#slash-api-v2-WorkspaceService)
  
- [Scalar Value Types](#scalar-value-types)



<a name="api_v2_common-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v2/common.proto


 


<a name="slash-api-v2-RowStatus"></a>

### RowStatus


| Name | Number | Description |
| ---- | ------ | ----------- |
| ROW_STATUS_UNSPECIFIED | 0 |  |
| NORMAL | 1 |  |
| ARCHIVED | 2 |  |



<a name="slash-api-v2-Visibility"></a>

### Visibility


| Name | Number | Description |
| ---- | ------ | ----------- |
| VISIBILITY_UNSPECIFIED | 0 |  |
| PRIVATE | 1 |  |
| WORKSPACE | 2 |  |
| PUBLIC | 3 |  |


 

 

 



<a name="api_v2_user_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v2/user_service.proto



<a name="slash-api-v2-CreateUserAccessTokenRequest"></a>

### CreateUserAccessTokenRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| description | [string](#string) |  | description is the description of the access token. |
| expires_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) | optional | expires_at is the expiration time of the access token. If expires_at is not set, the access token will never expire. |






<a name="slash-api-v2-CreateUserAccessTokenResponse"></a>

### CreateUserAccessTokenResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_token | [UserAccessToken](#slash-api-v2-UserAccessToken) |  |  |






<a name="slash-api-v2-CreateUserRequest"></a>

### CreateUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v2-User) |  |  |






<a name="slash-api-v2-CreateUserResponse"></a>

### CreateUserResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v2-User) |  |  |






<a name="slash-api-v2-DeleteUserAccessTokenRequest"></a>

### DeleteUserAccessTokenRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| access_token | [string](#string) |  | access_token is the access token to delete. |






<a name="slash-api-v2-DeleteUserAccessTokenResponse"></a>

### DeleteUserAccessTokenResponse







<a name="slash-api-v2-DeleteUserRequest"></a>

### DeleteUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v2-DeleteUserResponse"></a>

### DeleteUserResponse







<a name="slash-api-v2-GetUserRequest"></a>

### GetUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v2-GetUserResponse"></a>

### GetUserResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v2-User) |  |  |






<a name="slash-api-v2-ListUserAccessTokensRequest"></a>

### ListUserAccessTokensRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |






<a name="slash-api-v2-ListUserAccessTokensResponse"></a>

### ListUserAccessTokensResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_tokens | [UserAccessToken](#slash-api-v2-UserAccessToken) | repeated |  |






<a name="slash-api-v2-ListUsersRequest"></a>

### ListUsersRequest







<a name="slash-api-v2-ListUsersResponse"></a>

### ListUsersResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| users | [User](#slash-api-v2-User) | repeated |  |






<a name="slash-api-v2-UpdateUserRequest"></a>

### UpdateUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v2-User) |  |  |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  |  |






<a name="slash-api-v2-UpdateUserResponse"></a>

### UpdateUserResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v2-User) |  |  |






<a name="slash-api-v2-User"></a>

### User



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |
| row_status | [RowStatus](#slash-api-v2-RowStatus) |  |  |
| created_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| updated_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| role | [Role](#slash-api-v2-Role) |  |  |
| email | [string](#string) |  |  |
| nickname | [string](#string) |  |  |
| password | [string](#string) |  |  |






<a name="slash-api-v2-UserAccessToken"></a>

### UserAccessToken



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_token | [string](#string) |  |  |
| description | [string](#string) |  |  |
| issued_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| expires_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |





 


<a name="slash-api-v2-Role"></a>

### Role


| Name | Number | Description |
| ---- | ------ | ----------- |
| ROLE_UNSPECIFIED | 0 |  |
| ADMIN | 1 |  |
| USER | 2 |  |


 

 


<a name="slash-api-v2-UserService"></a>

### UserService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| ListUsers | [ListUsersRequest](#slash-api-v2-ListUsersRequest) | [ListUsersResponse](#slash-api-v2-ListUsersResponse) | ListUsers returns a list of users. |
| GetUser | [GetUserRequest](#slash-api-v2-GetUserRequest) | [GetUserResponse](#slash-api-v2-GetUserResponse) | GetUser returns a user by id. |
| CreateUser | [CreateUserRequest](#slash-api-v2-CreateUserRequest) | [CreateUserResponse](#slash-api-v2-CreateUserResponse) | CreateUser creates a new user. |
| UpdateUser | [UpdateUserRequest](#slash-api-v2-UpdateUserRequest) | [UpdateUserResponse](#slash-api-v2-UpdateUserResponse) |  |
| DeleteUser | [DeleteUserRequest](#slash-api-v2-DeleteUserRequest) | [DeleteUserResponse](#slash-api-v2-DeleteUserResponse) | DeleteUser deletes a user by id. |
| ListUserAccessTokens | [ListUserAccessTokensRequest](#slash-api-v2-ListUserAccessTokensRequest) | [ListUserAccessTokensResponse](#slash-api-v2-ListUserAccessTokensResponse) | ListUserAccessTokens returns a list of access tokens for a user. |
| CreateUserAccessToken | [CreateUserAccessTokenRequest](#slash-api-v2-CreateUserAccessTokenRequest) | [CreateUserAccessTokenResponse](#slash-api-v2-CreateUserAccessTokenResponse) | CreateUserAccessToken creates a new access token for a user. |
| DeleteUserAccessToken | [DeleteUserAccessTokenRequest](#slash-api-v2-DeleteUserAccessTokenRequest) | [DeleteUserAccessTokenResponse](#slash-api-v2-DeleteUserAccessTokenResponse) | DeleteUserAccessToken deletes an access token for a user. |

 



<a name="api_v2_auth_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v2/auth_service.proto



<a name="slash-api-v2-SignInRequest"></a>

### SignInRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| email | [string](#string) |  |  |
| password | [string](#string) |  |  |






<a name="slash-api-v2-SignInResponse"></a>

### SignInResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v2-User) |  |  |






<a name="slash-api-v2-SignOutRequest"></a>

### SignOutRequest







<a name="slash-api-v2-SignOutResponse"></a>

### SignOutResponse







<a name="slash-api-v2-SignUpRequest"></a>

### SignUpRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| email | [string](#string) |  |  |
| nickname | [string](#string) |  |  |
| password | [string](#string) |  |  |






<a name="slash-api-v2-SignUpResponse"></a>

### SignUpResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v2-User) |  |  |





 

 

 


<a name="slash-api-v2-AuthService"></a>

### AuthService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| SignIn | [SignInRequest](#slash-api-v2-SignInRequest) | [SignInResponse](#slash-api-v2-SignInResponse) |  |
| SignUp | [SignUpRequest](#slash-api-v2-SignUpRequest) | [SignUpResponse](#slash-api-v2-SignUpResponse) |  |
| SignOut | [SignOutRequest](#slash-api-v2-SignOutRequest) | [SignOutResponse](#slash-api-v2-SignOutResponse) |  |

 



<a name="api_v2_collection_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v2/collection_service.proto



<a name="slash-api-v2-Collection"></a>

### Collection



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |
| creator_id | [int32](#int32) |  |  |
| created_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| updated_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| name | [string](#string) |  |  |
| title | [string](#string) |  |  |
| description | [string](#string) |  |  |
| shortcut_ids | [int32](#int32) | repeated |  |
| visibility | [Visibility](#slash-api-v2-Visibility) |  |  |






<a name="slash-api-v2-CreateCollectionRequest"></a>

### CreateCollectionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v2-Collection) |  |  |






<a name="slash-api-v2-CreateCollectionResponse"></a>

### CreateCollectionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v2-Collection) |  |  |






<a name="slash-api-v2-DeleteCollectionRequest"></a>

### DeleteCollectionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v2-DeleteCollectionResponse"></a>

### DeleteCollectionResponse







<a name="slash-api-v2-GetCollectionByNameRequest"></a>

### GetCollectionByNameRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  |  |






<a name="slash-api-v2-GetCollectionByNameResponse"></a>

### GetCollectionByNameResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v2-Collection) |  |  |






<a name="slash-api-v2-GetCollectionRequest"></a>

### GetCollectionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v2-GetCollectionResponse"></a>

### GetCollectionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v2-Collection) |  |  |






<a name="slash-api-v2-ListCollectionsRequest"></a>

### ListCollectionsRequest







<a name="slash-api-v2-ListCollectionsResponse"></a>

### ListCollectionsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collections | [Collection](#slash-api-v2-Collection) | repeated |  |






<a name="slash-api-v2-UpdateCollectionRequest"></a>

### UpdateCollectionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v2-Collection) |  |  |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  |  |






<a name="slash-api-v2-UpdateCollectionResponse"></a>

### UpdateCollectionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v2-Collection) |  |  |





 

 

 


<a name="slash-api-v2-CollectionService"></a>

### CollectionService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| ListCollections | [ListCollectionsRequest](#slash-api-v2-ListCollectionsRequest) | [ListCollectionsResponse](#slash-api-v2-ListCollectionsResponse) | ListCollections returns a list of collections. |
| GetCollection | [GetCollectionRequest](#slash-api-v2-GetCollectionRequest) | [GetCollectionResponse](#slash-api-v2-GetCollectionResponse) | GetCollection returns a collection by id. |
| GetCollectionByName | [GetCollectionByNameRequest](#slash-api-v2-GetCollectionByNameRequest) | [GetCollectionByNameResponse](#slash-api-v2-GetCollectionByNameResponse) | GetCollectionByName returns a collection by name. |
| CreateCollection | [CreateCollectionRequest](#slash-api-v2-CreateCollectionRequest) | [CreateCollectionResponse](#slash-api-v2-CreateCollectionResponse) | CreateCollection creates a collection. |
| UpdateCollection | [UpdateCollectionRequest](#slash-api-v2-UpdateCollectionRequest) | [UpdateCollectionResponse](#slash-api-v2-UpdateCollectionResponse) | UpdateCollection updates a collection. |
| DeleteCollection | [DeleteCollectionRequest](#slash-api-v2-DeleteCollectionRequest) | [DeleteCollectionResponse](#slash-api-v2-DeleteCollectionResponse) | DeleteCollection deletes a collection by id. |

 



<a name="api_v2_shortcut_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v2/shortcut_service.proto



<a name="slash-api-v2-CreateShortcutRequest"></a>

### CreateShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v2-Shortcut) |  |  |






<a name="slash-api-v2-CreateShortcutResponse"></a>

### CreateShortcutResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v2-Shortcut) |  |  |






<a name="slash-api-v2-DeleteShortcutRequest"></a>

### DeleteShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v2-DeleteShortcutResponse"></a>

### DeleteShortcutResponse







<a name="slash-api-v2-GetShortcutAnalyticsRequest"></a>

### GetShortcutAnalyticsRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v2-GetShortcutAnalyticsResponse"></a>

### GetShortcutAnalyticsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| references | [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v2-GetShortcutAnalyticsResponse-AnalyticsItem) | repeated |  |
| devices | [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v2-GetShortcutAnalyticsResponse-AnalyticsItem) | repeated |  |
| browsers | [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v2-GetShortcutAnalyticsResponse-AnalyticsItem) | repeated |  |






<a name="slash-api-v2-GetShortcutAnalyticsResponse-AnalyticsItem"></a>

### GetShortcutAnalyticsResponse.AnalyticsItem



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  |  |
| count | [int32](#int32) |  |  |






<a name="slash-api-v2-GetShortcutRequest"></a>

### GetShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v2-GetShortcutResponse"></a>

### GetShortcutResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v2-Shortcut) |  |  |






<a name="slash-api-v2-ListShortcutsRequest"></a>

### ListShortcutsRequest







<a name="slash-api-v2-ListShortcutsResponse"></a>

### ListShortcutsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcuts | [Shortcut](#slash-api-v2-Shortcut) | repeated |  |






<a name="slash-api-v2-OpenGraphMetadata"></a>

### OpenGraphMetadata



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| title | [string](#string) |  |  |
| description | [string](#string) |  |  |
| image | [string](#string) |  |  |






<a name="slash-api-v2-Shortcut"></a>

### Shortcut



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |
| creator_id | [int32](#int32) |  |  |
| created_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| updated_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| row_status | [RowStatus](#slash-api-v2-RowStatus) |  |  |
| name | [string](#string) |  |  |
| link | [string](#string) |  |  |
| title | [string](#string) |  |  |
| tags | [string](#string) | repeated |  |
| description | [string](#string) |  |  |
| visibility | [Visibility](#slash-api-v2-Visibility) |  |  |
| view_count | [int32](#int32) |  |  |
| og_metadata | [OpenGraphMetadata](#slash-api-v2-OpenGraphMetadata) |  |  |






<a name="slash-api-v2-UpdateShortcutRequest"></a>

### UpdateShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v2-Shortcut) |  |  |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  |  |






<a name="slash-api-v2-UpdateShortcutResponse"></a>

### UpdateShortcutResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v2-Shortcut) |  |  |





 

 

 


<a name="slash-api-v2-ShortcutService"></a>

### ShortcutService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| ListShortcuts | [ListShortcutsRequest](#slash-api-v2-ListShortcutsRequest) | [ListShortcutsResponse](#slash-api-v2-ListShortcutsResponse) | ListShortcuts returns a list of shortcuts. |
| GetShortcut | [GetShortcutRequest](#slash-api-v2-GetShortcutRequest) | [GetShortcutResponse](#slash-api-v2-GetShortcutResponse) | GetShortcut returns a shortcut by id. |
| CreateShortcut | [CreateShortcutRequest](#slash-api-v2-CreateShortcutRequest) | [CreateShortcutResponse](#slash-api-v2-CreateShortcutResponse) | CreateShortcut creates a shortcut. |
| UpdateShortcut | [UpdateShortcutRequest](#slash-api-v2-UpdateShortcutRequest) | [UpdateShortcutResponse](#slash-api-v2-UpdateShortcutResponse) | UpdateShortcut updates a shortcut. |
| DeleteShortcut | [DeleteShortcutRequest](#slash-api-v2-DeleteShortcutRequest) | [DeleteShortcutResponse](#slash-api-v2-DeleteShortcutResponse) | DeleteShortcut deletes a shortcut by id. |
| GetShortcutAnalytics | [GetShortcutAnalyticsRequest](#slash-api-v2-GetShortcutAnalyticsRequest) | [GetShortcutAnalyticsResponse](#slash-api-v2-GetShortcutAnalyticsResponse) | GetShortcutAnalytics returns the analytics for a shortcut. |

 



<a name="api_v2_subscription_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v2/subscription_service.proto



<a name="slash-api-v2-GetSubscriptionRequest"></a>

### GetSubscriptionRequest







<a name="slash-api-v2-GetSubscriptionResponse"></a>

### GetSubscriptionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| subscription | [Subscription](#slash-api-v2-Subscription) |  |  |






<a name="slash-api-v2-Subscription"></a>

### Subscription



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| plan | [PlanType](#slash-api-v2-PlanType) |  |  |
| started_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| expires_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |






<a name="slash-api-v2-UpdateSubscriptionRequest"></a>

### UpdateSubscriptionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| license_key | [string](#string) |  |  |






<a name="slash-api-v2-UpdateSubscriptionResponse"></a>

### UpdateSubscriptionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| subscription | [Subscription](#slash-api-v2-Subscription) |  |  |





 


<a name="slash-api-v2-PlanType"></a>

### PlanType


| Name | Number | Description |
| ---- | ------ | ----------- |
| PLAN_TYPE_UNSPECIFIED | 0 |  |
| FREE | 1 |  |
| PRO | 2 |  |


 

 


<a name="slash-api-v2-SubscriptionService"></a>

### SubscriptionService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetSubscription | [GetSubscriptionRequest](#slash-api-v2-GetSubscriptionRequest) | [GetSubscriptionResponse](#slash-api-v2-GetSubscriptionResponse) |  |
| UpdateSubscription | [UpdateSubscriptionRequest](#slash-api-v2-UpdateSubscriptionRequest) | [UpdateSubscriptionResponse](#slash-api-v2-UpdateSubscriptionResponse) |  |

 



<a name="api_v2_user_setting_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v2/user_setting_service.proto



<a name="slash-api-v2-GetUserSettingRequest"></a>

### GetUserSettingRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |






<a name="slash-api-v2-GetUserSettingResponse"></a>

### GetUserSettingResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user_setting | [UserSetting](#slash-api-v2-UserSetting) |  |  |






<a name="slash-api-v2-UpdateUserSettingRequest"></a>

### UpdateUserSettingRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| user_setting | [UserSetting](#slash-api-v2-UserSetting) |  | user_setting is the user setting to update. |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  | update_mask is the field mask to update. |






<a name="slash-api-v2-UpdateUserSettingResponse"></a>

### UpdateUserSettingResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user_setting | [UserSetting](#slash-api-v2-UserSetting) |  |  |






<a name="slash-api-v2-UserSetting"></a>

### UserSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| locale | [UserSetting.Locale](#slash-api-v2-UserSetting-Locale) |  | locale is the user locale. |
| color_theme | [UserSetting.ColorTheme](#slash-api-v2-UserSetting-ColorTheme) |  | color_theme is the user color theme. |





 


<a name="slash-api-v2-UserSetting-ColorTheme"></a>

### UserSetting.ColorTheme


| Name | Number | Description |
| ---- | ------ | ----------- |
| COLOR_THEME_UNSPECIFIED | 0 |  |
| COLOR_THEME_SYSTEM | 1 |  |
| COLOR_THEME_LIGHT | 2 |  |
| COLOR_THEME_DARK | 3 |  |



<a name="slash-api-v2-UserSetting-Locale"></a>

### UserSetting.Locale


| Name | Number | Description |
| ---- | ------ | ----------- |
| LOCALE_UNSPECIFIED | 0 |  |
| LOCALE_EN | 1 |  |
| LOCALE_ZH | 2 |  |


 

 


<a name="slash-api-v2-UserSettingService"></a>

### UserSettingService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetUserSetting | [GetUserSettingRequest](#slash-api-v2-GetUserSettingRequest) | [GetUserSettingResponse](#slash-api-v2-GetUserSettingResponse) | GetUserSetting returns the user setting. |
| UpdateUserSetting | [UpdateUserSettingRequest](#slash-api-v2-UpdateUserSettingRequest) | [UpdateUserSettingResponse](#slash-api-v2-UpdateUserSettingResponse) | UpdateUserSetting updates the user setting. |

 



<a name="api_v2_workspace_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v2/workspace_service.proto



<a name="slash-api-v2-AutoBackupWorkspaceSetting"></a>

### AutoBackupWorkspaceSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| enabled | [bool](#bool) |  | Whether auto backup is enabled. |
| cron_expression | [string](#string) |  | The cron expression for auto backup. For example, &#34;0 0 0 * * *&#34; means backup at 00:00:00 every day. See https://en.wikipedia.org/wiki/Cron for more details. |
| max_keep | [int32](#int32) |  | The maximum number of backups to keep. |






<a name="slash-api-v2-GetWorkspaceProfileRequest"></a>

### GetWorkspaceProfileRequest







<a name="slash-api-v2-GetWorkspaceProfileResponse"></a>

### GetWorkspaceProfileResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| profile | [WorkspaceProfile](#slash-api-v2-WorkspaceProfile) |  | The workspace profile. |






<a name="slash-api-v2-GetWorkspaceSettingRequest"></a>

### GetWorkspaceSettingRequest







<a name="slash-api-v2-GetWorkspaceSettingResponse"></a>

### GetWorkspaceSettingResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| setting | [WorkspaceSetting](#slash-api-v2-WorkspaceSetting) |  | The user setting. |






<a name="slash-api-v2-UpdateWorkspaceSettingRequest"></a>

### UpdateWorkspaceSettingRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| setting | [WorkspaceSetting](#slash-api-v2-WorkspaceSetting) |  | The user setting. |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  | The update mask. |






<a name="slash-api-v2-UpdateWorkspaceSettingResponse"></a>

### UpdateWorkspaceSettingResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| setting | [WorkspaceSetting](#slash-api-v2-WorkspaceSetting) |  | The user setting. |






<a name="slash-api-v2-WorkspaceProfile"></a>

### WorkspaceProfile



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| mode | [string](#string) |  | Current workspace mode: dev, prod. |
| version | [string](#string) |  | Current workspace version. |
| plan | [PlanType](#slash-api-v2-PlanType) |  | The workspace plan. |
| enable_signup | [bool](#bool) |  | Whether to enable other users to sign up. |
| custom_style | [string](#string) |  | The custom style. |
| custom_script | [string](#string) |  | The custom script. |






<a name="slash-api-v2-WorkspaceSetting"></a>

### WorkspaceSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| license_key | [string](#string) |  |  |
| enable_signup | [bool](#bool) |  | Whether to enable other users to sign up. |
| custom_style | [string](#string) |  | The custom style. |
| custom_script | [string](#string) |  | The custom script. |
| auto_backup | [AutoBackupWorkspaceSetting](#slash-api-v2-AutoBackupWorkspaceSetting) |  | The auto backup setting. |





 

 

 


<a name="slash-api-v2-WorkspaceService"></a>

### WorkspaceService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetWorkspaceProfile | [GetWorkspaceProfileRequest](#slash-api-v2-GetWorkspaceProfileRequest) | [GetWorkspaceProfileResponse](#slash-api-v2-GetWorkspaceProfileResponse) |  |
| GetWorkspaceSetting | [GetWorkspaceSettingRequest](#slash-api-v2-GetWorkspaceSettingRequest) | [GetWorkspaceSettingResponse](#slash-api-v2-GetWorkspaceSettingResponse) |  |
| UpdateWorkspaceSetting | [UpdateWorkspaceSettingRequest](#slash-api-v2-UpdateWorkspaceSettingRequest) | [UpdateWorkspaceSettingResponse](#slash-api-v2-UpdateWorkspaceSettingResponse) |  |

 



## Scalar Value Types

| .proto Type | Notes | C++ | Java | Python | Go | C# | PHP | Ruby |
| ----------- | ----- | --- | ---- | ------ | -- | -- | --- | ---- |
| <a name="double" /> double |  | double | double | float | float64 | double | float | Float |
| <a name="float" /> float |  | float | float | float | float32 | float | float | Float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum or Fixnum (as required) |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="bool" /> bool |  | bool | boolean | boolean | bool | bool | boolean | TrueClass/FalseClass |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode | string | string | string | String (UTF-8) |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str | []byte | ByteString | string | String (ASCII-8BIT) |

