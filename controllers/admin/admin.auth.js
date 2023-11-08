import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import Admin from '../../models/Admin.js';
import Product from '../../models/Product.js'
import { adminLogger } from '../../services/logger.js';
import { createAPIError } from '../../utils/APIError.js';

/* CREATE TOKEN */
export const createToken = (_id, role) =>{
    return jwt.sign(
        {
            admin_id: _id,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d",
            algorithm: 'HS512'
        }
    )
}

/* REGISTER */
export const register = async (req, res, next) => {
    try{
        const { name, email, password, role } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            adminLogger.error(`Error while registering user: ${errors.array()}`);
            return next(createAPIError(400, false, "", errors.array()));
        }

        const admin = await Admin.findOne({ email });
        if (admin) {
            adminLogger.error(`Admin already exists for email ${email}`);
            return next(createAPIError(400, false, 'Admin already exists'));
        }
        if (role === 'Admin' && req.admin.role !== 'Super-admin') {
            adminLogger.error(`Admin ${req.admin.admin_id} not permitted to create admin`);
            return next(createAPIError(403, false, 'Forbidden'));
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword,
            role
        });
        await newAdmin.save();
        adminLogger.info(`Admin ${email} registered successfully`);
        res.status(201).json({success: true, message: 'Admin created successfully'});
    }
    catch(err){
        adminLogger.error(`Error while registering admin: ${err.message}`);
        next(err);
    }
}

/* DELETE */
export const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.query;
        const { role } = req.admin;
        const admin = await Admin.findOne({ _id: id });
        if (!admin) {
            adminLogger.error(`Admin does ${id} does not exist`);
            return next(createAPIError(400, false, 'Bad Request'));
        }
        if (admin.role === 'Admin' && role !== 'Super-admin') {
            adminLogger.error(`Admin ${req.admin.admin_id} not permitted to delete admin`);
            return next(createAPIError(403, false, 'Forbidden'));
        }
        if (admin.role === 'Super-admin') {
            adminLogger.error(`Super-admin cannot be deleted`);
            return next(createAPIError(400, false, 'Bad Request'));
        }
        if (admin.role === 'Vendor') {
            await Product.deleteMany({ vendorId: id });
        }
        await Admin.deleteOne({ _id: id });
        adminLogger.info(`Admin ${admin.id} deleted successfully`);
        res.status(200).json({success: true, message: 'Admin deleted successfully'});
    }
    catch (err) {
        adminLogger.error(`Error while deleting in admin: ${err.message}`);
        next(err);
    }
}

/* LOGIN */
export const login = async (req, res, next) => {
    try{
        const {email, password} = req.body;

        const errors=validationResult(req);
        if(!errors.isEmpty()){
            adminLogger.error(`Error while registering user: ${errors.array()}`);
            return next(createAPIError(400, false, "", errors.array()));
        }
        
        const admin = await Admin.findOne({ email }, { createdAt: 0, updatedAt: 0, __v: 0 });
        if(!admin) {
            adminLogger.error(`User not found for email ${email}`);
            return next(createAPIError(400, false, "Admin not found"));
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch){
            adminLogger.error(`Invalid credentials for admin ${email}`);
            return next(createAPIError(400, false, "Invalid credentials"));
        }

        const token = createToken(admin.id, admin.role);

        admin.token = token;
        admin.password = undefined;
        
        const options={
            expires: new Date(Date.now()+(7*24*3600*1000)),
            httpOnly: true,
            sameSite: 'Strict',
            secure: true,
            signed: true
        };
        
        adminLogger.info(`Admin ${email} logged in successfully`);
        res.status(200).cookie('token',token,options).json({success: true, admin: admin});
    }
    catch(err){
        adminLogger.error(`Error while logging in admin: ${err.message}`);
        next(err);
    }
}

/* LOGOUT */
export const logout = async (req, res, next) => {
    try{
        adminLogger.info(`User ${req.admin.admin_id} logged out successfully`);
        res.status(200).clearCookie('token').json({success: true});
    }
    catch(err){
        adminLogger.error(`Error while logging out user: ${err.message}`);
        next(err);
    }
}