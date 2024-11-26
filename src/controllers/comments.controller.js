import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comments.model.js"
import { Video } from "../models/video.model.js"
import mongoose, { isValidObjectId } from "mongoose"


const getVideoComments = asyncHandler(async (req, res) => {

    const{ videoId } = req.params
    const{ page = 1, limit = 10 } = req.query

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    const pipeline = [{
        $match: {
            video: new mongoose.Types.ObjectId(videoId)
        }
    }]

    const options = {
        page: parseInt(page, 1),
        limit: parseInt(limit, 10),
        customLabels: {
            docs: "comments"
        }
    }

    const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options)
    if(!comments){
        throw new ApiError(404, "Comments not found")
    }
    return res
            .status(200)
            .json(new ApiResponse(200, "Comments fetched successfully", {
                comments,
                limit: comments.limit,
                page: comments.page
            }))
            
})

const addComments = asyncHandler(async(req,res) => {
    const{ videoId } = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(500, "Video id is not valid")
    }
    
    const check = await Video.findById(videoId)
    if(!check){
        throw new ApiError(404, "Video not found")
    }
    
    const comments = await Comment.create({
        content: req.body.content,
        video: {
            _id: videoId,
            videoFile: check.videoFile,
            thumbnails: check.thumbnails
        },
        owner:{
            _id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        }
    })
    // console.log(comments)
    
    if(!comments){
        throw new ApiError(400, "Error while adding comments")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200, "Video comments added successfully", comments))
})

const updateComments = asyncHandler(async(req,res) => {
    const{ commentId } = req.params
    const{ content } = req.body
    
    if(!isValidObjectId(commentId))
        throw new ApiError(400, "commentId is no found")

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {new: true}
    )
    if(!comment)
        throw new ApiError(400, "comment is empty")

   return res
    .status(200)
    .json(new ApiResponse(200, "comment updated successfully",comment))
}) 

const deleteComment = asyncHandler(async(req,res) => {
    const{ commentId } = req.params
    
    const comment = await Comment.findById(commentId)
    if(!commentId)
      throw new ApiError(400, "commentId is not found")

    if (comment.owner._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "User is not authorized to delete this comment");
    }
    
     const commentDelete =  await Comment.findByIdAndDelete(commentId)

    if(!commentDelete)
        throw new ApiError(400, "Comment document is not deleted")
    
    res
    .status(200)
    .json(new ApiResponse(200,"comment deleted successfully",commentDelete))

}) 

export{
    getVideoComments,
    addComments,
    updateComments,
    deleteComment
}