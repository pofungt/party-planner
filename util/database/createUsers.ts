import pg from 'pg';
import dotenv from 'dotenv';
import jsonfile from "jsonfile";
import path from "path";
import {hashPassword} from "../../util/hash";
import {Users} from "../models";

dotenv.config();

const client = new pg.Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

async function main() {
    await client.connect();

    let usersData: Omit<Users, "id" | "created_at" | "updated_at">[] = await jsonfile.readFile(path.join(__dirname,"/data/users.json"));
    for (const usersDatum of usersData) {
      const hashedPassword = await hashPassword(usersDatum.password);
      await client.query(
        `INSERT INTO users 
        (first_name,last_name,email,phone,password,created_at,updated_at) 
        VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
        [usersDatum.firstName, usersDatum.lastName, usersDatum.email, usersDatum.phone, hashedPassword]
      );
    }

    client.end();
}

main();