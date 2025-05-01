import { NextFunction, Request, Response } from "express";
import prisma from "../utils/db";
import cloudinary from "../utils/cloudinary";
import { AuthenticatedRequest } from "../middleware/verifyJWT";
import fs from "fs";
import {
  deleteImagesFromCloudinary,
  uploadMultipleImages,
  uploadSingleImage,
} from "../utils/cloudinaryConf";
import { validate as isUuid } from "uuid";

//=> Get all services
export const getAllSoldServices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      include: { sold_services: true },
    });

    if (!services[0]) {
      res.status(200).json({ services: [] });
      return;
    }

    res.status(200).json({ services });
  } catch (err) {
    const error = new Error(`❌ Error in get all sold services`);
    next(error);
  }
};

//=> Get one service
export const getOneSoldService = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ message: "Missing sold service id" });
    return;
  }
  if (!isUuid(id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return;
  }
  console.log(id);

  try {
    const soldServices = await prisma.soldService.findUnique({
      where: { id: id },
    });

    res.status(200).json({ soldServices });
  } catch (err) {
    const error = new Error(`❌ Error in get one sold service`);
    next(error);
  }
};

//=> Create service
// export const createSoldService = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   const { type, content, vCardUi, uniqueCode } = req.body;
//   const body = req.body;
//   console.log({ type, content, vCardUi, uniqueCode });

//   if (!type || !content || !uniqueCode) {
//     res.status(400).json({ message: "All fields are required" });
//     console.log("err 1");
//     return;
//   }

//   const service = await prisma.service.findFirst({
//     where: { type: type },
//   });

//   if (!service?.id) {
//     res.status(400).json({ message: "Missing service id" });
//     console.log("err 2");
//     return;
//   }

//   const card = await prisma.card.findFirst({
//     where: { unique_code: uniqueCode },
//     include: {
//       sold_service: true,
//     },
//   });

//   if (!card?.id) {
//     res.status(400).json({ message: "Missing card id" });
//     console.log("err 3");

//     return;
//   }

//   const vCardContent = card?.sold_service?.vCardupdatableContent as unknown as {
//     name?: string;
//   };

//   if (vCardContent?.name) {
//     res.status(400).json({ message: "This card already has a service" });
//     console.log("err 4");

//     return;
//   }

//   const token = req.isAuthenticated();
//   console.log(`here is token: ${token}`);
//   console.log(req?.user);

//   if (!token) {
//     res
//       .status(401)
//       .json({ message: "Authentication token missing, Please Sign in" });
//     return;
//   }

//   let user: any = req?.user;

//   try {
//     // Upload profile picture
//     let profilePictureUrl = "";
//     let menuImageUrls: string[] = [];
//     let filePath = `/uploads/${req?.file?.filename}`;

//     if (type === "vCard") {
//       const uploadRes = await cloudinary.v2.uploader.upload(content?.image, {
//         folder: "user_images/vCard",
//       });
//       profilePictureUrl = uploadRes.secure_url;
//     } else if (type === "menu") {
//       // Upload multiple menu images
//       menuImageUrls = await Promise.all(
//         content?.map(async (image: any) => {
//           const uploadResponse = await cloudinary.v2.uploader.upload(image, {
//             folder: "user_images/menu_images",
//           });
//           return uploadResponse.secure_url; // Store only the URL
//         })
//       );
//     } else if (type === "file") {
//       filePath = `/uploads/${req?.file?.filename}`;
//     }

//     console.log(`req is : ${req.file}`);
//     console.log(`path name is : ${filePath}`);

//     const newSoldService = await prisma.soldService.create({
//       data: {
//         client_id: user?.id,
//         service_id: service.id,
//         card_id: card.id,
//         vCardUi: vCardUi,
//         type,
//         vCardupdatableContent:
//           type === "vCard"
//             ? { ...content, image: profilePictureUrl }
//             : undefined,
//         menuUpdatableContent: type === "menu" ? menuImageUrls : undefined,
//         urlUpdatableContent: type === "url" ? content : undefined,
//         fileUpdatableContent: type === "file" ? filePath : undefined,
//       },
//     });

