import { asyncAwaitError } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import ErrorHandler from "../utils/error.js";
import { User } from "../models/user.js";
import { Product } from "../models/product.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const createOrder = asyncAwaitError(async (req, res, next) => {
  const {
    // shippingInfo,
    orderItems,
    itemsPrice,
    taxPrice,
    selectedPlayers,
    totalAmount,
    question1,
    question2,
    question3,
    question4,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (user?.coins < totalAmount)
    return next(
      new ErrorHandler("You don't have sufficient coin to order this item", 400)
    );

  await Order.create({
    user: req.user._id,
    orderItems,
    itemsPrice,
    taxPrice,
    selectedPlayers,
    totalAmount,
    question1,
    question2,
    question3,
    question4,
    status: "pending",
  });

  // Decrease user coins
  user.coins = user.coins - totalAmount;
  await user.save();

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
  });
});

export const getAdminOrders = asyncAwaitError(async (req, res, next) => {
  const { pageNo } = req?.params;
  let limit = 10;
  let skip = (pageNo - 1) * limit;
  const orders = await Order.find({})
    .populate("orderItems.product")
    .populate("user")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  let totalCount = await Order.countDocuments();

  if (!orders) return next(new ErrorHandler("No order found", 404));

  res.status(200).json({
    success: true,
    orders,
    totalCount,
  });
});

export const getAllOrders = asyncAwaitError(async (req, res, next) => {
  const { pageNo } = req?.params;
  let limit = 50;
  let skip = (pageNo - 1) * limit;

  const orders = await Order.find({
    acceptedByUserId: { $exists: true, $ne: req.user._id },
  })
    .populate("orderItems.product")
    .populate("user")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  let totalCount = await Order.countDocuments({
    acceptedByUserId: { $exists: true, $eq: [] },
  });

  res.status(200).json({
    success: true,
    orders,
    totalCount,
  });
});

export const getAllAcceptedOrders = asyncAwaitError(async (req, res, next) => {
  const { pageNo } = req?.params;
  let limit = 50;
  let skip = (pageNo - 1) * limit;

  const orders = await Order.find({
    $or: [
      { acceptedByUserId: { $in: [req?.user?._id] } }, // Check if user is in acceptedByUserId array
      { user: req?.user?._id }, // Check if user field matches user ID
    ],
  })
    .populate("orderItems.product")
    .populate("user")
    .populate("acceptedByUserId")
    .sort({ joinedAt: -1 })
    .skip(skip)
    .limit(limit);

  let totalCount = await Order.countDocuments({
    acceptedByUserId: { $exists: true, $ne: null, $ne: [] },
  });

  if (!orders) return next(new ErrorHandler("No order found", 404));

  res.status(200).json({
    success: true,
    orders,
    totalCount,
  });
});

export const getMyCreatedChallenges = asyncAwaitError(
  async (req, res, next) => {
    const { pageNo } = req?.params;
    let limit = 10;
    let skip = (pageNo - 1) * limit;

    const orders = await Order.find({
      user: req?.user?._id,
    })
      .populate("orderItems.product")
      .populate("user")
      .populate("acceptedByUserId")
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(limit);

    let totalCount = await Order.countDocuments({
      acceptedByUserId: { $exists: true, $ne: null, $ne: [] },
    });

    if (!orders) return next(new ErrorHandler("No order found", 404));

    res.status(200).json({
      success: true,
      orders,
      totalCount,
    });
  }
);

export const getAllAdminAcceptedOrders = asyncAwaitError(
  async (req, res, next) => {
    const { pageNo } = req?.params;
    let limit = 10;
    let skip = (pageNo - 1) * limit;

    const orders = await Order.find({
      // acceptedByUserId: { $in: [req?.user?._id] },
    })
      .populate("orderItems.product")
      .populate("user")
      .populate("acceptedByUserId")
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(limit);

    let totalCount = await Order.countDocuments({
      acceptedByUserId: { $exists: true, $ne: null, $ne: [] },
    });

    if (!orders) return next(new ErrorHandler("No order found", 404));

    res.status(200).json({
      success: true,
      orders,
      totalCount,
    });
  }
);

export const getMyOrders = asyncAwaitError(async (req, res, next) => {
  const { pageNo } = req?.params;
  let limit = 10;
  let skip = (pageNo - 1) * limit;
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  let totalCount = await Order.countDocuments({ user: req.user._id });

  if (!orders || orders?.length === 0)
    return next(new ErrorHandler("No order found", 404));

  res.status(200).json({
    success: true,
    orders,
    totalCount,
  });
});

export const getOrderDetails = asyncAwaitError(async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorHandler("Please provide order id", 400));

  const order = await Order.findById(req.params.id)
    .populate("user")
    .populate("orderItems.product")
    .populate("acceptedByUserId");

  if (!order) return next(new ErrorHandler("No order found", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

export const deleteOrder = asyncAwaitError(async (req, res, next) => {
  let { orderId } = req.query;

  const order = await Order.findById(orderId);
  if (order) {
    await order.deleteOne();
  } else {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order deleted successfully!",
  });
});

export const processOrder = asyncAwaitError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("No order found", 404));

  if (order.orderStatus === "Preparing") order.orderStatus = "Shipped";
  else if (order.orderStatus === "Shipped") {
    (order.orderStatus = "Delivered"),
      (order.deliveredAt = new Date(Date.now()));
  } else return next(new ErrorHandler("Order already delivered", 400));

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order processed successfully",
  });
});

