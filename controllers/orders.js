import Order from '../models/Order.js';
import Product from "../models/Product.js";
import User from "../models/User.js";
import { razorpayInstance } from "../services/razorpay.js";
import crypto from "crypto";
import { Types } from 'mongoose';
import _ from 'lodash';
import logger, { adminLogger } from '../services/logger.js';
import { createAPIError } from '../utils/APIError.js';
import { baseUrl } from '../app.js';

export const checkoutProduct = async (req, res, next) => {
    try{
        const { user_id } = req.user;
        const { id: product_id, quantity = 1 } = req.query;
        
        const product = await Product.findById(product_id);
        if (!product) return next(createAPIError(404, true, "Product not found"));
        if (product.quantity < quantity) {
            logger.error(`Product ${product_id} out of stock`);
            adminLogger.error(`Product ${product_id} out of stock`);
            return next(createAPIError(400, true, "Product out of stock"));
        }

        const options = {
            amount: Number(product.cost * quantity * 100),
            currency: "INR",
        };
        const order = await razorpayInstance.orders.create(options);

        const user = await User.findById(user_id);
        const newOrder = new Order({
            userId: user_id,
            products: [{productId: product_id, quantity: Number(quantity)}],
            paymentId: order.id,
            paymentStatus: 'Pending',
            totalCost: product.cost * quantity,
            address: user.address
        });

        const prevOrder = await Order.findOne({ 
            userId: user_id, 
            products: [{productId: product_id, quantity}], 
            paymentStatus: 'Pending' 
        });
        if(!!prevOrder){
            prevOrder.paymentId = order.id;
            await prevOrder.save();
        }
        else{
            await newOrder.save();
        }
        
        logger.info(`Order created for user ${user_id} for product ${product_id}`);
        res.status(200).json({
            success: true,
            order
        });
    }
    catch(error){
        logger.error(`Error while creating order: ${error.message}`);
        next(error);
    }
};

export const checkoutCart = async (req, res, next) => {
    try{
        const { user_id } = req.user;
        const user = await User.findById(user_id);

        if(user.cart.length === 0){
            logger.error(`User ${user_id} has no products in cart`);
            return next(createAPIError(400, true, "Cart is empty"));
        }
        
        const productIds = user.cart.map(product => new Types.ObjectId(product.productId));
        const products = await Product.find({ _id: { $in: productIds } });

        let totalAmount = 0;
        products.forEach(product => {
            if(product.quantity < user.cart.find(item => item.productId === product._id.toString()).quantity){
                logger.error(`Product ${product._id} out of stock`);
                adminLogger.error(`Product ${product._id} out of stock`);
                return next(createAPIError(400, true, "Product out of stock"));
            }
            totalAmount += (product.cost * user.cart.find(item => item.productId === product._id.toString()).quantity);
        });
        const options = {
            amount: Number(totalAmount * 100),
            currency: "INR",
        };
        const order = await razorpayInstance.orders.create(options);

        const newOrder =  new Order({
            userId: user_id,
            products: user.cart,
            paymentId: order.id,
            paymentStatus: 'Pending',
            totalCost: totalAmount,
            address: user.address
        });
        
        const prevOrders = await Order.find({ userId: user_id, paymentStatus: 'Pending' });
        let prevOrder = null;
        prevOrders.forEach(order => {
            if(!prevOrder && order.products.length===user.cart.length && _.isEmpty(_.xorWith(order.products, user.cart, _.isEqual))){
                prevOrder = order;
            }
        });
        if(!!prevOrder){
            prevOrder.paymentId = order.id;
            await prevOrder.save();
        }
        else{
            await newOrder.save();
        }
        user.cart = [];
        await user.save();

        logger.info(`Order created for user ${user_id} for products ${newOrder.products}`);
        res.status(200).json({
            success: true,
            order
        });
    }
    catch(error){
        logger.error(`Error while creating order: ${error.message}`);
        next(error);
    }
};

