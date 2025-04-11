import {Router} from 'express';
import {registerUser} from "../controllers/auth.controllers.js"
import {validate} from "../middlewares/validator.middleware.js"
import {userRegistrationValidator} from "../validators/index.js"
const router = Router();


// we use a factory pattern to create the routes uaerRegistrationValidator is a middleware function that validates the request body and returns an array of errors if any if there are errors, it returns a 422 status code with the errors in the response body and if we not run explicitly the next function, it will not run the next middleware function in the stack so response will allways empaty and the next function will not run so we need to call the next function in the stack to run the next middleware function in the stack if there are no errors, it calls the next middleware function in the stack 
// if there are no errors, it calls the next middleware function in the stack



router.post('/register',userRegistrationValidator(), validate, registerUser)
export default router
