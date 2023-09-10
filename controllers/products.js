import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getAllProducts = async (req, res) => {
    try {
        let userId = null;
        if(req.user){
            userId = req.user.user_id;
        }
        const { page = 1, limit = 10 } = req.query;
        const products = await Product.paginate({}, { page, limit });

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

        res.status(200).json(simplifiedProducts);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const getProduct = async (req, res) => {
    try {
        let userId = null;
        if(req.user){
            userId = req.user.user_id;
        }
        const product = await Product.findById(req.params.id);
        
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
        
        res.status(200).json(simplifiedProduct);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const {searchTerm} = req.body;
        let userId = null;
        if(req.user){
            userId = req.user.user_id;
        }

        const { page = 1, limit = 10 } = req.query;
        const products = await Product.paginate(
            { name: 
                { 
                    $regex: searchTerm, 
                    $options: 'i' 
                } 
            },
            { page, limit }
        );
        
        const simplifiedProducts = products.docs.map(product => {
            let userRating = null;
            if (userId) {
                const userRatingObj = product.ratings.find(rating => rating.userId.toString() === userId);
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

        res.status(200).json(simplifiedProducts);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}

export const rateProduct = async (req, res) => {
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
            throw new Error("User has not ordered this product yet.");
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
        res.status(200).json({message: "Rating updated successfully"});
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}