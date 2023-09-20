import Admin from '../../models/Admin.js';
import { adminLogger } from '../../services/logger.js';

export const listAdmin = async (req, res, next) => {
    try {
        const { role } = req.admin;
        const query = {
            role: {}
        };
        if (role === 'Admin') {
            query.role.$in = ['Vendor', 'Dispatcher'];
        }
        else {
            query.role.$in = ['Admin', 'Vendor', 'Dispatcher'];
        }
        const admins = await Admin.find(query, { updatedAt: 0, createdAt: 0, __v: 0, password: 0 });

        adminLogger.info(`Admin list fetched successfully`);
        res.status(200).json({success: true, admins});
    }
    catch(err){
        adminLogger.error(`Error while fetching admin list: ${err.message}`);
        next(err);
    }
}

export const getProfile = async (req, res, next) => {
    try {
        const { admin_id: id } = req.admin;
        const admin = await Admin.findOne({ _id: id }, { updatedAt: 0, createdAt: 0, __v: 0, password: 0 });

        adminLogger.info(`Admin profile fetched successfully`);
        res.status(200).json({success: true, admin});
    }
    catch(err){
        adminLogger.error(`Error while fetching admin profile: ${err.message}`);
        next(err);
    }
}