//     await prisma.card.update({
//       where: { id: card?.id },
//       data: {
//         client_id: user?.id,
//       },
//     });

//     res.status(201).json({ newSoldService });
//   } catch (error) {
//     res.status(500).json({
//       message: "Something went wrong while creating sold service",
//       error,
//     });
//   }
// };
export const createSoldService = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { type, vCardUi, uniqueCode } = req.body;

  if (!type || !uniqueCode) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const service = await prisma.service.findFirst({ where: { type } });
  console.log("servic", service);

  if (!service?.id) {
    res.status(400).json({ message: "Missing service id" });
    return;
  }

  const card = await prisma.card.findFirst({
    where: { unique_code: uniqueCode },
    include: { sold_service: true },
  });
  console.log("card", card);

  if (!card?.id) {
    res.status(400).json({ message: "Missing card id" });
    return;
  }

  const existingVcardContent = card.sold_service?.vCardupdatableContent as {
    name?: string;
  };

  if (type === "vCard" && existingVcardContent?.name) {
    res.status(400).json({ message: "This card already has a vCard service" });
    return;
  }

  const token = req.isAuthenticated();
  if (!token) {
    res
      .status(401)
      .json({ message: "Authentication token missing, Please Sign in" });
    return;
  }

  const user: any = req.user;

  try {
    let profilePictureUrl = "";
    let menuImageUrls: string[] = [];
    let uploadedFilePath = "";

    // Handle image uploads
    const files = req.files as {
      files?: Express.Multer.File[];
      profileImage?: Express.Multer.File[];
      file?: Express.Multer.File[];
    };

    // Upload vCard profile image
    if (type === "vCard" && files?.profileImage?.[0]) {
      const uploadRes = await cloudinary.v2.uploader.upload(
        files.profileImage[0].path,
        {
          folder: "user_images/vCard",
        }
      );
      profilePictureUrl = uploadRes.secure_url;
      try {
        await fs.promises.unlink(files.profileImage[0].path);
      } catch (err) {
        console.warn(
          "Failed to delete profile image:",
          files.profileImage[0].path
        );
      }
    }

    // Upload menu images
    if (type === "menu" && files?.files?.length) {
      const uploadResults = await Promise.all(
        files.files.map((file) =>
          cloudinary.v2.uploader.upload(file.path, {
            folder: "user_images/menu_images",
          })
        )
      );
      menuImageUrls = uploadResults.map((res) => res.secure_url);

      if (files?.files?.length) {
        for (const file of files.files) {
          try {
            await fs.promises.unlink(file.path);
          } catch (err) {
            console.warn("Failed to delete menu image:", file.path);
          }
        }
      }
    }

    // Upload file
    if (type === "file" && files?.file?.[0]) {
      uploadedFilePath = `/uploads/${files.file[0].filename}`;
    }

    // Compose vCard content
    const vCardContent = {
      name: req.body.name,
      bio: req.body.bio,
      job: req.body.job,
      about: req.body.about,
      phone: req.body.phone,
      address: req.body.address,
      facebook_link: req.body.facebook_link,
      instgram_link: req.body.instgram_link,
      linkedin_link: req.body.linkedin_link,
      mainBackground: req.body.mainBackground,
      buttonBackground: req.body.buttonBackground,
      image: profilePictureUrl,
    };
    console.log("vCardContent", vCardContent);

    const newSoldService = await prisma.soldService.create({
      data: {
        client_id: user.id,
        service_id: service.id,
        card_id: card.id,
        vCardUi,
        type,
        vCardupdatableContent: type === "vCard" ? vCardContent : undefined,
        menuUpdatableContent: type === "menu" ? menuImageUrls : undefined,
        urlUpdatableContent: type === "url" ? req.body.content : undefined,
        fileUpdatableContent: type === "file" ? uploadedFilePath : undefined,
      },
    });

    await prisma.card.update({
      where: { id: card.id },
      data: {
        client_id: user.id,
      },
    });

    res.status(201).json({ newSoldService });
  } catch (err) {
    console.log(err);
    const error = new Error(`❌ Error in create sold service`);
    next(error);
  }
};

