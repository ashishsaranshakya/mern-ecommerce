## Admin Endpoints

### Authentication

- **Register Admin**
  - Endpoint: `POST /admin/register`
  - Description: Registers a new admin.
  - Body: JSON object containing admin registration data.
    - `name`: Name of the admin.
    - `email`: Email address of the admin.
    - `password`: Password for the admin.
    - `role`: Role of the admin(Enum: Admin, Vendor, Dispatcher).

- **Login Admin**
  - Endpoint: `POST /admin/login`
  - Description: Logs in a admin and generates an authentication token.
  - Body: JSON object containing admin login data.
    - `email`: Email address of the admin.
    - `password`: Password for the admin.

- **Delete Admin**
  - Endpoint: `DELETE /admin/delete`
  - Description: Delete existing admin.
  - Query Parameter:
    - `id`: Id of admin to be deleted.

- **Logout Admin**
  - Endpoint: `POST /admin/logout`
  - Description: Logs out a admin and clears the authentication token.

### Products

- **Register New Product**
  - Endpoint: `POST /admin/product`
  - Description: Registers a new product.
  - Body: JSON object containing product data.
    - `name`: Name of the product.
    - `description`: Description of the product.
    - `cost`: Cost of the product.
    - `imageUrl`: Image URL for the product.
    - `quantity`: Quantity in stock for the product.

- **Update Product**
  - Endpoint: `PUT /admin/product`
  - Description: Update a product.
  - Body: JSON object containing product data.
    - `id`: Id of the product to be updated.
    - `name` (Optional): Name of the product.
    - `description` (Optional): Description of the product.
    - `cost` (Optional): Cost of the product.
    - `imageUrl` (Optional): Image URL for the product.
    - `quantity` (Optional): Quantity in stock for the product.

- **Delete Product**
  - Endpoint: `DELETE /admin/product`
  - Description: Delete existing product.
  - Query Parameter:
    - `id`: Id of product to be deleted.

- **Get Products**
  - Method: GET
  - Endpoint: `/admin/product`
  - Description: Retrieves a list of all products.

- **Get Product by ID**
  - Endpoint: `GET /admin/product/:id`
  - Description: Retrieves a specific product by its ID.
  - Parameters:
    - `id`: ID of the product to retrieve.

### Admin

- **Get Admin Profile**
  - Method: GET
  - Endpoint: `/admin/profile`
  - Description: Get logged in admin profile data.

- **Get Admin List**
  - Method: GET
  - Endpoint: `/admin/list`
  - Description: Get list of registered admins.

### Orders

- **Get All Orders**
  - Method: GET
  - Endpoint: `/admin/order`
  - Description: Retrieves all orders.

- **Get Order by ID**
  - Method: GET
  - Endpoint: `/admin/order/:id`
  - Description: Retrieves a specific order by its ID.
  - Parameters:
    - `id`: ID of the order to retrieve.

- **Update Order**
  - Endpoint: `PATCH /admin/order`
  - Description: Update a order.
  - Body: JSON object containing order data.
    - `id`: Id of the order to be updated.
    - `status`: Status of the order(Enum: Delivered, Pending).

- **Delete Product**
  - Endpoint: `DELETE /admin/order`
  - Description: Delete existing order.
  - Query Parameter:
    - `id`: Id of order to be deleted.
