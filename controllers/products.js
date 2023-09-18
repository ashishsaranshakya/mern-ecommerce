import Product from '../models/Product.js';
import Order from '../models/Order.js';
import logger from '../services/logger.js';
import { createAPIError } from '../utils/APIError.js';

export const getProducts = async (req, res, next) => {
    try {
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
                sort: { cost: sort === 'asc' ? 1 : -1 },
                select: { 
                    description: 0, 
                    ratings: 0, 
                    updatedAt: 0, 
                    createdAt: 0,
                    __v: 0,
                    vendorId: 0
                }
            }
        );

        if(searchTerm) logger.info(`Products searched successfully for: ${searchTerm}`);
        else logger.info(`All products fetched successfully`);

        res.status(200).json({success: true, products: products.docs});
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
        const product = await Product.findById(req.params.id, {
            updatedAt: 0,
            createdAt: 0,
            __v: 0,
            vendorId: 0

        });
        if (!product) {
            return next(createAPIError(404, true, `Product ${req.params.id} not found`));
        }
        
        let userRating = null;
        if (userId) {
            const userRatingObj = product.ratings.find(rating => rating.userId === userId);
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
            userRating
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
        
        const orders = await Order.find({ userId: userId, paymentStatus: 'Confirmed' });
        let hasUserOrdered = false;
        orders.forEach(order => {
            order.products.forEach(product => {
                if(product.productId === productId){
                    hasUserOrdered = true;
                }
            })
        });
        if(!hasUserOrdered) {
            logger.error(`User ${userId} has not ordered product ${productId} yet.`);
            return next(createAPIError(400, true, 'User has not ordered this product yet.'));
        }

        const product = await Product.findById(productId);
        const existingRatingIndex = product.ratings.findIndex((rating) => rating.userId === userId);
        
        let totalRatings = product.rating * product.ratings.length;

        const updateQuery = {};
        if (existingRatingIndex !== -1) {
            totalRatings = totalRatings - product.ratings[existingRatingIndex].value + Number(rating);
            updateQuery.$set = { 
                [`ratings.${existingRatingIndex}.value`]: Number(rating) ,
                rating: totalRatings / product.ratings.length
            };
        } else {
            totalRatings = totalRatings + Number(rating);
            updateQuery.$push = { ratings: { userId: userId, value: Number(rating) } };
            updateQuery.$set = { rating: totalRatings / (product.ratings.length + 1) };
        }
        
        await Product.updateOne(
            { _id: productId },
            updateQuery
        );
        logger.info(`Product ${req.params.id} rated successfully by user ${userId}`);
        res.status(200).json({success: true, message: "Rating updated successfully"});
    }
    catch (error) {
        logger.error(`Error while rating product ${req.params.id}: ${error.message}`);
        next(error);
    }
}