import { config as conf } from "dotenv";
conf();
const _config = {
    port: process.env.PORT ,
    databaseUrl: process.env.MONGODBURI,
}


export const config = Object.freeze(_config);