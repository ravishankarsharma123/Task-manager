import {Router} from 'express';
import {getProjects,
    getProjectById,
    creatProject
} from "../controllers/projects.controllers.js";
import isAuth from "../middlewares/isAuth.js"
import {projectValidator} from "../validators/index.js"
import {validate} from "../middlewares/validator.middleware.js"
const router = Router();





router.route("/").get(isAuth, getProjects)
router.route("/:projectId").get(isAuth, getProjectById)
router.route("/new-project").post(isAuth,projectValidator(), validate,creatProject)



export default router
