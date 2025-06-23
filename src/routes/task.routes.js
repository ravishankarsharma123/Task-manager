import {Router} from 'express';

import {taskValidator} from '../validators/index.js';
import {validate} from '../middlewares/validator.middleware.js';


import {
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

} from "../controllers/task.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.route("/").get(isAuth, getTasks);
router.route("/create-task").post(isAuth, taskValidator(), validate, createTask);
router.route("/update-task/:taskId").put(isAuth, taskValidator(), validate, updateTask);
router.route("/delete-task/:taskId").delete(isAuth, deleteTask);
router.route("/status/:taskId").put(isAuth, taskStatus);
router.route("/project/:projectId").get(isAuth, getTaskByProjectId);


// Subtask routes
router.route("/subtasks").get(isAuth, getAllSubTasks);
router.route("/subtasks/create").post(isAuth, taskValidator(), validate, createSubTask);
router.route("/subtasks/update/:id").put(isAuth, taskValidator(), validate, updateSubTask);
router.route("/subtasks/delete/:id").delete(isAuth, deleteSubTask);

router.route("/:taskId").get(isAuth, getTaskById);



export default router
