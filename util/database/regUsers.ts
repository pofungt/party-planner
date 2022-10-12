import pg from 'pg';
import dotenv from 'dotenv';
import jsonfile from 'jsonfile';
import path from 'path';
import { newJsonFile } from '../functions/newJsonFile';
import { hashPassword } from '../functions/hash';
import { UsersInput, DataParts } from '../models';

dotenv.config();

const client = new pg.Client({
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD
});

let newUsersNumber: number = 5;
const newUsersString: string | undefined = process.argv[2];
if (newUsersString) {
	if (/^\d+$/.test(newUsersString)) {
		newUsersNumber = parseInt(newUsersString);
	}
}
let usersNewObjList: UsersInput[] = [];
let counter = 0;

async function test() {
	const [usersDB] = (await client.query(`SELECT * FROM users;`)).rows;
	// If empty table
	if (!usersDB) {
		const test = 'test';
		const testPassword = await hashPassword(test);
		await client.query(
			`INSERT INTO users 
      (id,first_name,last_name,email,phone,password,created_at,updated_at) 
      VALUES (-1,$1,$2,$3,'647-111-1111',$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
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

async function main() {
	await client.connect();

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
	let originalUsersList: UsersInput[] = await jsonfile.readFile(path.join(__dirname, '/data/users.json'));
	const finalUsersList: UsersInput[] = originalUsersList.concat(usersNewObjList);
	await jsonfile.writeFile(path.join(__dirname, '/data/users.json'), finalUsersList, { spaces: '\t' });

	client.end();
}

main();
