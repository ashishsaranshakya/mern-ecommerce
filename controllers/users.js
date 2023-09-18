import User from "../models/User.js";
import Product from "../models/Product.js";
import logger from '../services/logger.js';
import { createAPIError } from '../utils/APIError.js';

export const getCart = async (req, res, next) => {
    const userId = req.user.user_id;
    try {
        const user = await User.findById(userId);
        logger.info(`Cart of user ${userId} fetched successfully`);
        
        return res.status(200).json({
            success: true,
            cart: user.cart
        });
    }
    catch (error) {
        logger.error(`Error fetching cart of user ${userId}: error.message`);
        next(error);
    }
}

export const getProfile = async (req, res, next) => {
    const userId = req.user.user_id;
    try {
        const user = await User.findById(userId, { updatedAt: 0, createdAt: 0, __v: 0 });
        user.password=undefined;
        logger.info(`Profile of user ${userId} fetched successfully`);
        return res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        logger.error(`Error fetching profile of user ${userId}: error.message`);
        next(error);
    }
}

export const addToCart = async (req, res, next) => {
    const { id: productId } = req.query;
    const userId = req.user.user_id; 
    try {
        const product = await Product.findById(productId);
        if(!product) return next(createAPIError(404, true, "Product not found"));

        const user = await User.findById(userId);
        const existingIndex = user.cart.findIndex(item => item.productId === productId);
        const updateQuery = {};

        if (existingIndex !== -1) {
            updateQuery.$inc = { [`cart.${existingIndex}.quantity`]: 1 };
        } else {
            updateQuery.$push = { cart: { productId, quantity: 1 } };
        }
        
        await User.updateOne(
            { _id: userId },
            updateQuery
        );

        const updatedUser = await User.findById(userId);
        logger.info(`Product ${productId} added to cart of user ${userId}`);
        res.status(200).json({success: true, cart: updatedUser.cart});    
    }
    catch (error) {
        logger.error(`Error while adding product ${productId} to cart of user ${userId}: ${error.message}`);
        next(error);
    }
};

export const deleteFromCart = async (req, res, next) => {
    const { id: productId, single = "true" } = req.query;
    const userId = req.user.user_id; 
    try {
        const user = await User.findById(userId);
        const existingIndex = user.cart.findIndex(item => item.productId === productId);
        const updateQuery = {};

        if (existingIndex !== -1) {
            if (single !== "false" && user.cart[existingIndex].quantity > 1) {
                updateQuery.$inc = { [`cart.${existingIndex}.quantity`]: -1 };
            } else {
                updateQuery.$pull = { cart: { productId } };
            }

            await User.updateOne(
                { _id: userId },
                updateQuery
            );

            const updatedUser = await User.findById(userId);
            logger.info(`Product ${productId} deleted from cart of user ${userId}`);
            res.status(200).json({success: true, cart: updatedUser.cart});
        } else {
            logger.error(`Product ${productId} not found in cart of user ${userId}`);
            return next(createAPIError(400, true, "Product not found in cart"));
        }
    }
    catch (error) {
        logger.error(`Error while deleting product ${productId} from cart of user ${userId}: ${error.message}`);
        next(error);
    }
};