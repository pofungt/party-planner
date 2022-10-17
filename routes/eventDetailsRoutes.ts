import express, { Request, Response } from 'express';
import { client } from '../app';
import { logger } from '../util/logger';
import crypto from 'crypto';

export const eventDetailsRoutes = express.Router();

eventDetailsRoutes.get('/created/:id', getCreatedEventDetails);
eventDetailsRoutes.get('/participated/:id', getParticipatedEventDetails);
eventDetailsRoutes.get('/invitation/:id', getInvitationLink);
eventDetailsRoutes.put('/datetime/:id', updateDateTime);
eventDetailsRoutes.put('/venue/:id', updateVenue);

async function getCreatedEventDetails(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.params.id;
		const [event] = (
			await client.query(
				`
            SELECT * FROM events
            WHERE id = $1
            AND creator_id = $2;
        `,
				[parseInt(eventId), req.session.user]
			)
		).rows;

		if (event) {
			const [creatorDetail] = (
				await client.query(
					`
				SELECT * FROM users
				WHERE id = $1;
			`,
					[req.session.user]
				)
			).rows;
			const participantList = (
				await client.query(
					`
                SELECT users.id, users.first_name, users.last_name FROM users
                INNER JOIN participants ON participants.user_id = users.id
                INNER JOIN events ON participants.event_id = events.id
                WHERE events.id = $1;
            `,
					[parseInt(eventId)]
				)
			).rows;
			res.json({
				status: true,
				creator: {
					id: creatorDetail.id,
					first_name: creatorDetail.first_name,
					last_name: creatorDetail.last_name
				},
				detail: event,
				participants: participantList
			});
		} else {
			res.json({
				status: false
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETD001]: Failed to get Created Event Details'
		});
	}
}

async function getParticipatedEventDetails(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.params.id;

		/* 
			events 
			INNER join users as creator on events.creator_id = users.id
			INNER JOIN participants on ON participants.event_id = events.id
			INNER JOIN users ON participants.user_id = users.id
		*/
		const [event] = (
			await client.query(
				`
            SELECT events.* FROM events
            INNER JOIN participants ON participants.event_id = events.id
            INNER JOIN users ON participants.user_id = users.id
            WHERE events.id = $1 AND users.id = $2;
        `,
				[parseInt(eventId), req.session.user]
			)
		).rows;

		if (event) {
			const [creatorDetail] = (
				await client.query(
					`
				SELECT * FROM users
				INNER JOIN events ON events.creator_id = users.id
				WHERE events.id = $1;
			`,
					[parseInt(eventId)]
				)
			).rows;
			const participantList = (
				await client.query(
					`
                SELECT users.id, users.first_name, users.last_name FROM users
                INNER JOIN participants ON participants.user_id = users.id
                INNER JOIN events ON participants.event_id = events.id
                WHERE events.id = $1;
            `,
					[parseInt(eventId)]
				)
			).rows;

			res.json({
				status: true,
				creator: {
					id: creatorDetail.id,
					first_name: creatorDetail.first_name,
					last_name: creatorDetail.last_name
				},
				detail: event,
				participants: participantList
			});
		} else {
			res.json({
				status: false
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETD002]: Failed to get Participated Event Details'
		});
	}
}

async function getInvitationLink(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.params.id;
		const [event] = (
			await client.query(
				`
            SELECT * FROM events
            WHERE id = $1
            AND creator_id = $2;
        `,
				[parseInt(eventId), req.session.user]
			)
		).rows;

		if (event) {
			const invitation_token = crypto.randomBytes(64).toString('hex');
			await client.query(
				`
				UPDATE events SET invitation_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;
			`,
				[invitation_token, parseInt(eventId)]
			);
			res.json({
				status: true,
				invitation_token
			});
		} else {
			res.json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETD005]: Failed to copy invitation link'
		});
	}
}

async function updateDateTime(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.params.id;
		// CORRECT
		const [event] = (
			await client.query(
				`
            SELECT * FROM events
            WHERE id = $1
            AND creator_id = $2;
        `,
				[parseInt(eventId), req.session.user]
			)
		).rows;

		if (event) {
			await client.query(
				`
                UPDATE events
                SET start_datetime = $1, end_datetime = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3;
            `,
				[req.body.startTime, req.body.endTime, parseInt(eventId)]
			);
			res.json({ status: true });
		} else {
			res.json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETD003]: Failed to update date/time'
		});
	}
}

async function updateVenue(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.params.id;
		const [event] = (
			await client.query(
				`
            SELECT * FROM events
            WHERE id = $1
            AND creator_id = $2;
        `,
				[parseInt(eventId), req.session.user]
			)
		).rows;

		if (event) {
			await client.query(
				`
                UPDATE events
                SET venue = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2;
            `,
				[req.body.venue, parseInt(eventId)]
			);
			res.json({ status: true });
		} else {
			res.json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETD004]: Failed to update venue'
		});
	}
}
