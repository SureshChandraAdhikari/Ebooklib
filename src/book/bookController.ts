import { NextFunction , Request , Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";





const createBook = async (req: Request, res: Response , next: NextFunction) => {
console.log("files" ,req.files);

try {
    const files = req.files as {[fiedlname:string]: Express.Multer.File[]}
const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
const filename = files.coverImage[0].filename;
const filepath = path.resolve(__dirname, "../../public/data/uploads",filename);

const uploadResult = await cloudinary.uploader.upload(filepath,{
    filename_override: filename,
    folder:'book-covers',
    format:coverImageMimeType,
});

const bookFileName = files.file[0].filename;
const bookFilePath = path.resolve(__dirname, "../../public/data/uploads",filename);

const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,{
    resource_type: 'raw',
    filename_override: bookFileName,
    folder:"book-pdfs",
    format:"pdf",
})
console.log("bookfileUploadresult" ,bookFileUploadResult)



console.log("uploadResult" ,uploadResult)

    res.json({})

} catch (error) {
    console.log (error);
    return next(createHttpError(500,"Error in file uploading"));
}

}
export default createBook

