import { Request, Response } from "express";
import prisma from "../utils/db";

//=> Get all clients
export const getAllClients = async (req: Request, res: Response) => {
  const clients = await prisma.client.findMany();

  if (!clients[0]) {
    res.status(200).json({ clients: [] });
  }

  res.status(200).json({ clients });
};

//=> Get one client
export const getOneClient = async (req: Request, res: Response) => {
  const param = req.params;

  if (!param?.id) {
    res.status(404).json({ message: "Missing client id" });
    return;
  }
  const client = await prisma.client.findUnique({ where: { id: +param.id } });

  if (!client?.first_name) {
    res.status(400).json({ message: "Client not found" });
  }

  res.status(200).json({ client });
};

//=> Creat client
export const createClient = async (req: Request, res: Response) => {
  const body = req.body;

  if (!body.firstName || !body.lastName || !body.email) {
    res.status(400).json({ message: "All fields are required" });
  }

  try {
    const client = await prisma.client.create({
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        password: body.password,
        phone: body.phone,
        city: body.city,
      },
    });
    res.status(201).json({ client });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong while creating client" });
  }
};

// export const updateClient = async (req: Request, res: Response) => {
//   const param = req.params;

//   if (!param?.id) {
//     res.status(404).json({ message: "Missing client id" });
//     return;
//   }
//   const client = await prisma.client.findUnique({ where: { id: +param.id } });

//   if (!client?.first_name) {
//     res.status(400).json({ message: "Client not found" });
//   }

//   res.status(200).json({ client });
// };
