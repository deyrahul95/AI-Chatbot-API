import express, { type Request, type Response } from "express";

const APP = express();
const PORT = 3000;

APP.get("/", (req: Request, res: Response) => {
  res.json({
    status: "Success",
    message: "Welcome to Express API with BUN",
  });
});

APP.listen(PORT, () => {
  console.log(`🚀 Server is running on Port: ${PORT}`);
});
