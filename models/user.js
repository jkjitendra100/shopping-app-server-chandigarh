import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const user = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
  },

  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: [true, "Email already in use"],
    validate: validator.isEmail,
  },

  mobile: {
    type: Number,
    required: [false, "Please enter mobile no."],
  },

  upi: {
    type: String,
    required: [false, "Please enter UPI id"],
  },

  password: {
    type: String,
    required: [true, "Please enter password"],
    minLength: [6, "Password must be at lease six characters long"],
    select: false,
  },

  address1: {
    type: String,
    required: false,
  },

  address2: {
    type: String,
    required: false,
  },

  country: {
    type: String,
    required: false,
  },

  state: {
    type: String,
    required: false,
  },

  city: {
    type: String,
    required: false,
  },

  pinCode: {
    type: Number,
    // minLength: [6, "PIN code must be of six digits"],
    // maxLength: [6, "PIN code must be of six digits"],
    required: false,
  },

  coins: {
    type: Number,
    default: 1,
  },

  cart: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      quantity: Number,
    },
  ],

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  avatar: {
    public_id: String,
    url: String,
  },

  otp: Number,
  otp_expiry: Date,

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

user.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model("User", user);
