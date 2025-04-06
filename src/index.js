import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './db/db.connect.js';

dotenv.config({ path: './.env' });

connectDB()
.then()
.catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
});
const PORT = process.env.PORT || 5000;
