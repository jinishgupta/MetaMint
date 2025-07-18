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
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1); // Trust first proxy for secure cookies on Render

app.use(cors({
  origin: ["https://metamint-frontend.onrender.com", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Expires", "Pragma"],
  credentials: true,
  exposedHeaders: ["Set-Cookie"]
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`MetaMint backend running on port ${PORT}`);
});
