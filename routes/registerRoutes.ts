import express, { Request, Response } from 'express';
import jsonfile from 'jsonfile';
import { logger } from '../util/logger';
import { client } from '../app';
import { hashPassword } from '../util/functions/hash';
import { UsersInput } from '../util/models';
import { newJsonFile } from '../util/functions/newJsonFile';

export const registerRoutes = express.Router();

registerRoutes.post('/', registerUser);

async function registerUser(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');

		const loginUser = (
			await client.query(`SELECT * FROM users WHERE email = $1 OR phone = $2`, [
				req.body.email,
				!!req.body.phone ? req.body.phone : '0'
			])
		).rows[0];
		if (!loginUser) {
			const password = await hashPassword(req.body.password);
			await client.query(
				`INSERT INTO users (first_name, last_name, email, phone, password, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
				[req.body.first_name, req.body.last_name, req.body.email, req.body.phone, password]
			);

			// Create users.json file if not exist
			await newJsonFile();

			// Writing into users.json
			const usersNewObj: UsersInput = {
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
				phone: req.body.phone,
				password: req.body.password
			};

			// Writing into users.json
			let UsersList: UsersInput[] = await jsonfile.readFile('./util/database/data/users.json');
			UsersList.push(usersNewObj);
			await jsonfile.writeFile('./util/database/data/users.json', UsersList, {
				spaces: '\t'
			});

			res.json({ status: true });
		} else {
			res.status(401).json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[REG001]: Failed to Register' });
	}
}
