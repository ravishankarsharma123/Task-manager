import { asyncHandler } from "../utils/async-handler.js";
import {Project} from "../models/project.models.js"
import {User} from "../models/users.models.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/api-respose.js"
import mongoose from "mongoose";
import { PojectMember } from "../models/projectmember.models.js";
import { UserRolesEnum } from "../utils/constants.js";




const getProjects = asyncHandler(async (req, res) =>{
    const {_id} = req.user
    try {

        const projects = await Project.find({createBy:_id})
        if(!projects){
            throw new ApiError(404, "not found", "no projects found")
        }
         return res.status(200).json({
            status: "success",
            message: "projects found✔",
            projects
         })
         
    } catch (error) {
        throw new ApiError(500, "internal server error", error.message)
    }   
})


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
         return res.status(200).json(
            new ApiResponse(200, "success", "project found✔", project)

         );
    } catch (error) {
        throw new ApiError(500, "internal server error", error.message)
        
    }    
})


const creatProject = asyncHandler(async (req, res) =>{

    const{name, description} = req.body
    const { _id } = req.user?._id // destructure the user id from the request object if it exists if not, it will be undefined
    if(!name || !description){
        throw new ApiError(400, "bad request", "name and description are required")
    }
    try {
        const axistingProject = await Project.findOne({
            name,
            createBy: _id
        })
        if(axistingProject){
            throw new ApiError(409, "conflict", "project already exists")
        }
        const project = await withTransactionSession(async (session) => {
            const [newProject]= await project.crreate([{
                name,
                description,
                createBy: _id
            }], {session});
            await PojectMember.create([{
                user: _id,
                project: newProject._id,
                role: UserRolesEnum.PROJECT_ADMIN
            }], {session});
            return newProject;
        })
        // save the project to the database

        if(!project){
            throw new ApiError(500, "internal server error", "project not created")
        }
        return res.status(201).json(
            new ApiResponse(201, "success", "project created✔", project)
        )


        
    } catch (error) {
        throw new ApiError(500, "internal server error", error.message)
        
    }
})

const updateProjects = asyncHandler(async (req, res) =>{
    
})

const deleteProject = asyncHandler(async (req, res) =>{
    
})

const addMemberToProject = asyncHandler(async (req, res) =>{
    
})

const getProjectMembers = asyncHandler(async (req, res) =>{
    
})

const updateProjectMember = asyncHandler(async (req, res) =>{
    
})

const updateMemberRole = asyncHandler(async (req, res) =>{
    
})

const deleteMember = asyncHandler(async (req, res) =>{
    
})

export {
    getProjects,
    getProjectById,
    creatProject,
    updateProjects,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateProjectMember,
    updateMemberRole,
    deleteMember
}
