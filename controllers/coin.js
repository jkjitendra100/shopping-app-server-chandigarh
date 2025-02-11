import { asyncAwaitError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";
import { User } from "../models/user.js";
import { Coin } from "../models/coin.js";

export const addCoinRequest = async (req, res, next) => {
  try {
    const { amount, paymentMode, comment } = req.body;
    if (!req.file)
      return next(new ErrorHandler("Payment screenshot required", 400));

    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);

    await Coin.create({
      amount: Number(amount),
      paymentMode,
      comment,
      userId: req?.user?._id,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    res.status(200).json({
      success: true,
      message: "Request placed successfully!",
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getMyCoinRequests = asyncAwaitError(async (req, res, next) => {
  const coinRequests = await Coin.find({ userId: req.user._id });

  if (!coinRequests || coinRequests?.length == 0)
    return next(new ErrorHandler("No requests found", 404));

  res.status(200).json({
    success: true,
    data: coinRequests,
  });
});

export const getAllCoinRequests = asyncAwaitError(async (req, res, next) => {
  const { userId } = req?.query;

  const filter = {};
  if (userId) {
    filter.userId = userId;
  }

  const coinRequests = await Coin.find(filter).sort({ createdAt: -1 });

  if (!coinRequests || coinRequests?.length == 0)
    return next(new ErrorHandler("No requests found", 404));

  res.status(200).json({
    success: true,
    data: coinRequests,
  });
});

export const updateCoin = asyncAwaitError(async (req, res, next) => {
  const { coin, userId, coinId } = req.body;

  const user = await User.findById(userId);
  const existingCoin = user?.coins;
  user.coins = Number(existingCoin) + Number(coin || 0);
  await user.save();

  // Update coin status
  const coinDoc = await Coin.findByIdAndUpdate(
    coinId,
    { status: "success" },
    { new: true, runValidators: false }
  );

  res.status(200).json({
    success: true,
    message: "Coin added successfully",
    data: coinDoc,
  });
});

export const rejectCoin = asyncAwaitError(async (req, res, next) => {
  const { id } = req.params; // Document id of coin collection

  const coin = await Coin.findByIdAndUpdate(
    id,
    { status: "denied" },
    { runValidators: false, new: true }
  );

  res.status(200).json({
    success: true,
    message: "Request reject successfully",
    data: coin,
  });
});

export const UpdateCoinToUserProfile = asyncAwaitError(
  async (req, res, next) => {
    const { coin, userId } = req.body;

    const existingUser = await User.findById(userId);

    if (!existingUser) return new ErrorHandler("User not found", 404);

    const existingCoin = existingUser?.coins;

    console.log("existing User", existingUser);

    existingUser.coins = Number(existingCoin) + Number(coin || 0);
    await existingUser.save();

    res.status(200).json({
      success: true,
      message: "Coin added successfully",
    });
  }
);
