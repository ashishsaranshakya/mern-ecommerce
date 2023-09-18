import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

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

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};
app.use(cors(corsOptions));

/* ROUTES */
const baseUrl = `/api/${process.env.API_VERSION}`;
app.get(`${baseUrl}`,(req, res) => res.status(200).json({success: true, message: 'Cittaa Ecommerce API'}))
app.use(`${baseUrl}/auth`, authRoutes);
app.use(`${baseUrl}/product`, productRoutes);
app.use(`${baseUrl}/order`, orderRoutes);
app.use(`${baseUrl}/user`, userRoutes);
app.use(`${baseUrl}/admin`, adminRoutes);
app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;