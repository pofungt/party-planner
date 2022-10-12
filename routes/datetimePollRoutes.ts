import express, { Request, Response } from 'express';
import { client } from '../app';
import { isLoggedInAPI } from '../util/guard';
import { logger } from '../util/logger';

export const datetimePollRoutes = express.Router();

datetimePollRoutes.get('/:id', isLoggedInAPI, getPollOptions);//Done
datetimePollRoutes.post('/:id', isLoggedInAPI, createPoll);//Done
datetimePollRoutes.delete('/:id', isLoggedInAPI, deletePoll);//Done
datetimePollRoutes.post('/overwrite/:id', isLoggedInAPI, overwriteTerminatedPoll);
datetimePollRoutes.post('/vote/:event_id/:vote_id', isLoggedInAPI, submitVoteChoice);//Done

async function getPollOptions(req: Request, res: Response) {
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
			if (eventDetail.date_poll_created) {
				const pollOptions = (await client.query(`
					SELECT * FROM event_date_time WHERE event_id = $1;
				`,
					[eventId]
				)).rows;
				let voteCounts = {};
				for (let pollOption of pollOptions) {
					const [voteCount] = (await client.query(`
						SELECT COUNT(*) FROM event_date_time_votes
						WHERE event_date_time_id = $1;
					`,
						[pollOption.id]
					)).rows;
					voteCounts[pollOption.id] = voteCount;
				}
				res.json({
					status: true,
					creator: true,
					pollTerminated: eventDetail.date_poll_terminated,
					eventDeleted: eventDetail.deleted,
					pollOptions,
					voteCounts
				});
			} else {
				res.json({ status: false });
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
				if (eventDetailParticipant.date_poll_created) {
					const pollOptions = (await client.query(`
						SELECT * FROM event_date_time WHERE event_id = $1;
					`,
						[eventId]
					)).rows;
					let voteCounts = {};
					for (let pollOption of pollOptions) {
						const [voteCount] = (await client.query(`
							SELECT COUNT(*) FROM event_date_time_votes
							WHERE event_date_time_id = $1;
						`,
							[pollOption.id]
						)).rows;
						voteCounts[pollOption.id] = voteCount;
					}
					const [choiceMade] = (await client.query(`
						SELECT * FROM event_date_time_votes 
						WHERE event_date_time_id IN (SELECT id FROM event_date_time
													WHERE event_id = $1)
						AND user_id = $2;
					`,
						[eventId, userId]
					)).rows;
					let chosenDateTime;
					if (choiceMade) {
						[chosenDateTime] = (await client.query(`
							SELECT * FROM event_date_time
							WHERE id = $1;
						`,
							[choiceMade.event_date_time_id]
						)).rows;
					}
					res.json({
						status: true,
						creator: false,
						pollTerminated: eventDetailParticipant.date_poll_terminated,
						eventDeleted: eventDetailParticipant.deleted,
						choice: choiceMade
							? {
								id: `option_${choiceMade.event_date_time_id}`,
								start: `${chosenDateTime.start_datetime}`,
								end: `${chosenDateTime.end_datetime}`
							}
							: "",
						pollOptions,
						voteCounts
					});
				} else {
					res.json({ status: false });
				}
			} else {
				res.json({ status: false });
			}
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[DTP001]: Failed to get datetime poll options'
		});
	}
}

async function createPoll(req: Request, res: Response) {
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
			if (!eventDetail.date_poll_created) {
				const inputList = req.body;
				for (let input of inputList) {
					await client.query(`
						INSERT INTO event_date_time (start_datetime,end_datetime, event_id, created_at, updated_at)
						VALUES ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
					`,
						[input.start, input.end, eventId]
					);
					await client.query(`
						UPDATE events 
						SET date_poll_created = TRUE
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
			msg: '[DTP002]: Failed to create datetime poll'
		});
	}
}

async function deletePoll(req: Request, res: Response) {
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
			if (eventDetail.date_poll_created) {
				if (!eventDetail.date_poll_terminated) {
					await client.query(`
					UPDATE events SET date_poll_terminated = TRUE
					WHERE id = $1;
					`,
						[eventId]
					);
					res.json({ status: true });
				} else {
					res.json({
						status: false,
						terminated: true
					});
				}
			} else {
				res.json({
					status: false,
					noPoll: true
				});
			}
		} else {
			res.json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[DTP003]: Failed to delete datetime poll'
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
				DELETE FROM event_date_time_votes 
				WHERE event_date_time_id IN (SELECT id FROM event_date_time
											WHERE event_id = $1);
			`,
				[eventId]
			);
			await client.query(`
				DELETE FROM event_date_time WHERE event_id = $1;
			`,
				[eventId]
			);
			await client.query(`
				UPDATE events 
				SET date_poll_created = FALSE, 
                date_poll_terminated = FALSE
				WHERE id = $1;
			`,
				[eventId]
			);

			const inputList = req.body;
			for (let input of inputList) {
				await client.query(`
				INSERT INTO event_date_time (start_datetime,end_datetime, event_id, created_at, updated_at)
				VALUES ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
			`,
					[input.start, input.end, eventId]
				);
				await client.query(`
				UPDATE events 
				SET date_poll_created = TRUE
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
			msg: '[DTP004]: Failed to overwrite datetime poll'
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
				SELECT * FROM event_date_time_votes
				WHERE event_date_time_id IN (SELECT id FROM event_date_time
											WHERE event_id = $1);
			`,
				[eventId]
			)).rows;
			if (!choiceMade) {
				await client.query(`
					INSERT INTO event_date_time_votes
					(event_date_time_id,user_id,created_at,updated_at)
					VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
				`,
					[parseInt(req.params.vote_id), userId]);
				res.json({ status: true });
			} else {
				res.json({
					status: false,
					duplicate: true
				})
			}
		} else {
			res.json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[DTP005]: Failed to submit datetime vote'
		});
	}
}