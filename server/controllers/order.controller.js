import ErrorHandler from "../utilis/ErrorHandler.js";
import sendMail from "../utilis/send.mail.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import OrderModel from "../models/order.model.js";
import NotificationModel from "../models/notification.model.js";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getAllOrderService } from "../services/order.services.js";
import redisClient from "../utilis/redis.js";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create order
export const createOrder = async (req, res, next) => {
    try {
      const { courseId, payment_info } = req.body;
  
      if (payment_info) {
        if ("id" in payment_info) {
          const paymentIntentId = payment_info.id;
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
          if (paymentIntent.status !== "succeeded") {
            return next(new ErrorHandler("Payment failed", 400));
          }
        }
      }
  
      const user = await User.findById(req.user?._id);
  
      const isCourseExistByUser = user?.courses.some(
        (course) => course._id.toString() === courseId
      );
      if (isCourseExistByUser) {
        return next(new ErrorHandler("Course already exists", 400));
      }
  
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
  
      const data = {
        courseId: course._id,
        userId: user?._id,
        payment_info: payment_info,
      };
  
      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };
  
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/orderConfirmation.ejs"),
        { order: mailData }
      );
  
      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "orderConfirmation.ejs",
            data: mailData,
          });
        }
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
  
      user?.courses.push(course._id);
      await redisClient.set(req.user?._id, JSON.stringify(user));
      await user?.save();
  
      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order for ${course.name}`,
      });
  
      course.purchased += 1;
  
      await course.save();
  
      newOrder(data, res, next);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  };
  


//Get all Orders --only Admin
export const getAllOrder = async (req, res, next) => {
    try {
        await getAllOrderService(req, res, next); 
    } catch (error) {
        next(new ErrorHandler(error.message, 400));
    }
};


// Send stripe Publishabl
resedStrKey = async (req, res) => {
    res.status(200).json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  };
  
  // new Payment
  export const newPayment = async (req, res, next) => {
    try {
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "USD",
        metadata: {
          company: "E-Learning",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
  
      res.status(201).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  };
  
