import { asyncHandler } from "../utils/async-handler.js";
import {Project} from "../models/project.models.js"
import {User} from "../models/users.models.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/api-respose.js"
import mongoose from "mongoose";
import { ProjectMember } from "../models/projectmember.models.js";
import { UserRolesEnum } from "../utils/constants.js";
import { withTransactionSession } from "../services/transaction.sevices.js";
import {Task} from "../models/task.models.js";
import {SubTask} from "../models/subtask.models.js";




const getProjects = asyncHandler(async (req, res) =>{
    const {_id} = req.user
    try {

        const projects = await Project.find({createBy:_id})
        if(!projects){
            throw new ApiError(404, "not found", "no projects found")
        }
        if(projects.length === 0){
            return res.status(404).json(
                new ApiResponse(404, "not found", "no projects found")   
            )
        }
        console.log("************projects************", projects[0]);

         return res.status(200).json(
          new ApiResponse(200, "projects found✔", projects,{
            message: "projects found😁😁😁",
          }) 
         )
         
    } catch (error) {
        throw new ApiError(500, "internal server error", error.message)
    }   
}) //Done ✔


const getProjectById = asyncHandler(async (req, res) =>{
    const {projectId} = req.params
    try {
        const project = await Project.aggregate([
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(projectId)
                }

            },
            {
                $lookup:{
                    from: "PojectMember",
                    localField: "_id",
                    foreignField: "project",
                    as: "members"

                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "createBy",
                    foreignField: "_id",
                    as: "createBy"

                },
            },
            // unwind means to deconstruct an array field from the input documents to output a document for each element
            {
                $unwind:"$createBy"
            },
            {
                $project:{
                    "createBy.Password":0,
                    "createBy.refreshtoken":0,
                },
            },
        ]);

        if(!project){
            throw new ApiError(404, "not found", "no project found")
        }
        console.log("************project************", project);
        
         return res.status(200).json( 
            new ApiResponse(200, "project found✔", project)
         );

    } catch (error) {
        console.log(error)
        throw new ApiError(500, "internal server error", error.message)
        
    }    
}) //not working yet i will fix it later //Done ✔ all woking fine


const creatProject = asyncHandler(async (req, res) =>{

    const{name, description} = req.body
    const _id  = req.user?._id // destructure the user id from the request object if it exists if not, it will be undefined
    console.log("id=========",_id, "name_____________", name, "description__________", description);
    
    if(!name || !description ){
        throw new ApiError(400, "bad request", "name and description are required")
    }

    try {
        const axistingProject = await Project.findOne({
            name,
            createBy: _id
        })
        console.log("axistingProject", axistingProject);
        
        if(axistingProject){
            return res.status(409).json( 
                new ApiError(409, "conflict", "project already exists"))
        }
        const project = await withTransactionSession(async (session) => {
        
            try {
                const [newProject] = await Project.create([{
                    name,
                    description,
                    members: [ _id], // add the user id to the members array
                    createBy: _id,

                }], {session});
                await ProjectMember.create([{
                    user: _id,
                    project: newProject._id,
                    role: UserRolesEnum.PROJECT_ADMIN
                }], {session});

                console.log("newProject", newProject);
                
                return newProject;
                
            } catch (error) {
                console.log("__________________", error)
                throw new ApiError(500, "internal server error", "project not created")
                
            }
        });
    
        // save the project to the database

        console.log("************project************", project)
        if(!project){
        throw new ApiError(500, "project not fouund error", "project not created")
        }
        return res.status(201).json(
            new ApiResponse(201, "project created✔", project)
        )


        
    } catch (error) {
        console.log(" ggggggggggggggg",error)
        throw new ApiError(500, "internal server error", error.message)
        
    }
}) //Done ✔😁

