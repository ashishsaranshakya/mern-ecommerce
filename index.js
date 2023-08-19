import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from "razorpay";

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json({limit: '30mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}));
// app.use(cors());
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};
  
app.use(cors(corsOptions));

/* ROUTES */
app.use('/auth', authRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    })
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message));

export const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_API_SECRET,
    });