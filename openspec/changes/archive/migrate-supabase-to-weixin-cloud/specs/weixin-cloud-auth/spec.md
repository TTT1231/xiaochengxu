## ADDED Requirements

### Requirement: Cloud function obtains user identity automatically
The system SHALL use WeChat Cloud Function's `getWxContext()` to obtain the caller's `OPENID` automatically on every cloud function invocation. The client SHALL NOT pass `openid` as a parameter to cloud functions. The client SHALL NOT call `wx.login()` — the cloud function call itself carries user identity.

#### Scenario: New user calls login cloud function
- **WHEN** a new user invokes the `user-login` cloud function from the mini program
- **THEN** the cloud function extracts `OPENID` from `getWxContext()`, checks if user exists in the `users` collection, creates the user record and initializes credits if not found, and returns user profile data

#### Scenario: Existing user calls login cloud function
- **WHEN** an existing user invokes the `user-login` cloud function
- **THEN** the cloud function extracts `OPENID` from `getWxContext()`, finds the existing user record, and returns the user profile with credits data

#### Scenario: Cloud function called without valid identity
- **WHEN** a cloud function is called but `getWxContext()` returns no `OPENID`
- **THEN** the cloud function SHALL return an error with a clear message indicating authentication failure

#### Scenario: App restart restores session
- **WHEN** the user closes and reopens the mini program
- **THEN** the system SHALL call `wx.cloud.callFunction('user-login')` to re-establish the session. No `wx.login()` or stored tokens are needed — the cloud function call inherently carries user identity.

### Requirement: Remove JWT-based token management
The system SHALL remove all JWT parsing, token expiry checking, token refresh, and token storage logic. The `userStore` SHALL NOT store `accessToken`, `refreshToken`, or parse JWT payloads.

#### Scenario: App startup restores user session
- **WHEN** the mini program starts and calls the `user-login` cloud function
- **THEN** the system obtains user identity via cloud function context and loads the user profile without requiring stored tokens

### Requirement: User record creation generates unique display ID
The system SHALL generate a unique 7-digit display ID for each new user. The generation MUST ensure uniqueness via database query with retry logic.

#### Scenario: First user registration
- **WHEN** a new user is created with openid `abc123`
- **THEN** the system generates a 7-digit display ID (e.g. `9616095`), checks uniqueness against existing records, and inserts the user with default level `普通会员`

#### Scenario: Display ID collision during registration
- **WHEN** a generated display ID already exists in the `users` collection
- **THEN** the system SHALL retry with a salted seed up to 100 attempts before failing

#### Scenario: Concurrent registration with same display ID
- **WHEN** two users register simultaneously and the same display ID is generated for both
- **THEN** the system accepts the theoretical race window (extremely low probability with 7-digit space and retry logic). The `id` field is stored as a regular field (not `_id`), so duplicate IDs would need manual resolution. This is acceptable for the low-traffic nature of the app.

### Requirement: New user initialization creates credits record
The system SHALL create a `credits` record with `total_scores: 0` and `available_scores: 0` for every new user during registration.

#### Scenario: New user registration creates credits
- **WHEN** a new user is successfully created
- **THEN** a corresponding `credits` document with `users_id` set to the user's `openid` and both score fields set to `0` MUST also be created

#### Scenario: Credits creation fails after user creation
- **WHEN** the user record is created but credits record creation fails
- **THEN** the system SHALL delete the created user record and return a registration failure error
