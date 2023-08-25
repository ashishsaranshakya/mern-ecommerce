# Cittaa Internship Backend

This project is the backend component of an online store management system. It provides a RESTful API built using Node.js, Express.js, and MongoDB, enabling users to authenticate, manage products, create orders, and handle payments. The backend also integrates with the Razorpay payment gateway for secure and efficient payment processing.

## Features

- **User Authentication**: Users can register and log in to the system. Passwords are securely hashed and stored using bcrypt. JSON Web Tokens (JWT) are generated upon successful login for secure and stateless authentication.

- **Product Management**: Products can be retrieved individually or as a list. Each product's name, description, cost, and image URL are stored in the database.

- **Order Creation and Payment**: Users can create orders for products, and payments are handled using the Razorpay payment gateway.

- **Payment Verification**: Payments made through the Razorpay gateway are securely verified using signatures. Upon successful payment verification, the order's payment status is updated, and users are redirected to a success page.

- **User Orders**: Users can retrieve their orders, view the order details, and track the payment status.


## Getting Started
To use this API, follow the instructions below:

- Clone the repository: `git clone https://github.com/ashishsaranshakya/cittaa-internship-backend.git`
- Install the necessary dependencies: `npm install`
- Start the server: `npm start dev`
- Access the API at `http://localhost:3001/`

## Configuration

- Create a `.env` file in the root directory of the project.
- Open the `.env` file and add the following lines:
```
MONGO_URL='<MongoDB_Url>'
PORT=3001
JWT_SECRET='Jwt_Secret'
RAZORPAY_API_KEY='Razorpay_Api_Key'
RAZORPAY_API_SECRET='Razorpay_Api_Secret'
```
- Save the `.env` file.

## API Endpoints

### Authentication

- **Register User**
  - Endpoint: `POST /auth/register`
  - Description: Registers a new user.
  - Parameters:
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
  - Parameters:
    - Body: JSON object containing user login data.
      - `email`: Email address of the user.
      - `password`: Password for the user.

- **Logout User**
  - Endpoint: `POST /auth/logout`
  - Description: Logs out a user and clears the authentication token.

### Products

- **Get All Products**
  - Endpoint: `GET /product`
  - Description: Retrieves a list of all products.

- **Get Products by Search**
  - Method: GET
  - Endpoint: `/product/search`
  - Description: Retrieves products matching the search term.
  - Request Body:
    - `searchTerm`: Search term to filter products.

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

### User Cart

- **Add to Cart**
  - Method: POST
  - Endpoint: `/user/cart`
  - Description: Adds a product to the user's cart.
  - Request Body:
    - `productId`: ID of the product to add.

- **Delete from Cart**
  - Method: DELETE
  - Endpoint: `/user/cart`
  - Description: Deletes a product from the user's cart.
  - Request Body:
    - `productId`: ID of the product to delete.
    - `single`: Boolean flag indicating whether to delete a single item.

### Orders

- **Get User Orders**
  - Method: GET
  - Endpoint: `/order/user`
  - Description: Retrieves all orders associated with the authenticated user.

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
  - Request Body:
    - `product_id`: ID of the product for which the order is placed.

- **Checkout Cart**
  - Method: POST
  - Endpoint: `/order/checkout/cart`
  - Description: Creates order for products in the user's cart and initiates payment.

- **Payment Verification**
  - Method: POST
  - Endpoint: `/order/verify`
  - Description: Verifies the payment status, redirected from the Razorpay portal.
  - Request Body:
    - `razorpay_order_id`: Razorpay order ID.
    - `razorpay_payment_id`: Razorpay payment ID.
    - `razorpay_signature`: Razorpay signature.

## Error Handling
The API provides appropriate error responses in case of invalid requests or server-side issues. The error responses include appropriate status codes and error messages to assist in troubleshooting.

## Acknowledgements
- Express.js - Fast, unopinionated, minimalist web framework for Node.js.
- Mongoose - Elegant MongoDB object modeling for Node.js.

Please refer to the documentation of the used libraries and frameworks for more details on their usage and configuration.
