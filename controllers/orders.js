import Order from '../models/Order.js';
import User from "../models/User.js";

/* CREATE */


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
