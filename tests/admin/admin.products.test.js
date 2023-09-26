import request from 'supertest';
import app from '../../app.js';
import Admin from '../../models/Admin.js';
import Product from '../../models/Product.js';
import bcrypt from 'bcrypt';
import { mongoConnect, mongoDisconnect } from '../../services/mongo.js';

describe('Products Controller', () => {
    let savedAdmins;
    let superadminToken;
    let adminToken;
    let vendorToken;
    let dispatcherToken;

    beforeAll(async () => {
        await mongoConnect();
        await Admin.deleteMany();
        await Product.deleteMany();
    });

    afterAll(async () => {
        await Admin.deleteMany();
        await Product.deleteMany();
        await mongoDisconnect();
    });

    afterEach(async () => {
        await Product.deleteMany();
    });

    describe('GET /api/v1/admin/product', () => {
        it('should get tokens for all roles', async () => {
            const salt = await bcrypt.genSalt();
            const admins = [
                new Admin({
                    name: 'Super',
                    email: 'super-admin@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    role: 'Super-admin'
                }),
                new Admin({
                    name: 'Admin',
                    email: 'admin@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    role: 'Admin'
                }),
                new Admin({
                    name: 'Vendor',
                    email: 'vendor@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    role: 'Vendor'
                }),
                new Admin({
                    name: 'Dispatcher',
                    email: 'dispatcher@gmail.com',
                    password: await bcrypt.hash("P@ssw0rd", salt),
                    role: 'Dispatcher'
                })
            ]
            savedAdmins = await Admin.insertMany(admins);

            let response = await request(app)
                .post(`/api/v1/admin/login`)
                .send(
                    {
                        email: savedAdmins[0].email,
                        password: "P@ssw0rd"
                    }
                )
                .set('Accept', 'application/json');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            superadminToken = response.headers['set-cookie'][0].split(';')[0];

            response = await request(app)
                .post(`/api/v1/admin/login`)
                .send(
                    {
                        email: savedAdmins[1].email,
                        password: "P@ssw0rd"
                    }
                )
                .set('Accept', 'application/json');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            adminToken = response.headers['set-cookie'][0].split(';')[0];

            response = await request(app)
                .post(`/api/v1/admin/login`)
                .send(
                    {
                        email: savedAdmins[2].email,
                        password: "P@ssw0rd"
                    }
                )
                .set('Accept', 'application/json');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            vendorToken = response.headers['set-cookie'][0].split(';')[0];

            response = await request(app)
                .post(`/api/v1/admin/login`)
                .send(
                    {
                        email: savedAdmins[3].email,
                        password: "P@ssw0rd"
                    }
                )
                .set('Accept', 'application/json');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            dispatcherToken = response.headers['set-cookie'][0].split(';')[0];;
        });

        it('should get all products for superadmin', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product`)
                .set('Cookie', [superadminToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.products.length).toBe(2);
            expect(response.body.products).toMatchObject([
                {
                    _id: savedProducts[0]._id.toString(),
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50,
                    rating: 0,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
                {
                    _id: savedProducts[1]._id.toString(),
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20,
                    rating: 0,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                }
            ]);
        });

        it('should get all products for admin', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product`)
                .set('Cookie', [adminToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.products.length).toBe(2);
            expect(response.body.products).toMatchObject([
                {
                    _id: savedProducts[0]._id.toString(),
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50,
                    rating: 0,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
                {
                    _id: savedProducts[1]._id.toString(),
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20,
                    rating: 0,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                }
            ]);
        });

        it('should get there products for vendor', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product`)
                .set('Cookie', [vendorToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.products.length).toBe(1);
            expect(response.body.products).toMatchObject([
                {
                    _id: savedProducts[0]._id.toString(),
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50,
                    rating: 0,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                }
            ]);
        });

        it('should get all products for dispatcher', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product`)
                .set('Cookie', [dispatcherToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.products.length).toBe(2);
            expect(response.body.products).toMatchObject([
                {
                    _id: savedProducts[0]._id.toString(),
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    quantity: 50
                },
                {
                    _id: savedProducts[1]._id.toString(),
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    quantity: 20
                }
            ]);
        });
    });

    describe('GET /api/v1/admin/product/:id', () => {
        it('should get product for superadmin', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product/${savedProducts[0]._id.toString()}`)
                .set('Cookie', [superadminToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.product).toMatchObject(
                {
                    _id: savedProducts[0]._id.toString(),
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50,
                    rating: 0,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                });
        });

        it('should get product for admin', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product/${savedProducts[0]._id.toString()}`)
                .set('Cookie', [adminToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.product).toMatchObject(
                {
                    _id: savedProducts[0]._id.toString(),
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50,
                    rating: 0,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                });
        });

        it('should get there product for vendor', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product/${savedProducts[0]._id.toString()}`)
                .set('Cookie', [vendorToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.product).toMatchObject(
                {
                    _id: savedProducts[0]._id.toString(),
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50,
                    rating: 0,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                });
        });

        it('should throw error to get other vendor product for vendor', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product/${savedProducts[1]._id.toString()}`)
                .set('Cookie', [vendorToken]);
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Product not found");
        });

        it('should get product for dispatcher', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .get(`/api/v1/admin/product/${savedProducts[0]._id.toString()}`)
                .set('Cookie', [dispatcherToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.product).toMatchObject(
                {
                    _id: savedProducts[0]._id.toString(),
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    quantity: 50
                });
        });
    });

    describe('POST /api/v1/admin/product', () => {
        it('should create product for superadmin', async () => {
            const response = await request(app)
                .post(`/api/v1/admin/product`)
                .send({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    quantity: 50
                })
                .set('Cookie', [superadminToken]);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product created successfully");
            const products = await Product.find();
            expect(products.length).toBe(1);
        });

        it('should create product for admin', async () => {
            const response = await request(app)
                .post(`/api/v1/admin/product`)
                .send({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    quantity: 50
                })
                .set('Cookie', [adminToken]);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product created successfully");
            const products = await Product.find();
            expect(products.length).toBe(1);
        });

        it('should create product for vendor', async () => {
            const response = await request(app)
                .post(`/api/v1/admin/product`)
                .send({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    quantity: 50
                })
                .set('Cookie', [vendorToken]);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product created successfully");
            const products = await Product.find();
            expect(products.length).toBe(1);
        });

        it('should throw error for create product for dispatcher', async () => {
            const response = await request(app)
                .post(`/api/v1/admin/product`)
                .send({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    quantity: 50
                })
                .set('Cookie', [dispatcherToken]);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
            const products = await Product.find();
            expect(products.length).toBe(0);
        });
    });

    describe('DELETE /api/v1/admin/product', () => {
        it('should delete product for superadmin', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .delete(`/api/v1/admin/product?id=${savedProducts[0]._id.toString()}`)
                .set('Cookie', [superadminToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product deleted successfully");
            const productsAfterDelete = await Product.find();
            expect(productsAfterDelete.length).toBe(1);
        });

        it('should delete product for admin', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .delete(`/api/v1/admin/product?id=${savedProducts[0]._id.toString()}`)
                .set('Cookie', [adminToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product deleted successfully");
            const productsAfterDelete = await Product.find();
            expect(productsAfterDelete.length).toBe(1);
        });

        it('should delete product for vendor', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .delete(`/api/v1/admin/product?id=${savedProducts[0]._id.toString()}`)
                .set('Cookie', [vendorToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product deleted successfully");
            const productsAfterDelete = await Product.find();
            expect(productsAfterDelete.length).toBe(1);
        });

        it('should throw error for deleteing product by other vendor for vendor', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .delete(`/api/v1/admin/product?id=${savedProducts[1]._id.toString()}`)
                .set('Cookie', [vendorToken]);
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Product not found");
            const productsAfterDelete = await Product.find();
            expect(productsAfterDelete.length).toBe(2);
        });

        it('should throw error deleteing product for dispatcher', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                }),
                new Product({
                    name: 'Product 2',
                    cost: 200,
                    description: 'Product 2 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 20
                }),
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .delete(`/api/v1/admin/product?id=${savedProducts[0]._id.toString()}`)
                .set('Cookie', [dispatcherToken]);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Forbidden');
            const productsAfterDelete = await Product.find();
            expect(productsAfterDelete.length).toBe(2);
        });
    });

    describe('PUT /api/v1/admin/product', () => {
        it('should update product for superadmin', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                })
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .put(`/api/v1/admin/product`)
                .send({
                    id: savedProducts[0]._id.toString(),
                    name: 'Product_1',
                    cost: 1000,
                    description: 'Updated product 1 description',
                    imageUrl: 'https://www.google.com/updated',
                    quantity: 500
                })
                .set('Cookie', [superadminToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product updated successfully");
            const productsAfterUpdate = await Product.find({});
            expect(productsAfterUpdate.length).toBe(1);
            expect(productsAfterUpdate[0]).toMatchObject({
                _id: savedProducts[0]._id,
                name: 'Product_1',
                cost: 1000,
                description: 'Updated product 1 description',
                imageUrl: 'https://www.google.com/updated',
                quantity: 500,
                updatedAt: expect.any(Date),
                createdAt: expect.any(Date),
                vendorId: savedAdmins[2]._id.toString(),
                rating: 0,
                ratings: [],
                __v: 0
            });
        });

        it('should update product for admin', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                })
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .put(`/api/v1/admin/product`)
                .send({
                    id: savedProducts[0]._id.toString(),
                    name: 'Product_1',
                    cost: 1000,
                    description: 'Updated product 1 description',
                    imageUrl: 'https://www.google.com/updated',
                    quantity: 500
                })
                .set('Cookie', [adminToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product updated successfully");
            const productsAfterUpdate = await Product.find();
            expect(productsAfterUpdate.length).toBe(1);
            expect(productsAfterUpdate[0]).toMatchObject({
                _id: savedProducts[0]._id,
                name: 'Product_1',
                cost: 1000,
                description: 'Updated product 1 description',
                imageUrl: 'https://www.google.com/updated',
                quantity: 500,
                updatedAt: expect.any(Date),
                createdAt: expect.any(Date),
                vendorId: savedAdmins[2]._id.toString(),
                rating: 0,
                ratings: [],
                __v: 0
            });
        });

        it('should update product for vendor', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                })
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .put(`/api/v1/admin/product`)
                .send({
                    id: savedProducts[0]._id.toString(),
                    name: 'Product_1',
                    cost: 1000,
                    description: 'Updated product 1 description',
                    imageUrl: 'https://www.google.com/updated',
                    quantity: 500
                })
                .set('Cookie', [vendorToken]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Product updated successfully");
            const productsAfterUpdate = await Product.find();
            expect(productsAfterUpdate.length).toBe(1);
            expect(productsAfterUpdate[0]).toMatchObject({
                _id: savedProducts[0]._id,
                name: 'Product_1',
                cost: 1000,
                description: 'Updated product 1 description',
                imageUrl: 'https://www.google.com/updated',
                quantity: 500,
                updatedAt: expect.any(Date),
                createdAt: expect.any(Date),
                vendorId: savedAdmins[2]._id.toString(),
                rating: 0,
                ratings: [],
                __v: 0
            });
        });

        it('should throw error for updating product by other vendor for vendor', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: '1234',
                    quantity: 50
                })
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .put(`/api/v1/admin/product`)
                .send({
                    id: savedProducts[0]._id.toString(),
                    name: 'Product_1',
                    cost: 1000,
                    description: 'Updated product 1 description',
                    imageUrl: 'https://www.google.com/updated',
                    quantity: 500
                })
                .set('Cookie', [vendorToken]);
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Product not found");
            const productsAfterUpdate = await Product.find();
            expect(productsAfterUpdate.length).toBe(1);
            expect(productsAfterUpdate[0]).toMatchObject({
                _id: savedProducts[0]._id,
                name: 'Product 1',
                cost: 100,
                description: 'Product 1 description',
                imageUrl: 'https://www.google.com',
                quantity: 50,
                updatedAt: expect.any(Date),
                createdAt: expect.any(Date),
                vendorId: '1234',
                rating: 0,
                ratings: [],
                __v: 0
            });
        });

        it('should throw error updating product for dispatcher', async () => {
            const products = [
                new Product({
                    name: 'Product 1',
                    cost: 100,
                    description: 'Product 1 description',
                    imageUrl: 'https://www.google.com',
                    vendorId: savedAdmins[2]._id.toString(),
                    quantity: 50
                })
            ];
            const savedProducts = await Product.insertMany(products);

            const response = await request(app)
                .put(`/api/v1/admin/product`)
                .send({
                    id: savedProducts[0]._id.toString(),
                    name: 'Product_1',
                    cost: 1000,
                    description: 'Updated product 1 description',
                    imageUrl: 'https://www.google.com/updated',
                    quantity: 500
                })
                .set('Cookie', [dispatcherToken]);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Forbidden');
            const productsAfterUpdate = await Product.find();
            expect(productsAfterUpdate.length).toBe(1);
            expect(productsAfterUpdate[0]).toMatchObject({
                _id: savedProducts[0]._id,
                name: 'Product 1',
                cost: 100,
                description: 'Product 1 description',
                imageUrl: 'https://www.google.com',
                quantity: 50,
                updatedAt: expect.any(Date),
                createdAt: expect.any(Date),
                vendorId: savedAdmins[2]._id.toString(),
                rating: 0,
                ratings: [],
                __v: 0
            });
        });
    });
});