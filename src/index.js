import dotenv from "dotenv"
import connectionDb from './db/database.js'
import { app } from "./app.js"


dotenv.config({
    path: './.env'
})


connectionDb()
.then(()=>{
    app.listen(process.env.PORT || 9871, () =>{
        console.log(`⚙️  Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB connection Failed !!!", err);
})
