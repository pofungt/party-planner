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

main();