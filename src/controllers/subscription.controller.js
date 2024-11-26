import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Subscription } from "../models/subscription.model.js"              
import mongoose, { isValidObjectId } from "mongoose"

const toggleSubscription = asyncHandler(async (req,res) => {
     const{ channelId } = req.params

     if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel id is not valid")  
     }

   //   if(req.user?._id === channelId){
   //      throw new ApiError(400, "You can't subscribe to yourself")
   //   }   

     const subscribd = await Subscription.findOne({
       $and:[ {channel: channelId},
         {subscriber: req.user?._id} ]
     })
   //   console.log(subscribd)

     if(!subscribd){
        const subscribe = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })
        if(!subscribe)
            throw new ApiError(500, "Error while subscribing")

         return res
         .status(200)
         .json(new ApiResponse(200, "Channel subscribed",subscribe))
     }
     
          const unsubscribe = await Subscription.findOneAndDelete(subscribd._id)
          if(!unsubscribe){
             throw new ApiError(500, "Error while unsubscribing")
          }
     
  return res
          .status(200)
          .json(new ApiResponse(200, "Unsubscribed successfully",{}))
})

const getUserChannelSubsciber = asyncHandler(async (req,res) => {
   const { channelId } = req.params 

   if(!isValidObjectId(channelId)){
      throw new ApiError(400, "Channel id is not valid")  
   }

   const subscribe = await Subscription.aggregate([
      {
         $match: {
            channel: new mongoose.Types.ObjectId(channelId)
         } 
      },
      {
         $lookup: {
            from: "users",
            localField:"subscriber",
            foreignField:"_id",
            as:"subscriber",
            pipeline: [
               {
                  $project: {
                     fullname: 1,
                     username: 1,
                     avatar: 1
                  }
               }
            ]
         }
      },
      {
         $addFields: {
            subscriber: {
               $first: "$subscriber"
            }
         }
      },
      {
         $project: {
            subscriber: 1,
            createdAt: 1
         }
      }
   ])
   if(!subscribe)
      throw new ApiError(500, "Error while getting subscribers")

   return res
         .status(200)
         .json(new ApiResponse(200, "Subscribers fetched successfully",subscribe))  
})

const getSubscribedChannels = asyncHandler(async (req,res) => {
   const{ subscriberId } = req.params

   if(!isValidObjectId(subscriberId)){
      throw new ApiError(400, "Subscriber id is not valid")
   }

   const subscribe = await Subscription.aggregate([
      {
         $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId)
         }
      },
      {
         $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "channel",
            pipeline: [
               {
                  $project: {
                     fullname: 1,
                     username: 1,
                     avatar: 1
                  }
               }
            ]
         }
      },
      {
         $addFields: {
            channel: {
               $first: "$channel"
            }
         }
      },
      {
         $project: {
            channel: 1,
            createdAt: 1
         }
      }
   ])

   if(!subscribe)
      throw new ApiError(500, "Error while getting subscribed channels")

   return res
         .status(200)
         .json(new ApiResponse(200, "Subscribed channels fetched successfully",subscribe))

}) 

export{
    toggleSubscription,
    getUserChannelSubsciber,
    getSubscribedChannels
}