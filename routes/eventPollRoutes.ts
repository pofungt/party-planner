import express, { Request, Response } from 'express';
import { client } from '../app';
import { isLoggedInAPI } from '../util/guard';
import { logger } from '../util/logger';

export const eventPollRoutes = express.Router();

eventPollRoutes.get('/venue/:id', isLoggedInAPI, getVenuePollOptions);
eventPollRoutes.post('/venue/:id', isLoggedInAPI, createVenuePoll);
eventPollRoutes.post('/venue/overwrite/:id', isLoggedInAPI, overwriteTerminatedPoll);

async function getVenuePollOptions(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');

	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETP001]: Failed to get venue poll options'
		});
	}
}

async function createVenuePoll(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.id);
		const [eventDetail] = (await client.query(`
			SELECT * FROM events
			WHERE id = $1 AND creator_id = $2;
		`,
		[eventId, req.session.user]
		)).rows;

		if (eventDetail) {
			if (!eventDetail.venue_poll_created) {
				const inputList = req.body;
				for (let input of inputList) {
					await client.query(`
						INSERT INTO event_venues (address, event_id, created_at, updated_at)
						VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
					`,
					[input,eventId]
					);
					await client.query(`
						UPDATE events 
						SET venue_poll_created = TRUE
						WHERE id = $1;
					`,
					[eventId]
					);
				}
				res.json({status: true});
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
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETP002]: Failed to create venue poll'
		});
	}
}

async function overwriteTerminatedPoll(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.id);
        const [eventDetail] = (await client.query(`
            SELECT * FROM events
            WHERE id = $1 AND creator_id = $2;
        `,
        [eventId, req.session.user]
        )).rows;

		if (eventDetail) {
			// Initialize the polling data
			await client.query(`
				DELETE FROM event_venues_votes 
				WHERE event_venues_id IN (SELECT id FROM event_venues
											WHERE event_id = $1);
			`,
			[eventId]
			);
			await client.query(`
				DELETE FROM event_venues WHERE event_id = $1;
			`,
			[eventId]
			);
			await client.query(`
				UPDATE events 
				SET venue_poll_created = FALSE, 
					venue_poll_terminated = FALSE
				WHERE id = $1;
			`,
			[eventId]
			);

			const inputList = req.body;
			for (let input of inputList) {
				await client.query(`
					INSERT INTO event_venues (address, event_id, created_at, updated_at)
					VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
				`,
				[input,eventId]
				);
				await client.query(`
					UPDATE events 
					SET venue_poll_created = TRUE
					WHERE id = $1;
				`,
				[eventId]
				);
			}
			res.json({status: true});
		} else {
			res.json({
				status: false
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETP003]: Failed to overwrite venue poll'
		});
	}
}