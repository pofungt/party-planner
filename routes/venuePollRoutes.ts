import express, { Request, Response } from 'express';
import { client } from '../app';
import { isLoggedInAPI } from '../util/guard';
import { logger } from '../util/logger';

export const venuePollRoutes = express.Router();

venuePollRoutes.get('/:id', isLoggedInAPI, getPollOptions);
venuePollRoutes.post('/:id', isLoggedInAPI, createPoll);
venuePollRoutes.delete('/:id', isLoggedInAPI, deletePoll);
venuePollRoutes.post('/overwrite/:id', isLoggedInAPI, overwriteTerminatedPoll);
venuePollRoutes.post('/vote/:event_id/:vote_id', isLoggedInAPI, submitVoteChoice);

async function getPollOptions(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.id);
		const userId = req.session.user;
		const [eventDetail] = (
			await client.query(
				`
			SELECT * FROM events WHERE id = $1 AND creator_id = $2;
		`,
				[eventId, userId]
			)
		).rows;

		if (eventDetail) {
			if (eventDetail.venue_poll_created) {
				// event_venues should join event_venues_votes
				const pollOptions = (
					await client.query(
						`
					SELECT * FROM event_venues WHERE event_id = $1;
				`,
						[eventId]
					)
				).rows;
				let voteCounts = {};
				for (let pollOption of pollOptions) { // n + 1 query problem
					const [voteCount] = (
						await client.query(
							`
						SELECT COUNT(*) FROM event_venues_votes
						WHERE event_venues_id = $1;
					`,
							[pollOption.id]
						)
					).rows;
					voteCounts[pollOption.id] = voteCount;
				}
				res.json({
					status: true,
					creator: true,
					pollTerminated: eventDetail.venue_poll_terminated,
					eventDeleted: eventDetail.deleted,
					pollOptions,
					voteCounts
				});
			} else {
				res.json({ status: false });
			}
		} else {

			// Should be participants join events join event_venues join event_venue_votes
			const [participant] = (
				await client.query(
					`
				SELECT * FROM participants
				INNER JOIN events ON events.id = participants.event_id
				WHERE events.id = $1 AND participants.user_id = $2;
			`,
					[eventId, userId]
				)
			).rows;
			if (participant) {
				const [eventDetailParticipant] = (
					await client.query(
						`
					SELECT * FROM events WHERE id = $1;
				`,
						[eventId]
					)
				).rows;
				if (eventDetailParticipant.venue_poll_created) {
					const pollOptions = (
						await client.query(
							`
						SELECT * FROM event_venues WHERE event_id = $1;
					`,
							[eventId]
						)
					).rows;
					let voteCounts = {};
					for (let pollOption of pollOptions) {
						const [voteCount] = (
							await client.query(
								`
							SELECT COUNT(*) FROM event_venues_votes
							WHERE event_venues_id = $1;
						`,
								[pollOption.id]
							)
						).rows;
						voteCounts[pollOption.id] = voteCount;
					}
					const [choiceMade] = (
						await client.query(
							`
						SELECT * FROM event_venues_votes 
						WHERE event_venues_id IN (SELECT id FROM event_venues
													WHERE event_id = $1)
						AND user_id = $2;
					`,
							[eventId, userId]
						)
					).rows;
					let chosenAddress;
					if (choiceMade) {
						[chosenAddress] = (
							await client.query(
								`
							SELECT * FROM event_venues
							WHERE id = $1;
						`,
								[choiceMade.event_venues_id]
							)
						).rows;
					}
					res.json({
						status: true,
						creator: false,
						pollTerminated: eventDetailParticipant.venue_poll_terminated,
						eventDeleted: eventDetailParticipant.deleted,
						choice: choiceMade
							? {
									id: `option_${choiceMade.event_venues_id}`,
									address: `${chosenAddress.address}`
							  }
							: '',
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
			msg: '[VNP001]: Failed to get venue poll options'
		});
	}
}

async function createPoll(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.id);
		const [eventDetail] = (
			await client.query(
				`
			SELECT * FROM events
			WHERE id = $1 AND creator_id = $2;
		`,
				[eventId, req.session.user]
			)
		).rows;

		if (eventDetail) {
			if (!eventDetail.venue_poll_created) {
				const inputList = req.body;
				for (let input of inputList) {
					await client.query(
						`
						INSERT INTO event_venues (address, event_id, created_at, updated_at)
						VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
					`,
						[input, eventId]
					);
					await client.query(
						`
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
			msg: '[VNP002]: Failed to create venue poll'
		});
	}
}

async function deletePoll(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.id);
		const [eventDetail] = (
			await client.query(
				`
			SELECT * FROM events
			WHERE id = $1 AND creator_id = $2;
		`,
				[eventId, req.session.user]
			)
		).rows;

		if (eventDetail) {
			if (eventDetail.venue_poll_created) {
				if (!eventDetail.venue_poll_terminated) {
					await client.query(
						`
					UPDATE events SET venue_poll_terminated = TRUE
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
			msg: '[VNP003]: Failed to delete venue poll'
		});
	}
}

// Should not have poll_created as the column , but poll_terminated can retain

async function overwriteTerminatedPoll(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.id);
		const [eventDetail] = (
			await client.query(
				`
            SELECT * FROM events
            WHERE id = $1 AND creator_id = $2;
        `,
				[eventId, req.session.user]
			)
		).rows;

		if (eventDetail) {
			// Initialize the polling data
			await client.query(
				`
				DELETE FROM event_venues_votes 
				WHERE event_venues_id IN (SELECT id FROM event_venues
											WHERE event_id = $1);
			`,
				[eventId]
			);
			await client.query(
				`
				DELETE FROM event_venues WHERE event_id = $1;
			`,
				[eventId]
			);
			await client.query(
				`
				UPDATE events 
				SET venue_poll_created = FALSE, 
					venue_poll_terminated = FALSE
				WHERE id = $1;
			`,
				[eventId]
			);

			const inputList = req.body;
			for (let input of inputList) {
				await client.query(
					`
					INSERT INTO event_venues (address, event_id, created_at, updated_at)
					VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
				`,
					[input, eventId]
				);
				await client.query(
					`
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
			msg: '[VNP004]: Failed to overwrite venue poll'
		});
	}
}

async function submitVoteChoice(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = parseInt(req.params.event_id);
		const userId = req.session.user;
		const [participant] = (
			await client.query(
				`
			SELECT * FROM participants
			INNER JOIN events ON events.id = participants.event_id
			WHERE participants.user_id = $1
			AND events.id = $2;
		`,
				[userId, eventId]
			)
		).rows;
		if (participant) {
			const [choiceMade] = (
				await client.query(
					`
				SELECT * FROM event_venues_votes
				WHERE event_venues_id IN (SELECT id FROM event_venues
											WHERE event_id = $1);
			`,
					[eventId]
				)
			).rows;
			if (!choiceMade) {
				await client.query(
					`
					INSERT INTO event_venues_votes
					(event_venues_id,user_id,created_at,updated_at)
					VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
				`,
					[parseInt(req.params.vote_id), userId]
				);
				res.json({ status: true });
			} else {
				res.json({
					status: false,
					duplicate: true
				});
			}
		} else {
			res.json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[VNP005]: Failed to submit vote choice'
		});
	}
}
