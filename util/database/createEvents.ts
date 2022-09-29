import pg from 'pg';
import dotenv from 'dotenv';
import jsonfile from "jsonfile";
import path from "path";
import {Users} from "../models";
import {Events} from "../models";

dotenv.config();

const client = new pg.Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

async function main() {
    await client.connect();

    let usersData: Omit<Users, "id" | "created_at" | "updated_at">[] = await jsonfile.readFile(path.join(__dirname,"/data/users.json"));
    let eventsData: Omit<Events,"id" | "creator_id" | "created_at" | "updated_at">[] = await jsonfile.readFile(path.join(__dirname,"/data/events.json"));
    for (const index in eventsData) {
        const user = (await client.query(`SELECT * FROM users WHERE email = $1;`,[usersData[index].email])).rows[0];
        await client.query(
            `INSERT INTO events 
            (name,venue,budget,date,start_time,end_time,creator_id,created_at,updated_at) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
            [
                eventsData[index].name,
                eventsData[index].venue,
                eventsData[index].budget,
                eventsData[index].date,
                eventsData[index].start_time,
                eventsData[index].end_time,
                user.id
            ]
        );
    }

    client.end();
}

main();