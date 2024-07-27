import { asyncAwaitError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { Withdraw } from "../models/withdraw.js";

export const addWithdrawRequest = asyncAwaitError(async (req, res, next) => {
  const { amount } = req.body;

  if (Number(amount) > Number(req?.user?.coins)) {
    return next(new ErrorHandler("You don't have enough coin to withdraw"));
  }

  await Withdraw.create({
    amount: Number(amount),
    userId: req?.user?._id,
  });

  res.status(200).json({
    success: true,
    message: "Request placed successfully!",
  });
});
