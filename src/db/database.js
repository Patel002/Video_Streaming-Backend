import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectionDb = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`)
        console.log(`MONGODB connection host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("ERROR",error)
        process.exit(1)
    }
}

export default connectionDb