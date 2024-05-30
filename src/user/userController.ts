import { NextFunction, Response ,Request } from "express";
import createHttpError from "http-errors";
import UserModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = async (req : Request,res : Response,next:NextFunction) => {
const { name , email, password} = req.body;

if(!name || !email || !password) {
    const error = createHttpError(400, "All fields are require");
    return next(error);
    
}
const user = await UserModel.findOne({email: email});

if(user) {
    const error = createHttpError(400,"User Already Exist");
    return next(error);
}

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
})

const token = sign({sub: newUser._id}, config.jwtSecret as string,{expiresIn:"7d"});


res.json({accessToken: token})
}


export { createUser };