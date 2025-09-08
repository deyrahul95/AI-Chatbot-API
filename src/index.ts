import express, { type Request, type Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const APP = express();
const PORT = process.env.PORT || 3000;

APP.use(express.json());


APP.get("/", (req: Request, res: Response) => {
  res.json({
    status: "Success",
    message: "Welcome to Express API with BUN",
  });
});

APP.listen(PORT, () => {
  console.log(`🚀 Server is running on Port: ${PORT}`);
});
