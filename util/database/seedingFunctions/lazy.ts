import pg from 'pg';
import dotenv from 'dotenv';
import { addItems, addParticipants, clearDB, createEvents, initDB, regUsers } from '../dbSetupFunctions';

const newUsersNumber: number = 100;
const createEventsAmountPerUser: number = 1;
const eventId: number = 1;
const participantAmount: number = 100;

lazy();

async function lazy() {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

	await client.connect();

	const [tableCount] = (
		await client.query(`
        select count(*)
        from information_schema.tables
        where table_schema = 'public';
    `)
	).rows;

	await client.end();

	if (parseInt(tableCount.count)) {
		await clearDB();
	}

	await initDB();
	await regUsers(newUsersNumber);
	await createEvents(createEventsAmountPerUser);
	await addParticipants(eventId,participantAmount);
	await addItems(eventId);
}