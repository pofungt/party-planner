import express, { Request, Response } from "express";
import { client } from "../app";
import { checkPassword, hashPassword } from "../util/functions/hash";
import { logger } from "../util/logger";
import { Users, UsersInput } from "../util/models";
import jsonfile from "jsonfile";
import { isLoggedIn } from "../util/guard";

export const personalInfoRoutes = express.Router();

personalInfoRoutes.get("/", isLoggedIn, getUserID)
personalInfoRoutes.get("/personalPage/?id", isLoggedIn, getPersonalInfo);
personalInfoRoutes.put("/personalPage/update/?id", isLoggedIn, updatePersonalInfo);

async function getUserID(req :Request, res: Response) {
    const result = req.session.user
    res.json(result)
}


async function getPersonalInfo (req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");

        const result = await client.query(
            `SELECT * FROM users
            WHERE user_id = $1
            `, 
            [req.session.user])

        const user : Users[] = result.rows;
        res.json(user);

    } catch(e) {
        logger.error(e);
        res.status(500).json({
            msg: "[ERR001]: Failed to get information",
        });
    }
}

async function updatePersonalInfo (req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
        
        const hashedPassword :string  = (await client.query(
            `SELECT password FROM users 
            WHERE email = $1`, 
            [req.body.email])).rows[0]

        if (!checkPassword(req.body.currentPassword, hashedPassword)) {
            res.status(400)
            throw new Error ("the current password is incorrect")
        }
        //Updating DB
        const password = await hashPassword(req.body.password);
        await client.query(
          `UPDATE users 
          SET first_name = $1, last_name = $2, phone = $4, password = $5 
          WHERE email = $3;`,
          [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.phone,
            password,
          ]
        );
  
        // Writing into users.json
        const usersUpdateObj: UsersInput = {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          phone: req.body.phone,
          password: req.body.password,
        };
  
        let UsersList: UsersInput[] = await jsonfile.readFile(
          "../util/database/data/users.json"
        );
        UsersList.push(usersUpdateObj);
        await jsonfile.writeFile("../util/database/data/users.json", UsersList, {
          spaces: "\t",
        });
  
        res.json({ status: true });
      }  catch (e) {
        logger.error(e);
        res.status(400).json({
            msg: "[UPD001]: Failed to update information",
        });
    }
}
