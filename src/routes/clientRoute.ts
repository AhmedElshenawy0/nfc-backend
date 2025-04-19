import express from "express";
import {
  createClient,
  getAllClients,
  getOneClient,
} from "../controllers/clientController";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { verifyJWT } from "../middleware/verifyJWT";
import { verifySelfOrAdmin } from "../middleware/verifySelfOrAdmin";

const router = express.Router();

router.route("/").get(verifyAdmin, getAllClients).post(createClient);
router.route("/:id").get(verifyJWT, verifySelfOrAdmin, getOneClient);

export default router;
