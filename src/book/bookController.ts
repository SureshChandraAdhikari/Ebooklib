import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import BookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";

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

    const _req = req as AuthRequest

    const newBook = await BookModel.create({
      title,
      genre,
      author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, genre } = req.body;
    const bookId = req.params.bookId;

    const book = await BookModel.findOne({ _id: bookId });

    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }
    // Check access
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You can not update others book."));
    }

    // check if image field is exists.

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = "";
    if (files.coverImage) {
        const filename = files.coverImage[0].filename;
        const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
        // send files to cloudinary
        const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads/" + filename
        );
        completeCoverImage = filename;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: completeCoverImage,
            folder: "book-covers",
            format: converMimeType,
        });

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    }

    // check if file field is exists.
    let completeFileName = "";
    if (files.file) {
        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads/" + files.file[0].filename
        );

        const bookFileName = files.file[0].filename;
        completeFileName = bookFileName;

        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: completeFileName,
            folder: "book-pdfs",
            format: "pdf",
        });

        completeFileName = uploadResultPdf.secure_url;
        await fs.promises.unlink(bookFilePath);
    }

    const updatedBook = await BookModel.findOneAndUpdate(
        {
            _id: bookId,
        },
        {
            title: title,
            //description: description,
            genre: genre,
            coverImage: completeCoverImage
                ? completeCoverImage
                : book.coverImage,
            file: completeFileName ? completeFileName : book.file,
        },
        { new: true }
    );

    res.json(updatedBook);
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    // const sleep = await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
        // todo: add pagination.
        const book = await BookModel.find().populate("author", "name");
        res.json(book);
    } catch (err) {
        return next(createHttpError(500, "Error while getting a book"));
    }
};

const getSingleBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bookId = req.params.bookId;

    try {
        const book = await BookModel
            .findOne({ _id: bookId })
            // populate author field
            .populate("author", "name");
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }

        return res.json(book);
    } catch (err) {
        return next(createHttpError(500, "Error while getting a book"));
    }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;

    const book = await BookModel.findOne({ _id: bookId });
    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }

    // Check Access
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You can not update others book."));
    }
    // book-covers/dkzujeho0txi0yrfqjsm
    // https://res.cloudinary.com/degzfrkse/image/upload/v1712590372/book-covers/u4bt9x7sv0r0cg5cuynm.png

    const coverFileSplits = book.coverImage.split("/");
    const coverImagePublicId =
        coverFileSplits.at(-2) +
        "/" +
        coverFileSplits.at(-1)?.split(".").at(-2);

    const bookFileSplits = book.file.split("/");
    const bookFilePublicId =
        bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
    console.log("bookFilePublicId", bookFilePublicId);
    // todo: add try error block
    try {
        await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(bookFilePublicId, {
        resource_type: "raw",
    });

    await BookModel.deleteOne({ _id: bookId });

    return res.sendStatus(204);
    } catch (error) {
        return next(createHttpError(500, "File Deletion Unsuccessfull "));
    }
    
};

export {createBook,updateBook,listBooks,getSingleBook,deleteBook}


