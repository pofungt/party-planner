import express, { Request, Response } from 'express';
import { client } from '../app';
import { checkPassword, hashPassword } from '../util/functions/hash';
import { logger } from '../util/logger';
import { Users } from '../util/models';
import { isLoggedInAPI } from '../util/guard';

export const personalInfoRoutes = express.Router();

personalInfoRoutes.get('/', isLoggedInAPI, getPersonalInfo);
personalInfoRoutes.put('/', isLoggedInAPI, updatePersonalInfo);

async function getPersonalInfo(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');

		const result = await client.query(
			`SELECT * FROM users
            WHERE id = $1
            `,
			[req.session.user]
		);

		const user: Users = result.rows[0];
		res.json(user);
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ERR001]: Failed to get information'
		});
	}
}

async function updatePersonalInfo(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');

		await client.query(
			`UPDATE users 
		SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4`,
			[req.body.first_name, req.body.last_name, req.body.phone, req.session.user]
		);

		if (req.body.current_password) {
			//check if input password is correct

			const hashedPassword = await client.query(
				`SELECT password FROM users 
                WHERE id = $1`,
				[req.session.user]
			);

			if (!(await checkPassword(req.body.current_password, hashedPassword.rows[0].password))) {
				res.status(400);
				throw new Error(`Failed login attempt from user ${req.session.user}`);
			}

			// update DB with new password

			const password = await hashPassword(req.body.password);
			await client.query(
				`UPDATE users 
            SET password = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2`,
				[password, req.session.user]
			);
		}
		res.json({ status: true });
	} catch (e) {
		logger.error(e);
		res.status(400).json({
			msg: '[UPD001]: Failed to update information at Database'
		});
	}
}
