import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

app.use(express.cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))

app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended: true ,limit: "16kb"}))
app.use(express.static())
app.use(express.cookieParser())

export { app }