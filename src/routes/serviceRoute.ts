import express from "express";
import {
  createService,
  getAllServices,
  getOneService,
  updateService,
} from "../controllers/serviceController";

const router = express.Router();

router.route("/").get(getAllServices).post(createService);

router.route("/:type").get(getOneService).put(updateService);
export default router;
