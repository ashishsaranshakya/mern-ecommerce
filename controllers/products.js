import Product from '../models/Product.js';
import Order from '../models/Order.js';
import logger from '../utils/logger.js';
import { createAPIError } from '../utils/APIError.js';

export const getProducts = async (req, res, next) => {
    try {
        let userId = null;
        if(req.user){
            userId = req.user.user_id;
        }
        const { page = 1, limit = 10, query: searchTerm = null, sort = "desc" } = req.query;
        
        let query = {};
        if(searchTerm){
            query = { name: { $regex: searchTerm, $options: 'i' } };
        }
        const products = await Product.paginate(
            query,
            { 
                page,
                limit,
                sort: { cost: sort === 'asc' ? 1 : -1 }
            }
        );

        const simplifiedProducts = products.docs.map(product => {
            let userRating = null;
            if (userId) {
                const userRatingObj = product.ratings.find(rating => rating.userId === userId);
                if (userRatingObj) {
                    userRating = userRatingObj.value;
                }
            }

            return {
                _id: product._id,
                name: product.name,
                description: product.description,
                cost: product.cost,
                imageUrl: product.imageUrl,
                rating: product.rating,
                userRating: userRating
            };
        });

        if(searchTerm) logger.info(`Products searched successfully for: ${searchTerm}`);
        else logger.info(`All products fetched successfully`);

        res.status(200).json({success: true, products: simplifiedProducts});
    }
    catch (error) {
        logger.error(`Error while getting all products: ${error.message}`);
        next(error)
    }
};

export const getProduct = async (req, res, next) => {
    try {
        let userId = null;
        if(req.user){
            userId = req.user.user_id;
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(createAPIError(404, true, `Product ${req.params.id} not found`));
        }
        
        let userRating = null;
        if (userId) {
            const userRatingObj = product.ratings.find(rating => rating.userId.toString() === userId);
            if (userRatingObj) {
                userRating = userRatingObj.value;
            }
        }
        
        const simplifiedProduct = {
            _id: product._id,
            name: product.name,
            description: product.description,
            cost: product.cost,
            imageUrl: product.imageUrl,
            rating: product.rating,
            userRating: userRating
        };
        
        logger.info(`Product ${req.params.id} fetched successfully`);
        res.status(200).json({success: true, product: simplifiedProduct});
    }
    catch (error) {
        logger.error(`Error while getting product ${req.params.id}: ${error.message}`);
        next(error);
    }
};

export const rateProduct = async (req, res, next) => {
    try {
        const { rating } = req.body;
        const userId = req.user.user_id;
        const productId = req.params.id;
        
        const orders = await Order.find({userId: userId});
        let hasUserOrdered = false;
        orders.forEach(order => {
            if (order.productIds.includes(productId)) {
                hasUserOrdered = true;
            }
        });
        if(!hasUserOrdered) {
            return next(createAPIError(404, true, 'User has not ordered this product yet.'));
        }

        const product = await Product.findById(productId);
        const existingRatingIndex = product.ratings.findIndex((rating) => rating.userId === userId);
        
        if (existingRatingIndex !== -1) {
            product.ratings[existingRatingIndex].value = rating;
        } else {
            product.ratings.push({ userId: userId, value: rating });
        }
        
        const totalRatings = product.ratings.reduce((sum, rating) => sum + rating.value, 0);
        product.rating = totalRatings / product.ratings.length;
        
        await product.save();
        logger.info(`Product ${req.params.id} rated successfully by user ${userId}`);
        res.status(200).json({success: true, message: "Rating updated successfully"});
    }
    catch (error) {
        logger.error(`Error while rating product ${req.params.id}: ${error.message}`);
        next(error);
    }
}