import express from "express";
import { verifyJWT } from "../middleware/verifyJWT";
import {
  createClient,
  getAllClients,
  getOneClient,
  // updateClient,
} from "../controllers/clientController";

const router = express.Router();

router.route("/").get(getAllClients).post(createClient);
router.route("/:id").get(getOneClient);
// router.route("/:email").get(updateClient);

export default router;