const updateProjects = asyncHandler(async (req, res) =>{
    const {projectId} = req.params
    const {name, description} = req.body
    const userId = req.user._id
    const projectMember = await ProjectMember.validateUserRolesForProjectUpdate(
        userId,
        projectId
    )
    if(!projectMember){
        throw new ApiError(403, "you are not allowed to update this project", "user is not a project admin")
    }
    try {
        const project = await Project.findByIdAndUpdate(
            projectId, {name, description}, {new: true}
            
            // this will return the updated project new project
        ).populate({
            path: "createBy",
            // select: "firstName lastName email "
            select: "-password -refreshToken"
        })

        if(!project){
            throw new ApiError(404, "not found", "project not found faild to update")
        }
        return res.status(200).json(
           
            new ApiResponse(200, "project updated✔", project)
        )

        
    } catch (error) {
        console.log("___________________error__________", error)
        throw new ApiError(500, "internal server error for update project", error.message)
        
    }


    
}) //Done ✔😁

const deleteProject = asyncHandler(async (req, res) =>{
    console.log("*************** delete function started ***************")
    
    const {projectId} = req.params
    const userId = req.user._id
    const projectMember = await ProjectMember.validateUserRolesForProjectUpdate(
        userId,
        projectId

    )
    if(!projectMember){
        throw new ApiError(403, "you are not allowed to delete this project", "user is not a project admin")
    }
    try {
        console.log("***************  i am in try block ***************")
        const project = await Project.findById(projectId)
        console.log(" *************** project ***************", project);
        if(!project){
            throw new ApiError(404, "not found", "project not found faild to delete")
        }
        // delete all the tasks and subtasks related to the project
        const taskIds = await Task.find({project: projectId}).select("_id")
        console.log("*************** taskIds ***************", taskIds);
        const deletedProjects = await withTransactionSession(async(session)=>{
            await Task.deleteMany({project: projectId}, {session})
            console.log("*************** task deleted ***************");
            await SubTask.deleteMany({task:{$in: taskIds}}, {session})
            console.log("*************** subtask deleted ***************");
            await ProjectMember.deleteMany({project: projectId}, {session})
            console.log("*************** project member deleted ***************");
            const  deleteProject = await Project.findByIdAndDelete(projectId).select("_id").session(session)
            console.log("*************** project deleted ***************", deleteProject);

            return deleteProject
    
        }) 

        if(!deletedProjects){
            throw new ApiError(404, "project not found faild to delete")
        }
        return res.status(200).json(
            new ApiResponse(200, "project deleted✔", deletedProjects)
        )

        
    } catch (error) {
        console.log("___________________functoon ended __________", error)
        throw new ApiError(500, "internal server error for delete project", error.message)
        
    }
}) //Done ✔😁  TODO 
 
const addMemberToProject = asyncHandler(async (req, res) =>{
    const {projectId, memberId} = req.params;
    const userId = req.user._id

    const existprojectMember = await ProjectMember.findOne({
        user: userId,
        project: projectId,

        
    })

    if(!existprojectMember || existprojectMember.role !== UserRolesEnum.PROJECT_ADMIN){
        throw new ApiError(403, "you are not allowed to add member to this project", "user is not a project admin")
    }

    try {
        const existingMember = await ProjectMember.findOne({
            user: memberId,
            project: projectId,
        })
        if(existingMember){
            return res.status(409).json(
                new ApiError(409, "conflict", "member already exists in this project")
            )
        }
        const newProjectMember = await ProjectMember.create({
            user: memberId,
            project: projectId,


        })
        const project = await Project.findByIdAndUpdate(
            projectId, 
            {$addToSet: {members: memberId}}, // this will add the member id to the members array if it does not exist
            {new: true} // this will return the updated project
        )


        if(!newProjectMember){
            throw new ApiError(404, "not found", "project member not found faild to add")
        }

        return res.status(200).json(
            new ApiResponse(200, "project member added✔", newProjectMember, {
                message: "project member added successfully"
            })

        )
    } catch (error) {
        console.log("___________________error__________", error)
        throw new ApiError(500, "internal server error for add member to project", error.message)
        
    }



    
}) //Done ✔😁
// // i will check later why project member not added to project members array in project model

