# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [store/activity.proto](#store_activity-proto)
    - [ActivityShorcutCreatePayload](#slash-store-ActivityShorcutCreatePayload)
    - [ActivityShorcutViewPayload](#slash-store-ActivityShorcutViewPayload)
  
- [store/common.proto](#store_common-proto)
    - [RowStatus](#slash-store-RowStatus)
    - [Visibility](#slash-store-Visibility)
  
- [store/collection.proto](#store_collection-proto)
    - [Collection](#slash-store-Collection)
  
- [store/idp.proto](#store_idp-proto)
    - [IdentityProvider](#slash-store-IdentityProvider)
    - [IdentityProviderConfig](#slash-store-IdentityProviderConfig)
    - [IdentityProviderConfig.FieldMapping](#slash-store-IdentityProviderConfig-FieldMapping)
    - [IdentityProviderConfig.OAuth2Config](#slash-store-IdentityProviderConfig-OAuth2Config)
  
    - [IdentityProvider.Type](#slash-store-IdentityProvider-Type)
  
- [store/shortcut.proto](#store_shortcut-proto)
    - [OpenGraphMetadata](#slash-store-OpenGraphMetadata)
    - [Shortcut](#slash-store-Shortcut)
  
- [store/user_setting.proto](#store_user_setting-proto)
    - [UserSetting](#slash-store-UserSetting)
    - [UserSetting.AccessTokensSetting](#slash-store-UserSetting-AccessTokensSetting)
    - [UserSetting.AccessTokensSetting.AccessToken](#slash-store-UserSetting-AccessTokensSetting-AccessToken)
    - [UserSetting.GeneralSetting](#slash-store-UserSetting-GeneralSetting)
  
    - [UserSettingKey](#slash-store-UserSettingKey)
  
- [store/workspace_setting.proto](#store_workspace_setting-proto)
    - [WorkspaceSetting](#slash-store-WorkspaceSetting)
    - [WorkspaceSetting.GeneralSetting](#slash-store-WorkspaceSetting-GeneralSetting)
    - [WorkspaceSetting.IdentityProviderSetting](#slash-store-WorkspaceSetting-IdentityProviderSetting)
    - [WorkspaceSetting.ShortcutRelatedSetting](#slash-store-WorkspaceSetting-ShortcutRelatedSetting)
  
    - [WorkspaceSettingKey](#slash-store-WorkspaceSettingKey)
  
- [Scalar Value Types](#scalar-value-types)



<a name="store_activity-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## store/activity.proto



<a name="slash-store-ActivityShorcutCreatePayload"></a>

### ActivityShorcutCreatePayload



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut_id | [int32](#int32) |  |  |






<a name="slash-store-ActivityShorcutViewPayload"></a>

### ActivityShorcutViewPayload



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| shortcut_id | [int32](#int32) |  |  |
| ip | [string](#string) |  |  |
| referer | [string](#string) |  |  |
| user_agent | [string](#string) |  |  |





 

 

 

 



<a name="store_common-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## store/common.proto


 


<a name="slash-store-RowStatus"></a>

### RowStatus


| Name | Number | Description |
| ---- | ------ | ----------- |
| ROW_STATUS_UNSPECIFIED | 0 |  |
| NORMAL | 1 |  |
| ARCHIVED | 2 |  |



<a name="slash-store-Visibility"></a>

### Visibility


| Name | Number | Description |
| ---- | ------ | ----------- |
| VISIBILITY_UNSPECIFIED | 0 |  |
| PRIVATE | 1 |  |
| WORKSPACE | 2 |  |
| PUBLIC | 3 |  |


 

 

 



<a name="store_collection-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## store/collection.proto



<a name="slash-store-Collection"></a>

### Collection



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |
| creator_id | [int32](#int32) |  |  |
| created_ts | [int64](#int64) |  |  |
| updated_ts | [int64](#int64) |  |  |
| name | [string](#string) |  |  |
| title | [string](#string) |  |  |
| description | [string](#string) |  |  |
| shortcut_ids | [int32](#int32) | repeated |  |
| visibility | [Visibility](#slash-store-Visibility) |  |  |





 

 

 

 



<a name="store_idp-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## store/idp.proto



<a name="slash-store-IdentityProvider"></a>

### IdentityProvider



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  |  |
| title | [string](#string) |  |  |
| type | [IdentityProvider.Type](#slash-store-IdentityProvider-Type) |  |  |
| config | [IdentityProviderConfig](#slash-store-IdentityProviderConfig) |  |  |






<a name="slash-store-IdentityProviderConfig"></a>

### IdentityProviderConfig



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| oauth2 | [IdentityProviderConfig.OAuth2Config](#slash-store-IdentityProviderConfig-OAuth2Config) |  |  |






<a name="slash-store-IdentityProviderConfig-FieldMapping"></a>

### IdentityProviderConfig.FieldMapping



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| identifier | [string](#string) |  |  |
| display_name | [string](#string) |  |  |






<a name="slash-store-IdentityProviderConfig-OAuth2Config"></a>

### IdentityProviderConfig.OAuth2Config



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| client_id | [string](#string) |  |  |
| client_secret | [string](#string) |  |  |
| auth_url | [string](#string) |  |  |
| token_url | [string](#string) |  |  |
| user_info_url | [string](#string) |  |  |
| scopes | [string](#string) | repeated |  |
| field_mapping | [IdentityProviderConfig.FieldMapping](#slash-store-IdentityProviderConfig-FieldMapping) |  |  |





 


<a name="slash-store-IdentityProvider-Type"></a>

### IdentityProvider.Type


| Name | Number | Description |
| ---- | ------ | ----------- |
| TYPE_UNSPECIFIED | 0 |  |
| OAUTH2 | 1 |  |


 

 

 



<a name="store_shortcut-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## store/shortcut.proto



<a name="slash-store-OpenGraphMetadata"></a>

### OpenGraphMetadata



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| title | [string](#string) |  |  |
| description | [string](#string) |  |  |
| image | [string](#string) |  |  |






<a name="slash-store-Shortcut"></a>

### Shortcut



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [int32](#int32) |  |  |
| creator_id | [int32](#int32) |  |  |
| created_ts | [int64](#int64) |  |  |
| updated_ts | [int64](#int64) |  |  |
| row_status | [RowStatus](#slash-store-RowStatus) |  |  |
| name | [string](#string) |  |  |
| link | [string](#string) |  |  |
| title | [string](#string) |  |  |
| tags | [string](#string) | repeated |  |
| description | [string](#string) |  |  |
| visibility | [Visibility](#slash-store-Visibility) |  |  |
| og_metadata | [OpenGraphMetadata](#slash-store-OpenGraphMetadata) |  |  |





 

 

 

 



<a name="store_user_setting-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## store/user_setting.proto



<a name="slash-store-UserSetting"></a>

### UserSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| user_id | [int32](#int32) |  |  |
| key | [UserSettingKey](#slash-store-UserSettingKey) |  |  |
| general | [UserSetting.GeneralSetting](#slash-store-UserSetting-GeneralSetting) |  |  |
| access_tokens | [UserSetting.AccessTokensSetting](#slash-store-UserSetting-AccessTokensSetting) |  |  |






<a name="slash-store-UserSetting-AccessTokensSetting"></a>

### UserSetting.AccessTokensSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_tokens | [UserSetting.AccessTokensSetting.AccessToken](#slash-store-UserSetting-AccessTokensSetting-AccessToken) | repeated | Nested repeated field |






<a name="slash-store-UserSetting-AccessTokensSetting-AccessToken"></a>

### UserSetting.AccessTokensSetting.AccessToken



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_token | [string](#string) |  | The access token is a JWT token, including expiration time, issuer, etc. |
| description | [string](#string) |  | A description for the access token. |






<a name="slash-store-UserSetting-GeneralSetting"></a>

### UserSetting.GeneralSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| locale | [string](#string) |  |  |
| color_theme | [string](#string) |  |  |





 


<a name="slash-store-UserSettingKey"></a>

### UserSettingKey


| Name | Number | Description |
| ---- | ------ | ----------- |
| USER_SETTING_KEY_UNSPECIFIED | 0 |  |
| USER_SETTING_GENERAL | 1 | User general settings. |
| USER_SETTING_ACCESS_TOKENS | 2 | User access tokens. |


 

 

 



<a name="store_workspace_setting-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## store/workspace_setting.proto



<a name="slash-store-WorkspaceSetting"></a>

### WorkspaceSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| key | [WorkspaceSettingKey](#slash-store-WorkspaceSettingKey) |  |  |
| raw | [string](#string) |  |  |
| general | [WorkspaceSetting.GeneralSetting](#slash-store-WorkspaceSetting-GeneralSetting) |  |  |
| shortcut_related | [WorkspaceSetting.ShortcutRelatedSetting](#slash-store-WorkspaceSetting-ShortcutRelatedSetting) |  |  |
| identity_provider | [WorkspaceSetting.IdentityProviderSetting](#slash-store-WorkspaceSetting-IdentityProviderSetting) |  |  |






<a name="slash-store-WorkspaceSetting-GeneralSetting"></a>

### WorkspaceSetting.GeneralSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| secret_session | [string](#string) |  |  |
| license_key | [string](#string) |  |  |
| branding | [bytes](#bytes) |  |  |
| custom_style | [string](#string) |  |  |






<a name="slash-store-WorkspaceSetting-IdentityProviderSetting"></a>

### WorkspaceSetting.IdentityProviderSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| identity_providers | [IdentityProvider](#slash-store-IdentityProvider) | repeated |  |






<a name="slash-store-WorkspaceSetting-ShortcutRelatedSetting"></a>

### WorkspaceSetting.ShortcutRelatedSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| default_visibility | [Visibility](#slash-store-Visibility) |  |  |





 


<a name="slash-store-WorkspaceSettingKey"></a>

### WorkspaceSettingKey


| Name | Number | Description |
| ---- | ------ | ----------- |
| WORKSPACE_SETTING_KEY_UNSPECIFIED | 0 |  |
| WORKSPACE_SETTING_GENERAL | 1 | Workspace general settings. |
| WORKSPACE_SETTING_SHORTCUT_RELATED | 2 | Workspace shortcut-related settings. |
| WORKSPACE_SETTING_IDENTITY_PROVIDER | 3 | Workspace identity provider settings. |
| WORKSPACE_SETTING_LICENSE_KEY | 10 | TODO: remove the following keys. The license key. |
| WORKSPACE_SETTING_SECRET_SESSION | 11 | The secret session key used to encrypt session data. |
| WORKSPACE_SETTING_CUSTOM_STYLE | 12 | The custom style. |
| WORKSPACE_SETTING_DEFAULT_VISIBILITY | 13 | The default visibility of shortcuts and collections. |


 

 

 



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

