import jwt from 'jsonwebtoken';
import logger from '../services/logger.js';
import { createToken } from '../controllers/auth.js';
import { createAPIError } from '../utils/APIError.js';


export const verifyToken = (req, res, next) => {
    try{
        const token = req.signedCookies.token;
        if (!token) {
            logger.error('Error while verifying token: No token provided')
            return next(createAPIError(401, false, 'Unauthorized'));
        }

        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { ignoreExpiration: false }
        );
        req.user = verified;
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if((verified.exp-currentTimestamp)/(60*60*24)<1){
            updateToken(req, res, verified);
        }

        logger.info(`User ${verified.user_id} authenticated`);
        next();
    }
    catch(err){
        logger.error(err.message);
        next(err);
    }
};

export const verifyTokenForRating = (req, res, next) => {
    try{
        const token = req.signedCookies.token;
        
        const verified=jwt.verify(
            token,
            process.env.JWT_SECRET,
            { ignoreExpiration: false }
        );
        
        req.user=verified;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        if((verified.exp-currentTimestamp)/(60*60*24)<1){
            updateToken(req, res, verified);
        }
        next();
    }
    catch(err){
        next();
    }
    
};

const updateToken = (req, res, verified) => {
    const token = createToken(verified.user_id);

    verified.token=token
    verified.password=undefined

    const options={
        expires: new Date(Date.now()+(7*24*3600*1000)),
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        signed: true
    };
    
    logger.info(`Token updated for user ${verified.user_id}`);
    res.cookie('token',token,options);
}