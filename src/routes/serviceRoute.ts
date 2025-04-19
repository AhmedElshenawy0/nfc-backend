import { verifyAdmin } from "./../middleware/verifyAdmin";
import { verifyJWT } from "./../middleware/verifyJWT";
import express from "express";
import {
  createService,
  getAllServices,
  getOneService,
  updateService,
} from "../controllers/serviceController";

const router = express.Router();

router
  .route("/")
  .get(verifyJWT, getAllServices)
  .post(verifyAdmin, createService);

router.route("/:type").get(verifyJWT, getOneService).put(updateService);
export default router;
