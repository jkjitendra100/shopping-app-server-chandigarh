import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Coin required"],
  },

  status: {
    type: String,
    default: "pending",
    enum: ["pending", "accepted", "rejected"],
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

export const Withdraw = mongoose.model("Withdraw", withdrawSchema);
