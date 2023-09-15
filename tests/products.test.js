import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js'
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
const app = express();
dotenv.config({ path: '.test.env' });
import {createToken} from '../controllers/auth.js'

describe('Product endpoints', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
    });

    describe('GET /product', () => {
      it('should return all products', async () => {
            const salt= await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash("P@ssw0rd", salt);
            const user = new User({
                firstName: 'Ashish',
                lastName: "Something",
                email: 'ashish@gamil.com',
                password: hashedPassword
            })
            const savedUser = await user.save();
        
            const product1 = new Product({
                name: 'Product 1',
                description: 'Description 1',
                cost: 10,
                imageUrl: 'https://example.com/image1.jpg',
                rating: 4.5,
                ratings: [
                  { userId: 'user1', value: 4 },
                  { userId: 'user2', value: 5 }
                ]
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
                ]
            });
            await product1.save();
            await product2.save();

            const token = createToken(savedUser._id);

            const response = await request(app).get('/api/v1/product');//.set('Cookie', `token=${token}`);

        console.log(response.body,response.error)
            expect(response.status).toBe(200);
            expect(response.body.products.length).toBe(2);
            expect(response.body.products[0].name).toBe('Product 1');
            expect(response.body.products[0].rating).toBe(4.5);
            expect(response.body.products[1].name).toBe('Product 2');
            expect(response.body.products[1].rating).toBe(3.5);
        });
    });

    //   describe('GET /api/products/:id', () => {
    //     it('should return a product by id', async () => {
    //       const product = new Product({
    //         name: 'Product 1',
    //         description: 'Description 1',
    //         cost: 10,
    //         imageUrl: 'https://example.com/image1.jpg',
    //         rating: 4.5,
    //         ratings: [
    //           { userId: 'user1', value: 4 },
    //           { userId: 'user2', value: 5 }
    //         ]
    //       });
    //       await product.save();

    //       const response = await request(app).get(`/api/products/${product._id}`);

    //       expect(response.status).toBe(200);
    //       expect(response.body.name).toBe('Product 1');
    //       expect(response.body.userRating).toBe(4);
    //     });
    //   });

    //   describe('POST /api/products/search', () => {
    //     it('should return products matching search term', async () => {
    //       const product1 = new Product({
    //         name: 'Product 1',
    //         description: 'Description 1',
    //         cost: 10,
    //         imageUrl: 'https://example.com/image1.jpg',
    //         rating: 4.5,
    //         ratings: [
    //           { userId: 'user1', value: 4 },
    //           { userId: 'user2', value: 5 }
    //         ]
    //       });
    //       const product2 = new Product({
    //         name: 'Product 2',
    //         description: 'Description 2',
    //         cost: 20,
    //         imageUrl: 'https://example.com/image2.jpg',
    //         rating: 3.5,
    //         ratings: [
    //           { userId: 'user1', value: 3 },
    //           { userId: 'user3', value: 4 }
    //         ]
    //       });
    //       await product1.save();
    //       await product2.save();

    //       const response = await request(app)
    //         .post('/api/products/search')
    //         .send({ searchTerm: 'product 1' });

    //       expect(response.status).toBe(200);
    //       expect(response.body.length).toBe(1);
    //       expect(response.body[0].name).toBe('Product 1');
    //       expect(response.body[0].userRating).toBe(4);
    //     });
    //   });

    //   describe('POST /api/products/:id/rate', () => {
    //     it('should update product rating for a user who has ordered the product', async () => {
    //       const user1 = { user_id: 'user1' };
    //       const user2 = { user_id: 'user2' };
    //       const product = new Product({
    //         name: 'Product 1',
    //         description: 'Description 1',
    //         cost: 10,
    //         imageUrl: 'https://example.com/image1.jpg',
    //         rating: 4.5,
    //         ratings: [
    //           { userId: 'user1', value: 4 },
    //           { userId: 'user2', value: 5 }
    //         ]
    //       });
    //       await product.save();
    //       const order = new Order({
    //         userId: 'user1',
    //         productIds: [product._id]
    //       });
    //       await order.save();

    //       const response = await request(app)
    //         .post(`/api/products/${product._id}/rate`)
    //         .set('Authorization', `Bearer ${user1}`)
    //         .send({ rating: 3 });

    //       expect(response.status).toBe(200);
    //       expect(response.body.message).toBe('Rating updated successfully');
    //       const updatedProduct = await Product.findById(product._id);
    //       expect(updatedProduct.rating).toBe(4);
    //       expect(updatedProduct.ratings.length).toBe(2);
    //       expect(updatedProduct.ratings[0].value).toBe(4);
    //       expect(updatedProduct.ratings[1].value).toBe(3);
    //     });

    //     it('should throw an error if user has not ordered the product', async () => {
    //       const user1 = { user_id: 'user1' };
    //       const user2 = { user_id: 'user2' };
    //       const product = new Product({
    //         name: 'Product 1',
    //         description: 'Description 1',
    //         cost: 10,
    //         imageUrl: 'https://example.com/image1.jpg',
    //         rating: 4.5,
    //         ratings: [
    //           { userId: 'user1', value: 4 },
    //           { userId: 'user2', value: 5 }
    //         ]
    //       });
    //       await product.save();

    //       const response = await request(app)
    //         .post(`/api/products/${product._id}/rate`)
    //         .set('Authorization', `Bearer ${user1}`)
    //         .send({ rating: 3 });

    //       expect(response.status).toBe(404);
    //       expect(response.body.error).toBe('User has not ordered this product yet.');
    //       const updatedProduct = await Product.findById(product._id);
    //       expect(updatedProduct.rating).toBe(4.5);
    //       expect(updatedProduct.ratings.length).toBe(2);
    //       expect(updatedProduct.ratings[0].value).toBe(4);
    //       expect(updatedProduct.ratings[1].value).toBe(5);
    //     });
    //   });
  });