//=> update service
export const updateSoldService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ message: "Missing service id" });
    return;
  }

  const existingService = await prisma.soldService.findFirst({
    where: { id: id },
  });

  if (!existingService) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  try {
    const existingContent = (existingService!.vCardupdatableContent ??
      {}) as any;

    const files = req.files as {
      profileImage?: Express.Multer.File[];
    };

    let uploadedImageUrl = existingContent.image;

    if (files?.profileImage?.[0]) {
      uploadedImageUrl = await uploadSingleImage(
        files.profileImage[0],
        "user_images/vCard"
      );
    }

    const updatedData = {
      name: req.body.name || existingContent.name,
      bio: req.body.bio || existingContent.bio,
      job: req.body.job || existingContent.job,
      about: req.body.about || existingContent.about,
      phone: req.body.phone || existingContent.phone,
      address: req.body.address || existingContent.address,
      facebook_link: req.body.facebook_link || existingContent.facebook_link,
      instgram_link: req.body.instgram_link || existingContent.instgram_link,
      linkedin_link: req.body.linkedin_link || existingContent.linkedin_link,
      mainBackground: req.body.mainBackground || existingContent.mainBackground,
      buttonBackground:
        req.body.buttonBackground || existingContent.buttonBackground,
      image: uploadedImageUrl,
    };

    const soldService = await prisma.soldService.update({
      where: { id: id },
      data: {
        vCardUi: req?.body?.vCardUi || existingService?.vCardUi,
        vCardupdatableContent: updatedData,
      },
    });

    res.status(200).json({ soldService });
  } catch (err) {
    const error = new Error(`❌ Error in update sold service`);
    next(error);
  }
};

//=> update menu
export const updateMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id;

  console.log("BODY RAW:", req.body);
  console.log("FILES:", req.files);

  const deletedImagesRaw = req.body.deletedImages || [];
  const deletedImages = Array.isArray(deletedImagesRaw)
    ? deletedImagesRaw
    : [deletedImagesRaw];

  console.log("deletedImagesRaw", deletedImagesRaw);
  console.log("deletedImages", deletedImages);

  if (!id) {
    res.status(400).json({ message: "Missing service ID" });
    return;
  }

  const existingService = await prisma.soldService.findUnique({
    where: { id: id },
  });

  if (!existingService) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  let existingContent = (existingService!.menuUpdatableContent ??
    []) as string[];

  try {
    const files = req.files as { files?: Express.Multer.File[] };

    const isNoDelete = deletedImages.length === 0;
    const isNoUpload = !files?.files || files.files.length === 0;

    if (isNoDelete && isNoUpload) {
      res.status(204).json({ message: "No changes applied to menu" });
      return;
    }
    if (!isNoDelete) {
      await deleteImagesFromCloudinary(deletedImages);
      existingContent = existingContent.filter(
        (url) => !deletedImages.includes(url)
      );
    }

    let newImageUrls: string[] = [];

    if (files?.files?.length) {
      newImageUrls = await uploadMultipleImages(
        files.files,
        "user_images/menu_images"
      );
    }
    const finalImages = [...existingContent, ...newImageUrls];
    console.log("finalImages", finalImages);

    const soldService = await prisma.soldService.update({
      where: { id: id },
      data: {
        menuUpdatableContent: finalImages,
      },
    });

    res.status(200).json({ soldService });
  } catch (err) {
    const error = new Error(`❌ Error in update menu`);
    next(error);
  }
};
