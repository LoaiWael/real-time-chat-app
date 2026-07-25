import express from "express";
import "dotenv/config";
import connectDB from "./lib/db.js";
import { clerkMiddleware } from '@clerk/express'
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

app.get("/health", (_, res) => {
  res.status(200).json({ ok: true })
})

app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
  await connectDB();
});