import e from 'cors';
import {body} from 'express-validator';
import {AvailableUserRoles} from "../utils/constants.js";



const userRegistrationValidator = () =>{
    return [
        // email validation 
        body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .notEmpty().withMessage('Email is required'),

        // username validation
        body('username')
        .trim()
        .isLength({min: 3}).withMessage('Username must be at least 3 characters long')
        .notEmpty().withMessage('Username is required'),

        // password validation 
        body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({min: 6}).withMessage('Password must be at least 6 characters long'),

        // role validation
        body('role')
        .trim()
        .notEmpty().withMessage('Role is required')
    ]
}


const userLoginValidator = () =>{
    return [
        // email validation 
        body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .notEmpty().withMessage('Email is required'),

        // password validation 
        body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({min: 6}).withMessage('Password must be at least 6 characters long')
    ]
}

const projectValidator = () =>{
    return[
        // name validation 
        body('name')
        .trim()
        .isLength({min: 3}).withMessage('Name must be at least 3 characters long')
        .notEmpty().withMessage('Name is required'),

        // description validation 
        body('description')
        .trim()
        .isLength({min: 10}).withMessage('Description must be at least 10 characters long')
        .notEmpty().withMessage('Description is required'),

        // createBy validation
        // body('createBy')
        // .trim()
        // .notEmpty().withMessage('CreateBy is required'),
    ]
}

const projectMemberRoleValidator = () =>{
    return [
        // role validation
        body('role')
        .trim()
        .notEmpty().withMessage('Role is required')
        .isIn(AvailableUserRoles).withMessage('Role must be either admin or member')
    ]
}

const taskValidator = () => {
    return [
        // title validation
        body('title')
        .trim()
        .isLength({min: 3}).withMessage('Title must be at least 3 characters long')
        .notEmpty().withMessage('Title is required'),

        // description validation
        body('description')
        .trim()
        .isLength({min: 10}).withMessage('Description must be at least 10 characters long')
        .notEmpty().withMessage('Description is required'),

        // projectId validation
        body('projectId')
        .trim()
        .notEmpty().withMessage('Project ID is required'),

        // assignedTo validation
        body('assignedTo')
        .trim()
        .notEmpty().withMessage('Assigned To is required'),

        // status validation
        body('status')
        .trim()
        .notEmpty().withMessage('Status is required'),
    ]
}








export {userRegistrationValidator, userLoginValidator, projectValidator,projectMemberRoleValidator, taskValidator}