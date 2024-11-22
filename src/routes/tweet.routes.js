import { 
    createUserTweet, 
    getUserTweets, 
    updatedTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";
import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/user-tweet").post(verifyJWT,createUserTweet)
router.route("/current-user").get(verifyJWT,getUserTweets)
router.route("/update-tweet/:_id").patch(verifyJWT,updatedTweet)
router.route("/delete-tweet/:_id").delete(verifyJWT,deleteTweet)

export default router