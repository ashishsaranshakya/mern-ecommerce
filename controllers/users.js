import User from "../models/User.js";

export const addToCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.user_id; 

    try {
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
        res.status(200).json(updatedUser.cart);
        
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteFromCart = async (req, res) => {
    const { productId, single } = req.body;
    const userId = req.user.user_id; 

    try {
        const user = await User.findById(userId);
        const existingIndex = user.cart.findIndex(item => item.productId === productId);
        const updateQuery = {};

        if (existingIndex !== -1) {
            if (single && user.cart[existingIndex].quantity > 1) {
                updateQuery.$inc = { [`cart.${existingIndex}.quantity`]: -1 };
            } else {
                updateQuery.$pull = { cart: { productId } };
            }

            await User.updateOne(
                { _id: userId },
                updateQuery
            );

            const updatedUser = await User.findById(userId);
            res.status(200).json(updatedUser.cart);
        } else {
            res.status(404).json({ error: "Product not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};