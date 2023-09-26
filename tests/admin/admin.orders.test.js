import request from 'supertest';
import app from '../../app.js';
import Admin from '../../models/Admin.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import bcrypt from 'bcrypt';
import { mongoConnect, mongoDisconnect } from '../../services/mongo.js';

describe('User Controller', () => {
    let savedAdmins;
    let superadminToken;
    let adminToken;
    let vendorToken;
    let dispatcherToken;

    beforeAll(async () => {
        await mongoConnect();
        await Admin.deleteMany();
        await Order.deleteMany();
        await Product.deleteMany();
    });

    afterAll(async () => {
        await Admin.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
        await mongoDisconnect();
    });

    afterEach(async () => {
        await Product.deleteMany();
        await Order.deleteMany();
    });

    describe('GET /api/v1/admin/order', () => {
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

        it('should get all orders for superadmin', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .get('/api/v1/admin/order')
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.orders.length).toBe(2);
            expect(response.body.orders).toMatchObject([
                {
                    _id: savedOrders[0]._id.toString(),
                    userId: '1234',
                    products: [
                        { 
                            product: {
                                _id: savedProducts[0]._id.toString(),
                                name: 'Product 1',
                                cost: 100,
                                description: 'Product 1 description'
                            },
                            quantity: 5
                        },
                        { 
                            product: {
                                _id: savedProducts[1]._id.toString(),
                                name: 'Product 2',
                                cost: 200,
                                description: 'Product 2 description'
                            },
                            quantity: 2
                        }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                },
                {
                    _id: savedOrders[1]._id.toString(),
                    userId: '1234',
                    products: [
                        { 
                            product: {
                                _id: savedProducts[0]._id.toString(),
                                name: 'Product 1',
                                cost: 100,
                                description: 'Product 1 description'
                            },
                            quantity: 5
                        }
                    ],
                    paymentStatus: 'Pending',
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }
            ]);
        });

        it('should get all orders for admin', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .get('/api/v1/admin/order')
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.orders.length).toBe(2);
            expect(response.body.orders).toMatchObject([
                {
                    _id: savedOrders[0]._id.toString(),
                    userId: '1234',
                    products: [
                        { 
                            product: {
                                _id: savedProducts[0]._id.toString(),
                                name: 'Product 1',
                                cost: 100,
                                description: 'Product 1 description'
                            },
                            quantity: 5
                        },
                        { 
                            product: {
                                _id: savedProducts[1]._id.toString(),
                                name: 'Product 2',
                                cost: 200,
                                description: 'Product 2 description'
                            },
                            quantity: 2
                        }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                },
                {
                    _id: savedOrders[1]._id.toString(),
                    userId: '1234',
                    products: [
                        { 
                            product: {
                                _id: savedProducts[0]._id.toString(),
                                name: 'Product 1',
                                cost: 100,
                                description: 'Product 1 description'
                            },
                            quantity: 5
                        }
                    ],
                    paymentStatus: 'Pending',
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }
            ]);
        });

        it('should throw error to get orders for vendor', async () => {
            const response = await request(app)
                .get('/api/v1/admin/order')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });

        it('should get list of orders for dipatcher', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentStatus: 'Confirmed',
                    deliveryStatus: 'Delivered',
                    paymentId: '1245',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .get('/api/v1/admin/order')
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.orders.length).toBe(1);
            expect(response.body.orders).toMatchObject([
                {
                    _id: savedOrders[0]._id.toString(),
                    userId: '1234',
                    products: [
                        { 
                            product: {
                                _id: savedProducts[0]._id.toString(),
                                name: 'Product 1',
                                cost: 100,
                                description: 'Product 1 description'
                            },
                            quantity: 5
                        },
                        { 
                            product: {
                                _id: savedProducts[1]._id.toString(),
                                name: 'Product 2',
                                cost: 200,
                                description: 'Product 2 description'
                            },
                            quantity: 2
                        }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }
            ]);
        });
    });

    describe('GET /api/v1/admin/order/:id', () => {
        it('should get order for superadmin', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .get(`/api/v1/admin/order/${savedOrders[0]._id.toString()}`)
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.order).toMatchObject(
                {
                    _id: savedOrders[0]._id.toString(),
                    userId: '1234',
                    products: [
                        { 
                            product: {
                                _id: savedProducts[0]._id.toString(),
                                name: 'Product 1',
                                cost: 100,
                                description: 'Product 1 description'
                            },
                            quantity: 5
                        },
                        { 
                            product: {
                                _id: savedProducts[1]._id.toString(),
                                name: 'Product 2',
                                cost: 200,
                                description: 'Product 2 description'
                            },
                            quantity: 2
                        }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                });
        });

        it('should get order for admin', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .get(`/api/v1/admin/order/${savedOrders[0]._id.toString()}`)
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.order).toMatchObject(
                {
                    _id: savedOrders[0]._id.toString(),
                    userId: '1234',
                    products: [
                        { 
                            product: {
                                _id: savedProducts[0]._id.toString(),
                                name: 'Product 1',
                                cost: 100,
                                description: 'Product 1 description'
                            },
                            quantity: 5
                        },
                        { 
                            product: {
                                _id: savedProducts[1]._id.toString(),
                                name: 'Product 2',
                                cost: 200,
                                description: 'Product 2 description'
                            },
                            quantity: 2
                        }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                });
        });

        it('should throw error to get order for vendor', async () => {
            const response = await request(app)
                .get('/api/v1/admin/order/1234')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });

        it('should get order for dipatcher', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentStatus: 'Confirmed',
                    deliveryStatus: 'Delivered',
                    paymentId: '1245',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .get(`/api/v1/admin/order/${savedOrders[0]._id.toString()}`)
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.order).toMatchObject(
                {
                    _id: savedOrders[0]._id.toString(),
                    userId: '1234',
                    products: [
                        { 
                            product: {
                                _id: savedProducts[0]._id.toString(),
                                name: 'Product 1',
                                cost: 100,
                                description: 'Product 1 description'
                            },
                            quantity: 5
                        },
                        { 
                            product: {
                                _id: savedProducts[1]._id.toString(),
                                name: 'Product 2',
                                cost: 200,
                                description: 'Product 2 description'
                            },
                            quantity: 2
                        }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                });
        });

        it('should throw error to get order that is delivered or not paid for dipatcher', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentStatus: 'Confirmed',
                    deliveryStatus: 'Delivered',
                    paymentId: '1245',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .get(`/api/v1/admin/order/${savedOrders[1]._id.toString()}`)
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Order not found");
        });
    });

    describe('DELETE /api/v1/admin/order/:id', () => {
        it('should delete order for superadmin', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .delete(`/api/v1/admin/order?id=${savedOrders[0]._id.toString()}`)
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            const ordersAfterDelete = await Order.find();
            expect(ordersAfterDelete.length).toBe(1);
        });

        it('should get order for admin', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .delete(`/api/v1/admin/order?id=${savedOrders[0]._id.toString()}`)
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            const ordersAfterDelete = await Order.find();
            expect(ordersAfterDelete.length).toBe(1);
        });

        it('should throw error to delete order for vendor', async () => {
            const response = await request(app)
                .delete('/api/v1/admin/order?id=1234')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });

        it('should throw error to delete order for dispatcher', async () => {
            const response = await request(app)
                .delete('/api/v1/admin/order?id=1234')
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });
    });

    describe('PATCH /api/v1/admin/order', () => {
        it('should update order for superadmin', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .patch('/api/v1/admin/order')
                .send({
                    order_id: savedOrders[0]._id.toString(),
                    status: 'Delivered'
                })
                .set('Cookie', [superadminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Order updated successfully");
            const ordersAfterUpdate = await Order.find();
            expect(ordersAfterUpdate).toMatchObject([
                {
                    _id: savedOrders[0]._id,
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Delivered',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                },
                {
                    _id: savedOrders[1]._id,
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    paymentStatus: 'Pending',
                    totalCost: 500,
                    address: 'Chennai',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                }
            ]);
        });

        it('should update order for admin', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .patch('/api/v1/admin/order')
                .send({
                    order_id: savedOrders[0]._id.toString(),
                    status: 'Delivered'
                })
                .set('Cookie', [adminToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Order updated successfully");
            const ordersAfterUpdate = await Order.find();
            expect(ordersAfterUpdate).toMatchObject([
                {
                    _id: savedOrders[0]._id,
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Delivered',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                },
                {
                    _id: savedOrders[1]._id,
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    paymentStatus: 'Pending',
                    totalCost: 500,
                    address: 'Chennai',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                }
            ]);
        });

        it('should throw error to update order for vendor', async () => {
            const response = await request(app)
                .patch('/api/v1/admin/order')
                .set('Cookie', [vendorToken]);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Forbidden");
        });

        it('should update order for dispatcher', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .patch('/api/v1/admin/order')
                .send({
                    order_id: savedOrders[0]._id.toString(),
                    status: 'Delivered'
                })
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Order updated successfully");
            const ordersAfterUpdate = await Order.find();
            expect(ordersAfterUpdate).toMatchObject([
                {
                    _id: savedOrders[0]._id,
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Delivered',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                },
                {
                    _id: savedOrders[1]._id,
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    paymentStatus: 'Pending',
                    totalCost: 500,
                    address: 'Chennai',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                }
            ]);
        });

        it('should throw error to update order that is unpaid for dispatcher', async () => {
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
            const orders = [
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu'
                }),
                new Order({
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    totalCost: 500,
                    address: 'Chennai'
                })
            ];
            const savedOrders = await Order.insertMany(orders);

            const response = await request(app)
                .patch('/api/v1/admin/order')
                .send({
                    order_id: savedOrders[1]._id.toString(),
                    status: 'Delivered'
                })
                .set('Cookie', [dispatcherToken]);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Order has pending payment");
            const ordersAfterUpdate = await Order.find();
            expect(ordersAfterUpdate).toMatchObject([
                {
                    _id: savedOrders[0]._id,
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 },
                        { productId: savedProducts[1]._id.toString(), quantity: 2 }
                    ],
                    paymentStatus: 'Confirmed',
                    paymentId: '1234',
                    totalCost: 700,
                    address: 'Kathmandu',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                },
                {
                    _id: savedOrders[1]._id,
                    userId: '1234',
                    products: [
                        { productId: savedProducts[0]._id.toString(), quantity: 5 }
                    ],
                    paymentId: '2345',
                    paymentStatus: 'Pending',
                    totalCost: 500,
                    address: 'Chennai',
                    deliveryStatus: 'Pending',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                }
            ]);
        });
    });
});