const getProjectMembers = asyncHandler(async (req, res) =>{
    const {projectId} = req.params
    const userId = req.user._id
    const projectMember = await ProjectMember.validateUserRolesForProjectUpdate(
        userId,
        projectId
    )
    if(!projectMember){
        throw new ApiError(403, "you are not allowed to get project members", "user is not a project admin")
    }
    try {
        const projectMembers = await ProjectMember.find({
            project: projectId,

        }).select("role project user").populate({
            path: "user",
            select: "_id firstName lastName email phone username" 
        }).populate(
            {
                path: "project",
                select: "_id name"
            }
        )
        if(!projectMembers){
            throw new ApiError(404, "not found", "project members not found faild to get")
        }
        return res.status(200).json(
            new ApiResponse(200, "project members✔", projectMembers)
        )
        
    } catch (error) {
        console.log("___________________error__________", error)
        throw new ApiError(500, "internal server error for get all project  project members", error.message)
        
    }
    
}) //Done ✔😁



const updateMemberRole = asyncHandler(async (req, res) =>{
    console.log("*************** update member role function started ***************")
    const {projectId, memberId} = req.params
    const {role} = req.body
    const userId = req.user._id
    // i am confused about the role validation becouse i thing i write the wring user model so i will check it letter and fix it after some time letter 
    try {
        console.log("*************** update member role function started ***************", projectId, memberId, role)
       const user = await User.findById(userId)
        console.log("*************** user ***************", user);
       if (!user||!user.isAdmin) {
            throw new ApiError(403, "you are not athourized to update this  role", "user is a project admin or admin")
        }
        const projectMember = await ProjectMember.validateUserRolesForProjectUpdate(
            userId,
            projectId
        )
        console.log("*************** projectMember ***************", projectMember);
        if(!projectMember || projectMember.role !== UserRolesEnum.PROJECT_ADMIN){
            throw new ApiError(403, "you are not allowed to update this member role", "user is not a project admin")
        }
        const updatedMember = await ProjectMember.findOneAndUpdate(

            {project: projectId, user: memberId},
            {role},
            {new: true}
        ).populate({
            path: "user",
            select: "_id firstName lastName email phone username" 
        }).populate(
            {
                path: "project",
                select: "_id name"
            }
        )
        if(!updatedMember){
            throw new ApiError(404, "not found", "project member not found faild to update")
        }
        return res.status(200).json(
            new ApiResponse(200, "project member role updated✔", updatedMember, {
                message: "project member role updated successfully"
            })
        )
    } catch (error) {
        console.log("___________________error__________", error)
        throw new ApiError(500, "internal server error for update member role", error.message)
        
    }
    
}) // this is not working yet i will fix it later 

const deleteMember = asyncHandler(async (req, res) =>{

    const {projectId, memberId} = req.params
    const userId = req.user._id 
    const projectMember = await ProjectMember.validateUserRolesForProjectUpdate(
        userId,
        projectId
    )
    if (!projectMember){
        throw new ApiError(403, "you are not allowed to delete this member", "user is not a project admin")     
    }
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        const taskIs = await Task.find({
            assignedTo: memberId,
            
        }).select("_id")
        await Task.deleteMany({assignedTo: memberId}, {session});        
        await SubTask.deleteMany({task:{$in: taskIs}}, {session});
        const deletedMember = await ProjectMember.findOneAndDelete(memberId)    
        console.log("deletedMember", deletedMember);
        if(!deletedMember){
            throw new ApiError(404, "not found", "project member not found faild to delete")
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(
            new ApiResponse(200, "project member deleted✔", deletedMember, {
                message: "project member deleted successfully"
            })
        )

    } catch (error) {
        console.log("___________________error__________", error)
        throw new ApiError(500, "internal server error for delete member", error.message)
        
    }
    
    
}) //this is not working yet i will fix it later some issue occur in this code i will fix it later

export {
    getProjects,
    getProjectById,
    creatProject,
    updateProjects,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
}
