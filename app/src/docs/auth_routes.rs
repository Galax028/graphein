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
//! ## Parameters
//!
//! | Name         | Type     | Description                              | Default   |
//! |--------------|----------|------------------------------------------|-----------|
//! | `asMerchant` | [`bool`] | Toggles whether to allow merchant logins.| [`true`]  |
//!
//! **Note:** An asterisk (*) next to the parameter name indicates that it is required.
//!
//! # GET `/auth/google/code`
//!
//! This is the redirect URI that is to be called by the OAuth provider. The frontend **should not**
//! call this route by itself. If the OAuth flow is successful, the server will set the necessary
//! cookies for authentication and authorization, which are not accessible by JavaScript. Then, a
//! temporary HTML page will be rendered with script inside it to send a [message] to the [opener]
//! to indicate a successful login, the content of the message being `oauthSuccess`. Once the
//! message is received, it is encouraged to close the popup window from the parent.
//!
//! [message]: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
//! [opener]: https://developer.mozilla.org/en-US/docs/Web/API/Window/opener
//!
//! ## Responses
//!
//! ### On success
//!
//! Possible status codes: [`200 OK`]
//!
//! Sets the `sessionToken` and `isOnboarded` cookies, along with a `max-age` directive of one week
//! from the time of issuance of the token.
//!
//! Content type: `text/html`
//!
//! ### On failure
//!
//! Possible status codes: [`401 Unauthorized`], [`403 Forbidden`]
//!
//! Content type: `text/html`
//!
//! # POST `/auth/signout`
//!
//! This route signs out the current session of the user (by removing cookies) and returns no
//! content. If called when there is no `sessionToken` cookie present, the server will return an
//! error.
//!
//! ## Responses
//!
//! ### On success
//!
//! Possible status codes: [`204 No Content`]
//! 
//! Content type: *None*
//!
//! ### On failure
//!
//! Possible status codes: [`401 Unauthorized`]
//! 
//! Content type: `application/json`
//!
//! [`200 OK`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/200
//! [`204 No Content`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204
//! [`401 Unauthorized`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401
//! [`403 Forbidden`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403
