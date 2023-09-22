import Order from '../../models/Order.js';
import { adminLogger } from '../../services/logger.js';
import { createAPIError } from '../../utils/APIError.js';
import Product from '../../models/Product.js';

export const getOrders = async (req, res, next) => {
    try {
        const query = {};
        if (req.admin.role === 'Dispatcher') {
            query.deliveryStatus = 'Pending';
            query.paymentStatus = 'Confirmed';
        }
        const orders = await Order.find(query, { __v: 0 });
        if (!orders) {
            adminLogger.error(`Error while fetching orders: No orders found`);
            return next(createAPIError(404, false, 'No orders found'));
        }

        const ordersWithProducts = await Promise.all(orders.map(async (order) => {
            const products = await Promise.all(order.products.map(async (productInOrder) => {
                const product = await Product.findOne(
                    { _id: productInOrder.productId },
                    { __v: 0, createdAt: 0, updatedAt: 0, ratings: 0, vendorId: 0, rating: 0, quantity: 0, imageUrl: 0 });
                return { product, quantity: productInOrder.quantity };
            }));
            return { ...order.toObject(), products };
        }));

        adminLogger.info(`Orders fetched`);
        res.status(200).json({
            success: true,
            orders: ordersWithProducts
        });
    }
    catch(error){
        adminLogger.error(`Error while fetching orders: ${error.message}`);
        next(error);
    }
}

export const getOrder = async (req, res, next) => {
    try {
        const query = {};
        if (req.admin.role === 'Dispatcher') {
            query.deliveryStatus = 'Pending';
            query.paymentStatus = 'Confirmed';
        }
        const order = await Order.findOne({ ...query, _id: req.params.id }, { __v: 0 });
        if(!order){
            adminLogger.error(`Error while fetching order: Order ${req.params.id} not found`);
            return next(createAPIError(404, false, 'Order not found'));
        }

        const products = await Promise.all(order.products.map(async (productInOrder) => {
            const product = await Product.findOne(
                { _id: productInOrder.productId },
                { __v: 0, createdAt: 0, updatedAt: 0, ratings: 0, vendorId: 0, rating: 0, quantity: 0, imageUrl: 0 });
            return { product, quantity: productInOrder.quantity };
        }));
        order.products = products;

        adminLogger.info(`Order ${req.params.id} fetched`);
        res.status(200).json({
            success: true,
            order
        });
    }
    catch(error){
        adminLogger.error(`Error while fetching order: ${error.message}`);
        next(error);
    }
}

export const updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.body.order_id);
        if(!order){
            adminLogger.error(`Error while updating order: Order ${req.body.order_id} not found`);
            return next(createAPIError(404, false, 'Order not found'));
        }
        if (order.paymentStatus === 'Pending') {
            adminLogger.error(`Error while updating order: Order ${req.body.order_id} has pending payment`);
            return next(createAPIError(400, false, 'Order has pending payment'));
        }

        if(req.body.status !== 'Delivered'){
            adminLogger.error(`Error while updating order: Invalid status ${req.body.status}`);
            return next(createAPIError(400, false, 'Invalid status'));
        }
        order.deliveryStatus = req.body.status;
        await order.save();

        adminLogger.info(`Order ${req.body.order_id} updated`);
        res.status(200).json({
            success: true,
            message: 'Order updated successfully'
        });
    }
    catch (error) {
        adminLogger.error(`Error while updating order: ${error.message}`);
        next(error);
    }
}

export const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.query.id);
        if(!order){
            adminLogger.error(`Error while deleting order: Order ${req.body.order_id} not found`);
            return next(createAPIError(404, false, 'Order not found'));
        }
        await order.deleteOne({ _id: req.query.id});

        adminLogger.info(`Order ${req.body.order_id} deleted`);
        res.status(200).json({ success: true });
    }
    catch (error) {
        adminLogger.error(`Error while deleting order: ${error.message}`);
        next(error);
    }
}