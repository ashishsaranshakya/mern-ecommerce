import { mongoConnect, mongoDisconnect } from '../services/mongo.js';
import Product from '../models/Product.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

await mongoConnect();
await Admin.deleteMany({});
await User.deleteMany({});
await Product.deleteMany({});
await Order.deleteMany({});

const salt= await bcrypt.genSalt();

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
        imageUrl: 'https://img.freepik.com/free-photo/book-composition-with-open-book_23-2147690555.jpg?w=1060&t=st=1696851422~exp=1696852022~hmac=8bd793323bcc6bab5d0da89b78cbac9e3474c18cf448e53ad1e87c7da0265f5e',
        rating: 4.5,
        ratings: [
          { userId: savedUsers[0]._id, value: 4 },
          { userId: savedUsers[1]._id, value: 5 }
        ],
        quantity: 50,
        vendorId: savedAdmins[2]._id
    }),
    new Product({
        name: 'Plant',
        description: 'Description 1',
        cost: 200,
        imageUrl: 'https://www.collinsdictionary.com/images/full/plant_108417266_1000.jpg?version=4.0.333',
        rating: 4,
        ratings: [
          { userId: savedUsers[0]._id, value: 3 },
          { userId: savedUsers[1]._id, value: 5 }
        ],
        quantity: 10,
        vendorId: savedAdmins[2]._id
    }),
    new Product({
        name: 'Candle',
        description: 'Description 1',
        cost: 100,
        imageUrl: 'https://wmcd.b-cdn.net/wp-content/uploads/wallmantra-candles-fragrances-lavender-clear-glass-scented-candle-31082681401510.jpg',
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