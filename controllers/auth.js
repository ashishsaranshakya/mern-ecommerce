import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* REGISTER */
export const register = async (req, res) => {
    try{
        const {firstName,lastName,email,password,location,occupation} = req.body;

        const user=await User.findOne({email});
        if(!!user) return res.status(404).json({error: "User already exists"});

        console.log({firstName,lastName,email,password,location,occupation});
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
        const savedUser = await newUser.save();
        delete savedUser.password;
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