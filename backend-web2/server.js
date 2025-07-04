import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './router.js';

dotenv.config();
const MONGODB_KEY = process.env.MONGODB_KEY;
mongoose.connect(MONGODB_KEY).then(() => {
  console.log("Connected to MongoDB");
}
).catch(err => {
  console.error("Error connecting to MongoDB:", err);
}
);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders : ["Content-Type", "Authorization", "Cache-Control", "Expires ", "Pragma"],  
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`MetaMint backend running on port ${PORT}`);
});
