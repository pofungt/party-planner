import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

async function main() {
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
}

main();