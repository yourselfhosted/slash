# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [api/v1/common.proto](#api_v1_common-proto)
    - [RowStatus](#slash-api-v1-RowStatus)
    - [Visibility](#slash-api-v1-Visibility)
  
- [api/v1/user_service.proto](#api_v1_user_service-proto)
    - [CreateUserAccessTokenRequest](#slash-api-v1-CreateUserAccessTokenRequest)
    - [CreateUserAccessTokenResponse](#slash-api-v1-CreateUserAccessTokenResponse)
    - [CreateUserRequest](#slash-api-v1-CreateUserRequest)
    - [CreateUserResponse](#slash-api-v1-CreateUserResponse)
    - [DeleteUserAccessTokenRequest](#slash-api-v1-DeleteUserAccessTokenRequest)
    - [DeleteUserAccessTokenResponse](#slash-api-v1-DeleteUserAccessTokenResponse)
    - [DeleteUserRequest](#slash-api-v1-DeleteUserRequest)
    - [DeleteUserResponse](#slash-api-v1-DeleteUserResponse)
    - [GetUserRequest](#slash-api-v1-GetUserRequest)
    - [GetUserResponse](#slash-api-v1-GetUserResponse)
    - [ListUserAccessTokensRequest](#slash-api-v1-ListUserAccessTokensRequest)
    - [ListUserAccessTokensResponse](#slash-api-v1-ListUserAccessTokensResponse)
    - [ListUsersRequest](#slash-api-v1-ListUsersRequest)
    - [ListUsersResponse](#slash-api-v1-ListUsersResponse)
    - [UpdateUserRequest](#slash-api-v1-UpdateUserRequest)
    - [UpdateUserResponse](#slash-api-v1-UpdateUserResponse)
    - [User](#slash-api-v1-User)
    - [UserAccessToken](#slash-api-v1-UserAccessToken)
  
    - [Role](#slash-api-v1-Role)
  
    - [UserService](#slash-api-v1-UserService)
  
- [api/v1/auth_service.proto](#api_v1_auth_service-proto)
    - [GetAuthStatusRequest](#slash-api-v1-GetAuthStatusRequest)
    - [GetAuthStatusResponse](#slash-api-v1-GetAuthStatusResponse)
    - [SignInRequest](#slash-api-v1-SignInRequest)
    - [SignInResponse](#slash-api-v1-SignInResponse)
    - [SignOutRequest](#slash-api-v1-SignOutRequest)
    - [SignOutResponse](#slash-api-v1-SignOutResponse)
    - [SignUpRequest](#slash-api-v1-SignUpRequest)
    - [SignUpResponse](#slash-api-v1-SignUpResponse)
  
    - [AuthService](#slash-api-v1-AuthService)
  
- [api/v1/collection_service.proto](#api_v1_collection_service-proto)
    - [Collection](#slash-api-v1-Collection)
    - [CreateCollectionRequest](#slash-api-v1-CreateCollectionRequest)
    - [CreateCollectionResponse](#slash-api-v1-CreateCollectionResponse)
    - [DeleteCollectionRequest](#slash-api-v1-DeleteCollectionRequest)
    - [DeleteCollectionResponse](#slash-api-v1-DeleteCollectionResponse)
    - [GetCollectionByNameRequest](#slash-api-v1-GetCollectionByNameRequest)
    - [GetCollectionByNameResponse](#slash-api-v1-GetCollectionByNameResponse)
    - [GetCollectionRequest](#slash-api-v1-GetCollectionRequest)
    - [GetCollectionResponse](#slash-api-v1-GetCollectionResponse)
    - [ListCollectionsRequest](#slash-api-v1-ListCollectionsRequest)
    - [ListCollectionsResponse](#slash-api-v1-ListCollectionsResponse)
    - [UpdateCollectionRequest](#slash-api-v1-UpdateCollectionRequest)
    - [UpdateCollectionResponse](#slash-api-v1-UpdateCollectionResponse)
  
    - [CollectionService](#slash-api-v1-CollectionService)
  
- [api/v1/shortcut_service.proto](#api_v1_shortcut_service-proto)
    - [CreateShortcutRequest](#slash-api-v1-CreateShortcutRequest)
    - [CreateShortcutResponse](#slash-api-v1-CreateShortcutResponse)
    - [DeleteShortcutRequest](#slash-api-v1-DeleteShortcutRequest)
    - [DeleteShortcutResponse](#slash-api-v1-DeleteShortcutResponse)
    - [GetShortcutAnalyticsRequest](#slash-api-v1-GetShortcutAnalyticsRequest)
    - [GetShortcutAnalyticsResponse](#slash-api-v1-GetShortcutAnalyticsResponse)
    - [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v1-GetShortcutAnalyticsResponse-AnalyticsItem)
    - [GetShortcutByNameRequest](#slash-api-v1-GetShortcutByNameRequest)
    - [GetShortcutByNameResponse](#slash-api-v1-GetShortcutByNameResponse)
    - [GetShortcutRequest](#slash-api-v1-GetShortcutRequest)
    - [GetShortcutResponse](#slash-api-v1-GetShortcutResponse)
    - [ListShortcutsRequest](#slash-api-v1-ListShortcutsRequest)
    - [ListShortcutsResponse](#slash-api-v1-ListShortcutsResponse)
    - [OpenGraphMetadata](#slash-api-v1-OpenGraphMetadata)
    - [Shortcut](#slash-api-v1-Shortcut)
    - [UpdateShortcutRequest](#slash-api-v1-UpdateShortcutRequest)
    - [UpdateShortcutResponse](#slash-api-v1-UpdateShortcutResponse)
  
    - [ShortcutService](#slash-api-v1-ShortcutService)
  
- [api/v1/subscription_service.proto](#api_v1_subscription_service-proto)
    - [GetSubscriptionRequest](#slash-api-v1-GetSubscriptionRequest)
    - [GetSubscriptionResponse](#slash-api-v1-GetSubscriptionResponse)
    - [Subscription](#slash-api-v1-Subscription)
    - [UpdateSubscriptionRequest](#slash-api-v1-UpdateSubscriptionRequest)
    - [UpdateSubscriptionResponse](#slash-api-v1-UpdateSubscriptionResponse)
  
    - [PlanType](#slash-api-v1-PlanType)
  
    - [SubscriptionService](#slash-api-v1-SubscriptionService)
  
- [api/v1/user_setting_service.proto](#api_v1_user_setting_service-proto)
    - [GetUserSettingRequest](#slash-api-v1-GetUserSettingRequest)
    - [GetUserSettingResponse](#slash-api-v1-GetUserSettingResponse)
    - [UpdateUserSettingRequest](#slash-api-v1-UpdateUserSettingRequest)
    - [UpdateUserSettingResponse](#slash-api-v1-UpdateUserSettingResponse)
    - [UserSetting](#slash-api-v1-UserSetting)
  
    - [UserSetting.ColorTheme](#slash-api-v1-UserSetting-ColorTheme)
    - [UserSetting.Locale](#slash-api-v1-UserSetting-Locale)
  
    - [UserSettingService](#slash-api-v1-UserSettingService)
  
- [api/v1/workspace_service.proto](#api_v1_workspace_service-proto)
    - [AutoBackupWorkspaceSetting](#slash-api-v1-AutoBackupWorkspaceSetting)
    - [GetWorkspaceProfileRequest](#slash-api-v1-GetWorkspaceProfileRequest)
    - [GetWorkspaceProfileResponse](#slash-api-v1-GetWorkspaceProfileResponse)
    - [GetWorkspaceSettingRequest](#slash-api-v1-GetWorkspaceSettingRequest)
    - [GetWorkspaceSettingResponse](#slash-api-v1-GetWorkspaceSettingResponse)
    - [UpdateWorkspaceSettingRequest](#slash-api-v1-UpdateWorkspaceSettingRequest)
    - [UpdateWorkspaceSettingResponse](#slash-api-v1-UpdateWorkspaceSettingResponse)
    - [WorkspaceProfile](#slash-api-v1-WorkspaceProfile)
    - [WorkspaceSetting](#slash-api-v1-WorkspaceSetting)
  
    - [WorkspaceService](#slash-api-v1-WorkspaceService)
  
- [Scalar Value Types](#scalar-value-types)



<a name="api_v1_common-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/common.proto


 


<a name="slash-api-v1-RowStatus"></a>

### RowStatus


| Name | Number | Description |
| ---- | ------ | ----------- |
| ROW_STATUS_UNSPECIFIED | 0 |  |
| NORMAL | 1 |  |
| ARCHIVED | 2 |  |



<a name="slash-api-v1-Visibility"></a>

### Visibility


| Name | Number | Description |
| ---- | ------ | ----------- |
| VISIBILITY_UNSPECIFIED | 0 |  |
| PRIVATE | 1 |  |
| WORKSPACE | 2 |  |
| PUBLIC | 3 |  |


 

 

 



<a name="api_v1_user_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/user_service.proto



<a name="slash-api-v1-CreateUserAccessTokenRequest"></a>

### CreateUserAccessTokenRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| description | [string](#string) |  | description is the description of the access token. |
| expires_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) | optional | expires_at is the expiration time of the access token. If expires_at is not set, the access token will never expire. |






<a name="slash-api-v1-CreateUserAccessTokenResponse"></a>

### CreateUserAccessTokenResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_token | [UserAccessToken](#slash-api-v1-UserAccessToken) |  |  |






<a name="slash-api-v1-CreateUserRequest"></a>

### CreateUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |






<a name="slash-api-v1-CreateUserResponse"></a>

### CreateUserResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |






<a name="slash-api-v1-DeleteUserAccessTokenRequest"></a>

### DeleteUserAccessTokenRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| access_token | [string](#string) |  | access_token is the access token to delete. |






<a name="slash-api-v1-DeleteUserAccessTokenResponse"></a>

### DeleteUserAccessTokenResponse







<a name="slash-api-v1-DeleteUserRequest"></a>

### DeleteUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-DeleteUserResponse"></a>

### DeleteUserResponse







<a name="slash-api-v1-GetUserRequest"></a>

### GetUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-GetUserResponse"></a>

### GetUserResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |






<a name="slash-api-v1-ListUserAccessTokensRequest"></a>

### ListUserAccessTokensRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |






<a name="slash-api-v1-ListUserAccessTokensResponse"></a>

### ListUserAccessTokensResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_tokens | [UserAccessToken](#slash-api-v1-UserAccessToken) | repeated |  |






<a name="slash-api-v1-ListUsersRequest"></a>

### ListUsersRequest







<a name="slash-api-v1-ListUsersResponse"></a>

### ListUsersResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| users | [User](#slash-api-v1-User) | repeated |  |






<a name="slash-api-v1-UpdateUserRequest"></a>

### UpdateUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  |  |






<a name="slash-api-v1-UpdateUserResponse"></a>

### UpdateUserResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |






<a name="slash-api-v1-User"></a>

### User



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |
| row_status | [RowStatus](#slash-api-v1-RowStatus) |  |  |
| created_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| updated_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| role | [Role](#slash-api-v1-Role) |  |  |
| email | [string](#string) |  |  |
| nickname | [string](#string) |  |  |
| password | [string](#string) |  |  |






<a name="slash-api-v1-UserAccessToken"></a>

### UserAccessToken



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_token | [string](#string) |  |  |
| description | [string](#string) |  |  |
| issued_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| expires_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |





 


<a name="slash-api-v1-Role"></a>

### Role


| Name | Number | Description |
| ---- | ------ | ----------- |
| ROLE_UNSPECIFIED | 0 |  |
| ADMIN | 1 |  |
| USER | 2 |  |


 

 


<a name="slash-api-v1-UserService"></a>

### UserService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| ListUsers | [ListUsersRequest](#slash-api-v1-ListUsersRequest) | [ListUsersResponse](#slash-api-v1-ListUsersResponse) | ListUsers returns a list of users. |
| GetUser | [GetUserRequest](#slash-api-v1-GetUserRequest) | [GetUserResponse](#slash-api-v1-GetUserResponse) | GetUser returns a user by id. |
| CreateUser | [CreateUserRequest](#slash-api-v1-CreateUserRequest) | [CreateUserResponse](#slash-api-v1-CreateUserResponse) | CreateUser creates a new user. |
| UpdateUser | [UpdateUserRequest](#slash-api-v1-UpdateUserRequest) | [UpdateUserResponse](#slash-api-v1-UpdateUserResponse) |  |
| DeleteUser | [DeleteUserRequest](#slash-api-v1-DeleteUserRequest) | [DeleteUserResponse](#slash-api-v1-DeleteUserResponse) | DeleteUser deletes a user by id. |
| ListUserAccessTokens | [ListUserAccessTokensRequest](#slash-api-v1-ListUserAccessTokensRequest) | [ListUserAccessTokensResponse](#slash-api-v1-ListUserAccessTokensResponse) | ListUserAccessTokens returns a list of access tokens for a user. |
| CreateUserAccessToken | [CreateUserAccessTokenRequest](#slash-api-v1-CreateUserAccessTokenRequest) | [CreateUserAccessTokenResponse](#slash-api-v1-CreateUserAccessTokenResponse) | CreateUserAccessToken creates a new access token for a user. |
| DeleteUserAccessToken | [DeleteUserAccessTokenRequest](#slash-api-v1-DeleteUserAccessTokenRequest) | [DeleteUserAccessTokenResponse](#slash-api-v1-DeleteUserAccessTokenResponse) | DeleteUserAccessToken deletes an access token for a user. |

 



<a name="api_v1_auth_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/auth_service.proto



<a name="slash-api-v1-GetAuthStatusRequest"></a>

### GetAuthStatusRequest







<a name="slash-api-v1-GetAuthStatusResponse"></a>

### GetAuthStatusResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |






<a name="slash-api-v1-SignInRequest"></a>

### SignInRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| email | [string](#string) |  |  |
| password | [string](#string) |  |  |






<a name="slash-api-v1-SignInResponse"></a>

### SignInResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |






<a name="slash-api-v1-SignOutRequest"></a>

### SignOutRequest







<a name="slash-api-v1-SignOutResponse"></a>

### SignOutResponse







<a name="slash-api-v1-SignUpRequest"></a>

### SignUpRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| email | [string](#string) |  |  |
| nickname | [string](#string) |  |  |
| password | [string](#string) |  |  |






<a name="slash-api-v1-SignUpResponse"></a>

### SignUpResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |





 

 

 


<a name="slash-api-v1-AuthService"></a>

### AuthService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetAuthStatus | [GetAuthStatusRequest](#slash-api-v1-GetAuthStatusRequest) | [GetAuthStatusResponse](#slash-api-v1-GetAuthStatusResponse) |  |
| SignIn | [SignInRequest](#slash-api-v1-SignInRequest) | [SignInResponse](#slash-api-v1-SignInResponse) |  |
| SignUp | [SignUpRequest](#slash-api-v1-SignUpRequest) | [SignUpResponse](#slash-api-v1-SignUpResponse) |  |
| SignOut | [SignOutRequest](#slash-api-v1-SignOutRequest) | [SignOutResponse](#slash-api-v1-SignOutResponse) |  |

 



<a name="api_v1_collection_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/collection_service.proto



<a name="slash-api-v1-Collection"></a>

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
| visibility | [Visibility](#slash-api-v1-Visibility) |  |  |






<a name="slash-api-v1-CreateCollectionRequest"></a>

### CreateCollectionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v1-Collection) |  |  |






<a name="slash-api-v1-CreateCollectionResponse"></a>

### CreateCollectionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v1-Collection) |  |  |






<a name="slash-api-v1-DeleteCollectionRequest"></a>

### DeleteCollectionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-DeleteCollectionResponse"></a>

### DeleteCollectionResponse







<a name="slash-api-v1-GetCollectionByNameRequest"></a>

### GetCollectionByNameRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  |  |






<a name="slash-api-v1-GetCollectionByNameResponse"></a>

### GetCollectionByNameResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v1-Collection) |  |  |






<a name="slash-api-v1-GetCollectionRequest"></a>

### GetCollectionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-GetCollectionResponse"></a>

### GetCollectionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v1-Collection) |  |  |






<a name="slash-api-v1-ListCollectionsRequest"></a>

### ListCollectionsRequest







<a name="slash-api-v1-ListCollectionsResponse"></a>

### ListCollectionsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collections | [Collection](#slash-api-v1-Collection) | repeated |  |






<a name="slash-api-v1-UpdateCollectionRequest"></a>

### UpdateCollectionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v1-Collection) |  |  |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  |  |






<a name="slash-api-v1-UpdateCollectionResponse"></a>

### UpdateCollectionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| collection | [Collection](#slash-api-v1-Collection) |  |  |





 

 

 


<a name="slash-api-v1-CollectionService"></a>

### CollectionService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| ListCollections | [ListCollectionsRequest](#slash-api-v1-ListCollectionsRequest) | [ListCollectionsResponse](#slash-api-v1-ListCollectionsResponse) | ListCollections returns a list of collections. |
| GetCollection | [GetCollectionRequest](#slash-api-v1-GetCollectionRequest) | [GetCollectionResponse](#slash-api-v1-GetCollectionResponse) | GetCollection returns a collection by id. |
| GetCollectionByName | [GetCollectionByNameRequest](#slash-api-v1-GetCollectionByNameRequest) | [GetCollectionByNameResponse](#slash-api-v1-GetCollectionByNameResponse) | GetCollectionByName returns a collection by name. |
| CreateCollection | [CreateCollectionRequest](#slash-api-v1-CreateCollectionRequest) | [CreateCollectionResponse](#slash-api-v1-CreateCollectionResponse) | CreateCollection creates a collection. |
| UpdateCollection | [UpdateCollectionRequest](#slash-api-v1-UpdateCollectionRequest) | [UpdateCollectionResponse](#slash-api-v1-UpdateCollectionResponse) | UpdateCollection updates a collection. |
| DeleteCollection | [DeleteCollectionRequest](#slash-api-v1-DeleteCollectionRequest) | [DeleteCollectionResponse](#slash-api-v1-DeleteCollectionResponse) | DeleteCollection deletes a collection by id. |

 



<a name="api_v1_shortcut_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/shortcut_service.proto



<a name="slash-api-v1-CreateShortcutRequest"></a>

### CreateShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v1-Shortcut) |  |  |






<a name="slash-api-v1-CreateShortcutResponse"></a>

### CreateShortcutResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v1-Shortcut) |  |  |






<a name="slash-api-v1-DeleteShortcutRequest"></a>

### DeleteShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-DeleteShortcutResponse"></a>

### DeleteShortcutResponse







<a name="slash-api-v1-GetShortcutAnalyticsRequest"></a>

### GetShortcutAnalyticsRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-GetShortcutAnalyticsResponse"></a>

### GetShortcutAnalyticsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| references | [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v1-GetShortcutAnalyticsResponse-AnalyticsItem) | repeated |  |
| devices | [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v1-GetShortcutAnalyticsResponse-AnalyticsItem) | repeated |  |
| browsers | [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v1-GetShortcutAnalyticsResponse-AnalyticsItem) | repeated |  |






<a name="slash-api-v1-GetShortcutAnalyticsResponse-AnalyticsItem"></a>

### GetShortcutAnalyticsResponse.AnalyticsItem



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  |  |
| count | [int32](#int32) |  |  |






<a name="slash-api-v1-GetShortcutByNameRequest"></a>

### GetShortcutByNameRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  |  |






<a name="slash-api-v1-GetShortcutByNameResponse"></a>

### GetShortcutByNameResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v1-Shortcut) |  |  |






<a name="slash-api-v1-GetShortcutRequest"></a>

### GetShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-GetShortcutResponse"></a>

### GetShortcutResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v1-Shortcut) |  |  |






<a name="slash-api-v1-ListShortcutsRequest"></a>

### ListShortcutsRequest







<a name="slash-api-v1-ListShortcutsResponse"></a>

### ListShortcutsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcuts | [Shortcut](#slash-api-v1-Shortcut) | repeated |  |






<a name="slash-api-v1-OpenGraphMetadata"></a>

### OpenGraphMetadata



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| title | [string](#string) |  |  |
| description | [string](#string) |  |  |
| image | [string](#string) |  |  |






<a name="slash-api-v1-Shortcut"></a>

### Shortcut



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |
| creator_id | [int32](#int32) |  |  |
| created_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| updated_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| row_status | [RowStatus](#slash-api-v1-RowStatus) |  |  |
| name | [string](#string) |  |  |
| link | [string](#string) |  |  |
| title | [string](#string) |  |  |
| tags | [string](#string) | repeated |  |
| description | [string](#string) |  |  |
| visibility | [Visibility](#slash-api-v1-Visibility) |  |  |
| view_count | [int32](#int32) |  |  |
| og_metadata | [OpenGraphMetadata](#slash-api-v1-OpenGraphMetadata) |  |  |






<a name="slash-api-v1-UpdateShortcutRequest"></a>

### UpdateShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v1-Shortcut) |  |  |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  |  |






<a name="slash-api-v1-UpdateShortcutResponse"></a>

### UpdateShortcutResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v1-Shortcut) |  |  |





 

 

 


<a name="slash-api-v1-ShortcutService"></a>

### ShortcutService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| ListShortcuts | [ListShortcutsRequest](#slash-api-v1-ListShortcutsRequest) | [ListShortcutsResponse](#slash-api-v1-ListShortcutsResponse) | ListShortcuts returns a list of shortcuts. |
| GetShortcut | [GetShortcutRequest](#slash-api-v1-GetShortcutRequest) | [GetShortcutResponse](#slash-api-v1-GetShortcutResponse) | GetShortcut returns a shortcut by id. |
| GetShortcutByName | [GetShortcutByNameRequest](#slash-api-v1-GetShortcutByNameRequest) | [GetShortcutByNameResponse](#slash-api-v1-GetShortcutByNameResponse) | GetShortcutByName returns a shortcut by name. |
| CreateShortcut | [CreateShortcutRequest](#slash-api-v1-CreateShortcutRequest) | [CreateShortcutResponse](#slash-api-v1-CreateShortcutResponse) | CreateShortcut creates a shortcut. |
| UpdateShortcut | [UpdateShortcutRequest](#slash-api-v1-UpdateShortcutRequest) | [UpdateShortcutResponse](#slash-api-v1-UpdateShortcutResponse) | UpdateShortcut updates a shortcut. |
| DeleteShortcut | [DeleteShortcutRequest](#slash-api-v1-DeleteShortcutRequest) | [DeleteShortcutResponse](#slash-api-v1-DeleteShortcutResponse) | DeleteShortcut deletes a shortcut by name. |
| GetShortcutAnalytics | [GetShortcutAnalyticsRequest](#slash-api-v1-GetShortcutAnalyticsRequest) | [GetShortcutAnalyticsResponse](#slash-api-v1-GetShortcutAnalyticsResponse) | GetShortcutAnalytics returns the analytics for a shortcut. |

 



<a name="api_v1_subscription_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/subscription_service.proto



<a name="slash-api-v1-GetSubscriptionRequest"></a>

### GetSubscriptionRequest







<a name="slash-api-v1-GetSubscriptionResponse"></a>

### GetSubscriptionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| subscription | [Subscription](#slash-api-v1-Subscription) |  |  |






<a name="slash-api-v1-Subscription"></a>

### Subscription



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| plan | [PlanType](#slash-api-v1-PlanType) |  |  |
| started_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| expires_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |






<a name="slash-api-v1-UpdateSubscriptionRequest"></a>

### UpdateSubscriptionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| license_key | [string](#string) |  |  |






<a name="slash-api-v1-UpdateSubscriptionResponse"></a>

### UpdateSubscriptionResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| subscription | [Subscription](#slash-api-v1-Subscription) |  |  |





 


<a name="slash-api-v1-PlanType"></a>

### PlanType


| Name | Number | Description |
| ---- | ------ | ----------- |
| PLAN_TYPE_UNSPECIFIED | 0 |  |
| FREE | 1 |  |
| PRO | 2 |  |


 

 


<a name="slash-api-v1-SubscriptionService"></a>

### SubscriptionService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetSubscription | [GetSubscriptionRequest](#slash-api-v1-GetSubscriptionRequest) | [GetSubscriptionResponse](#slash-api-v1-GetSubscriptionResponse) |  |
| UpdateSubscription | [UpdateSubscriptionRequest](#slash-api-v1-UpdateSubscriptionRequest) | [UpdateSubscriptionResponse](#slash-api-v1-UpdateSubscriptionResponse) |  |

 



<a name="api_v1_user_setting_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/user_setting_service.proto



<a name="slash-api-v1-GetUserSettingRequest"></a>

### GetUserSettingRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |






<a name="slash-api-v1-GetUserSettingResponse"></a>

### GetUserSettingResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user_setting | [UserSetting](#slash-api-v1-UserSetting) |  |  |






<a name="slash-api-v1-UpdateUserSettingRequest"></a>

### UpdateUserSettingRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| user_setting | [UserSetting](#slash-api-v1-UserSetting) |  | user_setting is the user setting to update. |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  | update_mask is the field mask to update. |






<a name="slash-api-v1-UpdateUserSettingResponse"></a>

### UpdateUserSettingResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user_setting | [UserSetting](#slash-api-v1-UserSetting) |  |  |






<a name="slash-api-v1-UserSetting"></a>

### UserSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| locale | [UserSetting.Locale](#slash-api-v1-UserSetting-Locale) |  | locale is the user locale. |
| color_theme | [UserSetting.ColorTheme](#slash-api-v1-UserSetting-ColorTheme) |  | color_theme is the user color theme. |





 


<a name="slash-api-v1-UserSetting-ColorTheme"></a>

### UserSetting.ColorTheme


| Name | Number | Description |
| ---- | ------ | ----------- |
| COLOR_THEME_UNSPECIFIED | 0 |  |
| COLOR_THEME_SYSTEM | 1 |  |
| COLOR_THEME_LIGHT | 2 |  |
| COLOR_THEME_DARK | 3 |  |



<a name="slash-api-v1-UserSetting-Locale"></a>

### UserSetting.Locale


| Name | Number | Description |
| ---- | ------ | ----------- |
| LOCALE_UNSPECIFIED | 0 |  |
| LOCALE_EN | 1 |  |
| LOCALE_ZH | 2 |  |
| LOCALE_FR | 3 |  |


 

 


<a name="slash-api-v1-UserSettingService"></a>

### UserSettingService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetUserSetting | [GetUserSettingRequest](#slash-api-v1-GetUserSettingRequest) | [GetUserSettingResponse](#slash-api-v1-GetUserSettingResponse) | GetUserSetting returns the user setting. |
| UpdateUserSetting | [UpdateUserSettingRequest](#slash-api-v1-UpdateUserSettingRequest) | [UpdateUserSettingResponse](#slash-api-v1-UpdateUserSettingResponse) | UpdateUserSetting updates the user setting. |

 



<a name="api_v1_workspace_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/workspace_service.proto



<a name="slash-api-v1-AutoBackupWorkspaceSetting"></a>

### AutoBackupWorkspaceSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| enabled | [bool](#bool) |  | Whether auto backup is enabled. |
| cron_expression | [string](#string) |  | The cron expression for auto backup. For example, &#34;0 0 0 * * *&#34; means backup at 00:00:00 every day. See https://en.wikipedia.org/wiki/Cron for more details. |
| max_keep | [int32](#int32) |  | The maximum number of backups to keep. |






<a name="slash-api-v1-GetWorkspaceProfileRequest"></a>

### GetWorkspaceProfileRequest







<a name="slash-api-v1-GetWorkspaceProfileResponse"></a>

### GetWorkspaceProfileResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| profile | [WorkspaceProfile](#slash-api-v1-WorkspaceProfile) |  | The workspace profile. |






<a name="slash-api-v1-GetWorkspaceSettingRequest"></a>

### GetWorkspaceSettingRequest







<a name="slash-api-v1-GetWorkspaceSettingResponse"></a>

### GetWorkspaceSettingResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| setting | [WorkspaceSetting](#slash-api-v1-WorkspaceSetting) |  | The user setting. |






<a name="slash-api-v1-UpdateWorkspaceSettingRequest"></a>

### UpdateWorkspaceSettingRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| setting | [WorkspaceSetting](#slash-api-v1-WorkspaceSetting) |  | The user setting. |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  | The update mask. |






<a name="slash-api-v1-UpdateWorkspaceSettingResponse"></a>

### UpdateWorkspaceSettingResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| setting | [WorkspaceSetting](#slash-api-v1-WorkspaceSetting) |  | The user setting. |






<a name="slash-api-v1-WorkspaceProfile"></a>

### WorkspaceProfile



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| mode | [string](#string) |  | Current workspace mode: dev, prod. |
| version | [string](#string) |  | Current workspace version. |
| plan | [PlanType](#slash-api-v1-PlanType) |  | The workspace plan. |
| enable_signup | [bool](#bool) |  | Whether to enable other users to sign up. |
| custom_style | [string](#string) |  | The custom style. |
| custom_script | [string](#string) |  | The custom script. |
| favicon_provider | [string](#string) |  | The url of custom favicon provider. |






<a name="slash-api-v1-WorkspaceSetting"></a>

### WorkspaceSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| license_key | [string](#string) |  |  |
| enable_signup | [bool](#bool) |  | Whether to enable other users to sign up. |
| instance_url | [string](#string) |  | The instance URL. |
| custom_style | [string](#string) |  | The custom style. |
| custom_script | [string](#string) |  | The custom script. |
| auto_backup | [AutoBackupWorkspaceSetting](#slash-api-v1-AutoBackupWorkspaceSetting) |  | The auto backup setting. (Unimplemented) |
| default_visibility | [Visibility](#slash-api-v1-Visibility) |  | The default visibility of shortcuts and collections. |
| favicon_provider | [string](#string) |  | The url of custom favicon provider. |





 

 

 


<a name="slash-api-v1-WorkspaceService"></a>

### WorkspaceService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetWorkspaceProfile | [GetWorkspaceProfileRequest](#slash-api-v1-GetWorkspaceProfileRequest) | [GetWorkspaceProfileResponse](#slash-api-v1-GetWorkspaceProfileResponse) |  |
| GetWorkspaceSetting | [GetWorkspaceSettingRequest](#slash-api-v1-GetWorkspaceSettingRequest) | [GetWorkspaceSettingResponse](#slash-api-v1-GetWorkspaceSettingResponse) |  |
| UpdateWorkspaceSetting | [UpdateWorkspaceSettingRequest](#slash-api-v1-UpdateWorkspaceSettingRequest) | [UpdateWorkspaceSettingResponse](#slash-api-v1-UpdateWorkspaceSettingResponse) |  |

 



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

