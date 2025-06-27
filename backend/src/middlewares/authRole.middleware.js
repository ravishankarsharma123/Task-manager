import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";

import {asyncHandler} from "../utils/async-handler.js";
import dotenv from "dotenv";


dotenv.config();


const validtaeProjectPermissions = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user?._id;

    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    
});







