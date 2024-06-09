import { asyncAwaitError } from "../middlewares/error.js";
import { Payment } from "../models/payment.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const newPayment = asyncAwaitError(async (req, res, next) => {
  const { amount, paymentMode } = req.body;
  const file = req.file;

  let screenshot = undefined;
  if (file) {
    const tempFile = getDataUri(file);
    const cloudData = await cloudinary.v2.uploader.upload(tempFile.content);
    screenshot = {
      public_id: cloudData?.public_id,
      url: cloudData?.secure_url,
    };
  }

  const payment = await Payment.create({
    userId: req.user._id,
    amount,
    paymentMode,
    screenshot,
  });

  res.status(201).json({
    success: true,
    message: "Payment created successfully",
    payment,
  });
});

export const updatePayment = asyncAwaitError(async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  const file = req.file;

  let screenshot = undefined;
  if (file) {
    const tempFile = getDataUri(file);
    const cloudData = await cloudinary.v2.uploader.upload(tempFile.content);
    screenshot = {
      public_id: cloudData?.public_id,
      url: cloudData?.secure_url,
    };
  }

  const payment = await Payment.findByIdAndUpdate(id, update, { new: true });

  res.status(201).json({
    success: true,
    message: "Payment updated successfully",
    payment,
  });
});
