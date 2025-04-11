import e from 'cors';
import {body} from 'express-validator';


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









export {userRegistrationValidator, userLoginValidator}