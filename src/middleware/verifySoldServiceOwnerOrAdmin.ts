import { Request, Response, NextFunction } from "express";
import prisma from "../utils/db";
import { AuthenticatedRequest } from "./verifyJWT";

export const verifySoldServiceOwnerOrAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const soldServiceId = req.params.id;
  console.log("user", user);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const soldService = await prisma.soldService.findUnique({
      where: { id: soldServiceId },
      select: { client_id: true },
    });

    if (!soldService) {
      res.status(404).json({ message: "Sold service not found" });
      return;
    }

    if (user.role === "admin" || user.id === soldService.client_id) {
      next();
      return;
    } else {
      res.status(403).json({ message: "Access denied" });
      return;
    }
  } catch (err) {
    console.error("Error in verifySoldServiceOwnerOrAdmin:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
