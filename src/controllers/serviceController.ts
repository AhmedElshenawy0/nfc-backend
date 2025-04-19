import { NextFunction, Request, Response } from "express";
import prisma from "../utils/db";
import { Prisma } from "@prisma/client";

//=> Get all services
export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      include: { sold_services: true },
    });

    res.status(200).json({ services });
  } catch (error) {
    const err = new Error(`❌ Error in get all services`);
    next(error);
  }
};

//=> Get one service
export const getOneService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const params = req.params;

  if (!params.type) {
    res.status(400).json({ message: "Missing service type" });
    return;
  }

  try {
    const service = await prisma.service.findFirst({
      where: { type: params.type },
      include: { sold_services: true },
    });

    res.status(200).json({ service });
  } catch (err) {
    const error = new Error(`❌ Error in get one service`);
    next(error);
  }
};

//=> Create service
export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const body = req.body;

  if (!body.type) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const service = await prisma.service.create({
      data: body,
    });

    res.status(201).json({ service });
  } catch (err) {
    const error = new Error(`❌ Error in create service`);
    next(error);
  }
};

//=> Create service
export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  const type = req.params.type;

  if (!type) {
    res.status(400).json({ message: "Missing service type" });
    return;
  }

  const existingService = await prisma.service.findFirst({
    where: { type: type },
  });

  if (!existingService) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  try {
    const service = await prisma.service.update({
      where: { type: type },
      data: {
        type: body.type || existingService.type,
        vCardContent: {
          ...((existingService.vCardContent as Prisma.JsonObject) ?? {}), // Keep old values
          ...(body.vCardContent || {}), // Update new values
        },
      },
    });

    res.status(200).json({ service });
  } catch (err) {
    const error = new Error(`❌ Error in update service`);
    next(error);
  }
};
