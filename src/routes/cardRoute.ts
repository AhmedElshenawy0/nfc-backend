import express from "express";
import {
  createCard,
  deleteCard,
  getAllCards,
  getOneCard,
  updateCard,
  verifyCard,
} from "../controllers/cardController";

const router = express.Router();

router.route("/verifyCard").get(verifyCard);

router.route("/").get(getAllCards).post(createCard);

router.route("/:id").get(getOneCard).put(updateCard);
router.route("/:unique_code").delete(deleteCard);

export default router;
