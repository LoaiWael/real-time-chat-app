import { getAuth } from "@clerk/express";
import User from "../models";

export async function protectedRoute(req, res, nxt) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" })
      return;
    }

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      res.status(404).json({ message: "user not found" })
      return;
    }

    req.user = user

    nxt();
  } catch (err) {
    console.error("Error in the protectedRoute middleware", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}