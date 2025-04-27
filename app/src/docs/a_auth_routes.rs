//! Routes for authentication and authorization.
//!
//! # GET `/auth/google/init`
//!
//! Initiates the OAuth login process with Google as the provider. The frontend should open this
//! route via JavaScript using the [`window.open()`] method. The user will be restricted to logging
//! in via `sk.ac.th` emails only. To remove this restriction, the query parameter `asMerchant` can
//! be appended to the route for allow merchant logins. Once the server has successfully verified
//! that the user completed the OAuth flow, the user will have already been redirected to
//! [`/auth/google/code`] by the OAuth provider. In the case of logging in a new user, in other
//! words, a user without an existing account in the database, then the server will proceed to
//! create the user automatically and the frontend can proceed with the onboarding process.
//!
//! [`window.open()`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/open
//! [`/auth/google/code`]: #get-authgooglecode
//!
//! ## Request
//!
//! #### Query parameters
//!
//! | Name         | Type     | Required?             |
//! |--------------|----------|-----------------------|
//! | `asMerchant` | [`bool`] | No (default: `false`) |
//!
//! # GET `/auth/google/code`
//!
//! This is the redirect URI that is to be called by the OAuth provider. The frontend **should not**
//! call this route by itself.
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`200 OK`]
//!
//! The server will set the necessary cookies for authentication and authorization, which are not
//! accessible by JavaScript. The cookies will be named `session_token` and `is_onboarded`, both
//! will be set with `max-age` directives of one week from the time of issuance of the session.
//!
//! Response headers: `Set-Cookie`
//!
//! ##### Response body
//!
//! Content type: `text/html`
//!
//! The HTML page will contain a script inside it with a sole purpose to send a [message] to the
//! [opener] to indicate a successful login, the content of the message being `oauthSuccess`. Once
//! the message is received, it is encouraged to close the popup window from the parent.
//!
//! [message]: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
//! [opener]: https://developer.mozilla.org/en-US/docs/Web/API/Window/opener
//!
//! ### On client error (400-499)
//!
//! #### [`401 Unauthorized`]
//!
//! Unless threat actors targeting the OAuth flow were to appear, this error is impossible to occur.
//!
//! ##### Response body
//!
//! Content type: `text/html`
//!
//! #### [`403 Forbidden`]
//!
//! Unless a non-merchant user modifies the `hd` query parameter during the OAuth flow, this error
//! is impossible to occur.
//!
//! ##### Response body
//!
//! Content type: `text/html`
//!
//! # POST `/auth/signout`
//!
//! This route signs out the current session of the user (by removing cookies) and returns no
//! content. If called when there is no `session_token` cookie present, the server will return an
//! error.
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`204 No Content`]
//!
//! The server clear the cookies via the `Set-Cookie` header. No content body will be sent.
//!
//! Response headers: `Set-Cookie`
//!
//! ### On client error (400-499)
//!
//! #### [`401 Unauthorized`]
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! [`200 OK`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/200
//! [`204 No Content`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204
//! [`401 Unauthorized`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401
//! [`403 Forbidden`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403
