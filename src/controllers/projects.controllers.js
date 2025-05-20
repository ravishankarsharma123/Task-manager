import { asyncHandler } from "../utils/async-handler.js";
import {Project} from "../models/project.models.js"
import {User} from "../models/users.models.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/api-respose.js"
import mongoose from "mongoose";
import { ProjectMember } from "../models/projectmember.models.js";
import { UserRolesEnum } from "../utils/constants.js";
import { withTransactionSession } from "../services/transaction.sevices.js";




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
        
            try {
                const [newProject] = await Project.create([{
                    name,
                    description,
                    createBy: _id
                }], {session});
                await ProjectMember.create([{
                    user: _id,
                    project: newProject._id,
                    role: UserRolesEnum.PROJECT_ADMIN
                }], {session});
                
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
            new ApiResponse(201, "success", "project created✔", project)
        )


        
    } catch (error) {
        console.log(" ggggggggggggggg",error)
        throw new ApiError(500, "internal server error", error.message)
        
    }
}) //Done ✔😁

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
