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
  
- [store/shortcut.proto](#store_shortcut-proto)
    - [OpenGraphMetadata](#slash-store-OpenGraphMetadata)
    - [Shortcut](#slash-store-Shortcut)
  
- [store/user_setting.proto](#store_user_setting-proto)
    - [UserSetting](#slash-store-UserSetting)
    - [UserSettingAccessTokens](#slash-store-UserSettingAccessTokens)
    - [UserSettingAccessTokens.AccessToken](#slash-store-UserSettingAccessTokens-AccessToken)
    - [UserSettingGeneral](#slash-store-UserSettingGeneral)
  
    - [UserSettingKey](#slash-store-UserSettingKey)
  
- [store/workspace_setting.proto](#store_workspace_setting-proto)
    - [WorkspaceSetting](#slash-store-WorkspaceSetting)
  
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
| general | [UserSettingGeneral](#slash-store-UserSettingGeneral) |  |  |
| access_tokens | [UserSettingAccessTokens](#slash-store-UserSettingAccessTokens) |  |  |






<a name="slash-store-UserSettingAccessTokens"></a>

### UserSettingAccessTokens



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_tokens | [UserSettingAccessTokens.AccessToken](#slash-store-UserSettingAccessTokens-AccessToken) | repeated |  |






<a name="slash-store-UserSettingAccessTokens-AccessToken"></a>

### UserSettingAccessTokens.AccessToken



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_token | [string](#string) |  | The access token is a JWT token. Including expiration time, issuer, etc. |
| description | [string](#string) |  | A description for the access token. |






<a name="slash-store-UserSettingGeneral"></a>

### UserSettingGeneral



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| locale | [string](#string) |  |  |
| color_theme | [string](#string) |  |  |





 


<a name="slash-store-UserSettingKey"></a>

### UserSettingKey


| Name | Number | Description |
| ---- | ------ | ----------- |
| USER_SETTING_KEY_UNSPECIFIED | 0 |  |
| GENERAL | 1 | General settings for the user. |
| ACCESS_TOKENS | 2 | Access tokens for the user. |


 

 

 



<a name="store_workspace_setting-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## store/workspace_setting.proto



<a name="slash-store-WorkspaceSetting"></a>

### WorkspaceSetting



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| key | [WorkspaceSettingKey](#slash-store-WorkspaceSettingKey) |  |  |
| license_key | [string](#string) |  | The license key of workspace. |
| secret_session | [string](#string) |  | The secret session key used to encrypt session data. |
| enable_signup | [bool](#bool) |  | Whether to enable other users to sign up. |
| custom_style | [string](#string) |  | The custom style. |
| instance_url | [string](#string) |  | The instance URL of workspace. |
| default_visibility | [Visibility](#slash-store-Visibility) |  | The default visibility of shortcuts and collections. |
| favicon_provider | [string](#string) |  | The url of custom favicon provider. e.g. https://github.com/yourselfhosted/favicons |





 


<a name="slash-store-WorkspaceSettingKey"></a>

### WorkspaceSettingKey


| Name | Number | Description |
| ---- | ------ | ----------- |
| WORKSPACE_SETTING_KEY_UNSPECIFIED | 0 |  |
| WORKSPACE_SETTING_LICENSE_KEY | 1 | The license key. |
| WORKSPACE_SETTING_SECRET_SESSION | 2 | The secret session key used to encrypt session data. |
| WORKSAPCE_SETTING_ENABLE_SIGNUP | 3 | Whether to enable other users to sign up. |
| WORKSPACE_SETTING_CUSTOM_STYLE | 4 | The custom style. |
| WORKSPACE_SETTING_INSTANCE_URL | 7 | The instance URL. |
| WORKSPACE_SETTING_DEFAULT_VISIBILITY | 8 | The default visibility of shortcuts and collections. |
| WORKSPACE_SETTING_FAVICON_PROVIDER | 9 | The url of custom favicon provider. |


 

 

 



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

