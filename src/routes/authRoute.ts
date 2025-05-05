import { verifyJWT } from "../middleware/verifyJWT";
import express from "express";
import {
  checkUserSoldService,
  deleteUser,
  getAllUsers,
  getSingleUser,
  getUserInfo,
  getUserRole,
  logOut,
  updateUser,
  userLogin,
  userRegister,
  verifyEmail,
} from "../controllers/authController";
import passport from "passport";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { sendVerificationEmail } from "../utils/sendEmail";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/db";
const router = express.Router();

router.route("/register").post(userRegister);

router.get("/verify-email", verifyEmail);

router.post("/login", (req, res, next) => {
  const { cardType, cardId } = req.body;
  passport.authenticate("local", async (err: any, user: any, info: any) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (!user)
      return res.status(401).json({ message: info?.message || "Unauthorized" });

    // If email not verified
    if (!user?.emailVerified) {
      const token = uuidv4();
      console.log("login card type", cardType, cardId);

      try {
        await prisma.client.update({
          where: { email: user.email },
          data: { verificationToken: token },
        });

        // Resend verification email
        await sendVerificationEmail(user.email, token, cardType, cardId);
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }

      return res.status(403).json({
        message: "Email not verified. Verification email sent again.",
      });
    }

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

router.get("/check-user-role/:email", getUserRole);

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
router.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    (
      err: any,
      user: Express.User | false,
      info: { message?: string } | undefined
    ) => {
      if (err || !user) {
        const errorMsg = info?.message || "Authentication failed";
        return res.redirect(
          `${process.env.CLIENT_URL}/signin?error=${encodeURIComponent(
            errorMsg
          )}`
        );
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.redirect(
            `${process.env.CLIENT_URL}/signin?error=Login failed`
          );
        }

        const cardType = req.cookies.cardType;
        const cardId = req.cookies.cardId;

        return res.redirect(
          `${process.env.CLIENT_URL}/signin?auth=true&gCardType=${cardType}&gCardId=${cardId}`
        );
      });
    }
  )(req, res, next);
});

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     session: true,
//     failureRedirect: `${
//       process.env.CLIENT_URL
//     }/signin?error=${encodeURIComponent("Email not verified")}`,
//   }),
//   (req: any, res,info) => {
//     const errorMsg = info?.message || "Authentication failed";

//     const cardType = req.cookies.cardType;
//     const cardId = req.cookies.cardId;

//     console.log("Extracted from cookies:", cardType, cardId);

//     console.log("from callback", cardType, cardId);

//     if (req.user?.isExist === false) {
//       console.log(req.user);

//       return res.redirect(
//         `${process.env.CLIENT_URL}/signin?error=${encodeURIComponent(
//           "Invalid email or password"
//         )}`
//       );
//     }

//     if (req.user?.emailVerified === false) {
//       console.log(req.user);

//       return res.redirect(
//         `${process.env.CLIENT_URL}/signin?error=${encodeURIComponent(
//           "Email not verified, Please verify"
//         )}`
//       );
//     }
//     console.log(req.user);

//     res.redirect(
//       `${process.env.CLIENT_URL}/signin?auth=true&gCardType=${cardType}&gCardId=${cardId}`
//     );
//   }
// );

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
