import {Router} from 'express';
import {getProjects,
    getProjectById,
    creatProject,
    updateProjects,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
} from "../controllers/projects.controllers.js";
import isAuth from "../middlewares/isAuth.js"
import {projectValidator, projectMemberRoleValidator} from "../validators/index.js"
import {validate} from "../middlewares/validator.middleware.js"
const router = Router();





router.route("/").get(isAuth, getProjects)
router.route("/new-project").post(isAuth, projectValidator(), validate,creatProject)
router.route("/members/:projectId").get(isAuth, getProjectMembers)
router.route("/update-project/:projectId").put(isAuth, projectValidator(), validate, updateProjects)
router.route("/delete-project/:projectId").delete(isAuth, deleteProject)
router.route("/:projectId/add-member/:memberId").post(isAuth, addMemberToProject) 
router.route("/:projectId/update-project-members/:memberId").post(isAuth, projectMemberRoleValidator(),validate, updateMemberRole)
router.route("/:projectId").post(isAuth, getProjectById)
router.route("/delete-member/:projectId/:memberId").delete(isAuth, deleteMember)


export default router


