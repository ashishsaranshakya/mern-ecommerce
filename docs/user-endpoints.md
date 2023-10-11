## User Endpoints

### Authentication

- **Register User**
  - Endpoint: `POST /auth/register`
  - Description: Registers a new user.
  - Body: JSON object containing user registration data.
    - `firstName`: First name of the user.
    - `lastName`: Last name of the user.
    - `email`: Email address of the user.
    - `password`: Password for the user.
    - `location`: Location of the user (optional).
    - `occupation`: Occupation of the user (optional).

- **Login User**
  - Endpoint: `POST /auth/login`
  - Description: Logs in a user and generates an authentication token.
  - Body: JSON object containing user login data.
    - `email`: Email address of the user.
    - `password`: Password for the user.

- **Logout User**
  - Endpoint: `POST /auth/logout`
  - Description: Logs out a user and clears the authentication token.

### Products

- **Get Products**
  - Method: GET
  - Endpoint: `/product`
  - Description: Retrieves a list of products filtered by various criteria.
  - Query Parameters:
    - `page` (Optional): Specifies the page number for pagination (default is 1).
    - `limit` (Optional): Sets the maximum number of products per page (default is 10).
    - `query` (Optional): Filters products based on a search term (default is null).
    - `sort` (Optional): Specifies the sorting order for products, either 'asc' (ascending) or 'desc' (descending) based on the cost (default is 'desc').

- **Get Product by ID**
  - Endpoint: `GET /product/:id`
  - Description: Retrieves a specific product by its ID.
  - Parameters:
    - `id`: ID of the product to retrieve.

- **Rate Product**
  - Method: PATCH
  - Endpoint: `/product/:id/rate`
  - Description: Updates the rating of a specific product by its ID.
  - Parameters:
    - `id`: ID of the product to update.
  - Request Body:
    - `rating`: New rating value for the product.

### User

- **Get User Profile**
  - Method: GET
  - Endpoint: `/user/profile`
  - Description: Get logged in user profile data.

- **Get User Cart**
  - Method: GET
  - Endpoint: `/user/cart`
  - Description: Get logged in user cart.

- **Add to Cart**
  - Method: POST
  - Endpoint: `/user/cart`
  - Description: Adds a product to the user's cart.
  - Query Parameters:
    - `id`: ID of the product to add.

- **Delete from Cart**
  - Method: DELETE
  - Endpoint: `/user/cart`
  - Description: Deletes a product from the user's cart.
  - Query Parameters:
    - `id`: ID of the product to delete.
    - `single`: Flag indicating whether to delete a single item.

### Orders

- **Get User Orders**
  - Method: GET
  - Endpoint: `/order/user`
  - Description: Retrieves all orders associated with the authenticated user.
  - Query Parameters:
    - `page` (Optional): Specifies the page number for pagination (default is 1).
    - `limit` (Optional): Sets the maximum number of products per page (default is 10).
    - `sort` (Optional): Specifies the sorting order for products, either 'asc' (ascending) or 'desc' (descending) based on the cost (default is 'desc').

- **Get Order by ID**
  - Method: GET
  - Endpoint: `/order/:id`
  - Description: Retrieves a specific order by its ID.
  - Parameters:
    - `id`: ID of the order to retrieve.

- **Checkout Product**
  - Method: POST
  - Endpoint: `/order/checkout/product`
  - Description: Creates an order for a product and initiates payment.
  - Query Parameters:
    - `id`: ID of the product for which the order is placed.
    - `quantity`: Quantity of product to order. 

- **Checkout Cart**
  - Method: POST
  - Endpoint: `/order/checkout/cart`
  - Description: Creates order for products in the user's cart and initiates payment.
 
- **Checkout Order**
  - Method: POST
  - Endpoint: `/order/checkout/order`
  - Description: Initiates payment for unpaid order.
  - Query Parameters:
    - `id`: ID of the order for which the payment has to be initiated.

- **Payment Verification**
  - Method: POST
  - Endpoint: `/order/verify`
  - Description: Verifies the payment status, redirected from the Razorpay portal.
  - Request Body:
    - `razorpay_order_id`: Razorpay order ID.
    - `razorpay_payment_id`: Razorpay payment ID.
    - `razorpay_signature`: Razorpay signature.
