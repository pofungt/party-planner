import pg from 'pg';
import dotenv from 'dotenv';
import { Users, Events } from '../models';

dotenv.config();

const client = new pg.Client({
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD
});

let loopTimes: number = 1;
const loopTimesString: string | undefined = process.argv[2];
if (loopTimesString) {
	if (/^\d+$/.test(loopTimesString)) {
		loopTimes = parseInt(loopTimesString);
	}
}

async function main() {
	await client.connect();

	// Obtain users info for event creation for each user
	let users: Users[] = (await client.query(`SELECT * FROM users;`)).rows;
	for (let i = 0; i < loopTimes; i++) {
		for (let user of users) {
			// Obtain events where user is neither creator or participant
			const eventsList: Events[] = (
				await client.query(
					`SELECT DISTINCT events.* FROM events
                LEFT JOIN participants ON events.id = participants.event_id
                WHERE (participants.user_id ISNULL OR participants.user_id != $1) AND events.creator_id != $1;`,
					[user.id]
				)
			).rows;
			const event_id = eventsList[Math.floor(Math.random() * eventsList.length)].id;

			await client.query(
				`INSERT INTO participants 
                (event_id,user_id,created_at,updated_at) 
                VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
				[event_id, user.id]
			);
		}
	}

	client.end();
}

main();
