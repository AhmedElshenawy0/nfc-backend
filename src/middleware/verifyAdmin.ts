import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./verifyJWT";

export const verifyAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.email && req.user?.role === "admin") {
    next(); // User is admin, continue to the route
  } else {
    return res.status(403).json({ message: "Access Forbidden: Admins only" });
  }
};
