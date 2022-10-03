import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new pg.Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

async function main() {
  await client.connect();

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
        indoor boolean,
        outdoor boolean,
        parking_lot boolean,
        lot_number int,
        creator_id int not NULL,
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
        purchased_on date,
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
        description varchar not NULL,
        event_id int not NULL,
        user_id int not NULL,
        start_time time not NULL,
        end_time time not NULL,
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

  client.end();
}

main();
