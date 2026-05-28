import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "Not authorized, user not found",
        });
      }

      req.user = user;
      next();
    } else {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    const message =
      error?.name === "TokenExpiredError"
        ? "Not authorized, token expired"
        : "Not authorized, token failed";

    return res.status(401).json({ message });
  }
};

// middleware for admin routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role?.toLowerCase() === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

export { adminOnly };
