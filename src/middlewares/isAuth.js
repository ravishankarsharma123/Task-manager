import jwt from "jsonwebtoken"
import {User} from "../models/users.models.js"
import ApiError from "../utils/ApiError.js"
import {asyncHandler} from "../utils/async-handler.js"
import dotenv from "dotenv"


dotenv.config()

const isAuth = asyncHandler(async (req, res, next) =>{
    console.log(req.cookies)
    const {accessToken } = req.cookies;
    if(!accessToken){
        throw new ApiError(401,"Access token not found")
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        if (!decoded) {
            throw new ApiError(401, "Invalid or expired access token.")
        }
        const user = await User.findById(decoded._id).select("-password -refreshToken")
        if (!user){
            throw new ApiError(401, "User not found")
        }
        req.user = user
        next()

        
    } catch (error) {
        console.log(error)
        throw new ApiError(401, "Invalid or expired access token." ,error)
        
    }

});

export default isAuth   

