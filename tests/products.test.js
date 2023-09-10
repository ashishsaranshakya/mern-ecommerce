import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import jwt from 'jsonwebtoken';
const app = express();

describe('Product endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Product.deleteMany();
    await Order.deleteMany();
  });

  describe('GET /product', () => {
    it('should return all products', async () => {
      const product1 = new Product({
        name: 'A red door',
        price: 100,
        discount: 25,
      });

      const product2 = new Product({
        name: 'A blue door',
        price: 100,
        discount: 25,
      });
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

      const token=jwt.sign({
        user_id:"user1"
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d",
        }
      )

      const response = await request(app).get('/product').set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Product 1');
      expect(response.body[0].userRating).toBe(4);
      expect(response.body[1].name).toBe('Product 2');
      expect(response.body[1].userRating).toBe(3);
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