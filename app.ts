import express from "express";
import expressSession from "express-session";
import path from "path";
import pg from "pg";
import dontenv from "dotenv";
import grant from "grant";
import { loginRoutes } from "./routes/loginRoutes";
import { registerRoutes } from "./routes/registerRoutes";
import { eventsRoutes } from "./routes/eventsRoutes";
import { isLoggedIn } from "./util/guard";
import { personalInfoRoutes } from "./routes/personalInfoRoutes";

dontenv.config();

export const client = new pg.Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

client.connect();

const app = express();

const sessionMiddleware = expressSession({
  secret: process.env.SESSION_SECRET || "",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
});

declare module "express-session" {
  interface SessionData {
    user?: number;
  }
}

const grantExpress = grant.express({
  defaults: {
    origin: "http://localhost:8080",
    transport: "session",
    state: true,
  },
  google: {
    key: process.env.GOOGLE_CLIENT_ID || "",
    secret: process.env.GOOGLE_CLIENT_SECRET || "",
    scope: ["profile", "email"],
    callback: "/login/google",
  },
});

app.use(
  express.json(),
  sessionMiddleware,
  express.static("public", { index: "landingPage.html" }),
  grantExpress as express.RequestHandler
);

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/events", eventsRoutes);
app.use("/personal", personalInfoRoutes);

app.use(isLoggedIn, express.static("private"));

app.use((req, res) => {
  res.status(404).sendFile(path.resolve("./public/404.html"));
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/`);
});
