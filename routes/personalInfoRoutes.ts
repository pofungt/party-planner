import express, { Request, Response } from "express";
import { client } from "../app";
import { checkPassword, hashPassword } from "../util/functions/hash";
import { logger } from "../util/logger";
import { Users, UsersInput } from "../util/models";
import jsonfile from "jsonfile";
import { isLoggedInAPI } from "../util/guard";

export const personalInfoRoutes = express.Router();


personalInfoRoutes.get("/", isLoggedInAPI, getPersonalInfo);
personalInfoRoutes.put("/", isLoggedInAPI, updatePersonalInfo);

async function getPersonalInfo(req: Request, res: Response) {
  try {
    logger.debug("Before reading DB");

    const result = await client.query(
      `SELECT * FROM users
            WHERE id = $1
            `,
      [req.session.user])

    const user: Users = result.rows[0];
    res.json(user);

  } catch (e) {
    logger.error(e);
    res.status(500).json({
      msg: "[ERR001]: Failed to get information",
    });
  }
}

async function updatePersonalInfo(req: Request, res: Response) {
  try {
    logger.debug("Before reading DB");

    if (!req.body.current_password) {

      // update DB without new password
      
      await client.query(
        `UPDATE users 
            SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4`,
        [
          req.body.first_name,
          req.body.last_name,
          req.body.phone,
          req.session.user
        ]
      );

      // update JSON with existing password

      const usersList: UsersInput[] = await jsonfile.readFile(
        "./util/database/data/users.json"
      );

      const currentPassword = usersList.filter((user) => {
        return user.email === req.body.email
      })[0].password

      const newUsersList = usersList.filter((user) => {
        return user.email !== req.body.email;
      });

      const usersUpdateObj: UsersInput = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        password: currentPassword,
      };

      newUsersList.push(usersUpdateObj);

      await jsonfile.writeFile("./util/database/data/users.json", newUsersList, {
        spaces: "\t",
      });

      res.json({ status: true });

    } else if (req.body.current_password) {

      //check if input password is correct

      const hashedPassword = await client.query(
        `SELECT password FROM users 
                WHERE id = $1`,
        [req.session.user])

      if (!(await checkPassword(req.body.current_password, hashedPassword.rows[0].password))) {
        res.status(400)
        throw new Error(`Failed login attempt from user ${req.session.user}`)
      }

      // update DB with new password

      const password = await hashPassword(req.body.password);
      await client.query(
        `UPDATE users 
            SET first_name = $1, last_name = $2, phone = $3, password = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5`,
        [
          req.body.first_name,
          req.body.last_name,
          req.body.phone,
          password,
          req.session.user
        ]
      );

      // update JSON with new password

      let UsersList: UsersInput[] = await jsonfile.readFile(
        "./util/database/data/users.json"
      );

      const newUsersList = UsersList.filter((user) => {
        return user.email !== req.body.email;
      });

      const usersUpdateObj: UsersInput = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
      };

      newUsersList.push(usersUpdateObj);

      await jsonfile.writeFile("./util/database/data/users.json", newUsersList, {
        spaces: "\t",
      });

      res.json({ status: true });
    }

  } catch (e) {
    logger.error(e);
    res.status(400).json({
      msg: "[UPD001]: Failed to update information at Database",
    });
  }
}
