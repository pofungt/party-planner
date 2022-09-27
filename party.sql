CREATE DATABASE party;

CREATE TABLE users (
    id SERIAL primary key,
    first_name varchar not NULL,
    last_name varchar not NULL,
    email varchar not NULL,
    phone int,
    password varchar,
    created_at timestamp not NULL,
    updated_at timestamp not NULL
);

CREATE TABLE events (
    id SERIAL primary key,
    name varchar not NULL,
    venue varchar,
    budget int,
    date date,
    start_time time,
    end_time time,
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

