import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoute from "../src/routes/authRoute";
import cardRoute from "../src/routes/cardRoute";
import clientRoute from "../src/routes/clientRoute";
import serviceRoute from "../src/routes/serviceRoute";
import soldServiceRoute from "../src/routes/soldRoute";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import bodyParser from "body-parser";
import "./utils/passport";
import path from "path";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

//=> Middleware
app.use(
  cors({
    // origin: process.env.CLIENT_URL, // Hnt=> Change to env
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret",
    resave: false, // Avoid recreating session on each request
    saveUninitialized: false, // Do not save empty sessions
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//=> routes
app.use("/api/auth", authRoute);
app.use("/api/cards", cardRoute);
app.use("/api/clients", clientRoute);
app.use("/api/services", serviceRoute);
app.use("/api/soldServices", soldServiceRoute);

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
//=> Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
