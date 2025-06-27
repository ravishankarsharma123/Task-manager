import { validationResult } from "express-validator"
import ApiError from "../utils/ApiError.js"
export const validate = (req, res, next) => {
    
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() })
        return next()

    }
    const extractedErrors = []
    errors.array().map(err => {
        extractedErrors.push({ 
            [err.path]: err.msg 
            
        });
    });
    console.log(...extractedErrors)
    throw new ApiError(422, "Validation Error", errors.array(), extractedErrors)
    next()
}




// const extractedErrors = []
// errors.array().map((err) => 
//     extractedErrors.push({ 
//         [err.path]: err.msg 
//     }),
// );
