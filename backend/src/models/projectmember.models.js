import mongoose, {Schema} from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";
import  ApiError  from  "../utils/ApiError.js";

const projectMemberSchema = new mongoose.Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref : "User",
        required: true

    },
    project:{
        type: Schema.Types.ObjectId,
        ref : "Project",
        required: true
    },
    role:{
        type: String,
        enum: AvailableUserRoles,
        default: UserRolesEnum.MEMBER,
    }

},{ timestamps: true})



// validate user roles
projectMemberSchema.statics.validateUserRolesForProjectUpdate = async function(
    userId,
    projectId
){
    console.log("validating user roles for project update", userId, projectId)

   try {
     const memberRole = await this.findOne({
        
         user: userId,
         project: projectId
     }).select("role")
        console.log("memberRole", memberRole)
     if(!memberRole){
         throw new ApiError(403, "user is not a member of this project")
     }
     if(memberRole.role !== UserRolesEnum.PROJECT_ADMIN && memberRole.role !== UserRolesEnum.ADMIN){
         throw new ApiError( 403, "user is not a project admin")
     }
     return memberRole
   } catch (error) {
    console.log("error in validate user roles", error)
     throw new ApiError(500, "internal server error for validate user roles", error)
    
   }

}


export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema)