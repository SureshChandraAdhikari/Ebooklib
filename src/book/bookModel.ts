import mongoose, { Schema, Document } from 'mongoose';
import UserModel from '../user/userModel';

interface Book extends Document {
  title: string;
  author: mongoose.Types.ObjectId;
  coverImage: string;
  file: string;
  genre: string;
}

const bookSchema = new Schema<Book>({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.modelName, // Correctly reference the user model name
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const BookModel = mongoose.model<Book>('Book', bookSchema);

export default BookModel;

