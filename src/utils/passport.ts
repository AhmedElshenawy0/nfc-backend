import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient, Client } from "@prisma/client";
import dotenv from "dotenv";
import { sendVerificationEmail } from "./sendEmail";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

const prisma = new PrismaClient();

// Define a custom user type to include isExist
type CustomUser = Client & { isExist: boolean };

// Serialize user in the session
passport.serializeUser((user: any, done) => {
  done(null, { email: user.email, isExist: user.isExist });
});

// Deserialize user from the session
passport.deserializeUser(
  async (userData: { email: string; isExist: boolean }, done) => {
    try {
      const user = await prisma.client.findUnique({
        where: { email: userData.email },
      });

      if (!user) return done(null, { email: userData.email, isExist: false });

      done(null, { ...user, isExist: true });
    } catch (err) {
      done(err, undefined);
    }
  }
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) return done(null, false);

        const cardType = req.cookies.cardType;
        const cardId = req.cookies.cardId;

        let user = await prisma.client.findUnique({
          where: { email },
        });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        if (!user?.emailVerified) {
          const token = uuidv4();

          await prisma.client.update({
            where: { email: user.email },
            data: { verificationToken: token },
          });

          await sendVerificationEmail(user.email, token, cardType, cardId);
          return done(null, false, {
            message:
              "Email not verified. A new verification email has been sent.",
          });
        }

        // User exists, pass isExist = true
        return done(null, { ...user, isExist: true } as CustomUser);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

//Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.client.findUnique({
          where: { email },
          include: { soldServices: true },
        });

        if (!user) {
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, { ...user, isExist: true });
      } catch (error) {
        return done(error);
      }
    }
  )
);
export default passport;
