import express, { Request, Response } from 'express';
import { logger } from '../util/logger';
import { client } from '../app';
import { hashPassword } from '../hash';

export const registerRoutes = express.Router();

registerRoutes.post('/', registerUser);

async function registerUser(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
    
		const loginUser = (await client.query(
			`SELECT * FROM users WHERE email = $1`,
			[req.body.email]
		)).rows[0];

		if (!loginUser) {
            const password = await hashPassword(req.body.password);
            await client.query(
                `INSERT INTO users (first_name, last_name, email, phone, password, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
                [req.body.first_name, req.body.last_name, req.body.email, req.body.phone, password]
            );
            res.json({status: true});
		} else {
			res.status(401).json({status: false});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[REG001]: Failed to Register' });
	}
}