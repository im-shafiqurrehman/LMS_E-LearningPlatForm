import express from "express"
import {
    createOrder,getAllOrder
} from "../controllers/order.controller.js"
import {authorizeRoles, isAuthenticated } from "../middleWare/auth.js";
import { updateAccessToken } from "../controllers/user.controller.js";


const orderRouter = express.Router();
orderRouter.post("/create-order",updateAccessToken,  isAuthenticated,createOrder);
orderRouter.get("/get-all-orders",updateAccessToken, isAuthenticated, authorizeRoles("admin"), getAllOrder);

// stripe 
orderRouter.get("/payment/stripe-publishable-key", sendStripePublishableKey);
orderRouter.post("/payment",updateAccessToken, isAuthenticated, newPayment);




export default orderRouter