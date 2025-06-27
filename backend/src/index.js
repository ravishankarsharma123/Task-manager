import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './db/db.connect.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 5000;
connectDB()
.then(() =>{
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})
.catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
});

