import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sederId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reciverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String
  },
  image: {
    type: String
  },
  video: {
    type: String
  },
}, { timestamps: true })

export default mongoose.model("Message", messageSchema);