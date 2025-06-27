import {Router} from 'express';
import healthCheck from '../controllers/healthcheck.controllers.js'; // Ensure this path is correct
const router = Router();

// Define the healthcheck route
router.get('/', healthCheck);



export default router;
