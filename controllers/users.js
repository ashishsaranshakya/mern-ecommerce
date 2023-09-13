import User from "../models/User.js";
import Product from "../models/Product.js";
import logger from '../logger.js';

export const addToCart = async (req, res) => {
    const { id: productId } = req.query;
    const userId = req.user.user_id; 
    try {
        const product = await Product.findById(productId);
        if(!product) return res.status(400).json({ error: "Product not found" });

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
        res.status(200).json(updatedUser.cart);
        
    }
    catch (error) {
        logger.error(`Error while adding product ${productId} to cart of user ${userId}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const deleteFromCart = async (req, res) => {
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
            res.status(200).json(updatedUser.cart);
        } else {
            logger.error(`Product ${productId} not found in cart of user ${userId}`);
            res.status(400).json({ error: "Product not found in cart" });
        }
    }
    catch (error) {
        logger.error(`Error while deleting product ${productId} from cart of user ${userId}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};