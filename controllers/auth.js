import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { createAPIError } from '../utils/APIError.js';

/* CREATE TOKEN */
export const createToken = (_id) =>{
    return jwt.sign(
        {
            user_id:_id
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d",
        }
    )
}

/* REGISTER */
export const register = async (req, res, next) => {
    try{
        const {firstName,lastName,email,password,location,occupation} = req.body;

        const errors=validationResult(req);
        if(!errors.isEmpty()){
            logger.error(`Error while registering user: ${errors.array()}`);
            return next(createAPIError(400, false, "", errors.array()));
        }

        const user=await User.findOne({email});
        if(!!user){
            logger.error(`User already exists for email ${email}`);
            return next(createAPIError(400, false, 'User already exists'));
        }

        const salt= await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            location,
            occupation
        });
        await newUser.save();
        logger.info(`User ${email} registered successfully`);
        res.status(201).json({success: true, message: 'User created successfully'});
    }
    catch(err){
        logger.error(`Error while registering user: ${err.message}`);
        next(err);
    }
}

/* LOGIN */
export const login = async (req, res, next) => {
    try{
        const {email, password} = req.body;

        const errors=validationResult(req);
        if(!errors.isEmpty()){
            logger.error(`Error while registering user: ${errors.array()}`);
            return next(createAPIError(400, false, "", errors.array()));
        }
        
        const user=await User.findOne({email});
        if(!user) {
            logger.error(`User not found for email ${email}`);
            return next(createAPIError(400, false, "User not found"));
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            logger.error(`Invalid credentials for user ${email}`);
            return next(createAPIError(400, false, "Invalid credentials"));
        }

        const token = createToken(user.id);

        user.token=token;
        user.password=undefined;
        
        const options={
            expires: new Date(Date.now()+(7*24*3600*1000)),
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        };
        
        logger.info(`User ${email} logged in successfully`);
        res.status(200).cookie('token',token,options).json({success: true, user: user});
    }
    catch(err){
        logger.error(`Error while logging in user: ${err.message}`);
        next(err);
    }
}

/* LOGOUT */
export const logout = async (req, res, next) => {
    try{
        logger.info(`User ${req.user.email} logged out successfully`);
        res.status(200).clearCookie('token').json({success: true});
    }
    catch(err){
        logger.error(`Error while logging out user: ${err.message}`);
        next(err);
    }
}