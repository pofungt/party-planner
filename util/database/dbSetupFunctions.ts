import pg from 'pg';
import dotenv from 'dotenv';
import jsonfile from 'jsonfile';
import path from 'path';
import crypto from 'crypto';
import { hashPassword } from '../functions/hash';
import { DataParts, Users } from '../models';
import { format } from 'date-fns';
import { logger } from '../logger';

function randomDate(start: Date, days: number): Date {
	const startTime = start.getTime();
	const minusTime = startTime - days * 86_400_000;
	const plusTime = startTime + days * 86_400_000;
	return new Date(minusTime + Math.random() * (plusTime - minusTime));
}

function randomIntFromInterval(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function clearDB() {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

	await client.connect();

	await client.query(`
    DROP TABLE event_date_time_votes;
    DROP TABLE event_date_time;
    DROP TABLE event_venues_votes;
    DROP TABLE event_venues;
    DROP TABLE comments;
    DROP TABLE time_block_item;
    DROP TABLE time_blocks;
    DROP TABLE items;
    DROP TABLE participants;
    DROP TABLE events;
    DROP TABLE users;
    `);

	await client.end();
}

export async function initDB() {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

	await client.connect();

	await client.query(`CREATE TABLE users (
        id SERIAL primary key,
        first_name varchar not NULL,
        last_name varchar not NULL,
        email varchar not NULL,
        phone varchar not NULL,
        password varchar not NULL,
        created_at timestamp not NULL,
        updated_at timestamp not NULL
    );
    
    CREATE TABLE events (
        id SERIAL primary key,
        name varchar not NULL,
        venue varchar,
        start_datetime timestamptz,
        end_datetime timestamptz,
        creator_id int not NULL,
        invitation_token varchar not NULL,
        deleted boolean not NULL,
        date_poll_created boolean not NULL,
		date_poll_terminated boolean not NULL,
		venue_poll_created boolean not NULL,
		venue_poll_terminated boolean not NULL,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id)
    );
    
    CREATE TABLE participants (
        id SERIAL primary key,
        event_id int not NULL,
        user_id int not NULL,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE items (
        id SERIAL primary key,
        name varchar not NULL,
        purchased boolean not NULL,
        type_name varchar not NULL,
        event_id int not NULL,
        user_id int not NULL,
        quantity int,
        price int,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE time_blocks (
        id SERIAL primary key,
        title varchar not NULL,
        description varchar,
        event_id int not NULL,
        user_id int not NULL,
        date varchar,
        start_time time not NULL,
        end_time time not NULL,
        color varchar,
        remark varchar,
        remark_2 varchar,
        remark_3 varchar,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE time_block_item (
        id SERIAL primary key,
        item_id int not NULL,
        time_block_id int not NULL,
        quantity int,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (item_id) REFERENCES items(id),
        FOREIGN KEY (time_block_id) REFERENCES time_blocks(id)
    );
    
    CREATE TABLE comments (
        id SERIAL primary key,
        user_id int not NULL,
        event_id int not NULL,
        category varchar not NULL,
        content varchar not NULL,
        anonymous boolean not NULL,
		read boolean not NULL DEFAULT 'false',
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (event_id) REFERENCES events(id)
    );
    
    CREATE TABLE event_venues (
        id SERIAL primary key,
        address varchar not NULL,
        event_id int not NULL,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (event_id) REFERENCES events(id)
    );
    
    CREATE TABLE event_venues_votes (
        id SERIAL primary key,
        event_venues_id int not NULL,
        user_id int not NULL,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (event_venues_id) REFERENCES event_venues(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE event_date_time (
        id SERIAL primary key,
        start_datetime timestamptz not NULL,
        end_datetime timestamptz not NULL,
        event_id int not NULL,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (event_id) REFERENCES events(id)
    );
    
    CREATE TABLE event_date_time_votes (
        id SERIAL primary key,
        event_date_time_id int not NULL,
        user_id int not NULL,
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (event_date_time_id) REFERENCES event_date_time(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );`);

	client.end();
}

export async function regUsers(newUsersAmount: number) {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

	await client.connect();

	// Insert test user when DB is empty
	const [usersDB] = (await client.query(`SELECT * FROM users WHERE id = -1;`)).rows;
	if (!usersDB) {
		const first_name = 'Gordon';
		const last_name = 'Lau';
		const email = 'gordonlau@tecky.io';
		const phone = '647-111-1111';
		const testPassword = await hashPassword('test');
		await client.query(
			`INSERT INTO users 
			(id,first_name,last_name,email,phone,password,created_at,updated_at) 
			VALUES (-1,$1,$2,$3,$4,$5,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
			[first_name, last_name, email, phone, testPassword]
		);
	}

	// Read random data parts for data assembling
	let parts: DataParts = await jsonfile.readFile(path.join(__dirname, '/data/dataParts.json'));

	let counter = 0;
	while (counter < newUsersAmount) {
		// Names
		const first_name: string = parts['firstName'][Math.floor(Math.random() * parts['firstName'].length)];
		const last_name: string = parts['lastName'][Math.floor(Math.random() * parts['lastName'].length)];
		// Email
		const emailHost: string = parts['emailHost'][Math.floor(Math.random() * parts['emailHost'].length)];
		const email: string = `${first_name.toLowerCase()}${last_name.toLowerCase()}@${emailHost}`;
		// Phone
		const phoneAreaCode: string = parts['phoneAreaCode'][Math.floor(Math.random() * parts['phoneAreaCode'].length)];
		const phone: string = `${phoneAreaCode}-${Math.random()
			.toString()
			.concat('0'.repeat(3))
			.substring(2, 3)}-${Math.random().toString().concat('0'.repeat(3)).substring(2, 4)}`;
		// Password
		const password: string = 'test';
		const hashedPassword = await hashPassword(password);

		const [checkUsers] = (await client.query(`SELECT * FROM users WHERE email = $1 OR phone = $2;`, [email, phone]))
			.rows;
		if (!checkUsers) {
			await client.query(
				`INSERT INTO users 
        (first_name,last_name,email,phone,password,created_at,updated_at) 
        VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
				[first_name, last_name, email, phone, hashedPassword]
			);
			counter++;
		}
	}

	client.end();
}

