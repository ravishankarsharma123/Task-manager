import express from 'express';
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// routres imports 
import healthCheckRouter from './routes/healthcheck.routes.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import taskRouter from './routes/task.routes.js';
import noteRouter from './routes/note.routes.js';



app.use("/api/v1", authRouter);
app.use("/api/v1", healthCheckRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("api/v1/subtasks", taskRouter)
app.use("/api/v1/notes", noteRouter);



export default app;
