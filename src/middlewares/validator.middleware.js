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
    throw new ApiError(422, "Validation Error", extractedErrors)
}




// const extractedErrors = []
// errors.array().map((err) => 
//     extractedErrors.push({ 
//         [err.path]: err.msg 
//     }),
// );
