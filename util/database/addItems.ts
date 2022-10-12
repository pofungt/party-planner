import pg from 'pg';
import dotenv from 'dotenv';
import { logger } from '../logger';
import { DataParts } from '../models';
import jsonfile from 'jsonfile';
import path from 'path';

dotenv.config();

const client = new pg.Client({
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD
});

let eventId: number = 0;
const eventIdString: string | undefined = process.argv[2]; 
// 　一定要係作一個standalone javascript 咁run 
if (eventIdString) {
	if (/^\d+$/.test(eventIdString)) {
		eventId = parseInt(eventIdString);
	}
}

// Database Seeding, basic data  
async function main() {
	await client.connect();
	try {
		// Read random data parts for data assembling
		let parts: DataParts = await jsonfile.readFile(path.join(__dirname, '/data/dataParts.json'));

		// Get participant ID of the event (need to exclude)
		const participantsObj: { [key: string]: number }[] = (
			await client.query(
				`
            SELECT user_id FROM participants
            WHERE event_id = $1;
        `,
				[eventId]
			)
		).rows;
		const participants = participantsObj.map((each) => {
			return each.user_id;
		});

		// addItems
		let types = ['food', 'drink', 'decoration', 'other'];
		for (let type of types) {
			for (let i = 0; i < parts[type].length; i++) {
				await client.query(
					`
                    INSERT INTO items 
                    (name, purchased, type_name,  event_id, user_id, quantity, price, created_at, updated_at)
                    VALUES ($1, $2 ,$3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
                `,
					[
						parts[type][i],
						Math.random() > 0.5,
						type,
						eventId,
						participants.splice(0, 1)[0],
						Math.floor(Math.random() * 20),
						Math.floor(Math.random() * 1000)
					]
				);
			}
		}
	} catch (e) {
		logger.error(e);
	}
	client.end();
}

main();

export async function addItems(eventId: number) {
	await client.connect();
	try {
		// Read random data parts for data assembling
		let parts: DataParts = await jsonfile.readFile(path.join(__dirname, '/data/dataParts.json'));

		// Get participant ID of the event (need to exclude)
		const participantsObj: { [key: string]: number }[] = (
			await client.query(
				`
            SELECT user_id FROM participants
            WHERE event_id = $1;
        `,
				[eventId]
			)
		).rows;
		const participants = participantsObj.map((each) => {
			return each.user_id;
		});

		// addItems
		let types = ['food', 'drink', 'decoration', 'other'];
		for (let type of types) {
			for (let i = 0; i < parts[type].length; i++) {
				await client.query(
					`
                    INSERT INTO items 
                    (name, purchased, type_name,  event_id, user_id, quantity, price, created_at, updated_at)
                    VALUES ($1, $2 ,$3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
                `,
					[
						parts[type][i],
						Math.random() > 0.5,
						type,
						eventId,
						participants.splice(0, 1)[0],
						Math.floor(Math.random() * 20),
						Math.floor(Math.random() * 1000)
					]
				);
			}
		}
	} catch (e) {
		logger.error(e);
	}
	client.end();
}
