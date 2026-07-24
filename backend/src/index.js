import express from "express";
import mongoose from 'mongoose';
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Database connected');
}).catch((error) => {
  console.log(error);
})