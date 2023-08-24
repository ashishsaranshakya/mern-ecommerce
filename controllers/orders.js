import Order from '../models/Order.js';
import Product from "../models/Product.js";
import User from "../models/User.js";
import { razorpayInstance } from "../index.js";
import crypto from "crypto";
import { Types } from 'mongoose';
import _ from 'lodash';

export const checkoutProduct = async (req, res) => {
    const { user_id } = req.user;
    const { product_id } = req.body;
    
    const product = await Product.findById(product_id);
    const options = {
      amount: Number(product.cost * 100),
      currency: "INR",
    };
    const order = await razorpayInstance.orders.create(options);
    console.log(order);
    const newOrder = new Order({
        userId: user_id,
        productIds: [product_id],
        paymentId: order.id,
        paymentStatus: 'Pending',
        totalCost: product.cost
    });

    const prevOrder = await Order.findOne({ userId: user_id, productIds: [product_id], paymentStatus: 'Pending' });
    if(!!prevOrder){
        prevOrder.paymentId = order.id;
        await prevOrder.save();
    }
    else{
        await newOrder.save();
    }
  
    res.status(200).json({
      success: true,
      order
    });
};

export const checkoutCart = async (req, res) => {
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    
    const productIds = user.cart.map(productId => new Types.ObjectId(productId));
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
    console.log(order);

    const newOrder =  new Order({
        userId: user_id,
        productIds: user.cart,
        paymentId: order.id,
        paymentStatus: 'Pending',
        totalCost: totalAmount
    });

    const prevOrders = await Order.find({ userId: user_id, paymentStatus: 'Pending' });
    let prevOrder = null;
    prevOrders.forEach(order => {
        if(!prevOrder && _.isEmpty(_.xor(order.productIds, user.cart))){
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

    res.status(200).json({
        success: true,
        order
    });
};

export const paymentVerification = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        const order = await Order.findOne({ paymentId: razorpay_order_id });

        order.paymentStatus = "Confirmed";
        await order.save();

        res.redirect(
        `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
        );
    } else {
        res.status(400).json({
        success: false,
        });
    }
};

export const getOrder = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id);
        if(order.userId !== req.user.user_id){
            throw new Error("Unauthorized");
        }
        res.status(200).json(order);
    }
    catch(error){
        res.status(404).json({error: error.message});
    }
}

export const getUserOrders = async (req, res) => {
    try{
        const orders = await Order.find({userId: req.user.user_id});
        res.status(200).json(orders);
    }
    catch(error){
        res.status(404).json({error: error.message});
    }
}