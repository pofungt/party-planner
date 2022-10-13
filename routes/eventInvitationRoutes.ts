import express, { Request, Response } from 'express';
import { client } from '../app';
import { logger } from '../util/logger';

export const eventInvitationRoutes = express.Router();

eventInvitationRoutes.post('/validation/:eventId/:token', validateInvitationToken);
eventInvitationRoutes.post('/participation/:eventId/:token', joinEvent);

async function validateInvitationToken(req: Request, res: Response) {
	try {
		const [eventDetail] = (
			await client.query(
				`
			SELECT * FROM events
			WHERE id = $1 AND invitation_token = $2;
		`,
				[req.params.eventId, req.params.token]
			)
		).rows;

		if (eventDetail) {
			res.json({
				status: true,
				eventDetail
			});
		} else {
			res.json({
				status: false,
				login: true// 唔洗問client side 的，因為server 本身知
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETD005]: Failed to validate invitation link'
		});
	}
}

async function joinEvent(req: Request, res: Response) {
	try {
		const [eventDetail] = (
			await client.query(
				`
			SELECT * FROM events
			WHERE id = $1 AND invitation_token = $2;
		`,
				[req.params.eventId, req.params.token]
			)
		).rows;

		if (eventDetail) {
			if (eventDetail.creator_id === req.session.user) {
				res.json({
					status: false,
					login: true,
					isCreator: true
				});
			} else {
				const [participant] = (
					await client.query(
						`
					SELECT * FROM participants
					WHERE event_id = $1 AND user_id = $2;
				`,
						[req.params.eventId, req.session.user]
					)
					// Insert On Conflict
					// Select -> exists -> update
					// |-> not exists -> insert
				).rows;
				if (participant) {
					res.json({
						status: false,
						login: true,
						joined: true
					});
				} else {
					await client.query(
						`
						INSERT INTO participants (event_id, user_id, created_at, updated_at)
						VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
					`,
						[req.params.eventId, req.session.user]
					);
					res.json({ status: true });
				}
			}
		} else {
			res.json({
				status: false,
				login: true
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETD006]: Failed to join event'
		});
	}
}