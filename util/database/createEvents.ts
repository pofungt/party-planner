import pg from "pg";
import dotenv from "dotenv";
import jsonfile from "jsonfile";
import path from "path";
import { format } from "date-fns";
import { Users, DataParts } from "../models";

dotenv.config();

const client = new pg.Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

let loopTimes: number = 1;
const loopTimesString: string | undefined = process.argv[2];
if (loopTimesString) {
  if (/^\d+$/.test(loopTimesString)) {
    loopTimes = parseInt(loopTimesString);
  }
}

function randomDate(start: Date, days: number): Date {
  const startTime = start.getTime();
  const minusTime = startTime - days * 86_400_000;
  const plusTime = startTime + days * 86_400_000;
  return new Date(minusTime + Math.random() * (plusTime - minusTime));
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function main() {
  await client.connect();

  // Read random data parts for data assembling
  let parts: DataParts = await jsonfile.readFile(
    path.join(__dirname, "/data/dataParts.json")
  );

  // Obtain users info for event creation for each user
  let users: Users[] = (await client.query(`SELECT * FROM users;`)).rows;
  for (let i = 0; i < loopTimes; i++) {
    for (const user of users) {
      // Party name
      const partyReason: string =
        parts["partyReason"][
          Math.floor(Math.random() * parts["partyReason"].length)
        ];
      const name: string = `${user.first_name}'s ${partyReason} Party`;
      // Party venue
      const venue: string = `${Math.floor(Math.random() * 999) + 1} ${
        parts["streetName"][
          Math.floor(Math.random() * parts["streetName"].length)
        ]
      }`;
      // Budget
      const budget: number = (Math.floor(Math.random() * 10) + 1) * 1000;

      // Date
      const date: string = format(randomDate(new Date(), 100), "yyyy/MM/dd");
      const userDetail = (
        await client.query(`SELECT * FROM users WHERE email = $1;`, [
          user.email,
        ])
      ).rows[0];
      // Time
      const start_time: string = `${randomIntFromInterval(12, 17)}:${
        Math.random() > 0.5 ? "00" : "30"
      }`;
      const end_time: string = `${randomIntFromInterval(18, 23)}:${
        Math.random() > 0.5 ? "00" : "30"
      }`;
      // DateTime
      const start_datetime: string = new Date(`${date} ${start_time}`).toISOString();
      const end_datetime: string = new Date(`${date} ${end_time}`).toISOString();

      // indoor or outdoor
      const indoor: boolean = Math.random() > 0.5 ? true : false;
      const outdoor: boolean = Math.random() > 0.5 ? true : false;

      // Creator id
      const creator_id: number = userDetail.id;

      await client.query(
        `INSERT INTO events 
                (name,venue,budget,start_datetime,end_datetime,indoor,outdoor,creator_id,created_at,updated_at) 
                VALUES ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
        [name, venue, budget, start_datetime, end_datetime, indoor, outdoor, creator_id]
      );
    }
  }

  client.end();
}

main();
