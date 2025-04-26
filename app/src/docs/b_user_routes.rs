//! Routes for interacting with user accounts.
//!
//! The choice for using singular form of "user" is intentional. The server will not provide ways to
//! interact with other user data. The only way to get user data is through merchant-only routes via
//! order objects.
//!
//! # GET `/user`
//!
//! Returns the currently logged-in user. This should be ideally fetched only once and kept as part
//! of the application state after the user has logged in throughout the frontend's lifetime.
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`200 OK`]
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! | Name          | Type         | Nullable?                                   |
//! |---------------|--------------|---------------------------------------------|
//! | `id`          | [`Uuid`]     | No                                          |
//! | `role`        | [`UserRole`] | No                                          |
//! | `email`       | [`String`]   | No                                          |
//! | `name`        | [`String`]   | No                                          |
//! | `tel`         | [`String`]   | Yes (unonboarded, [`Merchant`])             |
//! | `class`       | [`i16`]      | Yes (unonboarded, [`Teacher`]/[`Merchant`]) |
//! | `classNo`     | [`i16`]      | Yes (unonboarded, [`Teacher`]/[`Merchant`]) |
//! | `profileUrl`  | [`String`]   | No                                          |
//! | `isOnboarded` | [`bool`]     | No                                          |
//!
//! # PATCH `/user`
//!
//! Updates the user's profile with provided information. **Do not use** this route to onboard, the
//! server will reject the request if so. See the documentation for [`/user/onboard`] on how to
//! update onboarding information.
//!
//! [`/user/onboard`]: #post-useronboard
//!
//! ## Request
//!
//! Content type: `application/json`
//!
//! #### Request body
//!
//! | Name      | Type       | Required? |
//! |-----------|------------|-----------|
//! | `tel`     | [`String`] | No        |
//! | `class`   | [`i16`]    | No        |
//! | `classNo` | [`i16`]    | No        |
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`200 OK`]
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! | Name          | Type         | Nullable?                      |
//! |---------------|--------------|--------------------------------|
//! | `id`          | [`Uuid`]     | No                             |
//! | `role`        | [`UserRole`] | No                             |
//! | `email`       | [`String`]   | No                             |
//! | `name`        | [`String`]   | No                             |
//! | `tel`         | [`String`]   | Yes ([`Merchant`])             |
//! | `class`       | [`i16`]      | Yes ([`Teacher`]/[`Merchant`]) |
//! | `classNo`     | [`i16`]      | Yes ([`Teacher`]/[`Merchant`]) |
//! | `profileUrl`  | [`String`]   | No                             |
//! | `isOnboarded` | [`bool`]     | No                             |
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! Will be returned if no fields were provided for update, or if certain fields were set for the
//! wrong [`UserRole`] (e.g. setting `classNo` for [`Teacher`]s).
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! # POST `/user/onboard`
//!
//! Sends required user onboarding information which is saved. Allows the user to access the rest of
//! the application.
//!
//! ## Request
//!
//! Content type: `application/json`
//!
//! #### Request body
//!
//! | Name      | Type       | Required?                     |
//! |-----------|------------|-------------------------------|
//! | `tel`     | [`String`] | Yes ([`Student`]/[`Teacher`]) |
//! | `class`   | [`i16`]    | Yes ([`Student`])             |
//! | `classNo` | [`i16`]    | Yes ([`Student`])             |
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`200 OK`]
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! | Name          | Type         | Nullable?                      |
//! |---------------|--------------|--------------------------------|
//! | `id`          | [`Uuid`]     | No                             |
//! | `role`        | [`UserRole`] | No                             |
//! | `email`       | [`String`]   | No                             |
//! | `name`        | [`String`]   | No                             |
//! | `tel`         | [`String`]   | Yes ([`Merchant`])             |
//! | `class`       | [`i16`]      | Yes ([`Teacher`]/[`Merchant`]) |
//! | `classNo`     | [`i16`]      | Yes ([`Teacher`]/[`Merchant`]) |
//! | `profileUrl`  | [`String`]   | No                             |
//! | `isOnboarded` | [`bool`]     | No                             |
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! Will be returned if all the required fields were not set, or if certain fields were set for the
//! wrong [`UserRole`] (e.g. setting `classNo` for [`Teacher`]s).
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! [`200 OK`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/200
//! [`400 Bad Request`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/400
//!
//! [`Uuid`]: uuid::Uuid
//! [`UserRole`]: graphein_common::schemas::enums::UserRole
//! [`Student`]:  graphein_common::schemas::enums::UserRole::Student
//! [`Teacher`]: graphein_common::schemas::enums::UserRole::Teacher
//! [`Merchant`]: graphein_common::schemas::enums::UserRole::Merchant
