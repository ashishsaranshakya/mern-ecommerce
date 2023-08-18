import Product from '../models/Product.js';

/* READ */
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}

export const getProduct = async (req, res) => {
    try {
        const products = await Product.findOne({_id: req.params.id});
        res.status(200).json(products);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}