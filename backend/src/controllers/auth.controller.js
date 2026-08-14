export async function checkAuth(req, res, nxt) {
  const user = req.user

  if (!user) {
    res.status(401).json({ message: "Unauthorized" })
  }

  res.status(200).json(user);
}