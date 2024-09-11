import { asyncAwaitError } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import ErrorHandler from "../utils/error.js";
import { User } from "../models/user.js";
import { Product } from "../models/product.js";

export const createOrder = asyncAwaitError(async (req, res, next) => {
  const {
    // shippingInfo,
    orderItems,
    itemsPrice,
    taxPrice,
    selectedPlayers,
    totalAmount,
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
  });

  // Decrease user coins
  user.coins = user.coins - totalAmount;
  await user.save();

  res.status(201).json({
    success: true,
    message: "Order places successfully",
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
  const userId = req.user._id;

  console.log(orderId, userId);

  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) return next(new ErrorHandler("No order found", 404));

  let tempArr = existingOrder.acceptedByUserId;

  if (tempArr.includes(userId)) {
    return next(new ErrorHandler("You have already accepted this order", 404));
  }

  const existingProduct = await Product.findById(
    existingOrder.orderItems?.[0]?.product
  );

  const existingUser = await User.findById(req.user._id);

  if (existingUser.coins < existingProduct?.price) {
    return next(new ErrorHandler("You don't have enough coin", 404));
  }

  existingUser.coins = existingUser.coins - existingProduct.price;
  tempArr.push(userId);

  await existingOrder.save();
  await existingUser.save();

  res.status(200).json({
    success: true,
    message: "Order accepted successfully",
  });
});

export const cancelMyOrder = asyncAwaitError(async (req, res, next) => {
  const { orderId } = req.query;
  const userId = req.user._id;

  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) return next(new ErrorHandler("No order found", 404));

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
