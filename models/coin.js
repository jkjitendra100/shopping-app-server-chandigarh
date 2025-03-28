import mongoose from "mongoose";

const coinSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Coin required"],
  },

  paymentMode: {
    type: String,
    required: [true, "payment mode required"],
  },

  image: { public_id: String, url: String },

  status: {
    type: String,
    default: "pending",
    enum: ["pending", "success", "denied"],
  },

  comment: {
    type: String,
  },

  userId: {
    type: mongoose.Types.ObjectId,
    required: [true, "User id required"],
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

export const Coin = mongoose.model("Coin", coinSchema);
