import {Router} from 'express';
import {getProjects,
    getProjectById,
    creatProject,
    updateProjects,
    deleteProject,
    addMemberToProject,
    getProjectMembers
} from "../controllers/projects.controllers.js";
import isAuth from "../middlewares/isAuth.js"
import {projectValidator} from "../validators/index.js"
import {validate} from "../middlewares/validator.middleware.js"
const router = Router();





router.route("/").get(isAuth, getProjects)
router.route("/new-project").post(isAuth, projectValidator(), validate,creatProject)
router.route("/update-project/:projectId").put(isAuth, projectValidator(), validate, updateProjects)
router.route("/:projectId").post(isAuth, getProjectById)
router.route("/delete-project/:projectId").delete(isAuth, deleteProject)
router.route("/:projectId/add-member/:memberId").post(isAuth, addMemberToProject) 
router.route("/members/:projectId").get(isAuth, getProjectMembers)



export default router


