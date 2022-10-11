import express, { Request, Response } from 'express';
import { client } from '../app';
import { isLoggedInAPI } from '../util/guard';
import { logger } from '../util/logger';

export const eventPollRoutes = express.Router();

eventPollRoutes.post('/venue/:id', isLoggedInAPI, createVenuePoll);
// Passed in by overwrite modal (confirmed by user)
eventPollRoutes.post('/venue/overwrite/:id', isLoggedInAPI, overwriteTerminatedPoll);

async function createVenuePoll(req: Request, res: Response) {
	try {
	} catch (e) {
        const [eventDetail] = (await client.query(`
            SELECT * FROM events
            WHERE id = $1 AND creator_id = $2;
        `,
        [parseInt(req.params.id), req.session.user]
        )).rows;

		if (eventDetail) {
			if (!eventDetail.venue_poll_created) {
				// Do stuff here
			} else {
				res.json({
					status: false,
					created: true
				});
			}
		} else {
			res.json({
				status: false
			});
		}

		logger.error(e);
		res.status(500).json({
			msg: '[ETP001]: Failed to create venue poll'
		});
	}
}

async function overwriteTerminatedPoll(req: Request, res: Response) {
	try {
	} catch (e) {
        const [eventDetail] = (await client.query(`
            SELECT * FROM events
            WHERE id = $1 AND creator_id = $2;
        `,
        [parseInt(req.params.id), req.session.user]
        )).rows;

		if (eventDetail) {
			// Overwriting
		} else {
			res.json({
				status: false
			});
		}

		logger.error(e);
		res.status(500).json({
			msg: '[ETP001]: Failed to create venue poll'
		});
	}
}