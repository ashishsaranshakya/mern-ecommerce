import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

/* REGISTER */
export const validateRegister = [
    body("firstName", 'First name should be between 2 and 20 characters long.').isLength({
        min:2,
        max:20
    }),
    body("lastName", 'Last name should be between 2 and 20 characters long.').isLength({
        min:2,
        max:20
    }),
    body("email", 'Email is invalid.').isEmail(),
    body("password", 'Password should be at least 8 characters long.')
        .isLength({
            min:8
        })
        .custom((value, { req }) => {
            const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/;
            return passwordPattern.test(value);
        })
        .withMessage('Password must contain atleast one uppercase letter, one number and one special character'),
    body("location", 'Location should be less than 20 characters long.').isLength({
        max:20
    }),
    body("occupation", 'Occupation should be less than 20 characters long.').isLength({
        max:20
    })
];

export const register = async (req, res) => {
    try{
        const {firstName,lastName,email,password,location,occupation} = req.body;

        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array()
            })
        }

        const user=await User.findOne({email});
        if(!!user) return res.status(404).json({error: "User already exists"});

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
        res.status(201).json({message:'User created successfully'});
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
}

/* LOGIN */
export const login = async (req, res) => {
    try{
        const {email,password} = req.body;
        
        const user=await User.findOne({email});
        if(!user) return res.status(404).json({error: "User not found"});
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({error: "Invalid credentials"});

        const token=jwt.sign({
            user_id:user.id,email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d",
            }
        )

        user.token=token
        user.password=undefined
        
        const options={
            expires:new Date(Date.now()+(7*24*3600*1000)),
            httpOnly:true
        };
        
        res.status(200).cookie('token',token,options).send();
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
}

/* LOGOUT */
export const logout = async (req, res) => {
    try{
        res.status(200).clearCookie('token').send();
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
}