import mongoose from 'mongoose';
import { User } from './userTypes';

const { Schema, model } = mongoose;

const userSchema = new Schema<User>({
    name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    
  },
  password: {
    type: String,
    required: true,
  }
  
},{timestamps:true});



const UserModel = mongoose.model('User', userSchema);

export default UserModel;
