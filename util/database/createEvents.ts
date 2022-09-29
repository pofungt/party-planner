import pg from 'pg';
import dotenv from 'dotenv';
import jsonfile from "jsonfile";
import path from "path";

dotenv.config();

const client = new pg.Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

async function main() {
    await client.connect();

    let eventsData = await jsonfile.readFile(path.join(__dirname,"/data/events.json"));
    const usersList = (await client.query(`SELECT * FROM users;`)).rows;
    for (const index in usersList) {
        const userId = usersList[index].id;
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
                userId
            ]
        );
    }

    client.end();
}

main();