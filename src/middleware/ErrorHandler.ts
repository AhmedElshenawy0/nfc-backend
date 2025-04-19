import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(" Unhandled Error:", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      message: "Prisma error: Invalid request or data format.",
      code: err.code,
    });
  }

  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    return res.status(400).json({
      message: "Prisma error: Invalid request or data format.",
    });
  }

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
};
