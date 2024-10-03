import mongoose from "mongoose";

const schema = new mongoose.Schema({
  selectedPlayers: [String],

  orderItems: [
    {
      name: {
        type: String,
        required: false,
      },

      price: {
        type: Number,
        required: false,
      },

      quantity: {
        type: Number,
        required: false,
      },

      image: {
        type: String,
        required: false,
      },

      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false,
      },
    },
  ],

  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: false,
  },

  paymentMethod: {
    type: String,
    enum: ["CARD", "UPI", "COIN"],
    default: "COIN",
  },

  itemsPrice: {
    type: Number,
    required: false,
  },

  taxPrice: {
    type: Number,
    required: false,
  },

  totalAmount: {
    type: Number,
    required: false,
  },

  acceptedByUserId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  question1: {
    type: String,
  },

  question2: {
    type: String,
  },

  question3: {
    type: String,
  },

  question4: {
    type: String,
  },

  // Joined by username
  username: {
    type: String,
  },

  winAmount: {
    type: Number,
    default: 0,
  },

  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  joinedAt: {
    type: Date,
  },

  winScreenShorts: [
    {
      imageUrl: String,
      updatedAt: Date,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Order = mongoose.model("Order", schema);
