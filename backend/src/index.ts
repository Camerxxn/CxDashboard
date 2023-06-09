import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { authRouter } from "./api/auth";
import dotenv from "dotenv";
import path from "path";
import { userRouter } from "./api/user";
import { integrationRouter } from "./api/integration";
import client from "./db/mongo";

// .env setup
dotenv.config({"path": path.join(__dirname, "/../.env")});

// Express setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Setup API routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/integration", integrationRouter);

// Connect Mongo
app.use(async (req, res, next) => {
    await client.connect();
    next();
});

// Run Express
const PORT = Number.parseInt(process.env.API_PORT) || 3001;
app.listen(PORT, async () => {
    console.log(`Started CxDashboard on port ${PORT}`);
});