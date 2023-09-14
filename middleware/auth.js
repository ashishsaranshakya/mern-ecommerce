import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { createToken } from '../controllers/auth.js';
import { createAPIError } from '../utils/APIError.js';


export const verifyToken = (req, res, next) => {
    try{
        let token=req.header("Cookie");
        if(!token || !token.startsWith("token=")) return next(createAPIError(401, false, 'Unauthorized'));

        token=token.slice(6,token.length).trimLeft();
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
        let token=req.header("Cookie");
        
        if(token.startsWith("token=")){
            token=token.slice(6,token.length).trimLeft();
        } 
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
        expires:new Date(Date.now()+(7*24*3600*1000)),
        httpOnly:true,
        sameSite: 'strict',
        secure: true,
    };
    
    logger.info(`Token updated for user ${verified.user_id}`);
    res.cookie('token',token,options);
}