import {Router} from 'express';
const router = Router();
import validtaeProjectPermissions from '../middlewares/authRole.middleware.js';
import UserRolesEnum from "../utils/constants.js"
import { 
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    
    getNoteByUserId,
    getNoteByProjectIdAndUserId,
     } from '../controllers/note.controllers.js';


export default router

router.route("/:prokectId")
.get(validtaeProjectPermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),getNotes)
.post(validtaeProjectPermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createNote);
router.route("/:noteId")
.get(validtaeProjectPermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]), getNoteById)
.put(validtaeProjectPermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), updateNote)
.delete(validtaeProjectPermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteNote);
router.route("/:userId").get(validtaeProjectPermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]), getNoteByUserId);
router.route("/:projectId/users/:userId")
.get(validtaeProjectPermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]), getNoteByProjectIdAndUserId)



