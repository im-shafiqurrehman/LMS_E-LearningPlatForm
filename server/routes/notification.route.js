import express from "express"
import {
    getNotification,updateNotification
} from "../controllers/notification.controller.js"
import {authorizeRoles, isAuthenticated } from "../middleWare/auth.js";
import { updateAccessToken } from "../controllers/user.controller.js";


const notificationRouter = express.Router();
notificationRouter.get("/get-all-notification", isAuthenticated, authorizeRoles("admin"), getNotification);
notificationRouter.put("/update-notification/:id", isAuthenticated, authorizeRoles("admin"), updateNotification);



export default notificationRouter