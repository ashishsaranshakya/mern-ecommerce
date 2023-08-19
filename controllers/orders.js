import Order from '../models/Order.js';
import Product from "../models/Product.js";
import { razorpayInstance } from "../index.js";
import crypto from "crypto";

/* CREATE */
export const checkout = async (req, res) => {
    const { user_id } = req.user;
    const { product_id } = req.body;
    
    const product = await Product.findOne({ _id: product_id });
    const options = {
      amount: Number(product.cost * 100),
      currency: "INR",
    };
    const order = await razorpayInstance.orders.create(options);
    console.log(order);
    const newOrder = new Order({
        userId: user_id,
        productId: product_id,
        paymentId: order.id,
        paymentStatus: 'Pending'
    });

    const prevOrder = await Order.findOne({ userId: user_id, productId: product_id });
    if(!!prevOrder){
        prevOrder.paymentId = order.id;
        prevOrder.save();
    }
    else{
        newOrder.save();
    }
  
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
        order.save();

        res.redirect(
        `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
        );
    } else {
        res.status(400).json({
        success: false,
        });
    }
};

/* READ */
export const getOrder = async (req, res) => {
    try{
        const order = await Order.findOne({_id: req.params.id});
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

/* UPDATE */
