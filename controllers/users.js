import User from "../models/User.js";

export const patchCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.user_id; 
    try {
        const user = await User.findById(userId);
        
        const existingIndex = user.cart.findIndex((id) => id === productId);
        
        if (existingIndex !== -1) {
            user.cart.splice(existingIndex, 1);
        } else {
            user.cart.push(productId);
        }
        
        await user.save();
        res.status(200).json(user.cart);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};