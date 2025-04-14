// utils/cloudinaryUtils.ts
import cloudinary from "cloudinary";
import fs from "fs";

export const uploadSingleImage = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  const uploadRes = await cloudinary.v2.uploader.upload(file.path, {
    folder,
  });
  fs.unlink(file.path, (err) => {
    if (err) console.warn("Failed to delete uploaded file:", file.path);
  });
  return uploadRes.secure_url;
};

export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string
): Promise<string[]> => {
  const uploadResults = await Promise.all(
    files.map(async (file) => {
      const url = await uploadSingleImage(file, folder);
      return url;
    })
  );
  return uploadResults;
};

export const getPublicIdFromUrl = (url: string): string | undefined => {
  try {
    const match = url.match(
      /\/upload\/(?:v\d+\/)?(.+?)\.(jpg|jpeg|png|webp|gif)/
    );
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
};

export const deleteImagesFromCloudinary = async (
  urls: string[]
): Promise<void> => {
  const publicIds = urls
    .map(getPublicIdFromUrl)
    .filter((id): id is string => typeof id === "string");

  if (publicIds.length > 0) {
    try {
      await cloudinary.v2.api.delete_resources(publicIds, {
        type: "upload",
        resource_type: "image",
      });
    } catch (err) {
      console.warn("Cloudinary deletion failed:", err);
    }
  }
};