export const acceptOrder = asyncAwaitError(async (req, res, next) => {
  const { orderId } = req.query;
  const { gameStartTime, roomId, roomCode } = req.body;
  const userId = req.user._id;

  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) return next(new ErrorHandler("No order found", 404));

  let tempArr = existingOrder.acceptedByUserId;

  if (tempArr.includes(userId)) {
    return next(new ErrorHandler("You have already accepted this order", 404));
  }

  const existingProduct = await Product.findById(
    existingOrder.orderItems?.[0]?.product
  );

  if (!existingProduct) return next(new ErrorHandler("Product not found", 404));

  const existingUser = await User.findById(req.user._id);
  if (!existingUser) return next(new ErrorHandler("User not found", 404));

  let totalAmount =
    Number(existingProduct?.price || 0) *
    Number(existingOrder?.orderItems?.[0]?.quantity || 0);

  if (existingUser.coins < totalAmount) {
    return next(new ErrorHandler("You don't have enough coin", 404));
  }

  existingUser.coins = existingUser.coins - totalAmount;
  tempArr.push(userId);

  existingOrder.gameStartTime = gameStartTime;
  existingOrder.roomId = roomId;
  existingOrder.roomCode = roomCode;
  existingOrder.joinedAt = new Date();

  await existingOrder.save();
  await existingUser.save();

  res.status(200).json({
    success: true,
    message: "Order accepted successfully",
  });
});

export const uploadWinScreenShort = asyncAwaitError(async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.user._id;

  const tempScreenShort = req.files?.[0];

  if (!tempScreenShort)
    return next(new ErrorHandler("Please choose screen short", 400));

  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) return next(new ErrorHandler("No order found", 404));

  let existingScreenShorts = existingOrder.winScreenShorts || [];

  // Apply validations
  if (
    ![
      existingOrder?.user?.toString(),
      existingOrder?.acceptedByUserId?.[0]?.toString(),
    ]?.includes(userId?.toString())
  ) {
    return next(
      new ErrorHandler("You are not eligible to upload screen short", 400)
    );
  }

  if (
    existingScreenShorts?.find(
      (e) => e?.updatedBy?.toString() === userId?.toString()
    )
  ) {
    return next(
      new ErrorHandler("You have already uploaded screen short", 400)
    );
  }

  const file = getDataUri(tempScreenShort);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);

  let screenShortsArr = [
    ...existingScreenShorts,
    {
      imageUrl: myCloud.secure_url,
      updatedAt: new Date(),
      updatedBy: userId,
    },
  ];

  existingOrder.winScreenShorts = screenShortsArr;

  await existingOrder.save();

  res.status(200).json({
    success: true,
    message: "Screen short updated successfully",
  });
});

export const adminCancelOrder = asyncAwaitError(async (req, res, next) => {
  const { orderId } = req.body;

  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) return next(new ErrorHandler("No order found", 404));

  existingOrder.status = "cancelled";

  const existingUser = await User.findById(existingOrder?.user);
  if (!existingUser) return next(new ErrorHandler("User not found", 404));

  let joinedUserId = existingOrder?.acceptedByUserId?.[0];
  const existingJoinedUser = await User.findById(joinedUserId);

  if (!existingJoinedUser)
    return next(new ErrorHandler("Joined user not found", 404));

  existingUser.coins = existingUser.coins + existingOrder.totalAmount;

  existingJoinedUser.coins =
    existingJoinedUser.coins + existingOrder.totalAmount;

  await existingUser.save();
  await existingJoinedUser.save();
  await existingOrder.save();

  res.status(200).json({
    success: true,
    message: "Order Cancelled",
  });
});

export const cancelMyOrder = asyncAwaitError(async (req, res, next) => {
  const { orderId } = req.query;
  const userId = req.user._id;

  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) return next(new ErrorHandler("No order found", 404));

  if (existingOrder?.acceptedByUserId?.length > 0) {
    return next(
      new ErrorHandler("Order cannot be cancelled (Accepted by another user)")
    );
  }

  const existingProduct = await Product.findById(
    existingOrder.orderItems?.[0]?.product
  );

  const existingUser = await User.findById(req.user._id);

  existingUser.coins = existingUser.coins + existingProduct.price;

  await existingOrder.deleteOne();
  await existingUser.save();

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
  });
});

export const markWinner = asyncAwaitError(async (req, res, next) => {
  const { orderId, winnerId } = req.body;

  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) {
    return next(new ErrorHandler("Order not found", 404));
  }
  const existingWinner = await User.findById(winnerId);

  if (!existingWinner) {
    return next(new ErrorHandler("Winner not found", 404));
  }
  existingOrder.winnerId = winnerId;
  existingOrder.status = "resultDeclared";

  await existingOrder.save();

  console.log(existingOrder?.status);

  res.status(200).json({
    success: true,
    message: "Data saved successfully",
  });
});

export const addWinnerCoin = asyncAwaitError(async (req, res, next) => {
  const { orderId, winnerId, winAmount } = req.body;
  // console.log(orderId, winnerId, winAmount);

  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) {
    return next(new ErrorHandler("Order not found", 404));
  }
  const existingWinner = await User.findById(winnerId);

  if (!existingWinner) {
    return next(new ErrorHandler("Winner not found", 404));
  }

  existingOrder.winAmount = (existingOrder.winAmount || 0) + Number(winAmount);
  existingWinner.coins = existingWinner.coins + Number(winAmount);
  await existingWinner.save();
  await existingOrder.save();

  res.status(200).json({
    success: true,
    message: "Winner coin updated successfully",
  });
});
