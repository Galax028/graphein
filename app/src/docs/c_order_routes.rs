//! Routes for interacting with orders.
//!
//! # GET `/orders/glance`
//!
//! Returns a list of orders at a glance. They will be grouped by ongoing and finished orders. This
//! route will only return a **maximum** of three finished orders, but will return all ongoing
//! orders.
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
//! ###### [`ResponseBody`]
//!
//! | Name         | Type                   | Nullable?          |
//! |--------------|------------------------|--------------------|
//! | `success`    | [`bool`]               | No (always `true`) |
//! | `timestamp`  | [`DateTime<Utc>`]      | No                 |
//! | `message`    | [`String`]             | Always             |
//! | `data`       | [`OrdersGlance`]       | No                 |
//! | `error`      | [`String`]             | Always             |
//! | `pagination` | [`PaginationResponse`] | Always             |
//!
//! [`OrdersGlance`]: #ordersglance
//!
//! ###### `OrdersGlance`
//!
//! | Name       | Type                  | Nullable? |
//! |------------|-----------------------|-----------|
//! | `ongoing`  | [`Vec<CompactOrder>`] | No        |
//! | `finished` | [`Vec<CompactOrder>`] | No        |
//!
//! ###### `CompactOrder`
//!
//! | Name          | Type              | Nullable? |
//! |---------------|-------------------|-----------|
//! | `id`          | [`Uuid`]          | No        |
//! | `createdAt`   | [`DateTime<Utc>`] | No        |
//! | `orderNumber` | [`String`]        | No        |
//! | `status`      | [`OrderStatus`]   | No        |
//! | `filesCount`  | [`i64`]           | No        |
//!
//! # GET `/orders/history`
//!
//! Returns a list of finished orders. Automatically sorted by their date in descending order.
//! This route is paginated.
//!
//! ## Request
//!
//! #### Query parameters
//!
//! | Name         | Type                  | Required?                            |
//! |--------------|-----------------------|--------------------------------------|
//! | `pagination` | [`PaginationRequest`] | No (default: `{ size: 5, page: 1 }`) |
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
//! ###### [`ResponseBody`]
//!
//! | Name         | Type                   | Nullable? |
//! |--------------|------------------------|-----------|
//! | `success`    | [`bool`]               | No        |
//! | `timestamp`  | [`DateTime<Utc>`]      | No        |
//! | `message`    | [`String`]             | Yes       |
//! | `data`       | [`Vec<CompactOrder>`]  | No        |
//! | `error`      | [`String`]             | Yes       |
//! | `pagination` | [`PaginationResponse`] | No        |
//!
//! ###### `CompactOrder`
//!
//! | Name          | Type              | Nullable? |
//! |---------------|-------------------|-----------|
//! | `id`          | [`Uuid`]          | No        |
//! | `createdAt`   | [`DateTime<Utc>`] | No        |
//! | `orderNumber` | [`String`]        | No        |
//! | `status`      | [`OrderStatus`]   | No        |
//! | `filesCount`  | [`i64`]           | No        |
//!
//! # POST `/orders`
//!
//! Creates a new order with the [`OrderStatus`] set to [`Building`]. To change the status to
//! [`Reviewing`] (i.e. the user has finished configuring the files attached to the order), send a
//! PUT request to [`/orders/{id}/build`].
//!
//! **Disclaimer:** [`Building`] orders **will never appear** in any GET requests for orders, since
//! the intended flow is to allow only one order per user to be in the [`Building`] state at any
//! time. The frontend is therefore responsible for keeping track of the order ID returned by this
//! route. If the frontend loses track of an order in [`Building`] or fails to send a PUT request
//! to [`/orders/{id}/build`] **in 15 minutes**, it will become "orphaned" and automatically purged
//! by the server (gone forever) along with any associated files.
//!
//! [`/orders/{id}/build`]: #post-ordersidbuild
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`202 Accepted`]
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! The `data` field will contain the ID of the newly created order.
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type                   | Nullable?          |
//! |--------------|------------------------|--------------------|
//! | `success`    | [`bool`]               | No (always `true`) |
//! | `timestamp`  | [`DateTime<Utc>`]      | No                 |
//! | `message`    | [`String`]             | Always             |
//! | `data`       | [`Uuid`]               | No                 |
//! | `error`      | [`String`]             | Always             |
//! | `pagination` | [`PaginationResponse`] | Always             |
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! This error will be returned if the frontend tries to create a new order while an order in
//! [`Building`] already exists.
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type              | Nullable?           |
//! |--------------|-------------------|---------------------|
//! | `success`    | [`bool`]          | No (always `false`) |
//! | `timestamp`  | [`DateTime<Utc>`] | No                  |
//! | `message`    | [`String`]        | No                  |
//! | `data`       | [`None`]          | Always              |
//! | `error`      | [`String`]        | No                  |
//! | `pagination` | [`None`]          | Always              |
//!
//! # GET `/orders/{id}`
//!
//! Returns a single order in detail. This includes its status history, attached files, and any
//! additional services requested.
//!
//! ## Request
//!
//! #### Path parameters
//!
//! | Name | Type     | Required? |
//! |------|----------|-----------|
//! | `id` | [`Uuid`] | Yes       |
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
//! ###### [`ResponseBody`]
//!
//! | Name         | Type                   | Nullable?          |
//! |--------------|------------------------|--------------------|
//! | `success`    | [`bool`]               | No (always `true`) |
//! | `timestamp`  | [`DateTime<Utc>`]      | No                 |
//! | `message`    | [`String`]             | Always             |
//! | `data`       | [`DetailedOrder`]      | No                 |
//! | `error`      | [`String`]             | Always             |
//! | `pagination` | [`PaginationResponse`] | Always             |
//!
//! [`DetailedOrder`]: #detailedorder
//!
//! ###### `DetailedOrder`
//!
//! | Name            | Type                   | Nullable? |
//! |-----------------|------------------------|-----------|
//! | `id`            | [`Uuid`]               | No        |
//! | `createdAt`     | [`DateTime<Utc>`]      | No        |
//! | `orderNumber`   | [`String`]             | No        |
//! | `status`        | [`OrderStatus`]        | No        |
//! | `statusHistory` | [`Vec<StatusUpdate>`]  | No        |
//! | `files`         | [`Vec<File>`]          | No        |
//! | `services`      | [`Vec<Service>`]       | No        |
//!
//! ###### `StatusUpdate`
//!
//! **Note:** Automatically sorted by `timestamp` ascending.
//!
//! | Name        | Type              | Nullable? |
//! |-------------|-------------------|-----------|
//! | `timestamp` | [`DateTime<Utc>`] | No        |
//! | `status`    | [`OrderStatus`]   | No        |
//!
//! ###### `File`
//!
//! | Name               | Type                 | Nullable? |
//! |--------------------|----------------------|-----------|
//! | `id`               | [`Uuid`]             | No        |
//! | `filename`         | [`String`]           | No        |
//! | `filetype`         | [`FileType`]         | No        |
//! | `copies`           | [`i32`]              | No        |
//! | `range`            | [`String`]           | Yes       |
//! | `paperSizeId`      | [`Uuid`]             | No        |
//! | `paperOrientation` | [`PaperOrientation`] | No        |
//! | `isColor`          | [`bool`]             | No        |
//! | `scaling`          | [`i32`]              | No        |
//! | `isDoubleSided`    | [`bool`]             | No        |
//! | `notes`            | [`String`]           | Yes       |
//!
//! ###### `Service`
//!
//! | Name          | Type            | Nullable? |
//! |---------------|-----------------|-----------|
//! | `serviceType` | [`ServiceType`] | No        |
//! | `notes`       | [`String`]      | Yes       |
//! | `fileIds`     | [`Vec<Uuid>`]   | No        |
//!
//! # POST `/orders/{id}/status`
//!
//! Changes the status of an order either to [`Processing`], [`Ready`], or [`Completed`]. This route
//! is **for merchants only**. This route only works in succession from the previous status, meaning
//! that no request data indicating the target status has to be provided.
//!
//! ## Request
//!
//! #### Path parameters
//!
//! | Name | Type     | Required? |
//! |------|----------|-----------|
//! | `id` | [`Uuid`] | Yes       |
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
//! ###### [`ResponseBody`]
//!
//! | Name         | Type                   | Nullable?          |
//! |--------------|------------------------|--------------------|
//! | `success`    | [`bool`]               | No (always `true`) |
//! | `timestamp`  | [`DateTime<Utc>`]      | No                 |
//! | `message`    | [`String`]             | Always             |
//! | `data`       | [`StatusUpdate`]       | No                 |
//! | `error`      | [`String`]             | Always             |
//! | `pagination` | [`PaginationResponse`] | Always             |
//!
//! [`StatusUpdate`]: #statusupdate-1
//!
//! ###### `StatusUpdate`
//!
//! **Note:** Automatically sorted by `timestamp` ascending.
//!
//! | Name        | Type              | Nullable? |
//! |-------------|-------------------|-----------|
//! | `timestamp` | [`DateTime<Utc>`] | No        |
//! | `status`    | [`OrderStatus`]   | No        |
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! This error will be returned if the frontend tries to perform this action on an order that is
//! either has the status of [`Building`], [`Completed`], [`Rejected`], or [`Cancelled`]. Also
//! counts if the frontend tries to "reverse" the status.
//!
//! #### [`404 Not Found`]
//!
//! This error will be returned if the order does not exist.
//!
//! # POST `/orders/{id}/build`
//!
//! Builds an order. The order's status will be changed into [`Reviewing`].
//!
//! ## Request
//!
//! Content type: `application/json`
//!
//! #### Path parameters
//!
//! | Name | Type     | Required? |
//! |------|----------|-----------|
//! | `id` | [`Uuid`] | Yes       |
//!
//! #### Request body
//!
//! | Name            | Type                   | Required? |
//! |-----------------|------------------------|-----------|
//! | `files`         | [`Vec<File>`]          | Yes       |
//! | `services`      | [`Vec<Service>`]       | Yes       |
//!
//! ###### `File`
//!
//! | Name               | Type                 | Required? |
//! |--------------------|----------------------|-----------|
//! | `id`               | [`Uuid`]             | Yes       |
//! | `copies`           | [`i32`]              | Yes       |
//! | `range`            | [`String`]           | No        |
//! | `paperSizeId`      | [`Uuid`]             | Yes       |
//! | `paperOrientation` | [`PaperOrientation`] | Yes       |
//! | `isColor`          | [`bool`]             | Yes       |
//! | `scaling`          | [`i32`]              | Yes       |
//! | `isDoubleSided`    | [`bool`]             | Yes       |
//! | `notes`            | [`String`]           | No        |
//!
//! ###### `Service`
//!
//! | Name          | Type            | Required? |
//! |---------------|-----------------|-----------|
//! | `serviceType` | [`ServiceType`] | Yes       |
//! | `notes`       | [`String`]      | No        |
//! | `fileIds`     | [`Vec<Uuid>`]   | Yes       |
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`201 Created`]
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type                                | Nullable?          |
//! |--------------|-------------------------------------|--------------------|
//! | `success`    | [`bool`]                            | No (always `true`) |
//! | `timestamp`  | [`DateTime<Utc>`]                   | No                 |
//! | `message`    | [`String`]                          | Always             |
//! | `data`       | [`DetailedOrder`](#detailedorder-1) | No                 |
//! | `error`      | [`String`]                          | Always             |
//! | `pagination` | [`PaginationResponse`]              | Always             |
//!
//! ###### `DetailedOrder`
//!
//! | Name            | Type                   | Nullable? |
//! |-----------------|------------------------|-----------|
//! | `id`            | [`Uuid`]               | No        |
//! | `createdAt`     | [`DateTime<Utc>`]      | No        |
//! | `orderNumber`   | [`String`]             | No        |
//! | `status`        | [`OrderStatus`]        | No        |
//! | `statusHistory` | [`Vec<StatusUpdate>`]  | No        |
//! | `files`         | [`Vec<File>`]          | No        |
//! | `services`      | [`Vec<Service>`]       | No        |
//!
//! ###### `StatusUpdate`
//!
//! **Note:** Automatically sorted by `timestamp` ascending.
//!
//! | Name        | Type              | Nullable? |
//! |-------------|-------------------|-----------|
//! | `timestamp` | [`DateTime<Utc>`] | No        |
//! | `status`    | [`OrderStatus`]   | No        |
//!
//! ###### `File`
//!
//! | Name               | Type                 | Nullable? |
//! |--------------------|----------------------|-----------|
//! | `id`               | [`Uuid`]             | No        |
//! | `filename`         | [`String`]           | No        |
//! | `filetype`         | [`FileType`]         | No        |
//! | `copies`           | [`i32`]              | No        |
//! | `range`            | [`String`]           | Yes       |
//! | `paperSizeId`      | [`Uuid`]             | No        |
//! | `paperOrientation` | [`PaperOrientation`] | No        |
//! | `isColor`          | [`bool`]             | No        |
//! | `scaling`          | [`i32`]              | No        |
//! | `isDoubleSided`    | [`bool`]             | No        |
//! | `notes`            | [`String`]           | Yes       |
//!
//! ###### `Service`
//!
//! | Name          | Type            | Nullable? |
//! |---------------|-----------------|-----------|
//! | `serviceType` | [`ServiceType`] | No        |
//! | `notes`       | [`String`]      | Yes       |
//! | `fileIds`     | [`Vec<Uuid>`]   | No        |
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! This error will be returned if the frontend tries to build that has already been built or if
//! the data provided to create the order is erroneous.
//!
//! #### [`404 Not Found`]
//!
//! This error will be returned if the order does not exist.
//!
//! #### Response body
//!
//! Content type: `application/json`
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type              | Nullable?           |
//! |--------------|-------------------|---------------------|
//! | `success`    | [`bool`]          | No (always `false`) |
//! | `timestamp`  | [`DateTime<Utc>`] | No                  |
//! | `message`    | [`String`]        | No                  |
//! | `data`       | [`None`]          | Always              |
//! | `error`      | [`String`]        | No                  |
//! | `pagination` | [`None`]          | Always              |
//!
//! # DELETE `/orders/{id}`
//!
//! Changes the status of an order to [`Cancelled`] for clients. Alternatively, changes the status
//! of an order to [`Rejected`] for merchants.
//!
//! ## Request
//!
//! #### Path parameters
//!
//! | Name | Type     | Required? |
//! |------|----------|-----------|
//! | `id` | [`Uuid`] | Yes       |
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`204 No Content`]
//!
//! Indicates a successful cancellation/rejection of the order. No content body will be sent.
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! This error will be returned if the frontend tries to perform this action on an order that is
//! either has the status of [`Rejected`] or [`Cancelled`].
//!
//! #### [`404 Not Found`]
//!
//! This error will be returned if the order does not exist.
//!
//! #### Response body
//!
//! Content type: `application/json`
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type              | Nullable?           |
//! |--------------|-------------------|---------------------|
//! | `success`    | [`bool`]          | No (always `false`) |
//! | `timestamp`  | [`DateTime<Utc>`] | No                  |
//! | `message`    | [`String`]        | No                  |
//! | `data`       | [`None`]          | Always              |
//! | `error`      | [`String`]        | No                  |
//! | `pagination` | [`None`]          | Always              |
//!
//! # POST `/orders/{id}/files`
//!
//! Creates a new file "draft" and returns a presigned URL for the frontend to upload the file to
//! the storage bucket.
//!
//! **Disclaimer:** Both the file "draft" and the presigned URL will have the same expiry time as
//! the order currently in [`Building`]. There is also a max file limit per order of six files.
//!
//! ## Request
//!
//! Content type: `application/json`
//!
//! #### Path parameters
//!
//! | Name | Type     | Required? |
//! |------|----------|-----------|
//! | `id` | [`Uuid`] | Yes       |
//!
//! #### Request body
//!
//! **Note:** The `filesize` and `filetype` fields must __**exactly match**__ the actual size of the
//! file and the type of the file for the latter, or else the storage bucket will reject the upload
//! request.
//!
//! | Name       | Type         | Required? |
//! |------------|--------------|-----------|
//! | `filename` | [`String`]   | Yes       |
//! | `filetype` | [`FileType`] | Yes       |
//! | `filesize` | [`u64`]      | Yes       |
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`202 Accepted`]
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type                   | Nullable?          |
//! |--------------|------------------------|--------------------|
//! | `success`    | [`bool`]               | No (always `true`) |
//! | `timestamp`  | [`DateTime<Utc>`]      | No                 |
//! | `message`    | [`String`]             | Always             |
//! | `data`       | [`FileUploadResponse`] | No                 |
//! | `error`      | [`String`]             | Always             |
//! | `pagination` | [`PaginationResponse`] | Always             |
//!
//! [`FileUploadResponse`]: #fileuploadresponse
//!
//! ###### `FileUploadResponse`
//!
//! | Name        | Type       | Nullable? |
//! |-------------|------------|-----------|
//! | `id`        | [`Uuid`]   | No        |
//! | `objectKey` | [`String`] | No        |
//! | `uploadUrl` | [`String`] | No        |
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! This error will be returned if the frontend tries to create a file when the order has already
//! reached the max file limit. Another case is if the frontend tries to create a file for an order
//! not in [`Building`].
//!
//! #### [`404 Not Found`]
//!
//! This error will be returned if the frontend tries to create a file on a non-existing order.
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type              | Nullable?           |
//! |--------------|-------------------|---------------------|
//! | `success`    | [`bool`]          | No (always `false`) |
//! | `timestamp`  | [`DateTime<Utc>`] | No                  |
//! | `message`    | [`String`]        | No                  |
//! | `data`       | [`None`]          | Always              |
//! | `error`      | [`String`]        | No                  |
//! | `pagination` | [`None`]          | Always              |
//!
//! # GET `/orders/{id}/files/{id}/thumbnail`
//!
//! Returns the URL for the thumbnail image of the requested file.
//!
//! ## Request
//!
//! #### Path parameters
//!
//! | Name     | Type     | Required? |
//! |----------|----------|-----------|
//! | `id` (1) | [`Uuid`] | Yes       |
//! | `id` (2) | [`Uuid`] | Yes       |
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
//! The `data` field will contain the URL for the thumbnail.
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type                   | Nullable?          |
//! |--------------|------------------------|--------------------|
//! | `success`    | [`bool`]               | No (always `true`) |
//! | `timestamp`  | [`DateTime<Utc>`]      | No                 |
//! | `message`    | [`String`]             | Always             |
//! | `data`       | [`String`]             | No                 |
//! | `error`      | [`String`]             | Always             |
//! | `pagination` | [`PaginationResponse`] | Always             |
//!
//! #### [`202 Accepted`]
//!
//! Indicates that the server is still processing the thumbnail. The client should poll this route
//! continuously with exponential backoff until it returns a [`200 OK`] status code. No content body
//! will be sent.
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! This error will be returned if path parameters are malformed or missing.
//!
//! #### [`404 Not Found`]
//!
//! This error will be returned if either the order or the file does not exist.
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type              | Nullable?           |
//! |--------------|-------------------|---------------------|
//! | `success`    | [`bool`]          | No (always `false`) |
//! | `timestamp`  | [`DateTime<Utc>`] | No                  |
//! | `message`    | [`String`]        | No                  |
//! | `data`       | [`None`]          | Always              |
//! | `error`      | [`String`]        | No                  |
//! | `pagination` | [`None`]          | Always              |
//!
//! # DELETE `/orders/{id}/files/{id}`
//!
//! Deletes a file, and if any, its thumbnail, from an order in [`Building`]. The server will return
//! an error if the frontend attempts to call this route on non-[`Building`] orders.
//!
//! ## Request
//!
//! #### Path parameters
//!
//! | Name     | Type     | Required? |
//! |----------|----------|-----------|
//! | `id` (1) | [`Uuid`] | Yes       |
//! | `id` (2) | [`Uuid`] | Yes       |
//!
//! ## Responses
//!
//! ### On success (200-299)
//!
//! #### [`204 No Content`]
//!
//! Indicates a successful deletion of the file. No content body will be sent.
//!
//! ### On client error (400-499)
//!
//! #### [`400 Bad Request`]
//!
//! This error will be returned if path parameters are malformed or missing.
//!
//! #### [`404 Not Found`]
//!
//! This error will be returned if either the order or the file does not exist.
//!
//! ##### Response body
//!
//! Content type: `application/json`
//!
//! ###### [`ResponseBody`]
//!
//! | Name         | Type              | Nullable?           |
//! |--------------|-------------------|---------------------|
//! | `success`    | [`bool`]          | No (always `false`) |
//! | `timestamp`  | [`DateTime<Utc>`] | No                  |
//! | `message`    | [`String`]        | No                  |
//! | `data`       | [`None`]          | Always              |
//! | `error`      | [`String`]        | No                  |
//! | `pagination` | [`None`]          | Always              |
//!
//! [`200 OK`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/200
//! [`201 Created`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/201
//! [`202 Accepted`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202
//! [`204 No Content`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204
//! [`400 Bad Request`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/400
//! [`404 Not Found`]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404
//!
//! [`Uuid`]: uuid::Uuid
//! [`DateTime<Utc>`]: chrono::DateTime
//!
//! [`PaginationRequest`]: graphein_common::dto::PaginationRequest
//! [`ResponseBody`]: graphein_common::dto::ResponseBody
//! [`PaginationResponse`]: graphein_common::dto::PaginationResponse
//! [`FileType`]: graphein_common::schemas::enums::FileType
//! [`OrderStatus`]: graphein_common::schemas::enums::OrderStatus
//! [`Building`]: graphein_common::schemas::enums::OrderStatus::Building
//! [`Reviewing`]: graphein_common::schemas::enums::OrderStatus::Reviewing
//! [`Processing`]: graphein_common::schemas::enums::OrderStatus::Processing
//! [`Ready`]: graphein_common::schemas::enums::OrderStatus::Ready
//! [`Completed`]: graphein_common::schemas::enums::OrderStatus::Completed
//! [`Rejected`]: graphein_common::schemas::enums::OrderStatus::Rejected
//! [`Cancelled`]: graphein_common::schemas::enums::OrderStatus::Cancelled
//! [`PaperOrientation`]: graphein_common::schemas::enums::PaperOrientation
//! [`ServiceType`]: graphein_common::schemas::enums::ServiceType
