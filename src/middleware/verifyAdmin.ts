import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./verifyJWT";

export const verifyAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.email && req.user?.role === "admin") {
    next();
    return;
  } else {
    console.log(req.user);

    res.status(403).json({ message: "Access Forbidden: Admins only" });
    return;
  }
};
