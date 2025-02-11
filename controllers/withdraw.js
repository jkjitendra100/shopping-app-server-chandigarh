import { asyncAwaitError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { Withdraw } from "../models/withdraw.js";
import { User } from "../models/user.js";

export const addWithdrawRequest = asyncAwaitError(async (req, res, next) => {
  const { amount, upiId, nameOnUpi, name, email, mobile } = req.body;

  console.log(amount, req.user?.coins);
  if (Number(amount) > Number(req?.user?.coins)) {
    return next(new ErrorHandler("You don't have enough coin to withdraw"));
  }

  await Withdraw.create({
    amount: Number(amount),
    userId: req?.user?._id,
    upiId,
    nameOnUpi,
    name,
    email,
    mobile,
  });

  const user = await User.findById(req?.user?._id);
  user.coins = user.coins - Number(amount);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Request placed successfully!",
  });
});

export const markAsPaid = asyncAwaitError(async (req, res, next) => {
  const { requestId } = req.params;

  const request = await Withdraw.findById(requestId);
  request.status = "paid";
  request.updatedAt = Date.now();

  await request.save();

  res.status(200).json({
    success: true,
    message: "Amount paid successfully!",
    data: request,
  });
});

export const getAllRequests = asyncAwaitError(async (req, res, next) => {
  const { pageNo = 1, pageSize = 10, userId } = req.query;

  const filter = {};

  if (userId) {
    filter.userId = userId;
  }

  const requests = await Withdraw.find(filter)
    .skip((Number(pageNo) - 1) * Number(pageSize))
    .limit(Number(pageSize))
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: requests,
  });
});
