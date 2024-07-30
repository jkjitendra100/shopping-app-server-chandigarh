import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Coin required"],
  },

  status: {
    type: String,
    enum: ["pending", "paid", "rejected"],
    default: "pending",
  },

  userId: {
    type: mongoose.Types.ObjectId,
    required: [true, "User id required"],
  },

  upiId: {
    type: String,
  },

  nameOnUpi: {
    type: String,
  },

  name: {
    type: String,
  },

  email: {
    type: String,
  },

  mobile: {
    type: String,
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

export const Withdraw = mongoose.model("Withdraw", withdrawSchema);
