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
  // const token = req.cookies.jwt;

  const user = req.isAuthenticated();
  console.log("from verifyJWT", user, req?.user);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // const verify: any = jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
  // console.log(`decoded ${verify.email}`);

  // req.user = verify;
  next();
};
