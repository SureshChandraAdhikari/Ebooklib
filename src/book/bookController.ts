import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import BookModel from "./bookModel";
import fs from "node:fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  console.log("files", req.files);

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageFile = files.coverImage[0];
    const bookFile = files.file[0];

    const coverImageMimeType = coverImageFile.mimetype.split('/').pop();
    const coverImageFilename = coverImageFile.filename;
    const coverImagePath = path.resolve(__dirname, "../../public/data/uploads", coverImageFilename);

    const bookFileMimeType = bookFile.mimetype.split('/').pop();
    const bookFileFilename = bookFile.filename;
    const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileFilename);

    const uploadResult = await cloudinary.uploader.upload(coverImagePath, {
      filename_override: coverImageFilename,
      folder: 'book-covers',
      format: coverImageMimeType,
    });

    const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: 'raw',
      filename_override: bookFileFilename,
      folder: "book-pdfs",
      format: "pdf",
    });

    console.log("bookFileUploadResult", bookFileUploadResult);
    console.log("uploadResult", uploadResult);

    const newBook = await BookModel.create({
      title,
      genre,
      author: "6658bd64d196799209d7451f",
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    console.log(newBook);

    // Attempt to remove the uploaded files from local storage
    try {
      await fs.promises.unlink(coverImagePath);
    } catch (unlinkError) {
      console.error(`Failed to unlink file at ${coverImagePath}:`, unlinkError);
    }

    try {
      await fs.promises.unlink(bookFilePath);
    } catch (unlinkError) {
      console.error(`Failed to unlink file at ${bookFilePath}:`, unlinkError);
    }

    res.status(201).json({ id: newBook._id });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error in file uploading"));
  }
};

export default createBook;


