import pg from 'pg';
import dotenv from 'dotenv';
import jsonfile from 'jsonfile';
import path from 'path';
import { newJsonFile } from '../functions/newJsonFile';
import { hashPassword } from '../functions/hash';
import { UsersInput, DataParts, Users } from '../models';
import { format } from 'date-fns';
import crypto from 'crypto';

dotenv.config();

const client = new pg.Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
});

let newUsersNumber: number = 100;
let usersNewObjList: UsersInput[] = [];
let counter = 0;
let loopTimes: number = 1;
let eventId: number = 1;
let participantAmount: number = 100;

async function test() {
    const [usersDB] = (await client.query(`SELECT * FROM users;`)).rows;
    // If empty table
    if (!usersDB) {
        const test = 'test';
        const testPassword = await hashPassword(test);
        await client.query(
            `INSERT INTO users 
      (id,first_name,last_name,email,password,created_at,updated_at) 
      VALUES (-1,$1,$2,$3,$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
            [test, test, test, testPassword]
        );

        const userObj: UsersInput = {
            first_name: 'test',
            last_name: 'test',
            email: 'test',
            phone: null,
            password: 'test'
        };
        // Push new user object to json for writing in users.json later
        usersNewObjList.push(userObj);
    }
}

function randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function main() {
    await client.connect();

    const [tableCount] = (await client.query(`
        select count(*)
        from information_schema.tables
        where table_schema = 'public';
    `)).rows;

    if (parseInt(tableCount.count)) {
        // clearDB
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
    }

    // initDB
    await client.query(`CREATE TABLE users (
        id SERIAL primary key,
        first_name varchar not NULL,
        last_name varchar not NULL,
        email varchar not NULL,
        phone varchar,
        password varchar not NULL,
        created_at timestamp not NULL,
        updated_at timestamp not NULL
    );
    
    CREATE TABLE events (
        id SERIAL primary key,
        name varchar not NULL,
        venue varchar,
        budget int,
        start_datetime timestamptz,
        end_datetime timestamptz,
        indoor boolean not NULL,
        outdoor boolean not NULL,
        parking_lot boolean not NULL,
        lot_number int,
        remark varchar,
        creator_id int not NULL,
        invitation_token varchar not NULL,
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
        created_at timestamp not NULL,
        updated_at timestamp not NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (event_id) REFERENCES events(id)
    );
    
    CREATE TABLE event_venues (
        id SERIAL primary key,
        name varchar not NULL,
        address_link varchar not NULL,
        indoor boolean,
        parking_slots int,
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
        date date not NULL,
        start_time time not NULL,
        end_time time not NULL,
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

    // regUsers 100
    // Create users.json file if not exist
    await newJsonFile();

    // Insert test user when DB is empty
    await test();

    // Read random data parts for data assembling
    let parts: DataParts = await jsonfile.readFile(path.join(__dirname, '/data/dataParts.json'));

    while (counter < newUsersNumber) {
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
            .substr(2, 3)}-${Math.random().toString().concat('0'.repeat(3)).substr(2, 4)}`;
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
            const userObj: UsersInput = {
                first_name,
                last_name,
                email,
                phone,
                password
            };
            // Push new user object to json for writing in users.json later
            usersNewObjList.push(userObj);
            counter++;
        }
    }

    // Writing into users.json
    await jsonfile.writeFile(path.join(__dirname, '/data/users.json'), usersNewObjList, { spaces: '\t' });

    // createEvents 1
    // Obtain users info for event creation for each user
    let users: Users[] = (await client.query(`SELECT * FROM users;`)).rows;
    for (let i = 0; i < loopTimes; i++) {
        for (const user of users) {
            // Party name
            const partyReason: string = parts['partyReason'][Math.floor(Math.random() * parts['partyReason'].length)];
            const name: string = `${user.first_name}'s ${partyReason} Party`;
            // Party venue
            const venue: string = `${Math.floor(Math.random() * 999) + 1} ${parts['streetName'][Math.floor(Math.random() * parts['streetName'].length)]
                }`;
            // Budget
            const budget: number = (Math.floor(Math.random() * 10) + 1) * 1000;

            // Date
            const date: string = format(new Date((new Date()).getTime() + 30 * 86_400_000), 'yyyy/MM/dd');
            const userDetail = (await client.query(`SELECT * FROM users WHERE email = $1;`, [user.email])).rows[0];
            // Time
            const start_time: string = `${randomIntFromInterval(12, 17)}:${Math.random() > 0.5 ? '00' : '30'}`;
            const end_time: string = `${randomIntFromInterval(18, 23)}:${Math.random() > 0.5 ? '00' : '30'}`;
            // DateTime
            const start_datetime: string = new Date(`${date} ${start_time}`).toISOString();
            const end_datetime: string = new Date(`${date} ${end_time}`).toISOString();

            // indoor or outdoor
            const indoor: boolean = Math.random() > 0.5 ? true : false;
            const outdoor: boolean = Math.random() > 0.5 ? true : false;

            // parking lot
            const parkingLot: boolean = Math.random() > 0.5 ? true : false;
            const lotNumber: number = parkingLot ? Math.floor(Math.random() * 10) : 0;

            // Creator id
            const creator_id: number = userDetail.id;

            // Invitation Token
            const invitation_token = crypto.randomBytes(64).toString('hex');

            await client.query(
                `INSERT INTO events 
                (name,venue,budget,start_datetime,end_datetime,indoor,outdoor,parking_lot,lot_number,remark,creator_id,invitation_token,created_at,updated_at) 
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,null,$10,$11,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
                [name, venue, budget, start_datetime, end_datetime, indoor, outdoor, parkingLot, lotNumber, creator_id, invitation_token]
            );
        }
    }

    // addparticipants 1 100
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
    const userIdListCopy = [...userIdList];

    const p_loopTimes: number = Math.min(
        userIdList.length,
        participantAmount
    );

    for (let i = 0; i < p_loopTimes; i++) {
        const usersIndex: number = Math.floor(
            Math.random() * userIdList.length
        );
        const [userId] = userIdList.splice(usersIndex, 1);
        await client.query(
            `INSERT INTO participants 
                  (event_id,user_id,created_at,updated_at) 
                  VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
            [eventId, userId]
        );
    }

    // addItems
    let types = ["food", "drink", "decoration", "other"];
    for (let type of types) {
        for (let i = 0; i < parts[type].length; i++) {
            await client.query(`
                INSERT INTO items 
                (name, purchased, type_name,  event_id, user_id, quantity, price, created_at, updated_at)
                VALUES ($1, $2 ,$3, 1, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            `,
                [
                    parts[type][i],
                    Math.random() > 0.5,
                    type,
                    userIdListCopy.splice(0, 1)[0],
                    Math.floor(Math.random() * 20),
                    Math.floor(Math.random() * 1000)
                ]
            )
        }
    }

    await client.end();
}

main();