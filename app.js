import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { routeNotFoundHandler } from './middleware/routeNotFoundHandler.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

export const baseUrl = "https://mern-ecommerce-uw3n.onrender.com";

const corsOptions = {
    origin: baseUrl,
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.static('client/build'));

/* ROUTES */
const apiBaseUrl = `/api/${process.env.API_VERSION}`;
app.get(`${apiBaseUrl}`,(req, res) => res.status(200).json({success: true, message: 'Ecommerce API'}))
app.use(`${apiBaseUrl}/auth`, authRoutes);
app.use(`${apiBaseUrl}/product`, productRoutes);
app.use(`${apiBaseUrl}/order`, orderRoutes);
app.use(`${apiBaseUrl}/user`, userRoutes);
app.use(`${apiBaseUrl}/admin`, adminRoutes);
app.get('*', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'index.html'));
});
app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;