import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if authorization header exists and starts with Bearer
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    // Extract token
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Find user by id from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: error instanceof Error ? error.message : "Not authorized",
    });
  }
};