import express, { Request, Response } from 'express';
import { client } from '../app';
import { isLoggedInAPI } from '../util/guard';
import { logger } from '../util/logger';

export const commentRoutes = express.Router();

commentRoutes.get('/', isLoggedInAPI, getComment);
commentRoutes.post('/', isLoggedInAPI, postComment);
commentRoutes.put('/', isLoggedInAPI, checkedComment);

async function getComment(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const userId = req.session.user;

		const events = (
			await client.query(
				`
        SELECT * from events
        JOIN participants ON participants.event_id = events.id
        WHERE participants.user_id = $1
        `,
				[userId]
			)
		).rows;

		const participantComment = (
			await client.query(
				`
        SELECT comments.id, comments.event_id, comments.content, comments.created_at, events.name, users.first_name, users.last_name, comments.read, comments.anonymous FROM participants
        JOIN events ON participants.event_id = events.id
        JOIN comments ON events.id = comments.event_id
        JOIN users on participants.user_id = users.id
        WHERE participants.user_id = $1
        ORDER BY comments.created_at Desc,
                 comments.read Asc
        `,
				[userId]
			)
		).rows;

		const creatorComment = (
			await client.query(
				`
        SELECT comments.read, comments.anonymous, comments.id, comments.event_id, comments.content, comments.created_at, events.name, users.first_name, users.last_name FROM comments
        JOIN events ON events.id = comments.event_id
        JOIN users ON comments.user_id =users.id
        WHERE events.creator_id = $1
        ORDER BY comments.created_at Desc,
                 comments.read Asc
        `,
				[userId]
			)
		).rows;

		res.json({
			status: true,
			events: events,
			pComment: participantComment,
			cComment: creatorComment
		});
		// 唔好用簡寫
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[CMT001]: Failed to get Comment'
		});
	}
}

async function postComment(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const userId = req.session.user;
		const eventId = parseInt(req.body.receiver);
		const category = req.body.category;
		const comment = req.body.comment;
		const anonymous = req.body.anonymous;

		await client.query(
			`
        INSERT INTO comments 
        (user_id, event_id, category, content, anonymous, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())

        `,
			[userId, eventId, category, comment, anonymous]
		);

		res.json({
			status: true,
			msg: 'comment sent successfully'
		});
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[MSG001]: Failed to send Comment'
		});
	}
}

async function checkedComment(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const userId = req.session.user;
		const commentId = parseInt(req.body.commentId);
		const eventId = req.body.eventId;
		const read = req.body.check;

		let isCreator = true;

		const creatorEvent = (
			await client.query(
				`
        SELECT creator_id FROM events
        WHERE id = $1 
        `,
				[eventId]
			)
		).rows[0];

		if (creatorEvent.creator_id !== userId) {
			isCreator = false;
		}

		if (isCreator) {
			await client.query(
				`
            UPDATE comments 
            SET read = $1,
            updated_at = $2
            WHERE id = $3
        `,
				[read, 'now()', commentId]
			);

			res.json({
				status: true,
				msg: 'Checked/Unchecked'
			});
		} else {
			res.status(400).json({
				status: false,
				msg: 'Unauthorized Request'
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[MSG002]: Failed to edit Comment'
		});
	}
}
