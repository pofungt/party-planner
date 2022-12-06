import express, { Request, Response } from 'express';
import { client } from '../app';
import { Events } from '../util/models';
import { onlyNumbers } from '../util/functions/onlyNumbers';
import { logger } from '../util/logger';
import { isLoggedInAPI, isLoggedInInvitation } from '../util/guard';
import { eventDetailsRoutes } from './eventDetailsRoutes';
import { venuePollRoutes } from './venuePollRoutes';
import { datetimePollRoutes } from './datetimePollRoutes';

import crypto from 'crypto';
import { eventInvitationRoutes } from './eventInvitationRoutes';

export const eventsRoutes = express.Router();

eventsRoutes.get('/created', isLoggedInAPI, getCreateEventList);
eventsRoutes.get('/participated', isLoggedInAPI, getParticipateEventList);
eventsRoutes.post('/', isLoggedInAPI, postEvent);
eventsRoutes.delete('/:eventId', isLoggedInAPI, deleteEvent);
eventsRoutes.delete('/participants/:eventId', isLoggedInAPI, deleteParticipants);
eventsRoutes.use('/detail', isLoggedInAPI, eventDetailsRoutes);
eventsRoutes.use('/invitation', isLoggedInInvitation, eventInvitationRoutes);
eventsRoutes.use('/poll/venue', isLoggedInAPI, venuePollRoutes);
eventsRoutes.use('/poll/datetime', isLoggedInAPI, datetimePollRoutes);

// getCreatedEvents
async function getCreateEventList(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const [columnCountObject] = (
			await client.query(`SELECT COUNT(*) FROM events WHERE creator_id = $1 `, [req.session.user || 0])
		).rows;
		const columnCount = parseInt(columnCountObject.count);
		let currentPage = req.query.page + '';
		let offset: number = onlyNumbers(currentPage) ? (parseInt(currentPage) - 1) * 10 : 0;
		if (!columnCount) {
			currentPage = '1';
			offset = 0;
		} else if (Math.ceil(columnCount / 10) < parseInt(currentPage)) {
			currentPage = Math.ceil(columnCount / 10).toString();
			offset = (Math.ceil(columnCount / 10) - 1) * 10;
		}
		const result = await client.query(
			`
            SELECT * FROM events 
            WHERE creator_id = $1 
            ORDER BY start_datetime DESC, id DESC
            LIMIT 10 OFFSET $2;
            `,
			[req.session.user || 0, offset]
		);
		const eventList: Events[] = result.rows;
		res.json({
			object: eventList, // should be called eventList or events
			currentPage: currentPage,
			page: columnCount ? Math.ceil(columnCount / 10) : 1
		});
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[EVT001]: Failed to get Created Event List'
		});
	}
}
// getParticipatedEvents
async function getParticipateEventList(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const [columnCountObject] = (
			await client.query(
				`SELECT COUNT(events.*) FROM events
            INNER JOIN participants ON participants.event_id = events.id
            INNER JOIN users ON participants.user_id = users.id
            WHERE users.id = $1;`,
				[req.session.user || 0]
			)
		).rows;
		const columnCount = parseInt(columnCountObject.count);
		let currentPage = req.query.page as string;
		let offset: number = onlyNumbers(currentPage) ? (parseInt(currentPage) - 1) * 10 : 0;
		if (!columnCount) {
			currentPage = '1';
			offset = 0;
		} else if (Math.ceil(columnCount / 10) < parseInt(currentPage)) {
			currentPage = Math.ceil(columnCount / 10).toString();
			offset = (Math.ceil(columnCount / 10) - 1) * 10;
		}
		const result = await client.query(
			`
            SELECT events.* FROM events
            INNER JOIN participants ON participants.event_id = events.id
            INNER JOIN users ON participants.user_id = users.id
            WHERE users.id = $1
            ORDER BY events.start_datetime DESC, events.id DESC
            LIMIT 10 OFFSET $2;
            `,
			[req.session.user || 0, offset]
		);
		const eventList: Events[] = result.rows;
		res.json({
			object: eventList,
			currentPage: currentPage,
			page: columnCount ? Math.ceil(columnCount / 10) : 1
		});
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[EVT002]: Failed to get Participated Event List'
		});
	}
}

async function postEvent(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const invitation_token = crypto.randomBytes(64).toString('hex');
		await client.query(
			`INSERT INTO events 
                (name, venue, start_datetime, end_datetime, 
                creator_id, invitation_token, deleted, 
				date_poll_created,
				date_poll_terminated,
				venue_poll_created,
				venue_poll_terminated,
				created_at, updated_at) 
            VALUES ($1,$2,$3,$4,$5,$6,FALSE,FALSE,FALSE,FALSE,FALSE,
				CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
			[
				req.body.eventName,
				req.body.eventVenue,
				req.body.startTime,
				req.body.endTime,
				req.session.user,
				invitation_token
			]
		);
		res.json({ msg: 'Posted to DB' });
	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[EVT003]: Failed to post Event' });
	}
}

async function deleteParticipants(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.params.eventId ? parseInt(req.params.eventId) : 0;
		const [eventDetail] = (
			await client.query(
				`
			SELECT * FROM events
			WHERE creator_id = $1
			AND id = $2;
		`,
				[req.session.user, eventId]
			)
		).rows;
		const deletedParticipants: { id: number }[] = req.body.deletedParticipants;
		if (eventDetail) {
			const participantsWithItemAssigned = await client.query(
				`
				SELECT user_id FROM items
				WHERE user_id = ANY($1::int[])
			`,
				[deletedParticipants.map((p) => p.id)]
			);
			console.log(participantsWithItemAssigned);
			// Removed all of the ids from participantsWithItemAssigned
			// Then run delete

			let notDeletable = [];
			for (let deletedParticipant of req.body) {
				// n + 1 problem
				const itemInCharge = (
					await client.query(
						`
					SELECT * FROM items
					WHERE user_id = $1 AND event_id = $2 AND purchased = FALSE;
				`,
						[deletedParticipant.id, eventId]
					)
				).rows;
				if (itemInCharge.length) {
					notDeletable.push({
						deletedParticipant,
						itemInCharge
					});
				} else {
					await client.query(
						`
					DELETE FROM participants WHERE user_id = $1 and event_id = $2;
					`,
						[deletedParticipant.id, eventId]
					);
				}
			}
			res.json({
				status: true,
				notDeletable
			});
		} else {
			res.status(500).json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[EVT004]: Failed to delete Participants'
		});
	}
}

// Archived
async function deleteEvent(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.params.eventId ? parseInt(req.params.eventId) : 0;
		const [eventDetail] = (
			await client.query(
				`
			SELECT * FROM events
			WHERE creator_id = $1
			AND id = $2;
		`,
				[req.session.user, eventId]
			)
		).rows;
		if (eventDetail) {
			// Marked Delete
			await client.query(
				`
				UPDATE events SET deleted = TRUE
				WHERE id = $1;
			`,
				[eventId]
			);
			res.json({ status: true });
		} else {
			res.json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[EVT005]: Failed to delete Event'
		});
	}
}
