import request from 'supertest';
import User from '../models/User.js'
import Product from '../models/Product.js'
import bcrypt from 'bcrypt';
import app from '../app.js';
import { mongoConnect, mongoDisconnect } from '../services/mongo.js';

describe('User endpoints', () => {
    const password = 'P@ssw0rd';
    let cookie = null;
    let savedUser = null;

    beforeAll(async () => {
        await mongoConnect();
        await Product.deleteMany();
        await User.deleteMany();
    });

    afterAll(async () => {
        await User.deleteMany();
        await Product.deleteMany();
        await mongoDisconnect();
    });

    afterEach(async () => {
        savedUser.cart = [];
        await savedUser.save();
        await Product.deleteMany();
    });

    describe('GET /api/v1/user/profile', () => {
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

        it('should get profile of user', async () => {
            const response = await request(app)
                .get('/api/v1/user/profile')
                .set('Cookie', [cookie]);

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
        });

        it('should throw error for profile without credentials', async () => {
            const response = await request(app)
                .get('/api/v1/user/profile');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Unauthorized");
        });
    });

    describe('GET /api/v1/user/cart', () => {
        it('should get cart of user', async () => {
            savedUser.cart = [
                { productId: '60b6f7b9e1b9f3a5e8f1b0a1', quantity: 1 },
                { productId: '60b6f7b9e1b9f3a5e8f1b0a2', quantity: 2 }
            ];
            await savedUser.save();

            const response = await request(app)
                .get('/api/v1/user/cart')
                .set('Cookie', [cookie]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.cart.length).toBe(2);
            expect(response.body.cart[0]).toMatchObject({
                productId: '60b6f7b9e1b9f3a5e8f1b0a1',
                quantity: 1
            })
            expect(response.body.cart[1]).toMatchObject({
                productId: '60b6f7b9e1b9f3a5e8f1b0a2',
                quantity: 2
            });
        });

        it('should throw error for cart without credentials', async () => {
            const response = await request(app)
                .get('/api/v1/user/cart');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Unauthorized");
        });
    });

    describe('POST /api/v1/user/cart', () => {
        it('should add product to user cart', async () => {
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
                .post(`/api/v1/user/cart?id=${savedProduct1._id.toString()}`)
                .set('Cookie', [cookie]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.cart.length).toBe(1);
            expect(response.body.cart[0]).toMatchObject({
                productId: savedProduct1._id.toString(),
                quantity: 1
            })
        })

        it('should throw error for invalid product id', async () => {
            const response = await request(app)
                .post(`/api/v1/user/cart?id=60b6f7b9e1b9f3a5e8f1b0a1`)
                .set('Cookie', [cookie]);
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(true);
            expect(response.body.error).toBe("Product not found");
        })
    });

    describe('DELETE /api/v1/user/cart', () => {
        it('should delete single quantity of product from user cart', async () => {
            savedUser.cart = [
                { productId: '60b6f7b9e1b9f3a5e8f1b0a1', quantity: 1 },
                { productId: '60b6f7b9e1b9f3a5e8f1b0a2', quantity: 2 }
            ];
            await savedUser.save();

            const response = await request(app)
                .delete(`/api/v1/user/cart?id=60b6f7b9e1b9f3a5e8f1b0a2`)
                .set('Cookie', [cookie]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.cart.length).toBe(2);
            expect(response.body.cart[0]).toMatchObject({
                productId: savedUser.cart[0].productId,
                quantity: 1
            });
            expect(response.body.cart[1]).toMatchObject({
                productId: savedUser.cart[1].productId,
                quantity: 1
            });
        });

        it('should delete multiple quantity of product from user cart', async () => {
            savedUser.cart = [
                { productId: '60b6f7b9e1b9f3a5e8f1b0a1', quantity: 1 },
                { productId: '60b6f7b9e1b9f3a5e8f1b0a2', quantity: 2 }
            ];
            await savedUser.save();

            const response = await request(app)
                .delete(`/api/v1/user/cart?id=60b6f7b9e1b9f3a5e8f1b0a2&single=false`)
                .set('Cookie', [cookie]);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.cart.length).toBe(1);
            expect(response.body.cart[0]).toMatchObject({
                productId: savedUser.cart[0].productId,
                quantity: 1
            });
        });

        it('should throw error for product not in user cart', async () => {
            savedUser.cart = [
                { productId: '60b6f7b9e1b9f3a5e8f1b0a1', quantity: 1 }
            ];
            await savedUser.save();

            const response = await request(app)
                .delete(`/api/v1/user/cart?id=60b6f7b9e1b9f3a5e8f1b0a2&single=false`)
                .set('Cookie', [cookie]);
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(true);
            expect(response.body.error).toBe("Product not found in cart");;
        });
    });
});