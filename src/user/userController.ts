import { NextFunction, Response ,Request } from "express";
import createHttpError from "http-errors";
import UserModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";
import { access } from "fs";

const createUser = async (req : Request,res : Response,next:NextFunction) => {
const { name , email, password} = req.body;

if(!name || !email || !password) {
    const error = createHttpError(400, "All fields are require");
    return next(error);
    
}
try {
    const user = await UserModel.findOne({email: email});

if(user) {
    const error = createHttpError(400,"User Already Exist");
    return next(error);
}
} catch (error) {
    return next(createHttpError(500,"Error while getting user"))
}

let newUser: User;

try {

const hashedPassword = await bcrypt.hash(password, 10);
newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
})
} catch (error) {
    return next (createHttpError(500,"Error while creating user"))
}


try {
    const token = sign({sub: newUser._id}, config.jwtSecret as string,{expiresIn:"7d"});
    res.status(201).json({accessToken: token})
}
catch (error) {
    return next(createHttpError(500,  "Error while signing the jwt token"))
}

}


const loginUser = async (req: Request, res: Response,next: NextFunction) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return next(createHttpError(400,"All fields are required"))
    }

const user = await UserModel.findOne({email})
    try {
        
        if(!user) {
    return next(createHttpError(404,"User not found"))
}
        
    } catch (error) {
    return next(createHttpError(404,"User not found"))
    }
try {
     const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch) {
        return next(createHttpError(400,"Username or password is incorrect!"))
    }

        const token = sign({sub: user._id}, config.jwtSecret as string,{expiresIn:"7d"});
        res.json({access_token: token})
} catch (error) {
    return next(createHttpError(400,"Error while Logging in user"))
}

}

export {createUser,loginUser }