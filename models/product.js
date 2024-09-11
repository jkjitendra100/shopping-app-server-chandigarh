import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
  },

  description: {
    type: String,
    required: [true, "Please enter product description"],
  },

  price: {
    type: Number,
    required: [true, "Please enter product price"],
  },

noOfPlayersToBeSelected: {
    type: Number,
  },

  players: [String],

  images: [{ public_id: String, url: String }],

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Product = mongoose.model("Product", schema);
