import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError} from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const createUserTweet = asyncHandler(async (req, res) => {

    const { content } = req.body

     if(!content || !content.trim()) {
        throw new ApiError(400, "Content is required")
     }

     const userDetails = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $project: {
                name: 1,
                fullname: 1,
                avatar: 1
            }
        }
     ])

     if((!userDetails) || !userDetails.length) {
        throw new ApiError(404, "User not found")
     }

     const owner = userDetails[0]

     const tweet = await Tweet.create({
        owner,
        content
    })

     await tweet.populate("owner", "username fullname avatar")

     return res.status(201).json(new ApiResponse(201, "tweet created successfully", tweet))
})

const getUserTweets = asyncHandler(async (req, res) => { 

    const owner = req.body?._id

    const tweet = await Tweet.find(owner)

    if(!tweet || !tweet.length) {
        throw new ApiError(404, "User tweet not found")
    }

    return res.status(302).json(new ApiResponse(200, "User tweet fetched successfully", tweet))
})

const updatedTweet = asyncHandler(async(req, res)=> {
    // const { content } = req.body

    // if(!content){
    //     throw new ApiError(400, "Content is required")
    // }
    //     const tweet = await Tweet.findOneAndUpdate(
    //         req.params?._id,
    //         {
    //             $set: {
    //                 content,
    //             }       
    //         },
    //         {new : true}
    //     )
    //     console.log(tweet)

    //     if(!tweet) {
    //         throw new ApiError(404, "Tweet not found")
    //     }
        
    //     return res.status(200).json(new ApiResponse(200, "Tweet updated successfully", tweet))
    // })

    const { content } = req.body    

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        req.params?._id,
        {
            $set:{
                content
            }
        },
        {new: true}
    )   
// console.log(tweet)
// console.log(req.params?._id)

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(201).json(new ApiResponse(200, "Tweet updated successfully", tweet))

})

const deleteTweet = asyncHandler(async(req,res) => {
     const tweet = await Tweet.findByIdAndDelete(req.params?._id)
        res.status(200)
        .json(
            new ApiResponse(200, "Tweet deleted successfully",tweet)
        )

})

export {
    createUserTweet,
    getUserTweets,
    updatedTweet,
    deleteTweet
}