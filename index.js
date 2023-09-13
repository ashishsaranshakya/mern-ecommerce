import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from "razorpay";
import https from 'https';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const app = express();
app.use(express.json());

const corsOptions = {
    origin: "*",
    credentials: true
};
app.use(cors(corsOptions));

/* ROUTES */
app.use('/auth', authRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/user', userRoutes);
app.use(errorHandler);

/* HTTPS SETUP */
const privateKey = fs.readFileSync('./certs/key.pem', 'utf8');
const certificate = fs.readFileSync('./certs/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    })
    .then(() => httpsServer.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message));

/* RAZORPAY SETUP */
export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});