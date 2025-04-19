import { verifyJWT } from "../middleware/verifyJWT";
import express from "express";
import {
  checkUserSoldService,
  deleteUser,
  getAllUsers,
  getSingleUser,
  getUserInfo,
  logOut,
  updateUser,
  userLogin,
  userRegister,
} from "../controllers/authController";
import passport from "passport";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

router.route("/register").post(userRegister);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (!user)
      return res.status(401).json({ message: info?.message || "Unauthorized" });

    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });

      res.json({ message: "Logged in successfully", user });
    });
  })(req, res, next);
});

router.get("/get-user", verifyJWT, getSingleUser);

router.get("/user-info", getUserInfo);

router.post("/check-user", verifyJWT, checkUserSoldService);

router.get("/get-all-user", verifyAdmin, getAllUsers);

// GOOGLE Authentication

router.get(
  "/google",
  (req: any, res, next) => {
    res.cookie("cardType", req.query.cardType, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    }); // 5 mins expiry
    res.cookie("cardId", req.query.cardId, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    });

    console.log("Stored in session:", req.cookies.cardType);

    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: true }),
  (req: any, res) => {
    const cardType = req.cookies.cardType;
    const cardId = req.cookies.cardId;

    console.log("Extracted from cookies:", cardType, cardId);

    console.log("from callback", cardType, cardId);

    if (req.user?.isExist === false) {
      console.log(req.user);

      return res.redirect(
        `http://localhost:5173/signin?error=${encodeURIComponent(
          "Invalid email or password"
        )}`
      );
    }
    console.log(req.user);

    res.redirect(
      `http://localhost:5173/signin?auth=true&gCardType=${cardType}&gCardId=${cardId}`
    );
  }
);

//=> logout
router.post("/logout", verifyJWT, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return res.status(500).send("Error destroying session");

      res.status(200).json({ message: "success" });
    });
  });
});

router.get("/me", (req, res) => {
  res.send(req.user || null);
});

router.put("/update-client/:email", verifyAdmin, updateUser);

router.delete("/delete-client/:email", verifyAdmin, deleteUser);

export default router;
