import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({}, { timestamps: true })

export default mongoose.model("Message", messageSchema);