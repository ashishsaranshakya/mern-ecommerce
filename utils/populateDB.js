import { mongoConnect, mongoDisconnect } from '../services/mongo.js';
import Product from '../models/Product.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

await mongoConnect();
const salt= await bcrypt.genSalt();

const admins = [
    new Admin({
        name: 'Super',
        email: 'super-admin@gamil.com',
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
        email: 'vendor@gamil.com',
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

const savedAdmins = await Admin.insertMany(admins);

const users = [
    new User({
        firstName: 'User1',
        lastName: "Something",
        email: 'user1@gmail.com',
        password: await bcrypt.hash("P@ssw0rd", salt),
        address: 'Kathmandu',
        occupation: 'Student'
    }),
    new User({
        firstName: 'User2',
        lastName: "Something",
        email: 'user2@gmail.com',
        password: await bcrypt.hash("P@ssw0rd", salt),
        address: 'Chennai',
        occupation: 'Student'
    })
]

const savedUsers = await User.insertMany(users);

const products = [
    new Product({
        name: 'Book',
        description: 'Description 1',
        cost: 500,
        imageUrl: 'https://example.com/image1.jpg',
        rating: 4.5,
        ratings: [
          { userId: savedUsers[0]._id, value: 4 },
          { userId: savedUsers[1]._id, value: 5 }
        ],
        quantity: 50,
        vendorId: savedAdmins[2]._id
    }),
    new Product({
        name: 'Bundle',
        description: 'Description 1',
        cost: 2000,
        imageUrl: 'https://example.com/image1.jpg',
        rating: 4,
        ratings: [
          { userId: savedUsers[0]._id, value: 3 },
          { userId: savedUsers[1]._id, value: 5 }
        ],
        quantity: 10,
        vendorId: savedAdmins[2]._id
    }),
    new Product({
        name: 'Candles',
        description: 'Description 1',
        cost: 10,
        imageUrl: 'https://example.com/image1.jpg',
        rating: 4,
        ratings: [
          { userId: savedUsers[1]._id, value: 4 }
        ],
        quantity: 100,
        vendorId: savedAdmins[2]._id
    })
]

const savedProducts = await Product.insertMany(products);

await mongoDisconnect();