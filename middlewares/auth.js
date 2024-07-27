import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/Errorhandler.js";
import { User } from "../models/user.js";

export async function isAuthenticated(req, res, next) {
  try {
    // const { token } = req.cookies;
    let token;
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
      token = authorizationHeader.split(" ")[1];
    } else {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ErrorHandler("User is not logged in", 400));
    }

    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(_id);
    if (!user) {
      // Don't change this message
      return next(new ErrorHandler("invalid token", 400));
    }

    req.user = user;

    next();
  } catch (err) {
    // res.status(500).json({ success: false, error: err.message });
    return next(new ErrorHandler(err?.message, 500));
  }
}

export async function isAdmin(req, res, next) {
  try {
    // const { token } = req.cookies;
    let token;
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
      token = authorizationHeader.split(" ")[1];
    } else {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ErrorHandler("User is not logged in", 400));
    }

    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(_id);
    if (!user) {
      // Don't change this message
      return next(new ErrorHandler("invalid token", 400));
    }

    if (user.role !== "admin") {
      // Don't change this message
      return next(
        new ErrorHandler("You are not allowed to access this route", 400)
      );
    }
    req.user = user;

    next();
  } catch (err) {
    // res.status(500).json({ success: false, error: err.message });
    return next(new ErrorHandler(err?.message, 500));
  }
}

// import { User } from "../models/user.js";
// import ErrorHandler from "../utils/error.js";
// import jwt from "jsonwebtoken";
// import { asyncAwaitError } from "./error.js";

// export const isAuthenticated = asyncAwaitError(async (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) return next(new ErrorHandler("Not logged in", 401));

//   const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//   req.user = await User.findById(decodedData._id);
//   next();
// });

// export const isAdmin = asyncAwaitError(async (req, res, next) => {
//   console.log(req.user);
//   if (req.user.role !== "admin")
//     return next(
//       new ErrorHandler("This action can be performed by admin only", 401)
//     );
//   next();
// });
