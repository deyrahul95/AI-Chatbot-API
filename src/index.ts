import express from "express";
import dotenv from "dotenv";
import router from "./routes";

dotenv.config();

const APP = express();
APP.use(express.json());
APP.use(router);

const PORT = process.env.PORT || 3000;

APP.listen(PORT, () => {
  console.log(`🚀 Server is running on Port: ${PORT}`);
});
