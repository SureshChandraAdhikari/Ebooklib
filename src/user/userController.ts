import { NextFunction, Response ,Request } from "express";
import createHttpError from "http-errors";
import UserModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

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
    res.json({accessToken: token})
}
catch (error) {
    return next(createHttpError(500,  "Error while signing the jwt token"))
}

}

export {createUser }