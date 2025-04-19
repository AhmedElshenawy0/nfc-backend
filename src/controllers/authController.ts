import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../utils/db";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { signInValidation, signUpValidation } from "../utils/validation";
import { AuthenticatedRequest } from "../middleware/verifyJWT";
import { validate as isUuid } from "uuid";

export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const body = req.body;

  //=> Validation
  const validation = signUpValidation.safeParse(body);

  if (!validation.success) {
    res.status(400).json({ message: validation.error.errors[0].message });
    return;
  }

  const user = await prisma.client.findUnique({
    where: { email: body.email },
  });
  if (user?.first_name) {
    res.status(400).json({ message: "User is already exist. Please sign in" });
    return;
  }

  try {
    //=> Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const newUser = await prisma.client.create({
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        password: hashedPassword,
        phone: body.phone,
        city: body.city,
        birthday: body.birthday,
        job: body.job,
      },
    });

    res.status(201).json(newUser);
  } catch (err) {
    const error = new Error(`❌ Error in sign up`);
    next(error);
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;

  //=> Validation
  const validation = signInValidation.safeParse(body);

  if (!validation.success) {
    res.status(400).json({ message: validation.error.errors[0].message });
    return;
  }

  const user = await prisma.client.findUnique({
    where: { email: body.email },
  });

  if (!user?.first_name) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  // ==>> Check if password match existed password
  const isPassMatch = await bcrypt.compare(body.password, user.password);

  if (!isPassMatch) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }
  try {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "You've signed in successfully",
    });
  } catch (err) {
    const error = new Error(`❌ Error in sign in`);
    next(error);
  }
};
export const getSingleUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userInfo = req?.user;
  if (!isUuid(userInfo?.id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return;
  }
  try {
    const user = await prisma.client.findUnique({
      where: { id: userInfo?.id },
      include: {
        soldServices: true,
      },
    });

    res.status(200).json({ user });
  } catch (err) {
    const error = new Error(`❌ Error in get one user`);
    next(error);
  }
};
export const getUserInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userInfo = req?.user;

  if (!userInfo?.email) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const user = await prisma.client.findFirst({
      where: { email: userInfo?.email },
      include: {
        soldServices: true,
        cards: true,
      },
    });

    res.status(200).json({ user });
  } catch (err) {
    const error = new Error(`❌ Error in get user info`);
    next(error);
  }
};

export const checkUserSoldService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;

  if (!body?.email) {
    res.status(400).json({ mesage: "Missing email while checking user" });
    return;
  }

  try {
    const user = await prisma.client.findUnique({
      where: { email: body.email },
      include: {
        soldServices: true,
      },
    });

    res.status(200).json({ clientId: user?.id });
  } catch (err) {
    const error = new Error(`❌ Error in check user sold service`);
    next(error);
  }
};

export const logOut = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "strict" });
  res.status(200).json({ message: "Logged out successfully" });
};

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        cards: true,
        soldServices: true,
      },
    });

    if (!clients[0]) {
      res.status(200).json({ clients: [] });
      return;
    }

    res.status(200).json({ clients });
  } catch (err) {
    const error = new Error(`❌ Error in get all users`);
    next(error);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const params = req.params;
  const body = req.body;

  if (!params.email) {
    res.status(404).json({ message: "Missing client email" });
    return;
  }

  const client = await prisma.client.findUnique({
    where: { email: params?.email },
  });

  if (!client?.email) {
    res.status(404).json({ message: "Client not found" });
    return;
  }

  try {
    const updatedClient = await prisma.client.update({
      where: { email: params?.email },
      data: {
        first_name: body?.firstName || client.first_name,
        last_name: body?.lastName || client.last_name,
        phone: body?.phone || client.phone,
        city: body?.city || client.city,
        birthday: body?.birthday || client.birthday,
        job: body?.job || client.job,
        role: body?.role || client?.role,
      },
    });

    res.status(200).json({ message: "User has updated successfully" });
  } catch (err) {
    const error = new Error(`❌ Error in update user`);
    next(error);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const params = req.params;

  if (!params.email) {
    res.status(404).json({ message: "Missing client email" });
    return;
  }
  const client = await prisma.client.findUnique({
    where: { email: params.email },
  });

  if (!client?.email) {
    res.status(404).json({ message: "This client not found" });
    return;
  }
  try {
    await prisma.soldService.deleteMany({ where: { client_id: client.id } });

    await prisma.client.delete({
      where: { email: params?.email },
    });

    res.status(200).json({ message: "User has deleted successfully" });
  } catch (err) {
    const error = new Error(`❌ Error in delete user`);
    next(error);
  }
};
