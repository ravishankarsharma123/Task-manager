import { asyncHandler } from "../utils/async-handler";



const getTasks = asyncHandler(async (req, res) => {
    // Get all tasks from the database
    const tasks = await Task.find();
    res.status(200).json(tasks);
}
);       


const getTaskById = asyncHandler(async (req, res) => { 
});


const createTask = asyncHandler(async (req, res) => {
});


const updateTask = asyncHandler(async (req, res) => {
});

const deleteTask = asyncHandler(async (req, res) => {
});

const taskStatus = asyncHandler(async (req, res) => {
});

const getTaskByProjectId = asyncHandler(async (req, res) => {
}
);



