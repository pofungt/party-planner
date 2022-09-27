import { client } from "../app";

client.query(`
TRUNCATE TABLE users;

TRUNCATE TABLE events;

TRUNCATE TABLE participants;

TRUNCATE TABLE items;

TRUNCATE TABLE time_blocks;

TRUNCATE TABLE time_block_item;

TRUNCATE TABLE comments;

TRUNCATE TABLE event_venues;

TRUNCATE TABLE event_venues_votes;

TRUNCATE TABLE event_date_time;

TRUNCATE TABLE event_date_time_votes;
`);