# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [api/v1/common.proto](#api_v1_common-proto)
    - [RowStatus](#slash-api-v1-RowStatus)
    - [Visibility](#slash-api-v1-Visibility)
  
- [api/v1/user_service.proto](#api_v1_user_service-proto)
    - [CreateUserAccessTokenRequest](#slash-api-v1-CreateUserAccessTokenRequest)
    - [CreateUserRequest](#slash-api-v1-CreateUserRequest)
    - [DeleteUserAccessTokenRequest](#slash-api-v1-DeleteUserAccessTokenRequest)
    - [DeleteUserRequest](#slash-api-v1-DeleteUserRequest)
    - [GetUserRequest](#slash-api-v1-GetUserRequest)
    - [ListUserAccessTokensRequest](#slash-api-v1-ListUserAccessTokensRequest)
    - [ListUserAccessTokensResponse](#slash-api-v1-ListUserAccessTokensResponse)
    - [ListUsersRequest](#slash-api-v1-ListUsersRequest)
    - [ListUsersResponse](#slash-api-v1-ListUsersResponse)
    - [UpdateUserRequest](#slash-api-v1-UpdateUserRequest)
    - [User](#slash-api-v1-User)
    - [UserAccessToken](#slash-api-v1-UserAccessToken)
  
    - [Role](#slash-api-v1-Role)
  
    - [UserService](#slash-api-v1-UserService)
  
- [api/v1/auth_service.proto](#api_v1_auth_service-proto)
    - [GetAuthStatusRequest](#slash-api-v1-GetAuthStatusRequest)
    - [SignInRequest](#slash-api-v1-SignInRequest)
    - [SignInWithSSORequest](#slash-api-v1-SignInWithSSORequest)
    - [SignOutRequest](#slash-api-v1-SignOutRequest)
    - [SignUpRequest](#slash-api-v1-SignUpRequest)
  
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
    - [DeleteShortcutRequest](#slash-api-v1-DeleteShortcutRequest)
    - [GetShortcutAnalyticsRequest](#slash-api-v1-GetShortcutAnalyticsRequest)
    - [GetShortcutAnalyticsResponse](#slash-api-v1-GetShortcutAnalyticsResponse)
    - [GetShortcutAnalyticsResponse.AnalyticsItem](#slash-api-v1-GetShortcutAnalyticsResponse-AnalyticsItem)
    - [GetShortcutByNameRequest](#slash-api-v1-GetShortcutByNameRequest)
    - [GetShortcutRequest](#slash-api-v1-GetShortcutRequest)
    - [ListShortcutsRequest](#slash-api-v1-ListShortcutsRequest)
    - [ListShortcutsResponse](#slash-api-v1-ListShortcutsResponse)
    - [Shortcut](#slash-api-v1-Shortcut)
    - [Shortcut.OpenGraphMetadata](#slash-api-v1-Shortcut-OpenGraphMetadata)
    - [UpdateShortcutRequest](#slash-api-v1-UpdateShortcutRequest)
  
    - [ShortcutService](#slash-api-v1-ShortcutService)
  
- [api/v1/subscription_service.proto](#api_v1_subscription_service-proto)
    - [DeleteSubscriptionRequest](#slash-api-v1-DeleteSubscriptionRequest)
    - [GetSubscriptionRequest](#slash-api-v1-GetSubscriptionRequest)
    - [Subscription](#slash-api-v1-Subscription)
    - [UpdateSubscriptionRequest](#slash-api-v1-UpdateSubscriptionRequest)
  
    - [PlanType](#slash-api-v1-PlanType)
  
    - [SubscriptionService](#slash-api-v1-SubscriptionService)
  
- [api/v1/user_setting_service.proto](#api_v1_user_setting_service-proto)
    - [GetUserSettingRequest](#slash-api-v1-GetUserSettingRequest)
    - [GetUserSettingResponse](#slash-api-v1-GetUserSettingResponse)
    - [UpdateUserSettingRequest](#slash-api-v1-UpdateUserSettingRequest)
    - [UpdateUserSettingResponse](#slash-api-v1-UpdateUserSettingResponse)
    - [UserSetting](#slash-api-v1-UserSetting)
    - [UserSetting.AccessTokensSetting](#slash-api-v1-UserSetting-AccessTokensSetting)
    - [UserSetting.AccessTokensSetting.AccessToken](#slash-api-v1-UserSetting-AccessTokensSetting-AccessToken)
    - [UserSetting.GeneralSetting](#slash-api-v1-UserSetting-GeneralSetting)
  
    - [UserSettingService](#slash-api-v1-UserSettingService)
  
- [api/v1/workspace_service.proto](#api_v1_workspace_service-proto)
    - [GetWorkspaceProfileRequest](#slash-api-v1-GetWorkspaceProfileRequest)
    - [GetWorkspaceSettingRequest](#slash-api-v1-GetWorkspaceSettingRequest)
    - [IdentityProvider](#slash-api-v1-IdentityProvider)
    - [IdentityProviderConfig](#slash-api-v1-IdentityProviderConfig)
    - [IdentityProviderConfig.FieldMapping](#slash-api-v1-IdentityProviderConfig-FieldMapping)
    - [IdentityProviderConfig.OAuth2Config](#slash-api-v1-IdentityProviderConfig-OAuth2Config)
    - [UpdateWorkspaceSettingRequest](#slash-api-v1-UpdateWorkspaceSettingRequest)
    - [WorkspaceProfile](#slash-api-v1-WorkspaceProfile)
    - [WorkspaceSetting](#slash-api-v1-WorkspaceSetting)
  
    - [IdentityProvider.Type](#slash-api-v1-IdentityProvider-Type)
  
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






<a name="slash-api-v1-CreateUserRequest"></a>

### CreateUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user | [User](#slash-api-v1-User) |  |  |






<a name="slash-api-v1-DeleteUserAccessTokenRequest"></a>

### DeleteUserAccessTokenRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  | id is the user id. |
| access_token | [string](#string) |  | access_token is the access token to delete. |






<a name="slash-api-v1-DeleteUserRequest"></a>

### DeleteUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-GetUserRequest"></a>

### GetUserRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






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
| GetUser | [GetUserRequest](#slash-api-v1-GetUserRequest) | [User](#slash-api-v1-User) | GetUser returns a user by id. |
| CreateUser | [CreateUserRequest](#slash-api-v1-CreateUserRequest) | [User](#slash-api-v1-User) | CreateUser creates a new user. |
| UpdateUser | [UpdateUserRequest](#slash-api-v1-UpdateUserRequest) | [User](#slash-api-v1-User) |  |
| DeleteUser | [DeleteUserRequest](#slash-api-v1-DeleteUserRequest) | [.google.protobuf.Empty](#google-protobuf-Empty) | DeleteUser deletes a user by id. |
| ListUserAccessTokens | [ListUserAccessTokensRequest](#slash-api-v1-ListUserAccessTokensRequest) | [ListUserAccessTokensResponse](#slash-api-v1-ListUserAccessTokensResponse) | ListUserAccessTokens returns a list of access tokens for a user. |
| CreateUserAccessToken | [CreateUserAccessTokenRequest](#slash-api-v1-CreateUserAccessTokenRequest) | [UserAccessToken](#slash-api-v1-UserAccessToken) | CreateUserAccessToken creates a new access token for a user. |
| DeleteUserAccessToken | [DeleteUserAccessTokenRequest](#slash-api-v1-DeleteUserAccessTokenRequest) | [.google.protobuf.Empty](#google-protobuf-Empty) | DeleteUserAccessToken deletes an access token for a user. |

 



<a name="api_v1_auth_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/auth_service.proto



<a name="slash-api-v1-GetAuthStatusRequest"></a>

### GetAuthStatusRequest







<a name="slash-api-v1-SignInRequest"></a>

### SignInRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| email | [string](#string) |  |  |
| password | [string](#string) |  |  |






<a name="slash-api-v1-SignInWithSSORequest"></a>

### SignInWithSSORequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| idp_id | [string](#string) |  | The id of the SSO provider. |
| code | [string](#string) |  | The code to sign in with. |
| redirect_uri | [string](#string) |  | The redirect URI. |






<a name="slash-api-v1-SignOutRequest"></a>

### SignOutRequest







<a name="slash-api-v1-SignUpRequest"></a>

### SignUpRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| email | [string](#string) |  |  |
| nickname | [string](#string) |  |  |
| password | [string](#string) |  |  |





 

 

 


<a name="slash-api-v1-AuthService"></a>

### AuthService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetAuthStatus | [GetAuthStatusRequest](#slash-api-v1-GetAuthStatusRequest) | [User](#slash-api-v1-User) | GetAuthStatus returns the current auth status of the user. |
| SignIn | [SignInRequest](#slash-api-v1-SignInRequest) | [User](#slash-api-v1-User) | SignIn signs in the user with the given username and password. |
| SignInWithSSO | [SignInWithSSORequest](#slash-api-v1-SignInWithSSORequest) | [User](#slash-api-v1-User) | SignInWithSSO signs in the user with the given SSO code. |
| SignUp | [SignUpRequest](#slash-api-v1-SignUpRequest) | [User](#slash-api-v1-User) | SignUp signs up the user with the given username and password. |
| SignOut | [SignOutRequest](#slash-api-v1-SignOutRequest) | [.google.protobuf.Empty](#google-protobuf-Empty) | SignOut signs out the user. |

 



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






<a name="slash-api-v1-DeleteShortcutRequest"></a>

### DeleteShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






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






<a name="slash-api-v1-GetShortcutRequest"></a>

### GetShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |






<a name="slash-api-v1-ListShortcutsRequest"></a>

### ListShortcutsRequest







<a name="slash-api-v1-ListShortcutsResponse"></a>

### ListShortcutsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcuts | [Shortcut](#slash-api-v1-Shortcut) | repeated |  |






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
| og_metadata | [Shortcut.OpenGraphMetadata](#slash-api-v1-Shortcut-OpenGraphMetadata) |  |  |






<a name="slash-api-v1-Shortcut-OpenGraphMetadata"></a>

### Shortcut.OpenGraphMetadata



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| title | [string](#string) |  |  |
| description | [string](#string) |  |  |
| image | [string](#string) |  |  |






<a name="slash-api-v1-UpdateShortcutRequest"></a>

### UpdateShortcutRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut | [Shortcut](#slash-api-v1-Shortcut) |  |  |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  |  |





 

 

 


<a name="slash-api-v1-ShortcutService"></a>

### ShortcutService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| ListShortcuts | [ListShortcutsRequest](#slash-api-v1-ListShortcutsRequest) | [ListShortcutsResponse](#slash-api-v1-ListShortcutsResponse) | ListShortcuts returns a list of shortcuts. |
| GetShortcut | [GetShortcutRequest](#slash-api-v1-GetShortcutRequest) | [Shortcut](#slash-api-v1-Shortcut) | GetShortcut returns a shortcut by id. |
| GetShortcutByName | [GetShortcutByNameRequest](#slash-api-v1-GetShortcutByNameRequest) | [Shortcut](#slash-api-v1-Shortcut) | GetShortcutByName returns a shortcut by name. |
| CreateShortcut | [CreateShortcutRequest](#slash-api-v1-CreateShortcutRequest) | [Shortcut](#slash-api-v1-Shortcut) | CreateShortcut creates a shortcut. |
| UpdateShortcut | [UpdateShortcutRequest](#slash-api-v1-UpdateShortcutRequest) | [Shortcut](#slash-api-v1-Shortcut) | UpdateShortcut updates a shortcut. |
| DeleteShortcut | [DeleteShortcutRequest](#slash-api-v1-DeleteShortcutRequest) | [.google.protobuf.Empty](#google-protobuf-Empty) | DeleteShortcut deletes a shortcut by name. |
| GetShortcutAnalytics | [GetShortcutAnalyticsRequest](#slash-api-v1-GetShortcutAnalyticsRequest) | [GetShortcutAnalyticsResponse](#slash-api-v1-GetShortcutAnalyticsResponse) | GetShortcutAnalytics returns the analytics for a shortcut. |

 



<a name="api_v1_subscription_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/subscription_service.proto



<a name="slash-api-v1-DeleteSubscriptionRequest"></a>

### DeleteSubscriptionRequest







<a name="slash-api-v1-GetSubscriptionRequest"></a>

### GetSubscriptionRequest







<a name="slash-api-v1-Subscription"></a>

### Subscription



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| plan | [PlanType](#slash-api-v1-PlanType) |  |  |
| started_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| expires_time | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| features | [string](#string) | repeated |  |
| seats | [int32](#int32) |  |  |
| shortcuts_limit | [int32](#int32) |  |  |
| collections_limit | [int32](#int32) |  |  |






<a name="slash-api-v1-UpdateSubscriptionRequest"></a>

### UpdateSubscriptionRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| license_key | [string](#string) |  |  |





 


<a name="slash-api-v1-PlanType"></a>

### PlanType


| Name | Number | Description |
| ---- | ------ | ----------- |
| PLAN_TYPE_UNSPECIFIED | 0 |  |
| FREE | 1 |  |
| PRO | 2 |  |
| ENTERPRISE | 3 |  |


 

 


<a name="slash-api-v1-SubscriptionService"></a>

### SubscriptionService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetSubscription | [GetSubscriptionRequest](#slash-api-v1-GetSubscriptionRequest) | [Subscription](#slash-api-v1-Subscription) | GetSubscription gets the current subscription of Slash instance. |
| UpdateSubscription | [UpdateSubscriptionRequest](#slash-api-v1-UpdateSubscriptionRequest) | [Subscription](#slash-api-v1-Subscription) | UpdateSubscription updates the subscription. |
| DeleteSubscription | [DeleteSubscriptionRequest](#slash-api-v1-DeleteSubscriptionRequest) | [Subscription](#slash-api-v1-Subscription) | DeleteSubscription deletes the subscription. |

 



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
| user_id | [int32](#int32) |  |  |
| general | [UserSetting.GeneralSetting](#slash-api-v1-UserSetting-GeneralSetting) |  |  |
| access_tokens | [UserSetting.AccessTokensSetting](#slash-api-v1-UserSetting-AccessTokensSetting) |  |  |






<a name="slash-api-v1-UserSetting-AccessTokensSetting"></a>

### UserSetting.AccessTokensSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_tokens | [UserSetting.AccessTokensSetting.AccessToken](#slash-api-v1-UserSetting-AccessTokensSetting-AccessToken) | repeated | Nested repeated field |






<a name="slash-api-v1-UserSetting-AccessTokensSetting-AccessToken"></a>

### UserSetting.AccessTokensSetting.AccessToken



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_token | [string](#string) |  | The access token is a JWT token, including expiration time, issuer, etc. |
| description | [string](#string) |  | A description for the access token. |






<a name="slash-api-v1-UserSetting-GeneralSetting"></a>

### UserSetting.GeneralSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| locale | [string](#string) |  |  |
| color_theme | [string](#string) |  |  |





 

 

 


<a name="slash-api-v1-UserSettingService"></a>

### UserSettingService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetUserSetting | [GetUserSettingRequest](#slash-api-v1-GetUserSettingRequest) | [GetUserSettingResponse](#slash-api-v1-GetUserSettingResponse) | GetUserSetting returns the user setting. |
| UpdateUserSetting | [UpdateUserSettingRequest](#slash-api-v1-UpdateUserSettingRequest) | [UpdateUserSettingResponse](#slash-api-v1-UpdateUserSettingResponse) | UpdateUserSetting updates the user setting. |

 



<a name="api_v1_workspace_service-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## api/v1/workspace_service.proto



<a name="slash-api-v1-GetWorkspaceProfileRequest"></a>

### GetWorkspaceProfileRequest







<a name="slash-api-v1-GetWorkspaceSettingRequest"></a>

### GetWorkspaceSettingRequest







<a name="slash-api-v1-IdentityProvider"></a>

### IdentityProvider



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  | The unique identifier of the identity provider. |
| title | [string](#string) |  |  |
| type | [IdentityProvider.Type](#slash-api-v1-IdentityProvider-Type) |  |  |
| config | [IdentityProviderConfig](#slash-api-v1-IdentityProviderConfig) |  |  |






<a name="slash-api-v1-IdentityProviderConfig"></a>

### IdentityProviderConfig



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| oauth2 | [IdentityProviderConfig.OAuth2Config](#slash-api-v1-IdentityProviderConfig-OAuth2Config) |  |  |






<a name="slash-api-v1-IdentityProviderConfig-FieldMapping"></a>

### IdentityProviderConfig.FieldMapping



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| identifier | [string](#string) |  |  |
| display_name | [string](#string) |  |  |






<a name="slash-api-v1-IdentityProviderConfig-OAuth2Config"></a>

### IdentityProviderConfig.OAuth2Config



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| client_id | [string](#string) |  |  |
| client_secret | [string](#string) |  |  |
| auth_url | [string](#string) |  |  |
| token_url | [string](#string) |  |  |
| user_info_url | [string](#string) |  |  |
| scopes | [string](#string) | repeated |  |
| field_mapping | [IdentityProviderConfig.FieldMapping](#slash-api-v1-IdentityProviderConfig-FieldMapping) |  |  |






<a name="slash-api-v1-UpdateWorkspaceSettingRequest"></a>

### UpdateWorkspaceSettingRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| setting | [WorkspaceSetting](#slash-api-v1-WorkspaceSetting) |  | The user setting. |
| update_mask | [google.protobuf.FieldMask](#google-protobuf-FieldMask) |  | The update mask. |






<a name="slash-api-v1-WorkspaceProfile"></a>

### WorkspaceProfile



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| mode | [string](#string) |  | Current workspace mode: dev, prod. |
| version | [string](#string) |  | Current workspace version. |
| subscription | [Subscription](#slash-api-v1-Subscription) |  | The workspace subscription. |
| enable_signup | [bool](#bool) |  | Whether to enable other users to sign up. |
| custom_style | [string](#string) |  | The custom style. |
| owner | [string](#string) |  | The owner name. Format: &#34;users/{id}&#34; |
| branding | [bytes](#bytes) |  | The workspace branding. |






<a name="slash-api-v1-WorkspaceSetting"></a>

### WorkspaceSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| instance_url | [string](#string) |  | The url of instance. |
| branding | [bytes](#bytes) |  | The workspace custome branding. |
| custom_style | [string](#string) |  | The custom style. |
| default_visibility | [Visibility](#slash-api-v1-Visibility) |  | The default visibility of shortcuts and collections. |
| identity_providers | [IdentityProvider](#slash-api-v1-IdentityProvider) | repeated | The identity providers. |
| disallow_user_registration | [bool](#bool) |  | Whether to disallow user registration by email&amp;password. |





 


<a name="slash-api-v1-IdentityProvider-Type"></a>

### IdentityProvider.Type


| Name | Number | Description |
| ---- | ------ | ----------- |
| TYPE_UNSPECIFIED | 0 |  |
| OAUTH2 | 1 |  |


 

 


<a name="slash-api-v1-WorkspaceService"></a>

### WorkspaceService


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| GetWorkspaceProfile | [GetWorkspaceProfileRequest](#slash-api-v1-GetWorkspaceProfileRequest) | [WorkspaceProfile](#slash-api-v1-WorkspaceProfile) |  |
| GetWorkspaceSetting | [GetWorkspaceSettingRequest](#slash-api-v1-GetWorkspaceSettingRequest) | [WorkspaceSetting](#slash-api-v1-WorkspaceSetting) |  |
| UpdateWorkspaceSetting | [UpdateWorkspaceSettingRequest](#slash-api-v1-UpdateWorkspaceSettingRequest) | [WorkspaceSetting](#slash-api-v1-WorkspaceSetting) |  |

 



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

