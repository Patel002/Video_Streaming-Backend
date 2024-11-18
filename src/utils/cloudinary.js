import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError} from "../utils/ApiError.js"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        
        //upload the file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
           resource_type: "auto"  
        })
        
        //file has upload successfully
        //console.log("File uploaded successfully",response.url);
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

const getPublicId = async(url) => {
    if(!url) return null

    return url.split('/').pop().split('.')[0]
}
const oldImageDelete = async(publicUrl) => {
    
    try {
        if(!publicUrl) throw new ApiError(400, "No url provided for deletion");
         
        const publicId = publicUrl.includes('/')?getPublicId(publicUrl) : publicUrl 

        if(!publicId) throw new ApiError(400, "No public id found in url");
        
        const response = await cloudinary.uploader.destroy(publicId,{
            resource_type: "image"
        })
    
        return response
        
    } catch (error) {
         console.error(401, "Error while deleting image from cloudinary",error)
        
    }
}

export { 
    uploadOnCloudinary,
    oldImageDelete
 }
