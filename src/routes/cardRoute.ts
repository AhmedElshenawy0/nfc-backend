import { verifyJWT } from "./../middleware/verifyJWT";
import express from "express";
import {
  createCard,
  deleteCard,
  getAllCards,
  getOneCard,
  updateCard,
  verifyCard,
} from "../controllers/cardController";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

router.route("/verifyCard").get(verifyCard);

router.route("/").get(getAllCards).post(createCard);

router.route("/:id").get(verifyJWT, getOneCard).put(updateCard);
router.route("/:unique_code").delete(verifyAdmin, deleteCard);

export default router;
