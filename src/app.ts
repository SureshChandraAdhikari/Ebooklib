import  express  from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";


const app = express();

app.get("/",(req,res,next) =>{
res.json({message:"Welcome"});
});

app.use(globalErrorHandler)


export default app;