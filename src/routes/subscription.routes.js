import {
    toggleSubscription,
    getUserChannelSubsciber,
    getSubscribedChannels
}from "../controllers/subscription.controller.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/subscribe/:channelId").post(verifyJWT,toggleSubscription)
router.route("/subscriber/:channelId").get(verifyJWT,getUserChannelSubsciber)
router.route("/channelsubscriber/:subscriberId").get(verifyJWT,getSubscribedChannels)



export default router