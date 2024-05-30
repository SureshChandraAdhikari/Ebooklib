import { NextFunction, Response ,Request } from "express";
import createHttpError from "http-errors";
import UserModel from "./userModel";


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


  res.json({message:"User Created"})
}


export { createUser };