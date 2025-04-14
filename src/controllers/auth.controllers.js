import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/ApiError.js"
import { ApiResponse } from "../utils/api-respose.js";
import {userLoginValidator, userRegistrationValidator} from "../validators/index.js"
import {User} from "../models/users.models.js"
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import {emailVerificationMailGenContent, forgotPasswordMailGenContent, sendMail } from "../utils/mail.js"
import { console } from "inspector";



const registerUser = asyncHandler(async (req, res) => {

    //validate the request body
    const { email,password,firstName,lastName ,username, phone,  } = req.body;
    if (!email || !password || !firstName || !lastName || !username) { 
            throw new ApiError(400, "All fields are required",)
    }
    //check if the user already exists  
    try {
        const existUser = await User.findOne({email})
        if (existUser) {
            throw new ApiError(409, "User already exists")
        }

        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            username,
            phone,
        })

        if (!user) {
            throw new ApiError(500, "User creation failed")
        }
        console.log(user)


        //send verification email
        const verificationToken = user.emailVerificationMailGenContent(user.username, user.ve )


        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)
        
    }


});

const loginUser = asyncHandler(async (req, res) => {
    //validate the request body
})


const logoutUser = asyncHandler(async (req, res) => {
    //validate the request body
})


const verifyEmail = asyncHandler(async (req, res) => {
    //validate the request body
})



const resendVerificationEmail = asyncHandler(async (req, res) => {
    //validate the request body
})



const refreshAccessToken = asyncHandler(async (req, res) => {
    //validate the request body
})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    //validate the request body
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    //validate the request body
})

const getCurrentUser = asyncHandler(async (req, res) => {
    //validate the request body
})



export {registerUser}