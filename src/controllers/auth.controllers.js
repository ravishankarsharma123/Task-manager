import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/ApiError.js"
import { ApiResponse } from "../utils/api-respose.js";
import {userLoginValidator, userRegistrationValidator} from "../validators/index.js"
import {User } from "../models/users.models.js"
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

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
        // create a new user
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
        const  verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token.hashedToken}`;
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
}); //Done✔



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
 }) //Done✔


 
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
}) //Done✔



const resendVerificationEmail = asyncHandler(async (req, res) => {
    //validate the request body
    const {email} = req.body;
    if (!email){
        throw new ApiError(400, "Email is required")
    }
    try {
        const user = await User.findOne({email});
        if (!user){
            throw new ApiError(404, "User not found")
        }
        if (user.isEmailVerified){
            throw new ApiError(400, "Email already verified")
        }
        const token = await user.generateTemporaryToken()
        user.emailVerificationToken = token.hashedToken
        user.emailVerificationTokenExpiry = token.expiry
        await user.save()
        //send verification email
        const  verificationUrl = `http://localhost:${process.env.PORT}/api/v1/verify-email?token=${token.hashedToken}`;
        await sendMail({
            email: user.email,
            subject: "Email Verification",
            mailGenContent: emailVerificationMailGenContent(user.username, verificationUrl)
        });
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)
        
    }

}) //Done✔

const refreshAccessToken = asyncHandler(async (req, res) => {
    //validate the request body
    const {refreshToken} = req.cookies;
    console.log(refreshToken)
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token not found")
    }
    let decoded
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decoded._id).select("+refreshToken")
        if (!user){
            throw new ApiError(404, "User not found")
        }
        if (user.refreshToken !== refreshToken){
            throw new ApiError(401, "Invalid refresh token")
        }
        const accessToken = user.genrateAccessToken()
        const newRefrenshToken = user.genrateRefreshToken()
        //update the refresh token in the database
        user.refreshToken = newRefrenshToken;
        await user.save();
        //set the refresh token in the cookie
        const cookieOptions = {
            httpOnly: true,
            secure:process.env.NODE_ENV,
            maxAge: 30 * 24 * 60 * 60 * 1000
        }
        res.cookie("refreshToken", newRefrenshToken, cookieOptions)
            .cookie("accessToken", accessToken, cookieOptions)
        //send response
        const response = new ApiResponse(200, "Access token refreshed successfully", {
            accessToken,
            refreshToken: newRefrenshToken,
            
        });
        return res.status(200).json(response)

        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)
        
    }
}) //Done✔

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    //validate the request body
    const {email} = req.body;
    if (!email){
        throw  new ApiError(400, "Email is required")
    }
     try {
        const user = await User.findOne({email});
        if (!user){
            throw new ApiError(404, "User not found")
        }
        const token = await user.generateTemporaryToken()
        user.forgotPasswordToken = token.hashedToken
        user.forgotPasswordTokenExpiry = token.expiry
        await user.save()
        //send verification email
        const  verificationUrl = `http://localhost:${process.env.PORT}/api/v1/verify-reset-password?token=${token.hashedToken}`;
        await sendMail({
            email: user.email,
            subject: "Password Reset",
            mailGenContent: forgotPasswordMailGenContent(user.username, verificationUrl)
        });
        //send response
        const response = new ApiResponse(200, "Password reset email sent successfully", {
            message: "Password reset email sent successfully",
        });
        return res.status(200).json(response)

        
     } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)
        
     }
}); //Done✔

const resetForgotPasswordHandler = asyncHandler(async (req, res) => {

    const {token } = req.query;
    const {password} = req.body;
    try {

        const hashedToken = crypto.createHash("sha256").updated(token).digest("hex");
        const user = await User.findOne({forgotPasswordToken,
            $and: [
                {forgotPasswordToken: hashedToken},
                {forgotPasswordTokenExpiry: {$gt: Date.now()}}
            ]
        });
        // const user = await User.findOne({forgotPasswordToken: token})
        // console.log(user)
        // if (!user){
        //     throw new ApiError(404, "User not ok found") 
        // }
        // user.password = password;
        // await  user.save();
        // const response = new ApiResponse(200, "Password updated....✔", {
            
            
        // });
        // return res.status(200).json(response)

         

        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)
    }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    //validate the request body
    const {email, password,newPassword, confirmPassword} = req.body;
    try {
        if(!password || !email){
            throw new ApiError(404, "All fields are required")
        }
        const user = await User.findOne({email}).select("+password")
        if (!user){
            throw new ApiError(404, "User not found")
        }
        const isPasswordMatched = await user.isPasswordMatched(password)
        if (!isPasswordMatched) {
            throw new ApiError(401, "Invalid credentials")
        }
        if (newPassword !== confirmPassword){
            throw new ApiError(401, "Password do not match")
        }
        user.password = newPassword;
        await user.save();
        const response = new ApiResponse(200, "Password updated successfully", {
            message: "Password updated successfully",
        });
        return res.status(200).json(response)

        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)
    }

})

const getCurrentUser = asyncHandler(async (req, res) => {

    //validate the request body
    const id = req.user._id;
    if (!id) {
        throw new ApiError(401, "User not authenticated")
    }
    try {
        const user = await User.findById(id).select("-password -emailVerificationToken -emailVerificationExpiry -refreshToken -forgotPasswordToken -forgotPasswordExpiry")
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const response = new ApiResponse(200, "User fetched successfully", user)
        return res.status(200).json(response)
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message ,error.stack)
        
    }

})



export {registerUser, 
    loginUser, 
    logoutUser, 
    verifyEmail, 
    resendVerificationEmail, 
    refreshAccessToken, 
    forgotPasswordRequest, 
    changeCurrentPassword, 
    getCurrentUser,
    resetForgotPasswordHandler
    

}