import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from "./libs/db.js";
import authRoute from "./routes/authRoute.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());

// public route
app.use('/api/auth', authRoute)
// private route


connectDB().then(() =>
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    })
)

