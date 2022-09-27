import { client } from "../app";

client.query(`
DROP TABLE users;

DROP TABLE events;

DROP TABLE participants;

DROP TABLE items;

DROP TABLE time_blocks;

DROP TABLE time_block_item;

DROP TABLE comments;

DROP TABLE event_venues;

DROP TABLE event_venues_votes;

DROP TABLE event_date_time;

DROP TABLE event_date_time_votes;
`);