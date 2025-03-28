import mongoose from "mongoose";

const model = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Amount required"],
  },

  paymentMode: {
    type: String,
    required: [true, "Payment mode required"],
  },

  verificationStatus: {
    type: String,
    enum: ["verified", "not verified", "accepted", "rejected"],
    default: "not verified",
  },

  screenshot: {
    public_id: String,
    url: String,
  },

  userId: {
    type: String,
    required: [true, "User ID required"],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Payment = mongoose.model("Payment", model);
