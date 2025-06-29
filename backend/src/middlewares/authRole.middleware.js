import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.models.js";

import {asyncHandler} from "../utils/async-handler.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {UserRolesEnum} from "../utils/constants.js";



dotenv.config();


const validtaeProjectPermissions = (roles = []) =>
asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user?._id;

    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    try {
        projectMembers = await User.findOne({
            project: mongoose.Types.ObjectId(projectId),
            user: mongoose.Types.ObjectId(userId)
        })
        if (!projectMembers) {
            throw new ApiError(403, "You do not have permission to access this project");
        }

        const givenRole = projectMembers?.role;
        req.user.role = givenRole;

        if (roles.length && !roles.includes(givenRole)) {
            throw new ApiError(403, `You do not have the required role to access this project. Required roles: ${roles.join(", ")}`);
        }


        
    } catch (error) {
        throw new ApiError(500, "Error fetching project members");
        
    }


    
});

export default validtaeProjectPermissions;







