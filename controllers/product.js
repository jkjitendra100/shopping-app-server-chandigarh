import { asyncAwaitError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";

export const getAllAdminProducts = asyncAwaitError(async (req, res, next) => {
  const products = await Product.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    products,
  });
});

export const getProductDetails = asyncAwaitError(async (req, res, next) => {
  console.log(req.params.id);
  const product = await Product.findById(req.params.id);
  const ordersCount = await Order.countDocuments({
    "orderItems.product": req.params.id,
  });

  if (!product) return next(new ErrorHandler("Product not found", 404));

  res.status(200).json({
    success: true,
    product,
    ordersCount: ordersCount,
  });
});

export const addNewProduct = asyncAwaitError(async (req, res, next) => {
  const {
    name,
    description,
    price,
    players,
    noOfPlayersToBeSelected,
    matchTime,
    question1,
    question2,
    question3,
    question4,
    adminMessage,
  } = req.body;
  if (req.files?.length <= 0)
    return next(new ErrorHandler("Please choose product images", 400));

  if (!name) return next(new ErrorHandler("Please enter product name", 400));
  if (!description)
    return next(new ErrorHandler("Please enter product description", 400));
  if (!price) return next(new ErrorHandler("Please enter product price", 400));

  const tempArr = req.files;
  const images = [];

  if (tempArr.length > 0) {
    for (let i = 0; i < tempArr.length; i++) {
      const file = getDataUri(tempArr[i]);
      const myCloud = await cloudinary.v2.uploader.upload(file.content);
      images?.push({
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      });
    }
  }

  await Product.create({
    name,
    description,
    price: Number(price),
    images,
    players,
    matchTime: Number(matchTime),
    noOfPlayersToBeSelected: Number(noOfPlayersToBeSelected),
    question1,
    question2,
    question3,
    question4,
    adminMessage,
  });

  res.status(200).json({
    success: true,
    message: "Product added successfully",
  });
});

export const updateProduct = asyncAwaitError(async (req, res, next) => {
  const {
    name,
    description,
    price,
    players,
    matchTime,
    adminMessage,
    question1,
    question2,
    question3,
    question4,
  } = req.body;
  const { id } = req.params;
  if (!name) return next(new ErrorHandler("Please enter product name", 400));
  if (!description)
    return next(new ErrorHandler("Please enter product description", 400));
  if (!price) return next(new ErrorHandler("Please enter product price", 400));

  const oldProduct = await Product.findById(id);

  const images = oldProduct?.images;

  if (req.file) {
    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    images?.push({
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    });
  }

  await Product.findByIdAndUpdate(
    id,
    {
      name,
      description,
      price: Number(price),
      images,
      players,
      question1,
      question2,
      question3,
      question4,
      adminMessage,
      matchTime: Number(matchTime),
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
  });
});

export const addNewProductImage = asyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (!req.file)
    return next(new ErrorHandler("Please choose product image", 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  product.images.push(image);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Image added successfully",
  });
});

export const deleteProductImage = asyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  const id = req.query.id;
  if (!id) return next(new ErrorHandler("Please enter image id", 400));

  let isExist = -1;

  product.images.forEach((item, index) => {
    if (item._id.toString() === id.toString()) isExist = index;
  });

  if (isExist < 0) return next(new ErrorHandler("Image not found", 404));
  await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
  product.images.splice(isExist, 1);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
});

export const deleteProduct = asyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  for (let index = 0; index < product.images.length; index++) {
    await cloudinary.v2.uploader.destroy(product.images[index].public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

export const addToCart = asyncAwaitError(async (req, res, next) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  if (!userId) return next(new ErrorHandler("User id required", 400));
  if (!productId) return next(new ErrorHandler("Product id required", 400));
  if (quantity <= 0)
    return next(new ErrorHandler("Product quantity required", 400));

  const userData = await User.findById(userId);

  const tempCart = userData.cart;
  tempCart.push({
    productId,
    quantity,
  });

  userData.cart = tempCart;
  await userData.save();

  res.status(200).json({
    success: true,
    message: "Product added to cart",
    data: userData,
  });
});

export const increaseQuantityInCart = asyncAwaitError(
  async (req, res, next) => {
    const { userId } = req.params;
    const { productId } = req.body;

    if (!userId) return next(new ErrorHandler("User id required", 400));
    if (!productId) return next(new ErrorHandler("Product id required", 400));

    const userData = await User.findById(userId);

    let cartItems = userData?.cart;
    let product = cartItems?.find((e) => e?.productId == productId);

    if (product?.quantity < 0)
      return next(new ErrorHandler("Invalid quantity", 400));

    let productIndex = cartItems?.findIndex((e) => e?.productId == productId);

    let tempCartItem = {
      _id: product?._id,
      productId: product?.productId,
      quantity: product?.quantity + 1,
    };

    cartItems[productIndex] = tempCartItem;

    await userData.save();

    res.status(200).json({
      success: true,
      message: "Product quantity increased by 1",
      data: userData,
    });
  }
);

export const decreaseQuantityInCart = asyncAwaitError(
  async (req, res, next) => {
    const { userId } = req.params;
    const { productId } = req.body;

    if (!userId) return next(new ErrorHandler("User id required", 400));
    if (!productId) return next(new ErrorHandler("Product id required", 400));

    const userData = await User.findById(userId);

    let cartItems = userData?.cart;
    let product = cartItems?.find((e) => e?.productId == productId);

    if (product?.quantity <= 0)
      return next(new ErrorHandler("Invalid quantity", 400));

    let productIndex = cartItems?.findIndex((e) => e?.productId == productId);

    let tempCartItem = {
      _id: product?._id,
      productId: product?.productId,
      quantity: product?.quantity - 1,
    };

    cartItems[productIndex] = tempCartItem;

    await userData.save();

    res.status(200).json({
      success: true,
      message: "Product quantity decreases by 1",
      data: userData,
    });
  }
);

export const showCartItems = asyncAwaitError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const cart = user.cart;

  const products = [];
  for (let i = 0; i < cart.length; i++) {
    const tempProduct = await Product.findById(cart[i]?.productId);
    products.push(tempProduct);
  }

  res.status(200).json({
    message: "Data fetched successfully!",
    data: products,
  });
});

export const getProductOrdersReport = asyncAwaitError(
  async (req, res, next) => {
    const { productId } = req?.params;

    const orders = await Order.find({
      "orderItems.product": productId,
    }).populate("user");

    res.status(200).json({
      success: true,
      data: orders,
    });
  }
);
