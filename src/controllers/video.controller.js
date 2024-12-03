import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const{ page = 1, limit = 10 , query, sortBy = 'createdAt',sortType, sortId = 1, userId = "" } = req.query

    const video = await Video.aggregate([
        {
            $match: query ?
            {
                $or: [
                    { title: { $regex: query, $options: "i"} },
                    { description: { $regex: query, $options: "i" } },
                ],
            }:{},
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
            $unwind: "$owner"
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnails: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner: {
                    _id: 1,
                    name: 1,
                    fullname: 1,
                    avatar: 1
                }
             }
        },
        {
            $sort:{
                [sortBy]: sortType === 'asc' ? 1 : -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        }
            ])

           return res.status(200)
            .json(
                new ApiResponse(200,video,"Videos fetched successfully")
            )

})

const publishVideo = asyncHandler(async (req, res) => {
    // console.log(`upload files`,req.files)
    const { title, description } = req.body

    if(!title || !description){
        throw new ApiError(400, "Title and description is required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    if(!videoFileLocalPath){
        throw new ApiError(400, "Video is required")
    }
     console.log(videoFileLocalPath)

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    if(!videoFile.url){
        throw new ApiError(400, "Error while uploading video")
    }

    const thumbnailLocalPath = req.files?.thumbnails[0]?.path
    if(!thumbnailLocalPath){ 
        throw new ApiError(400, "Thumbnail is required")
    }
    console.log(thumbnailLocalPath)

    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnailFile.url){
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    const video = await Video.create({
        videoFile : videoFile.url,
        thumbnails : thumbnailFile.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })

    // console.log(video)

    if(!video){
        throw new ApiError(500, "Error while publishing video")
    }

   return res.status(200)
    .json(new ApiResponse(200,video,"Video is live now"))
})

const getVideoById = asyncHandler(async (req,res) => {

    const { _id } = req.params
    // console.log(_id,req.params)
    
    if(!_id){
        throw new ApiError(400, "Video id is not found!!")
    }

    const video = await Video.findById(_id)
    if(!video){
        throw new ApiError(400, "video in not found from this id")
    }   
    
   return res.status(200)
    .json(new ApiResponse(200,"Video fetched successfully", video))

})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const thumbnailsLocalPath = req.file?.path
    const { _id } = req.params
    const { title, description } = req.body

    if(!title || !description){
        throw new ApiError(400, "Title and description is required")
    }

    if(!thumbnailsLocalPath){
        throw new ApiError(400, "Thumbnails file is missing")
    }
    
    const video = await Video.findById(_id)
        if(!video){
            throw new ApiError(400, "User is unauthorized to update this Thumbnail")
        }

    const thumbnailDelete = await deleteFromCloudinary(video.thumbnails)
    if(!thumbnailDelete){
        throw new ApiError(500 , "Error while deleting thumbnail from cloudinary")
    }

    if(!thumbnailDelete){
        throw new ApiError(500 , "Error while deleting thumbnail from cloudinary")
    }
    
    
    const thumbnailsFile = await uploadOnCloudinary(thumbnailsLocalPath)

    const videoUpdate = await Video.findByIdAndUpdate(
        req.params._id,
        {
            $set: {
                title,
                description,
                thumbnails: thumbnailsFile.url
            }
        },
        {new : true}
    )

    return res.status(200)
            .json(new ApiResponse(200,videoUpdate,"Video details updated successfully"))

})

const deleteVideo = asyncHandler(async(req, res) => {

    const{ _id } = req.params
    // console.log(_id)

    if(!_id) throw new ApiError(400, "Requested video delete file id not found")

        const video = await Video.findById(_id)
        // console.log("this file",video)
        if(!video)
            throw new ApiError(404, "This id is not present!")

        const videoDeleteFromCloudinary = await deleteFromCloudinary(video.videoFile)
        if(!videoDeleteFromCloudinary) 
            throw new ApiError(500, "Bad request due to video is not present at this location")
        
        const thumbnailDelete = await deleteFromCloudinary(video.thumbnails)
        if(!thumbnailDelete){
            throw new ApiError(500 , "Error while deleting thumbnail from cloudinary")
        }

       const deleteVideocollectionFromDatabase = await Video.findByIdAndDelete(_id)
       if(!deleteVideocollectionFromDatabase)
        throw new ApiError(500, "Error while deleting video file url")

      return res.status(200)
       .json(new ApiResponse(200,videoDeleteFromCloudinary,thumbnailDelete,"Video successfully deleted from database and cloudinary"))

})

const togglePublishStatus = asyncHandler(async(req,res) => {
    const{ _id } = req.params
     
    const toggleIsPublish = await Video.findOne(
        {
        _id,
        owner : req.user._id
        }
    )

    if(!toggleIsPublish){
        throw new ApiError(400, "You are not authorized to publish this video")
    }

    //isPublished = true then output is false and if it is false then output is true
    toggleIsPublish.isPublished = !toggleIsPublish.isPublished 

    const togglePublish = await toggleIsPublish.save()
    if(!togglePublish){
        throw new ApiError(500, "Error while toggling publish status")      
    }
    
    return res.status(200)
            .json(new ApiResponse(200,togglePublish, "Video publish toggle updated successfully"))
})

export{
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}