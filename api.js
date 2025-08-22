
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./Routers/authRouter');
const adminRouter = require('./Routers/adminRouter');
const userRouter = require('./Routers/userRouter');
const ownerRouter = require('./Routers/ownerRouter');

const app = express();

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jtyx5j9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(dbLink)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000", // local dev
    "https://roxiler-systems-frontend-theta.vercel.app" // deployed frontend
  ],
  credentials: true,
}));

app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});