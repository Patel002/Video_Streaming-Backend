import{
    addComments,
    deleteComment,
    getVideoComments,
    updateComments
} from "../controllers/comments.controller.js"
import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/:videoId").get(getVideoComments)
router.route("/add-comments/:videoId").post(addComments)
router.route("/:commentId").patch(updateComments).delete(deleteComment)

export default router