export const checkoutOrder = async (req, res, next) => {
    try{
        const { user_id } = req.user;
        const { id: order_id } = req.query;
        const user = await User.findById(user_id);

        const savedOrder = await Order.findById(order_id);
        if (!savedOrder) {
            logger.error(`Order ${order_id} not found`);
            return next(createAPIError(404, true, "Order not found"));
        }
        if (savedOrder.userId !== user_id) {
            logger.error(`User ${user_id} not authorized to checkout order ${order_id}`);
            return next(createAPIError(401, true, "User not authorized to checkout this order"));
        }
        if (savedOrder.paymentStatus === 'Confirmed') {
            logger.error(`Order ${order_id} already confirmed`);
            return next(createAPIError(400, true, "Order already confirmed"));
        }

        const options = {
            amount: Number(savedOrder.totalCost * 100),
            currency: "INR",
        };
        const order = await razorpayInstance.orders.create(options);
        
        savedOrder.paymentId = order.id;
        await savedOrder.save();

        logger.info(`Order updated for user ${user_id} for products ${savedOrder.products}`);
        res.status(200).json({
            success: true,
            order
        });
    }
    catch(error){
        logger.error(`Error while creating order: ${error.message}`);
        next(error);
    }
};

export const paymentVerification = async (req, res, next) => {
    try{
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;
        const order = await Order.findOne({ paymentId: razorpay_order_id });

        if (isAuthentic) {
            order.paymentStatus = "Confirmed";
            await order.save();

            order.products.forEach(async product => {
                const productObj = await Product.findById(product.productId);
                productObj.quantity -= product.quantity;
                await productObj.save();
            })

            logger.info(`Payment verified for order ${order._id}`);
            res.redirect(
                `${baseUrl}/paymentsuccess?reference=${order._id}`
            );
        }
        else {
            logger.error(`Payment verification failed for order ${order._id}`);
            res.redirect(
                `${baseUrl}/paymentfailure?reference=${order._id}`
            );
        }
    }
    catch(error){
        logger.error(`Error while verifying payment: ${error.message}`);
        next(error);
    }
};

export const getOrder = async (req, res, next) => {
    try{
        const order = await Order.findById(req.params.id,{
            updatedAt: 0,
            createdAt: 0,
            __v: 0
        });
        if(order.userId !== req.user.user_id){
            logger.error(`User ${req.user.user_id} not authorized to view order ${req.params.id}`);
            return next(createAPIError(404, true, "User not authorized to view this order"));
        }

        const products = await Promise.all(order.products.map(async (productInOrder) => {
            const product = await Product.findOne(
                { _id: productInOrder.productId },
                { __v: 0, createdAt: 0, updatedAt: 0, ratings: 0, vendorId: 0, rating: 0, quantity: 0 });
            return { product, quantity: productInOrder.quantity };
        }));
        order.products = products;

        logger.info(`Order ${req.params.id} fetched for user ${req.user.user_id}`);
        res.status(200).json({success: true, order});
    }
    catch(error){
        logger.error(`Error while fetching order ${req.params.id}: ${error.message}`);
        next(error);
    }
}

export const getUserOrders = async (req, res, next) => {
    try{
        const { page = 1, limit = 10, sort = "desc" } = req.query;

        const orders = await Order.paginate(
            { userId: req.user.user_id },
            {
                page,
                limit,
                sort: { updatedAt: sort === 'asc' ? 1 : -1 },
                select: { updatedAt: 0, createdAt: 0, __v: 0 }
            });
        
        const ordersWithProducts = await Promise.all(orders.docs.map(async (order) => {
            const products = await Promise.all(order.products.map(async (productInOrder) => {
                const product = await Product.findOne(
                    { _id: productInOrder.productId },
                    { __v: 0, createdAt: 0, updatedAt: 0, ratings: 0, vendorId: 0, rating: 0, quantity: 0 });
                return { product, quantity: productInOrder.quantity };
            }));
            return { ...order.toObject(), products };
        }));
        
        logger.info(`Orders fetched for user ${req.user.user_id}`);
        res.status(200).json({success: true, orders: ordersWithProducts});
    }
    catch(error){
        logger.error(`Error while fetching orders: ${error.message}`);
        next(error);
    }
}