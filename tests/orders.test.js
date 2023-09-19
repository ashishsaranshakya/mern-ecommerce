import request from 'supertest';
import Product from '../models/Product.js';
import User from '../models/User.js'
import Order from '../models/Order.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import app from '../app.js';
import dotenv from 'dotenv';
dotenv.config();
import { mongoConnect, mongoDisconnect } from '../services/mongo.js';

describe('Orders endpoints', () => {
    const password = 'P@ssw0rd';
    let savedUser = null;
    let cookie = null;

    beforeAll(async () => {
        await mongoConnect();
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
    });

    afterAll(async () => {
        await User.deleteMany();
        await mongoDisconnect();
    });

    afterEach(async () => {
        await User.updateOne(
            { _id: savedUser._id.toString() },
            { $set: { cart: [] } }
        );
        await Product.deleteMany();
        await Order.deleteMany();
    });

    describe('GET /api/v1/order', () => {
        it('should login registered user', async () => {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({
                firstName: 'Ashish',
                lastName: "Something",
                email: 'testing@gmail.com',
                password: hashedPassword,
                address: 'Kathmandu',
            })
            savedUser = await user.save();

            const response = await request(app)
                .post(`/api/v1/auth/login`)
                .send(
                    {
                        email: savedUser.email,
                        password: password
                    }
                )
                .set('Accept', 'application/json');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toMatchObject({
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                address: savedUser.address,
                cart: [],
                occupation: null
            });
            
            cookie = response.headers['set-cookie'][0].split(';')[0];
        })

        it('should return all orders', async () => {
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: 'user1', value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const product2 = new Product({
                name: 'Product 2',
                description: 'Description 2',
                cost: 20,
                imageUrl: 'https://example.com/image2.jpg',
                rating: 3.5,
                ratings: [
                    { userId: 'user1', value: 3 },
                    { userId: 'user3', value: 4 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct1 = await product1.save();
            const savedProduct2 = await product2.save();
            const order1 = new Order({
                userId: savedUser._id.toString(),
                products: [
                    { productId: savedProduct1._id.toString(), quantity: 1 },
                    { productId: savedProduct2._id.toString(), quantity: 2 }
                ],
                totalCost: 50,
                paymentId: '1234',
                paymentStatus: 'Confirmed',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            const order2 = new Order({
                userId: savedUser._id.toString(),
                products: [
                    { productId: product1._id.toString(), quantity: 1 }
                ],
                totalCost: 10,
                paymentId: '2344',
                paymentStatus: 'Pending',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            const order3 = new Order({
                userId: '1234',
                products: [
                    { productId: product1._id.toString(), quantity: 1 }
                ],
                totalCost: 10,
                paymentId: '1345',
                paymentStatus: 'Pending',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            await order1.save();
            await order2.save();
            await order3.save();

            const response = await request(app)
                .get('/api/v1/order')
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.orders.length).toBe(2);
            expect(response.body.orders[0].products.length).toBe(1);
            expect(response.body.orders[0].products[0].product).toMatchObject({
                _id: savedProduct1._id.toString(),
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
            });
            expect(response.body.orders[0].products[0].quantity).toBe(1);
            expect(response.body.orders[0].paymentId).toBe('2344');
            expect(response.body.orders[0].paymentStatus).toBe('Pending');
            expect(response.body.orders[1].products.length).toBe(2);
            expect(response.body.orders[1].products[0].product).toMatchObject({
                _id: savedProduct1._id.toString(),
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
            });
            expect(response.body.orders[1].products[0].quantity).toBe(1);
            expect(response.body.orders[1].products[1].product).toMatchObject({
                _id: savedProduct2._id.toString(),
                name: 'Product 2',
                description: 'Description 2',
                cost: 20,
                imageUrl: 'https://example.com/image2.jpg',
            });
            expect(response.body.orders[1].products[1].quantity).toBe(2);
            expect(response.body.orders[1].paymentId).toBe('1234');
            expect(response.body.orders[1].paymentStatus).toBe('Confirmed');
        });
    });

    describe('GET /api/v1/order/:id', () => {
        it('should return one order', async () => {
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: 'user1', value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const product2 = new Product({
                name: 'Product 2',
                description: 'Description 2',
                cost: 20,
                imageUrl: 'https://example.com/image2.jpg',
                rating: 3.5,
                ratings: [
                    { userId: 'user1', value: 3 },
                    { userId: 'user3', value: 4 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct1 = await product1.save();
            const savedProduct2 = await product2.save();
            const order1 = new Order({
                userId: savedUser._id.toString(),
                products: [
                    { productId: savedProduct1._id.toString(), quantity: 1 },
                    { productId: savedProduct2._id.toString(), quantity: 2 }
                ],
                totalCost: 50,
                paymentId: '1234',
                paymentStatus: 'Confirmed',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            const order2 = new Order({
                userId: savedUser._id.toString(),
                products: [
                    { productId: product1._id.toString(), quantity: 1 }
                ],
                totalCost: 10,
                paymentId: '2344',
                paymentStatus: 'Pending',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            const savedOrder1 = await order1.save();
            const savedOrder2 = await order2.save();

            const response = await request(app)
                .get(`/api/v1/order/${savedOrder1._id.toString()}`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.order.paymentId).toBe('1234');
            expect(response.body.order.paymentStatus).toBe('Confirmed');
            expect(response.body.order.totalCost).toBe(50);
            expect(response.body.order.deliveryStatus).toBe('Pending');
            expect(response.body.order.products.length).toBe(2);
            expect(response.body.order.products[0].product).toMatchObject({
                _id: savedProduct1._id.toString(),
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
            });
            expect(response.body.order.products[0].quantity).toBe(1);
            expect(response.body.order.products[1].product).toMatchObject({
                _id: savedProduct2._id.toString(),
                name: 'Product 2',
                description: 'Description 2',
                cost: 20,
                imageUrl: 'https://example.com/image2.jpg',
            });
            expect(response.body.order.products[1].quantity).toBe(2);
        });

        it('should throw error for access other user order', async () => {
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: 'user1', value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const product2 = new Product({
                name: 'Product 2',
                description: 'Description 2',
                cost: 20,
                imageUrl: 'https://example.com/image2.jpg',
                rating: 3.5,
                ratings: [
                    { userId: 'user1', value: 3 },
                    { userId: 'user3', value: 4 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct1 = await product1.save();
            const savedProduct2 = await product2.save();
            const order1 = new Order({
                userId: savedUser._id.toString(),
                products: [
                    { productId: savedProduct1._id.toString(), quantity: 1 },
                    { productId: savedProduct2._id.toString(), quantity: 2 }
                ],
                totalCost: 50,
                paymentId: '1234',
                paymentStatus: 'Confirmed',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            const order2 = new Order({
                userId: '1234',
                products: [
                    { productId: product1._id.toString(), quantity: 1 }
                ],
                totalCost: 10,
                paymentId: '2344',
                paymentStatus: 'Pending',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            const savedOrder1 = await order1.save();
            const savedOrder2 = await order2.save();

            const response = await request(app)
                .get(`/api/v1/order/${savedOrder2._id.toString()}`)
                .set('Cookie', cookie);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(true);
            expect(response.body.error).toBe('User not authorized to view this order');
        });
    });

    describe('POST /api/v1/order/checkout/product', () => {
        it('should create order for product', async () => {
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: 'user1', value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct1 = await product1.save();

            const response = await request(app)
                .post(`/api/v1/order/checkout/product?id=${savedProduct1._id.toString()}`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.order).toMatchObject({
                entity: 'order',
                amount: 1000,
                amount_paid: 0,
                amount_due: 1000,
                currency: 'INR',
                receipt: null,
                offer_id: null,
                status: 'created',
                attempts: 0,
                notes: []
            });
            const orders = await Order.find({ userId: savedUser._id.toString() });
            expect(orders.length).toBe(1);
            expect(orders[0].products.length).toBe(1);
            expect(orders[0].products[0].productId).toBe(savedProduct1._id.toString());
            expect(orders[0].products[0].quantity).toBe(1);
            expect(orders[0].paymentId).toBe(response.body.order.id);
            expect(orders[0].paymentStatus).toBe('Pending');
            expect(orders[0].deliveryStatus).toBe('Pending');
        });

        it('should throw error for invalid product id', async () => {
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: 'user1', value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct1 = await product1.save();

            const response = await request(app)
                .post(`/api/v1/order/checkout/product?id=60b6f7b9e1b9f3a5e8f1b0a1`)
                .set('Cookie', cookie);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(true);
            expect(response.body.error).toBe("Product not found");
        });
    });

    describe('POST /api/v1/order/checkout/cart', () => {
        it('should create order for user cart', async () => {
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: 'user1', value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const product2 = new Product({
                name: 'Product 2',
                description: 'Description 2',
                cost: 20,
                imageUrl: 'https://example.com/image2.jpg',
                rating: 3.5,
                ratings: [
                    { userId: 'user1', value: 3 },
                    { userId: 'user3', value: 4 }
                ],
                quantity: 20,
                vendorId: '1234'
            });
            const savedProduct1 = await product1.save();
            const savedProduct2 = await product2.save();

            savedUser.cart.push({ productId: savedProduct1._id.toString(), quantity: 1 });
            savedUser.cart.push({ productId: savedProduct2._id.toString(), quantity: 2 });
            await savedUser.save();

            const response = await request(app)
                .post(`/api/v1/order/checkout/cart`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.order).toMatchObject({
                entity: 'order',
                amount: 5000,
                amount_paid: 0,
                amount_due: 5000,
                currency: 'INR',
                receipt: null,
                offer_id: null,
                status: 'created',
                attempts: 0,
                notes: []
            });
            const orders = await Order.find({ userId: savedUser._id.toString() });
            expect(orders.length).toBe(1);
            expect(orders[0].products.length).toBe(2);
            expect(orders[0].products[0].productId).toBe(savedProduct1._id.toString());
            expect(orders[0].products[0].quantity).toBe(1);
            expect(orders[0].products[1].productId).toBe(savedProduct2._id.toString());
            expect(orders[0].products[1].quantity).toBe(2);
            expect(orders[0].paymentId).toBe(response.body.order.id);
            expect(orders[0].paymentStatus).toBe('Pending');
            expect(orders[0].deliveryStatus).toBe('Pending');
        });

        it('should throw error for cart empty', async () => {
            const response = await request(app)
                .post(`/api/v1/order/checkout/cart`)
                .set('Cookie', cookie);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(true);
            expect(response.body.error).toBe("Cart is empty");
        });
    });

    describe('POST /api/v1/order/verify', () => {
        it('should verify order payment', async () => {
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: 'user1', value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const product2 = new Product({
                name: 'Product 2',
                description: 'Description 2',
                cost: 20,
                imageUrl: 'https://example.com/image2.jpg',
                rating: 3.5,
                ratings: [
                    { userId: 'user1', value: 3 },
                    { userId: 'user3', value: 4 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct1 = await product1.save();
            const savedProduct2 = await product2.save();
            const order1 = new Order({
                userId: savedUser._id.toString(),
                products: [
                    { productId: savedProduct1._id.toString(), quantity: 1 },
                    { productId: savedProduct2._id.toString(), quantity: 2 }
                ],
                totalCost: 50,
                paymentId: '1234',
                paymentStatus: 'Pending',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            const savedOrder1 = await order1.save();

            const body = savedOrder1.paymentId + "|" + "181738901";

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
                .update(body.toString())
                .digest("hex");

            const response = await request(app)
                .post(`/api/v1/order/verify`)
                .send(
                    {
                        razorpay_order_id: savedOrder1.paymentId,
                        razorpay_payment_id: "181738901",
                        razorpay_signature: expectedSignature
                    }
                )
                .set('Accept', 'application/x-www-form-urlencoded')
                .set('Cookie', cookie);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(`http://localhost:3000/paymentsuccess?reference=${savedOrder1._id.toString()}`);
            const orders = await Order.find({ userId: savedUser._id.toString() });
            expect(orders.length).toBe(1);
            expect(orders[0].products.length).toBe(2);
            expect(orders[0].products[0].productId).toBe(savedProduct1._id.toString());
            expect(orders[0].products[0].quantity).toBe(1);
            expect(orders[0].products[1].productId).toBe(savedProduct2._id.toString());
            expect(orders[0].products[1].quantity).toBe(2);
            expect(orders[0].paymentStatus).toBe('Confirmed');
            expect(orders[0].deliveryStatus).toBe('Pending');
        });

        it('should throw error for invalid order payment', async () => {
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: 'user1', value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const product2 = new Product({
                name: 'Product 2',
                description: 'Description 2',
                cost: 20,
                imageUrl: 'https://example.com/image2.jpg',
                rating: 3.5,
                ratings: [
                    { userId: 'user1', value: 3 },
                    { userId: 'user3', value: 4 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct1 = await product1.save();
            const savedProduct2 = await product2.save();
            const order1 = new Order({
                userId: savedUser._id.toString(),
                products: [
                    { productId: savedProduct1._id.toString(), quantity: 1 },
                    { productId: savedProduct2._id.toString(), quantity: 2 }
                ],
                totalCost: 50,
                paymentId: '1234',
                paymentStatus: 'Pending',
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            const savedOrder1 = await order1.save();

            const body = savedOrder1.paymentId + "|" + "181738901";

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
                .update(body.toString())
                .digest("hex");

            const response = await request(app)
                .post(`/api/v1/order/verify`)
                .send(
                    {
                        razorpay_order_id: savedOrder1.paymentId,
                        razorpay_payment_id: "167627874",
                        razorpay_signature: expectedSignature
                    }
                )
                .set('Accept', 'application/x-www-form-urlencoded')
                .set('Cookie', cookie);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(`http://localhost:3000/paymentfailure?reference=${savedOrder1._id.toString()}`);
            const orders = await Order.find({ userId: savedUser._id.toString() });
            expect(orders.length).toBe(1);
            expect(orders[0].products.length).toBe(2);
            expect(orders[0].products[0].productId).toBe(savedProduct1._id.toString());
            expect(orders[0].products[0].quantity).toBe(1);
            expect(orders[0].products[1].productId).toBe(savedProduct2._id.toString());
            expect(orders[0].products[1].quantity).toBe(2);
            expect(orders[0].paymentStatus).toBe('Pending');
            expect(orders[0].deliveryStatus).toBe('Pending');
        });
    });
});