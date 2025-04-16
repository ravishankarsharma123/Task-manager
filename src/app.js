import express from 'express';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// routres imports 
import healthCheckRouter from './routes/healthcheck.routes.js';
import authRouter from './routes/auth.routes.js';



app.use("/api/v1", authRouter);

export default app;
