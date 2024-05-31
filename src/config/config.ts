import { config as conf } from "dotenv";
conf();
const _config = {
    port: process.env.PORT ,
    databaseUrl: process.env.MONGODBURI,
    env:process.env.NODE_ENV ,
    jwtSecret: process.env.JWT_SECRET ,
    cloudinaryCloud:process.env.CLOUDINARY_CLOUD,
    cloudinaryCloudApikey:process.env.CLOUDINARY_API_KEY,
    cloudinaryCloudApisecret:process.env.CLOUDINARY_API_SECRET,
    frontEndDomain:process.env.FRONT_END_DOMAIN ,
}


export const config = Object.freeze(_config);