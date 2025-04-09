# Single Sign-On(SSO)

> **Note**: This feature is only available in the **Team** plan.

**Single Sign-On (SSO)** is an authentication method that enables users to securely authenticate with multiple applications and websites by using just one set of credentials.

Slash supports SSO integration with **OAuth 2.0** standard.

## Create a new SSO provider

As an Admin user, you can create a new SSO provider in Setting > Workspace settings > SSO.

![sso-setting](../assets/getting-started/sso-setting.png)

For example, to integrate with GitHub, you might need to fill in the following fields:

![github-sso](../assets/getting-started/github-sso.png)

### Identity provider information

The information is the base concept of OAuth 2.0 and comes from your provider.

- **Client ID** is a public identifier of the custom provider;
- **Client Secret** is the OAuth2 client secret from identity provider;
- **Authorization endpoint** is the custom provider's OAuth2 login page address;
- **Token endpoint** is the API address for obtaining access token;
- **User endpoint** URL is the API address for obtaining user information by access token;
- **Scopes** is the scope parameter carried when accessing the OAuth2 URL, which is filled in according to the custom provider;

### User information mapping

For different providers, the structures returned by their user information API are usually not the same. In order to know how to map the user information from an provider into user fields, you need to fill the user information mapping form.

Slash will use the mapping to import the user profile fields when creating new accounts. The most important user field mapping is the identifier which is used to identify the Slash account associated with the OAuth 2.0 login.

- **Identifier** is the field name of primary email in 3rd-party user info;
- **Display name** is the field name of display name in 3rd-party user info (optional);
