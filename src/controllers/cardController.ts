// import { SoldService } from "./../../../front-end/src/types/types";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prisma from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import { AuthenticatedRequest } from "../middleware/verifyJWT";

//=> Verify card
export const verifyCard = async (req: AuthenticatedRequest, res: Response) => {
  const { unique_code } = req.query;

  try {
    // CHECK if unique code isn't provided
    if (!unique_code) {
      res.status(403).json({ message: "You're not allowed with SignUp" });
      return;
    }

    const card = await prisma.card.findUnique({
      where: { unique_code: unique_code as string },
      include: { sold_service: true },
    });

    // CHECK if card isn't exist
    if (!card?.unique_code) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    if (!card?.sold_service?.client_id) {
      res.status(200).json({
        message: "Go to signup",
        type: card?.nfc_type,
        cardId: card?.id,
      });
      return;
    }

    const client = await prisma.client.findUnique({
      where: { id: +card?.sold_service?.client_id },
    });

    if (!client) {
      res.status(404).json({ message: "Client not found" });
      return;
    }

    const userSession = req?.user;

    console.log("from card controller get user session", userSession);
    console.log("from card controller get user session", req.isAuthenticated());

    if (!userSession?.email) {
      res.status(401).json({
        message: "Authentication missing, Please Sign in",
        type: card?.nfc_type,
        cardId: card?.id,
      });
      return;
    }

    if (userSession?.email !== client?.email) {
      res.status(403).json({ message: "You're not authorized" });
      return;
    }

    res.status(200).json({ message: "success", name: client?.first_name });
  } catch (error) {
    res.status(500).json({ message: "error here" });
  }
};

//=> Get all cards
export const getAllCards = async (req: Request, res: Response) => {
  const cards = await prisma.card.findMany({ include: { client: true } });

  if (!cards[0]) {
    res.status(200).json({ cards: [] });
    return;
  }

  res.status(200).json({ cards });
};

//=> Get one card
export const getOneCard = async (req: Request, res: Response) => {
  const param = req.params;

  const card = await prisma.card.findUnique({ where: { id: +param.id } });

  if (!card) {
    res.status(404).json({ message: "Card not found" });
    return;
  }

  res.status(200).json({ card });
};

//=> Create card
export const createCard = async (req: Request, res: Response) => {
  const body = req.body;

  if (!body.nfc_shap || !body.nfc_type) {
    res.status(404).json({ message: "All fields require when creating card" });
    return;
  }

  try {
    const unique_code = uuidv4();

    const card = await prisma.card.create({
      data: {
        nfc_shap: body.nfc_shap,
        nfc_type: body.nfc_type,
        unique_code,
        client_id: body.client_id || null,
      },
    });

    res.status(201).json({ card });
  } catch (error) {
    res
      .status(200)
      .json({ message: "Something went wrong while creating card" });
  }
};

//=> Update card
export const updateCard = async (req: Request, res: Response) => {
  const body = req.body;
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ message: "Missing Card Id" });
    return;
  }
  try {
    const card = await prisma.card.update({ where: { id: +id }, data: body });

    res.status(200).json({ card });
  } catch (error) {
    res
      .status(200)
      .json({ message: "Something went wrong while Updating card" });
  }
};

//=> Get all cards
export const deleteCard = async (req: Request, res: Response) => {
  const { unique_code } = req.params;

  if (!unique_code) {
    res.status(400).json({ message: "Missing Card unique code" });
    return;
  }
  console.log("unique is ", unique_code);

  const card = await prisma.card.findUnique({ where: { unique_code } });

  if (!card?.unique_code) {
    res.status(404).json({ message: "Card not found" });
    return;
  }
  console.log("card is ", card);

  try {
    await prisma.soldService.deleteMany({
      where: { card_id: card?.id },
    });
    await prisma.card.delete({ where: { unique_code } });

    res.status(200).json({ message: "Card has delete successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong while delete card" });
  }
};
