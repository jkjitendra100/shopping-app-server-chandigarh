import mongoose from "mongoose";

const accountDeletionSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: [false, "Reason required"],
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

export const AccountDeletion = mongoose.model(
  "AccountDeletion",
  accountDeletionSchema
);
