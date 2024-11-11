import ErrorHandler from "../utils/error.js";
import { AccountDeletion } from "../models/accountDeletion.js";

export const requestAccountDeletion = async (req, res, next) => {
  try {
    const { reason } = req.params;

    await AccountDeletion.create({
      userId: req?.user?._id,
      reason,
    });

    res.status(200).json({
      success: true,
      message:
        "We have request your request, and your account will be deleted with in 72 hours",
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
