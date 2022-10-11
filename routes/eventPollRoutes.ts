import express, { Request, Response } from 'express';
import { client } from '../app';
import { isLoggedInAPI } from '../util/guard';
import { logger } from '../util/logger';

export const eventPollRoutes = express.Router();

eventPollRoutes.get('/venue/:id', isLoggedInAPI, getVenuePollOptions);
eventPollRoutes.post('/venue/:id', isLoggedInAPI, createVenuePoll);
eventPollRoutes.post('/venue/overwrite/:id', isLoggedInAPI, overwriteTerminatedPoll);
eventPollRoutes.post('/venue/vote/:event_id/:vote_id', isLoggedInAPI, submitVoteChoice);

async function getVenuePollOptions(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.id);
		const userId = req.session.user;
		const [eventDetail] = (await client.query(`
			SELECT * FROM events WHERE id = $1 AND creator_id = $2;
		`,
			[eventId, userId]
		)).rows;

		if (eventDetail) {
			if (eventDetail.venue_poll_created) {
				const pollOptions = (await client.query(`
					SELECT * FROM event_venues WHERE event_id = $1;
				`,
					[eventId]
				)).rows;
				res.json({
					status: true,
					creator: true,
					pollTerminated: eventDetail.venue_poll_terminated,
					eventDeleted: eventDetail.deleted,
					pollOptions
				});
			} else {
				res.json({status: false});
			}
		} else {
			const [participant] = (await client.query(`
				SELECT * FROM participants
				INNER JOIN events ON events.id = participants.event_id
				WHERE events.id = $1 AND participants.user_id = $2;
			`,
				[eventId, userId]
			)).rows;
			if (participant) {
				const [eventDetailParticipant] = (await client.query(`
					SELECT * FROM events WHERE id = $1;
				`,
					[eventId]
				)).rows;
				if (eventDetailParticipant.venue_poll_created) {
					const pollOptions = (await client.query(`
						SELECT * FROM event_venues WHERE event_id = $1;
					`,
						[eventId]
					)).rows;
					const [choiceMade] = (await client.query(`
						SELECT * FROM event_venues_votes 
						WHERE event_venues_id IN (SELECT id FROM event_venues
													WHERE event_id = $1)
						AND user_id = $2;
					`,
					[eventId, userId]
					)).rows;
					res.json({
						status: true,
						creator: false,
						pollTerminated: eventDetailParticipant.venue_poll_terminated,
						eventDeleted: eventDetailParticipant.deleted,
						choice: choiceMade ? `option_${choiceMade.event_venues_id}` : "0",
						pollOptions
					});
				} else {
					res.json({status: false});
				}
			} else {
				res.json({ status: false });
			}
		}
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
						[input, eventId]
					);
					await client.query(`
						UPDATE events 
						SET venue_poll_created = TRUE
						WHERE id = $1;
					`,
						[eventId]
					);
				}
				res.json({ status: true });
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
					[input, eventId]
				);
				await client.query(`
					UPDATE events 
					SET venue_poll_created = TRUE
					WHERE id = $1;
				`,
					[eventId]
				);
			}
			res.json({ status: true });
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

async function submitVoteChoice(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.event_id);
		const userId = req.session.user;
		const [participant] = (await client.query(`
			SELECT * FROM participants
			INNER JOIN events ON events.id = participants.event_id
			WHERE participants.user_id = $1
			AND events.id = $2;
		`,
		[userId, eventId]
		)).rows;
		if (participant) {
			const [choiceMade] = (await client.query(`
				SELECT * FROM event_venues_votes
				WHERE event_venues_id IN (SELECT id FROM event_venues
											WHERE event_id = $1);
			`,
			[eventId]
			)).rows;
			if (!choiceMade) {
				await client.query(`
					INSERT INTO event_venues_votes
					(event_venues_id,user_id,created_at,updated_at)
					VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
				`,
				[parseInt(req.params.vote_id),userId]);
				res.json({status: true});
			} else {
				res.json({
					status: false,
					duplicate: true
				})
			}
		} else {
			res.json({status: false});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETP003]: Failed to overwrite venue poll'
		});
	}
}