import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
export const verifyJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const isAuth = req.isAuthenticated();

  if (!isAuth || !req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  next();
};
