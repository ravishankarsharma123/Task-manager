import { asyncHandler } from "../utils/async-handler";
import { ProjectNote } from "../models/note.models";
import ApiError from "../utils/ApiError";
import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";
import {Project} from "../models/project.models.js";

const getNotes = asyncHandler(async (req, res) => {
    const { projectId} = req.params;
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new ApiError(404, "Project not found");
        }
        const notes = ProjectNote.findOne({
            project: new mongoose.Types.ObjectId(projectId),
        
        }).populate("createdBy", "name email role");
        if (!notes) {
            throw new ApiError(404, "No notes found for this project");
        }
        res.status(200).json(new ApiResponse(200, "Notes fetched successfully", notes));
    } catch (error) {
        throw new ApiError(500, "Error fetching notes");    
        
    }
});

const getNoteById = asyncHandler(async (req, res) => {
    const {notesId} = req.params;
    try {
        const note = await ProjectNote.findById(notesId);
        if (!note) {
            throw new ApiError(404, "Note not found");
        }
        res.status(200).json(new ApiResponse(200, "Note fetched successfully", note));
    } catch (error) {
        throw new ApiError(500, "Error fetching note");    
        
    }

});


const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new ApiError(404, "Project not found");
        }
        const note = await ProjectNote.create({
            project: new mongoose.Types.ObjectId(projectId),
            createdBy: new mongoose.Types.ObjectId(req.user._id),
            content: content,
        })

        if (!note) {
            throw new ApiError(500, "Error creating note");
        }
        // await note.save();

        const populatedNote = await ProjectNote.findById(note._id).populate("createdBy", "name email role");
        res.status(200).json(new ApiResponse(200, "Note created successfully", populatedNote));

        
    } catch (error) {
        throw new ApiError(500, "Error creating note");
        
    }
});

const updateNote = asyncHandler(async (req, res) => {
    const { notesId } = req.params;
    const { content } = req.body;

    try {
        const note = await ProjectNote.findById(notesId);
        if (!note) {
            throw new ApiError(404, "Note not found");
        }
        note.content = content || note.content;
        // await note.save();

        const updatedNote = await ProjectNote.findById(note._id).populate("createdBy", "name email role");
        res.status(200).json(new ApiResponse(200, "Note updated successfully", updatedNote));
    } catch (error) {
        throw new ApiError(500, "Error updating note");
    }

})


const deleteNote = asyncHandler(async (req, res) => {
    const { notesId} = req.params;
    try {
        const note = await ProjectNote.findByIdAndDelete(notesId);
        if (!note) {
            throw new ApiError(404, "Note not found");
        }
        res.status(200).json(new ApiResponse(200, "Note deleted successfully",note));
    } catch (error) {
        throw new ApiError(500, "Error deleting note");
    }

});



const getNoteByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    try {
        const notes = await ProjectNote.find({ createdBy: new mongoose.Types.ObjectId(userId) })
            .populate("createdBy", "name email role");
        if (!notes || notes.length === 0) {
            throw new ApiError(404, "No notes found for this user");
        }
        res.status(200).json(new ApiResponse(200, "Notes fetched successfully", notes));
    } catch (error) {
        throw new ApiError(500, "Error fetching notes for user");
    }

});


const getNoteByProjectIdAndUserId = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;
    try {
        const notes = await ProjectNote.find({
            project: new mongoose.Types.ObjectId(projectId),
            createdBy: new mongoose.Types.ObjectId(userId)
        }).populate("createdBy", "name email role");
        
        if (!notes || notes.length === 0) {
            throw new ApiError(404, "No notes found for this project and user");
        }
        res.status(200).json(new ApiResponse(200, "Notes fetched successfully", notes));
    } catch (error) {
        throw new ApiError(500, "Error fetching notes for project and user");
    }
});




export {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    getNoteByUserId,
    getNoteByProjectIdAndUserId,
    
};





