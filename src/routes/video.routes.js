import {
    togglePublishStatus,
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishVideo,
    updateVideoDetails
} from "../controllers/video.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/fetch-videos").get(verifyJWT,getAllVideos)

router.route("/video").post(verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnails",
            maxCount: 1
        }
    ])
    ,publishVideo)

router.route("/videos/:_id").get(verifyJWT,getVideoById)
router.route("/update-details/:_id").patch(verifyJWT,upload.single("thumbnails"),updateVideoDetails)
router.route("/delete-video/:_id").delete(verifyJWT,deleteVideo)
router.route("/toggle/publish/:_id").patch(verifyJWT,togglePublishStatus)

export default router

