import Product from '../../models/Product.js';
import { adminLogger } from '../../services/logger.js';
import { createAPIError } from '../../utils/APIError.js';

export const createProduct = async (req, res, next) => {
    try {
        const { name, description, cost, imageUrl, quantity } = req.body;
        const { admin_id: id } = req.admin;

        const product = new Product({
            name,
            description,
            cost,
            imageUrl,
            quantity,
            vendorId: id
        });
        const savedProduct = await product.save();

        adminLogger.info(`Product ${savedProduct._id} created successfully`);
        res.status(201).json({success: true, message: 'Product created successfully'});
    }
    catch (error) {
        adminLogger.error(`Error while creating product: ${error.message}`);
        next(error);
    }
}

export const deleteProduct = async (req, res, next) => {
    try {
        const { id: productId } = req.query;
        const { admin_id } = req.admin;

        if(!productId){
            adminLogger.error('Error while deleting product: No productId provided');
            return next(createAPIError(400, false, 'Bad Request'));
        }

        const query = { _id: productId };
        if (req.admin.role === 'Vendor') query.vendorId = admin_id;
        const product = await Product.deleteOne(query);

        if (!product.deletedCount) {
            adminLogger.error(`Error while deleting product: Product ${productId} not found`);
            return next(createAPIError(404, false, 'Product not found'));
        }

        adminLogger.info(`Product ${productId} deleted successfully for admin ${admin_id}`);
        res.status(200).json({success: true, message: 'Product deleted successfully'});
    }
    catch (error) {
        adminLogger.error(`Error while deleting product: ${error.message}`);
        next(error);
    }
}

export const updateProduct = async (req, res, next) => {
    try {
        const { id, name, description, cost, quantity, imageUrl } = req.body
        if(!id){
            adminLogger.error('Error while updating product: No productId provided');
            return next(createAPIError(400, false, 'Bad Request'));
        }
        const { admin_id: vendorId } = req.admin;
        const query = { _id: id };
        if (req.admin.role === 'Vendor') query.vendorId = vendorId;
        const product = await Product.findOne(query);
        if (!product) {
            adminLogger.error(`Error while updating product: Product ${id} not found`);
            return next(createAPIError(404, false, 'Product not found'));
        }

        const updateQuery = {};
        if (name) updateQuery.name = name;
        if (description) updateQuery.description = description;
        if (cost) updateQuery.cost = cost;
        if (quantity) updateQuery.quantity = quantity;
        if (imageUrl) updateQuery.imageUrl = imageUrl;
        await Product.updateOne(query, updateQuery);

        adminLogger.info(`Product ${id} updated successfully for admin ${vendorId}`);
        res.status(200).json({success: true, message: 'Product updated successfully'});
    }
    catch (error) {
        adminLogger.error(`Error while updating product: ${error.message}`);
        next(error);
    }
}

export const getProducts = async (req, res, next) => {
    try {
        const { admin_id: id } = req.admin;
        const query = {};
        const selectQuery = {};
        if (req.admin.role === 'Vendor') query.vendorId = id;
        if (req.admin.role === 'Dispatcher') {
            selectQuery.rating = 0;
            selectQuery.vendorId = 0;
            selectQuery.createdAt = 0;
            selectQuery.updatedAt = 0;
        }
        const products = await Product.find(query, { ...selectQuery, __v: 0, ratings: 0 });

        adminLogger.info(`Products fetched successfully for admin ${id}`);
        res.status(200).json({success: true, products});
    }
    catch (error) {
        adminLogger.error(`Error while fetching products: ${error.message}`);
        next(error);
    }
}

export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { admin_id: vendorId } = req.admin;
        
        const query = { _id: id };
        const selectQuery = {};
        if (req.admin.role === 'Vendor') query.vendorId = vendorId;
        if (req.admin.role === 'Dispatcher') {
            selectQuery.rating = 0;
            selectQuery.vendorId = 0;
            selectQuery.createdAt = 0;
            selectQuery.updatedAt = 0;
        }
        
        const product = await Product.findOne(query, { ...selectQuery, __v: 0, ratings: 0 });
        if(!product){
            adminLogger.error(`Error while fetching product: Product ${id} not found`);
            return next(createAPIError(404, false, 'Product not found'));
        }
        
        adminLogger.info(`Product ${id} fetched successfully for admin ${vendorId}`);
        res.status(200).json({success: true, product});
    }
    catch (error) {
        adminLogger.error(`Error while fetching product: ${error.message}`);
        next(error);
    }
}