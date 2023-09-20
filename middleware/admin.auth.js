import jwt from 'jsonwebtoken';
import { adminLogger } from '../services/logger.js';
import { createToken } from '../controllers/admin/admin.auth.js';
import { createAPIError } from '../utils/APIError.js';

export const verifyToken = (req, res, next) => {
    try{
        const token = req.signedCookies.token;
        if (!token) {
            adminLogger.error('Error while verifying token: No token provided')
            return next(createAPIError(401, false, 'Unauthorized'));
        }

        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { ignoreExpiration: false }
        );
        req.admin = verified;
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if((verified.exp-currentTimestamp)/(60*60*24)<1){
            updateToken(req, res, verified);
        }

        const isPermitted = checkPermission(verified, req.originalUrl, req.method);
        if (!isPermitted) {
            adminLogger.error(`Error while verifying token: Admin ${verified.admin_id} not permitted to access ${req.originalUrl}`);
            return next(createAPIError(403, false, 'Forbidden'));
        }

        adminLogger.info(`Admin ${verified.admin_id} authenticated`);
        next();
    }
    catch(err){
        adminLogger.error(err.message);
        next(err);
    }
};

const updateToken = (req, res, verified) => {
    const token = createToken(verified.admin_id);
    verified.token = token;

    const options={
        expires:new Date(Date.now()+(7*24*3600*1000)),
        httpOnly:true,
        sameSite: 'strict',
        secure: true,
        signed: true
    };
    
    adminLogger.info(`Token updated for admin ${verified.admin_id}`);
    res.cookie('token', token, options);
}

const checkPermission = (verified, url, method) => {
    const { role } = verified;
    const urlParts = url.split('/').slice(4);
    urlParts[urlParts.length - 1] = urlParts[urlParts.length - 1].split('?')[0];

    const openAccessRoutes = ['login', 'profile', 'logout'];
    const adminSpecificAccess = ['register', 'delete', 'list'];
    const productMethods = ['POST', 'DELETE', 'PUT', 'GET'];
    const userMethods = ['DELETE', 'GET'];
    const orderMethods = ['GET', 'PATCH'];

    // Super-admin has full access
    if (role === 'Super-admin') {
        return true;
    }

    // Open access
    if (openAccessRoutes.includes(urlParts[0])) {
        return true;
    }

    // Admin specific access
    if (role === 'Admin' && adminSpecificAccess.includes(urlParts[0])) {
        return true;
    }

    // Define a mapping of roles to their allowed paths and methods
    const rolePermissions = {
        Admin: {
            product: productMethods,
            user: userMethods,
            order: [...orderMethods, 'DELETE']
        },
        Vendor: {
            product: productMethods,
            user: [],
            order: []
        },
        Dispatcher: {
            product: ['GET'],
            user: ['GET'],
            order: orderMethods
        },
    };

    // Check if the role has permission to access the URL and method
    if (rolePermissions[role]) {
        for (const [path, allowedMethods] of Object.entries(rolePermissions[role])) {
            if (
                urlParts[0] === path &&
                allowedMethods.includes(method)) {
                return true;
            }
        }
    }

    return false;
};