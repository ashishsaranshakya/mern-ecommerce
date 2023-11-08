# MERN E-commerce Project

This project is a fullstack online ecommerce website. It provides a RESTful API built using Node.js, Express.js, and MongoDB, enabling users to authenticate, manage products, create orders, and handle payments. And providing a interactive UI that has been built using React.js. The backend also integrates with the Razorpay payment gateway for secure and efficient payment processing.

#### Deployed at: https://mern-ecommerce-uw3n.onrender.com/home

## Features

- **User Authentication**: Users can register and log in to the system. Passwords are securely hashed and stored using bcrypt. JSON Web Tokens (JWT) are generated upon successful login for secure and stateless authentication.

- **Product Management**: Products can be retrieved individually or as a list. Each product's name, description, cost, and image URL are stored in the database.

- **Order Creation and Payment**: Users can create orders for products, and payments are handled using the Razorpay payment gateway.

- **Payment Verification**: Payments made through the Razorpay gateway are securely verified using signatures. Upon successful payment verification, the order's payment status is updated, and users are redirected to a success page.

- **User Orders**: Users can retrieve their orders, view the order details, and track the payment status.


## Getting Started
To use this API, follow the instructions below:

- Clone the repository: `git clone https://github.com/ashishsaranshakya/mern-ecommerce.git`
- Install the server dependencies: `npm install`
- Install client dependencies: `npm run client-install`
- Change baseUrl in `client/src/App.js` to `http://localhost:3000`
- Build the frontend: `npm run build`
- Start the server: `npm run dev`
- Access the homepage at `http://localhost:3000/home`

## Configuration

- Create a `.env` file in the root directory of the project.
- Open the `.env` file and add the following lines:
```
MONGO_URL='<MongoDB_Url>'
PORT=3001
JWT_SECRET='512 bit Jwt_Secret'
REFRESH_TOKEN_SECRET='512 bit Jwt_Secret'
COOKIE_SECRET='512 bit Cokkie_Signature'
RAZORPAY_API_KEY='Razorpay_Api_Key'
RAZORPAY_API_SECRET='Razorpay_Api_Secret'
API_VERSION='v1'
TIMEZONE='Asia/Kolkata'
```
- Save the `.env` file.

## API Endpoints

- ### [<i class="fas fa-cogs"></i> **User Endpoints**](docs/user-endpoints.md)
- ### [<i class="fas fa-cogs"></i> **Admin Endpoints**](docs/admin-endpoints.md)

## Error Handling
The API provides appropriate error responses in case of invalid requests or server-side issues. The error responses include appropriate status codes and error messages to assist in troubleshooting.

## Acknowledgements
- Express.js - Fast, unopinionated, minimalist web framework for Node.js.
- Mongoose - Elegant MongoDB object modeling for Node.js.

Please refer to the documentation of the used libraries and frameworks for more details on their usage and configuration.
