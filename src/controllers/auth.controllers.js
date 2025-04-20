import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/ApiError.js"
import { ApiResponse } from "../utils/api-respose.js";
import {userLoginValidator, userRegistrationValidator} from "../validators/index.js"
import {User } from "../models/users.models.js"
import cookieParser from "cookie-parser";

import {emailVerificationMailGenContent, forgotPasswordMailGenContent, sendMail } from "../utils/mail.js"
import dotenv from "dotenv"
dotenv.config()




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

        const user = await  User.create({
            email,
            password,
            firstName,
            lastName,
            username,
            phone,
        });
        //hash the password
        const token = await user.generateTemporaryToken()
        user.emailVerificationToken = token.hashedToken
        user.emailVerificationTokenExpiry = token.expiry
        await user.save()

        if (!user) {
            throw new ApiError(500, "User creation failed")
        }
        console.log(user)
        console.log(token)


        //send verification email
        const  verificationUrl = `http://localhost:${process.env.PORT}/api/v1/verify-email?token=${token.hashedToken}`;
        const verificationToken = emailVerificationMailGenContent(user.username, verificationUrl);
        await sendMail({
            email: user.email,
            subject: "Email Verification",
            mailGenContent: verificationToken
        });
        // check if the email was sent successfully
        console.log("Verification email sent successfully")
        // console.log(verificationToken)
        // console.log(user.emailVerificationToken)
        // console.log("rgrigijgi",user.email)
        console.log(token)

        //send response
        const response = new ApiResponse(201, "User created successfully", {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                phone: user.phone,
            },
            
        });
        return res.status(201).json(response)


    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)   
    }
});



const loginUser = asyncHandler(async (req, res) => {
    //validate the request body
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "All fields are required")
    }
    try {
        const user = await User.findOne({ email }).select("+password")
        if(!user) {
            throw new ApiError(404, "User not found")
        }
        const isPasswordMatched = await user.isPasswordMatched(password)
        console.log(isPasswordMatched)
        if (!isPasswordMatched) {
            throw new ApiError(401, "Invalid credentials")
        }
        const isEmailVerified = user.isEmailVerified
        if (!isEmailVerified) {
            throw new ApiError(401, "Email not verified")
        }

        const accessToken = user.genrateAccessToken();
        const refreshToken = user.genrateRefreshToken();

        user.refreshToken = refreshToken
        await user.save();

        // const userData = await User.findById(user._id).select(
        //     "-password -emailVerificationToken -emailVerificationExpiry -refreshToken -forgotPasswordToken -forgotPasswordExpiry"
        // )

        const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
        };
        const cookieOptions = {
            httpOnly: true,
            secure:process.env.NODE_ENV,
            maxAge: 30 * 24 * 60 * 60 * 1000
        }
        res.cookie("refreshToken",refreshToken,cookieOptions)
            .cookie("accessToken",accessToken,cookieOptions)
        //send response 
        const response = new ApiResponse(200, "Login successful", userData,);
        return res.status(200).json(response)
  
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)    
    }
})


const logoutUser = asyncHandler(async (req, res) => {
    //validate the request body

    try {
        const id = req.user._id;
        if(!id){
            throw new ApiError(4001, "User not Authenticated")
        }
        console.log(id)
        await User.findById(id).updateOne({"refreshToken" : ''});
        return res
        .cookie("refreshToken", "")
        .cookie("accessToken", "")
        .status(200).json(new ApiResponse(200, "User logout successful"))
    } catch (error) {
        throw new ApiError(500, "Internal Server Error logout faild", error.message ,error.stack)
        
    }


})


const verifyEmail = asyncHandler(async (req, res) => {
    //validate the request body
    const { token } = req.query;
    if (!token) {
        throw new ApiError(400, "Token is required")
    }


    try {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpiry: { $gt: Date.now() },
        });
        
        if (!user) {
            throw new ApiError(400, "Invalid or expired token")
        }
        
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpiry = undefined;
        await user.save();
        return res.status(200).json(new ApiResponse(200, "Email verified successfully"))
        
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)
        
    }
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



export {registerUser, loginUser, logoutUser, verifyEmail, resendVerificationEmail, refreshAccessToken, forgotPasswordRequest, changeCurrentPassword, getCurrentUser}