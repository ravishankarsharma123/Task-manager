import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";


const projectMemberSchema = new mongoose.Schema({
    user:{
        type: Schema.Type.ObjectId,
        ref : "User",
        required: true

    },
    project:{
        type: Schema.Type.ObjectId,
        ref : "Project",
        required: true
    },
    role:{
        type: String,
        enum: AvailableUserRoles,
        default: UserRolesEnum.MEMBER,
    }

},{ timestamps: true})


export const PojectMember = mongoose.model("PojectMember", projectMemberSchema)