import { asyncHandler } from "../utils/async-handler.js";
import {Task} from "../models/task.models.js";
import mongoose from "mongoose";
import uploadeFileToCloudinary from "../services/cloudinary.services.js";

import ApiError from "../utils/ApiError.js";   
import {ApiResponse} from "../utils/api-respose.js"
import { SubTask } from "../models/subtask.models.js";




const getTasks = asyncHandler(async (req, res) => {
    // Get all tasks from the database
    const userId = req.user?.id;
    try {
         const allTask = await Task.find({
            $or: [
                { assignedTo: userId },
                { assignedBy: userId }
            ]
         }).populate("assignedTo", "name email")
            .populate("assignedBy", "name email")
            .populate("project", "name description")
            .populate("subTasks");

        if (!allTask || allTask.length === 0) {
            throw new ApiError(404, "No tasks found for this user", "Please check your assigned tasks or assigned by tasks.");          
        }    

        return res.status(200).json(new ApiResponse(200, "Tasks found", allTask));


    } catch (error) {
        console.log("Error in getTasks controller:", error);
        throw new ApiError(500, "Internal Server Error", error.message);        
        
    }
    
}
);       


const getTaskById = asyncHandler(async (req, res) => { 
    const taskId = req.params.id;
    
    try {
        const task = await Task.findById(taskId)
            .populate("assignedTo", "name email")
            .populate("assignedBy", "name email")
            .populate("project", "name description")
            .populate("subTasks");

        if (!task) {
            throw new ApiError(404, "Task not found with this id");
        }

        return res.status(200).json(new ApiResponse(200, "Task found", task));  
        
    } catch (error) {
        throw new ApiError(500, "somthing went wrong in get tak by id controller ", error.message);        
    }
});


const createTask = asyncHandler(async (req, res) => {
    console.log("************** createTask controller **************");
    const userId = req.user?.id;
    const {title, description, projectId, assignedTo, status } = req.body;
    console.log("title", title, "description", description, "projectId", projectId, "assignedTo", assignedTo, "status", status);

    try {

        const task  = await Task.create({
            title,
            description,
            project: projectId,
            assignedTo: assignedTo,
            assignedBy: userId,
            status
            
        })
        console.log("task created", task);
        
         const attachments = req.files.map((file) => file)
         if (attachments && attachments.length > 0) {
            const attachmentsurls = await Promise.all(
                attachments.map((file) => uploadeFileToCloudinary(file))
            
            )
            task.attachments.url = attachmentsurls.filter(Boolean)
             awaittask.save();
         }

        if (!task) {
            throw new ApiError(400, "Failed to create task");
        }

         
         return res.status(201).json(new ApiResponse(201, "Task created successfully", task));
         
        // Populate the task with related data
        
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error for create task and check your create task controller", error.message);        
    }
    
});


const updateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const userId = req.user?.id;
    const { title, description, projectId, assignedTo, status } = req.body;
    const attachments = req.files.map((file) => file);

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            {
                _id: taskId, assignedBy: userId
            },
            {
                $set: {
                    title,
                    description,
                    project: projectId,
                    assignedTo: assignedTo,
                    status
                },
            },
            {new: true}
        )
        if (!updatedTask) {
            throw new ApiError(404, "Task not found or you are not authorized to update this task");
        }

        if (attachments > 0 ){
            const attachmentsurls = await Promise.all(
                attachments.map((file) => uploadeFileToCloudinary(file))
            )
            updatedTask.attachments.url = attachmentsurls.filter(Boolean);
        }
        await updatedTask.save();
        return res.status(200).json(new ApiResponse(200, "Task updated successfully", updatedTask));


        
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error for update task and check your update task controller", error.message);        
        
    }

});

const deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const userId = req.user?.id;
    try {
        const deletedTask = await Task.findOneAndDelete({
            _id: taskId
        });

        if (!deletedTask) {
            throw new ApiError(404, "Task not found or you are not authorized to delete this task");
        }

        return res.status(200).json(new ApiResponse(200, "Task deleted successfully", deletedTask));
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error for delete task and check your delete task controller", error.message);        
        
    }
    
});

const taskStatus = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new ApiError(404, "Task not found with this id");
        }
        const taskStatus = task.status;
        return res.status(200).json(new ApiResponse(200, "Task status found", { taskId, status: taskStatus })); 
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error for task status and check your task status controller", error.message);        
        
    }
});

const getTaskByProjectId = asyncHandler(async (req, res) => {
}
);

// subTasks controller

const getAllSubTasks = asyncHandler(async (req, res) =>{

    const taskId = req.params.taskId;
    try {
        const subTasks = await SubTask.find({ task: taskId })
            .populate("createdBy", "name email")
            .populate("task", "title description");

        if (!subTasks || subTasks.length === 0) {
            throw new ApiError(404, "No subtasks found for this task");
        }

        return res.status(200).json(new ApiResponse(200, "Subtasks found", subTasks));
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error for get all subtasks", error.message);        
    }

})
const createSubTask = asyncHandler(async (req, res) =>{
    const { title, taskId, status } = req.body;
    const userd = req.user?.id;
    try {
        const subTask = await SubTask.create({
            title,
            task: taskId,
            createdBy: userd,
            isCompleted: status || false
        });

        if (!subTask) {
            throw new ApiError(400, "Failed to create subtask");
        }

        return res.status(201).json(new ApiResponse(201, "Subtask created successfully", subTask));
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error for create subtask", error.message);        
        
    }
})

const updateSubTask = asyncHandler(async (req, res) =>{
    const subTaskId = req.params.id;
    const { title, isCompleted } = req.body;
    const userId = req.user?.id;
    try {
        
        const updatedSubTask = await SubTask.findOneAndUpdate(
            {
                _id: subTaskId, createdBy: userId

            },
            {
                $set:{
                    title,
                    isCompleted
                }
            },
            { new: true }
            
        )
        if (!updatedSubTask) {
            throw new ApiError(404, "Subtask not found or you are not authorized to update this subtask");
        }
        return res.status(200).json(new ApiResponse(200, "Subtask updated successfully", updatedSubTask));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error for update subtask", error.message);        
        
    }

})
const deleteSubTask = asyncHandler(async (req, res) =>{
    const subTaskId = req.params.id;
    const userId = req.user?.id;
    try {
        const deletedSubTask = await SubTask.findOneAndDelete({
            _id: subTaskId, createdBy: userId
        });

        if (!deletedSubTask) {
            throw new ApiError(404, "Subtask not found or you are not authorized to delete this subtask");
        }

        return res.status(200).json(new ApiResponse(200, "Subtask deleted successfully", deletedSubTask));
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error for delete subtask", error.message);        
        
    }

})


export {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    taskStatus,
    getTaskByProjectId,
    getAllSubTasks,
    createSubTask,
    updateSubTask,
    deleteSubTask
}

