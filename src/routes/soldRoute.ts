import express from "express";
import {
  createSoldService,
  getAllSoldServices,
  getOneSoldService,
  updateMenu,
  updateSoldService,
} from "../controllers/soldController";
import { verifyJWT } from "../middleware/verifyJWT";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import path from "path";

const router = express.Router();

// Configure storage and file destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

const uploadMiddleware = upload.fields([
  { name: "files" },
  { name: "profileImage" },
]);

router
  .route("/")
  .get(getAllSoldServices)
  .post(uploadMiddleware, createSoldService);

// router.route("/").get(getAllSoldServices).post(createSoldService);

router.get("/get-one/:id", getOneSoldService);
router.route("/:id").put(uploadMiddleware, updateSoldService);
router.route("/menu/:id").put(uploadMiddleware, updateMenu);

export default router;
