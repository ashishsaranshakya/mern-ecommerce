import Order from '../models/Order.js';
import Product from "../models/Product.js";
import User from "../models/User.js";
import { razorpayInstance } from "../index.js";
import crypto from "crypto";
import { Types } from 'mongoose';
import _ from 'lodash';
import logger from '../logger.js';

export const checkoutProduct = async (req, res) => {
    try{
        const { user_id } = req.user;
        const { id: product_id, quantity = 1 } = req.query;
        
        const product = await Product.findById(product_id);
        if(!product) return res.status(400).json({ error: "Product not found" });

        const options = {
            amount: Number(product.cost * quantity * 100),
            currency: "INR",
        };
        const order = await razorpayInstance.orders.create(options);
    
        const newOrder = new Order({
            userId: user_id,
            products: [{productId: product_id, quantity}],
            paymentId: order.id,
            paymentStatus: 'Pending',
            totalCost: product.cost * quantity
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
        res.status(500).json({error: error.message});
    }
};

export const checkoutCart = async (req, res) => {
    try{
        const { user_id } = req.user;
        const user = await User.findById(user_id);

        if(user.cart.length === 0){
            logger.error(`User ${user_id} has no products in cart`);
            return res.status(400).json({error: "Cart is empty"});
        }
        
        const productIds = user.cart.map(product => new Types.ObjectId(product.productId));
        const products = await Product.find({ _id: { $in: productIds } });

        let totalAmount = 0;
        products.forEach(product => {
            totalAmount += product.cost;
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
            totalCost: totalAmount
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
        res.status(500).json({error: error.message});
    }
};

export const paymentVerification = async (req, res) => {
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

            logger.info(`Payment verified for order ${order._id}`);
            res.redirect(
                `http://localhost:3000/paymentsuccess?reference=${order._id}`
            );
        }
        else {
            logger.error(`Payment verification failed for order ${order._id}`);
            res.redirect(
                `http://localhost:3000/paymentfailure?reference=${order._id}`
            );
        }
    }
    catch(error){
        logger.error(`Error while verifying payment: ${error.message}`);
        res.status(500).json({error: error.message});
    }
};

export const getOrder = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id);
        if(order.userId !== req.user.user_id){
            logger.error(`User ${req.user.user_id} not authorized to view order ${req.params.id}`);
            return res.status(403).json({error: "User not authorized to view this order"});
        }
        logger.info(`Order ${req.params.id} fetched for user ${req.user.user_id}`);
        res.status(200).json(order);
    }
    catch(error){
        logger.error(`Error while fetching order ${req.params.id}: ${error.message}`);
        res.status(404).json({error: error.message});
    }
}

export const getUserOrders = async (req, res) => {
    try{
        const { page = 1, limit = 10, sort = "desc" } = req.query;

        const orders = await Order.paginate(
            { userId: req.user.user_id },
            {
                page,
                limit,
                sort: { updatedAt: sort === 'asc' ? 1 : -1 }
            });
        
        logger.info(`Orders fetched for user ${req.user.user_id}`);
        res.status(200).json(orders.docs);
    }
    catch(error){
        logger.error(`Error while fetching orders: ${error.message}`);
        res.status(404).json({error: error.message});
    }
}