export async function createEvents(eventNumbers: number) {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

	await client.connect();

	// Read random data parts for data assembling
	let parts: DataParts = await jsonfile.readFile(path.join(__dirname, '/data/dataParts.json'));

	// Obtain users info for event creation for each user
	let users: Users[] = (await client.query(`SELECT * FROM users;`)).rows;
	for (let i = 0; i < eventNumbers; i++) {
		for (const user of users) {
			// Party name
			const partyReason: string = parts['partyReason'][Math.floor(Math.random() * parts['partyReason'].length)];
			const name: string = `${user.first_name}'s ${partyReason} Party`;
			// Party venue
			const venue: string = `${Math.floor(Math.random() * 999) + 1} ${
				parts['streetName'][Math.floor(Math.random() * parts['streetName'].length)]
			}`;

			// Date
			const date: string = format(randomDate(new Date(), 100), 'yyyy/MM/dd');
			const userDetail = (await client.query(`SELECT * FROM users WHERE email = $1;`, [user.email])).rows[0];
			// Time
			const start_time: string = `${randomIntFromInterval(12, 17)}:${Math.random() > 0.5 ? '00' : '30'}`;
			const end_time: string = `${randomIntFromInterval(18, 23)}:${Math.random() > 0.5 ? '00' : '30'}`;
			// DateTime
			const start_datetime: string = new Date(`${date} ${start_time}`).toISOString();
			const end_datetime: string = new Date(`${date} ${end_time}`).toISOString();

			// Creator id
			const creator_id: number = userDetail.id;

			// Invitation Token
			const invitation_token = crypto.randomBytes(64).toString('hex');

			await client.query(
				`INSERT INTO events 
                (name,venue,start_datetime,end_datetime,
					creator_id,invitation_token,deleted,
					date_poll_created,
					date_poll_terminated,
					venue_poll_created,
					venue_poll_terminated,
					created_at,updated_at) 
                VALUES ($1,$2,$3,$4,$5,$6,FALSE,FALSE,FALSE,FALSE,FALSE,
					CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
				[
					name,
					venue,
					start_datetime,
					end_datetime,
					creator_id,
					invitation_token
				]
			);
		}
	}

	client.end();
}

export async function joinEvents(eventsJoinedPerUser: number) {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

	await client.connect();

	const eventsParticipantsRelations = (
		await client.query(
			`SELECT DISTINCT events.id as event_id, 
                            events.creator_id, 
                            participants.user_id as participants_id 
            FROM events
		    LEFT JOIN participants ON events.id = participants.event_id
            ORDER BY events.id, participants.user_id;
		`
		)
	).rows;
	let usersOfEventsList:
		| {
				(keys: number): {
					creator_id: number;
					participants_id: number[] | null[];
				};
		  }
		| {} = {};
	for (let relation of eventsParticipantsRelations) {
		if (!(relation.event_id in usersOfEventsList)) {
			usersOfEventsList[relation.event_id] = {
				creator_id: relation.creator_id,
				participants_id: relation.participants_id ? [relation.participants_id] : []
			};
		} else {
			usersOfEventsList[relation.event_id]['participants_id'].push(relation.participants_id);
		}
	}

	let usersIdList = (await client.query(`SELECT id FROM users;`)).rows;
	for (let userId of usersIdList) {
		let eventsJoined = 0;
		for (const eventId in usersOfEventsList) {
			const usersInfoInEvent = usersOfEventsList[eventId];
			if (usersInfoInEvent.creator_id !== userId.id && !usersInfoInEvent.participants_id.includes(userId.id)) {
				await client.query(
					`
                    INSERT INTO participants (event_id, user_id, created_at, updated_at)
                    VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
                `,
					[eventId, userId.id]
				);
				eventsJoined++;
			}

			if (eventsJoined === eventsJoinedPerUser) {
				break;
			}
		}
	}
	client.end();
}

export async function addParticipants(eventId: number, participantsAmount: number) {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

	await client.connect();
	try {
		// Get creator ID of the event (need to exclude)
		const [creatorUserObj] = (
			await client.query(
				`
        SELECT creator_id FROM events WHERE id = $1;
    `,
				[eventId]
			)
		).rows;

		if (!creatorUserObj) {
			throw new Error(`No such event (event id: ${eventId})!`);
		}

		const creatorUser: number = creatorUserObj.creator_id;

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

		// Obtain users info for event creation for each user (excluding creator)
		const userIdListRawObj: { [key: string]: number }[] = (
			await client.query(
				`
        SELECT id FROM users 
        WHERE id != $1;
    `,
				[creatorUser]
			)
		).rows;

		const userIdListRaw: number[] = userIdListRawObj.map((each) => {
			return each.id;
		});
		const participantsSet = new Set(participants);
		const userIdList = userIdListRaw.filter((userId) => {
			return !participantsSet.has(userId);
		});

		const loopTimes: number = Math.min(userIdList.length, participantsAmount);

		for (let i = 0; i < loopTimes; i++) {
			const usersIndex: number = Math.floor(Math.random() * userIdList.length);
			const [userId] = userIdList.splice(usersIndex, 1);
			await client.query(
				`INSERT INTO participants 
                  (event_id,user_id,created_at,updated_at) 
                  VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
				[eventId, userId]
			);
		}
	} catch (e) {
		logger.error(e);
	}
	client.end();
}

export async function addItems(eventId: number) {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

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

export async function truncateDB() {
	dotenv.config();

	const client = new pg.Client({
		database: process.env.DB_NAME,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	});

	await client.connect();

	await client.query(`
    DELETE FROM event_date_time_votes;
    DELETE FROM event_date_time;
    DELETE FROM event_venues_votes;
    DELETE FROM event_venues;
    DELETE FROM comments;
    DELETE FROM time_block_item;
    DELETE FROM time_blocks;
    DELETE FROM items;
    DELETE FROM participants;
    DELETE FROM events;
    DELETE FROM users;
    `);

	client.end();
	jsonfile.writeFile(path.join(__dirname, '/data/users.json'), []);
}
