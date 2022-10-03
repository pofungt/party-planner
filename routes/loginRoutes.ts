import express, { Request, Response } from "express";
import { logger } from "../util/logger";
import { client } from "../app";
import { checkPassword } from "../util/functions/hash";

export const loginRoutes = express.Router();

loginRoutes.post("/", checkLogin);
loginRoutes.get("/name", getName);

async function checkLogin(req: Request, res: Response) {
  try {
    logger.debug("Before reading DB");
    const loginUser = (
      await client.query(`SELECT * FROM users WHERE email = $1`, [
        req.body.email,
        
      ])
    ).rows[0];

    if (loginUser) {
      const match = await checkPassword(req.body.password, loginUser.password);
      if (match) {
        req.session.user = loginUser.id;
        res.json({
          status: true,
          user: loginUser.email,
        });
      } else {
        res.status(401).json({ status: false });
      }
    } else {
      res.status(401).json({ status: false });
    }
  } catch (e) {
    logger.error(e);
    res.status(500).json({ msg: "[LOG001]: Failed to check Login" });
  }
}

async function getName(req: Request, res: Response) {
  try {
    logger.debug("Before reading DB");
    const userName = (
      await client.query(`SELECT * FROM users WHERE id = $1`, [
        req.session.user
      ])
    ).rows[0];

    if (userName) {
      res.json({
        status: true,
        user: userName.first_name,
      });
    } else {
      res.status(401).json({ status: false });
    }
  } catch (e) {
    logger.error(e);
    res.status(500).json({ msg: "[LOG002]: Failed to get Name" });
  }
}