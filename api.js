const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./Routers/authRouter');
const adminRouter = require('./Routers/adminRouter');
const userRouter = require('./Routers/userRouter');
const ownerRouter = require('./Routers/ownerRouter');

const app = express();
dotenv.config();

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jtyx5j9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(dbLink)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter); // changed from "/api/post"

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
