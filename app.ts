import express from "express";
import expressSession from "express-session";
import path from "path";
import pg from "pg";
import dontenv from "dotenv";
import grant from "grant";

dontenv.config();

export const client = new pg.Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

client.connect();

const app = express();

const sessionMiddleware = expressSession({
  secret: process.env.SESSION_SECRET as string,
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

app.use(express.json());

app.use(sessionMiddleware, express.static("public"));

app.use(grantExpress as express.RequestHandler);

app.use((req, res) => {
  res.status(404);
  res.sendFile(path.resolve("./public/404.html"));
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/`);
});
