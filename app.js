import express from "express";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({ path: "./data/config.env" });

export const app = express();

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send("Default Route");
});

// Import Routes
import user from "./routes/user.js";
import product from "./routes/product.js";
import order from "./routes/order.js";
import Payment from "./routes/payment.js";
import coin from "./routes/coin.js";
import withdraw from "./routes/withdraw.js";
import accountDeletion from "./routes/accountDeletion.js";

app.use("/api/v1/user", user);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);
app.use("/api/v1/payment", Payment);
app.use("/api/v1/coin", coin);
app.use("/api/v1/withdraw", withdraw);
app.use("/api/v1/accountDeletion", accountDeletion);

// Error middleware
app.use(errorMiddleware);
