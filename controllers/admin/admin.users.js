import User from '../../models/User.js';
import { adminLogger } from '../../services/logger.js';
import { createAPIError } from '../../utils/APIError.js';

export const getUsers = async (req, res, next) => {
    try {
        const query = {};
        if (req.admin.role === 'Dispatcher') {
            query.cart = 0;
            query.email = 0;
            query.occupation = 0;
            query.createdAt = 0;
            query.updatedAt = 0;
        }
        const users = await User.find({}, { ...query, password: 0, __v: 0 });
        adminLogger.info(`Users fetched`);
        res.status(200).json({
            success: true,
            users
        });
    }
    catch(error){
        adminLogger.error(`Error while fetching users: ${error.message}`);
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const query = {};
        if (req.admin.role === 'Dispatcher') {
            query.cart = 0;
            query.email = 0;
            query.occupation = 0;
            query.createdAt = 0;
            query.updatedAt = 0;
        }
        const user = await User.findById(req.params.id, { ...query, password: 0, __v: 0 });
        if(!user){
            adminLogger.error(`User ${req.params.id} not found`);
            return next(createAPIError(404, true, "User not found"));
        }
        adminLogger.info(`User ${req.params.id} fetched`);
        res.status(200).json({
            success: true,
            user
        });
    }
    catch(error){
        adminLogger.error(`Error while fetching user ${req.params.id}: ${error.message}`);
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.query.id);
        if(!user){
            adminLogger.error(`User ${req.params.id} not found`);
            return next(createAPIError(404, true, "User not found"));
        }
        adminLogger.info(`User ${req.params.id} deleted`);
        res.status(200).json({
            success: true,
            message: "User deleted"
        });
    }
    catch(error){
        adminLogger.error(`Error while deleting user ${req.params.id}: ${error.message}`);
        next(error);
    }
}