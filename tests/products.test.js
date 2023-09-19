import request from 'supertest';
import Product from '../models/Product.js';
import User from '../models/User.js'
import Order from '../models/Order.js';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { mongoConnect, mongoDisconnect } from '../services/mongo.js';

describe('Product endpoints', () => {
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
        await Product.deleteMany();
        await Order.deleteMany();
    });

    describe('GET /api/v1/product', () => {
        it('should return all products', async () => {
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
            await product1.save();
            await product2.save();

            const response = await request(app).get('/api/v1/product?sort=asc');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.products.length).toBe(2);
            expect(response.body.products[0].name).toBe('Product 1');
            expect(response.body.products[0].cost).toBe(10);
            expect(response.body.products[0].rating).toBe(4.5);
            expect(response.body.products[1].name).toBe('Product 2');
            expect(response.body.products[1].cost).toBe(20);
            expect(response.body.products[1].rating).toBe(3.5);
        });
    });

    describe('GET /api/v1/product/:id', () => {
        it('should login registered user', async () => {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({
                firstName: 'Ashish',
                lastName: "Something",
                email: 'product@gmail.com',
                password: hashedPassword,
                address: 'Kathmandu'
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
                .set('Accept', 'application/json');;
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            
            cookie = response.headers['set-cookie'][0].split(';')[0];
        })

        it('should return a product by id with user rating', async () => {
            const product = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: savedUser._id.toString(), value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct = await product.save();

            const response = await request(app)
                .get(`/api/v1/product/${savedProduct._id}`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.product.name).toBe('Product 1');
            expect(response.body.product.cost).toBe(10);
            expect(response.body.product.rating).toBe(4.5);
            expect(response.body.product.userRating).toBe(4);
        });

        it('should return a product by id without user rating', async () => {
            const product = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                    { userId: savedUser._id.toString(), value: 4 },
                    { userId: 'user2', value: 5 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            const savedProduct = await product.save();

            const response = await request(app)
                .get(`/api/v1/product/${savedProduct._id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.product.name).toBe('Product 1');
            expect(response.body.product.cost).toBe(10);
            expect(response.body.product.rating).toBe(4.5);
            expect(response.body.product.userRating).toBe(null);
        });
    });

    describe('PATCH /api/product/:id/rate', () => {
        it('should update product rating for a user who has ordered the product', async () => {
            const product = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4,
                ratings: [
                    { userId: 'user1', value: 4 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            await product.save();
            const order = new Order({
                userId: savedUser._id.toString(),
                products: [{ productId: product._id.toString(), quantity: 1 }],
                paymentId: '1234',
                paymentStatus: 'Confirmed',
                totalCost: 10,
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            await order.save();

            const response = await request(app)
                .patch(`/api/v1/product/${product._id}/rate`)
                .set('Cookie', cookie)
                .send({ rating: 3 })
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            const updatedProduct = await Product.findById(product._id);
            expect(updatedProduct.rating).toBe(3.5);
            expect(updatedProduct.ratings.length).toBe(2);
            expect(updatedProduct.ratings[0].value).toBe(4);
            expect(updatedProduct.ratings[1].value).toBe(3);
        });
    
        it('should throw an error if user has not ordered the product', async () => {
            const product = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4,
                ratings: [
                    { userId: 'user1', value: 4 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            await product.save();
            const order = new Order({
                userId: savedUser._id.toString(),
                products: [{ productId: product._id.toString(), quantity: 1 }],
                paymentId: '1234',
                paymentStatus: 'Pending',
                totalCost: 10,
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            await order.save();

            const response = await request(app)
                .patch(`/api/v1/product/${product._id}/rate`)
                .set('Cookie', cookie)
                .send({ rating: 3 })
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(true);
            expect(response.body.error).toBe('User has not ordered this product yet.');
            const updatedProduct = await Product.findById(product._id);
            expect(updatedProduct.rating).toBe(4);
            expect(updatedProduct.ratings.length).toBe(1);
            expect(updatedProduct.ratings[0].value).toBe(4);
        });

        it('should throw an error if user not logged in', async () => {
            const product = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4,
                ratings: [
                    { userId: 'user1', value: 4 }
                ],
                quantity: 10,
                vendorId: '1234'
            });
            await product.save();
            const order = new Order({
                userId: savedUser._id.toString(),
                products: [{ productId: product._id.toString(), quantity: 1 }],
                paymentId: '1234',
                paymentStatus: 'Pending',
                totalCost: 10,
                address: savedUser.address,
                deliveryStatus: 'Pending'
            });
            await order.save();

            const response = await request(app)
                .patch(`/api/v1/product/${product._id}/rate`)
                .send({ rating: 3 })
                .set('Accept', 'application/json');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Unauthorized');
            const updatedProduct = await Product.findById(product._id);
            expect(updatedProduct.rating).toBe(4);
            expect(updatedProduct.ratings.length).toBe(1);
            expect(updatedProduct.ratings[0].value).toBe(4);
        });
    });
});