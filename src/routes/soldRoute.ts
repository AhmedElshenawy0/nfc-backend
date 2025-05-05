import { verifyAdmin } from "./../middleware/verifyAdmin";
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
import path from "path";
import { verifySoldServiceOwnerOrAdmin } from "../middleware/verifySoldServiceOwnerOrAdmin";

const router = express.Router();

// storage and file destination

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } });

const uploadMiddleware = upload.fields([
  { name: "files" },
  { name: "profileImage" },
]);

router
  .route("/")
  .get(verifyAdmin, getAllSoldServices)
  .post(uploadMiddleware, verifyJWT, createSoldService);

router.get("/get-one/:id", verifySoldServiceOwnerOrAdmin, getOneSoldService);
router
  .route("/:id")
  .put(uploadMiddleware, verifySoldServiceOwnerOrAdmin, updateSoldService);
router
  .route("/menu/:id")
  .put(uploadMiddleware, verifySoldServiceOwnerOrAdmin, updateMenu);

export default router;
