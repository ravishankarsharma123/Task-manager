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
        const project = await Project.findByIdAndDelete(projectId)
        if(!project){
            throw new ApiError(404, "not found", "project not found faild to delete")
        }
        // delete all the tasks and subtasks related to the project
        const taskIds = await Task.find({project: projectId}).select("_id")
        const deletedProjects = await withTransactionSession(async(session)=>{
            await Task.deleteMany({project: projectId}, {session})
            await SubTask.deleteMany({task:{$in: taskIds}}, {session})
            await ProjectMember.deleteMany({project: projectId}, {session})
            const  deleteProject = await Project.findByIdAndDelete(projectId).select(projectId).session(session)
            return deleteProject
    
        }) 

        if(!deletedProjects){
            throw new ApiError(404, "project not found faild to delete")
        }
        return res.status(200).json(
            new ApiResponse(200, "project deleted✔", deletedProjects)
        )

        
    } catch (error) {
        console.log("___________________error__________", error)
        throw new ApiError(500, "internal server error for delete project", error.message)
        
    }
}) //Done ✔😁  but proper not working so will check ltter 
 
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
        const newProjectMember = await ProjectMember.create({
            user: memberId,
            project: projectId,
        })


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
// // i will check later why project member not added to project members array

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
            project: projectId
            // i dont want to send all infromation about the user in want to send only the user id, firstName, lastName, email and role

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
    const {projectId, memberId} = req.params
    const {role} = req.body
    
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
    updateMemberRole,
    deleteMember
}
