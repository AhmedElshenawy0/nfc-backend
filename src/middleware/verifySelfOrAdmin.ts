import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./verifyJWT";

export const verifySelfOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const loggedInUser = req.user;
  const paramId = req.params.id;

  if (loggedInUser?.role === "admin" || loggedInUser?.id === paramId) {
    next();
    return;
  } else {
    res.status(403).json({ message: "Access denied" });
    return;
  }
};
