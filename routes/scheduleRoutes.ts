import express, { Request, Response } from 'express';
import { client } from '../app';
import { isLoggedInAPI } from '../util/guard';
import { logger } from '../util/logger';

export const scheduleRoutes = express.Router();

scheduleRoutes.get('/', isLoggedInAPI, getEventSchedule);
scheduleRoutes.post('/activity', isLoggedInAPI, postEventSchedule);
scheduleRoutes.put('/description/edit', isLoggedInAPI, editDescription);
scheduleRoutes.put('/remark/edit', isLoggedInAPI, editRemark);
scheduleRoutes.put('/timeName/edit', isLoggedInAPI, editTimeName);
scheduleRoutes.post('/item', isLoggedInAPI, postItem);
scheduleRoutes.delete('/timeBlock/', isLoggedInAPI, deleteTimeBlock);

async function postItem(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const creator = req.query['is-creator'];
		const timeBlockId = req.query['id'];
		const itemList = req.body;
		const eventId = req.query['event-id'];

		const event = (
			await client.query(
				`
			SELECT start_datetime, end_datetime, deleted FROM events
			WHERE id = $1
		`,
				[eventId]
			)
		).rows[0];

		const isDeleted = event.deleted;
		const eventStartTimeInMin = event.start_datetime.getTime();
		const eventEndTimeInMin = event.end_datetime.getTime();
		const now = new Date().getTime();

		let isProcessing = true;

		if (eventStartTimeInMin < now && eventEndTimeInMin < now) {
			isProcessing = false;
			//event is finished
		}
		if (isDeleted) {
			isProcessing = false;
			//event was deleted by creator
		}

		if (creator === '1' && isProcessing) {
			// delete existing list
			await client.query(
				`
			DELETE FROM time_block_item
			WHERE time_block_item.time_block_id = $1
			`,
				[timeBlockId]
			);

			itemList.forEach(async (item: any) => {
				await client.query(
					`
				INSERT INTO time_block_item (time_block_id, item_id, created_at, updated_at)
				VALUES ($1, $2, $3, $4)
				`,
					[timeBlockId, `${item}`, 'now()', 'now()']
				);
			});

			res.json({
				status: true,
				msg: 'Items Added'
			});
		} else {
			res.status(400).json({
				msg: '[EER001]: Unauthorized Request'
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ITM003]: Failed to Add Show Item'
		});
	}
}

async function editTimeName(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.query['event-id'];
		const creator = req.query['is-creator'];
		const timeBlockId = parseInt(req.query['id'] as string);
		const date = req.query.date;
		const title = req.body.title;
		const startTime = req.body.editStartTime;
		const endTime = req.body.editEndTime;
		const color = req.body.editColor;

		const event = (
			await client.query(
				`
			SELECT start_datetime, end_datetime, deleted FROM events
			WHERE id = $1
		`,
				[eventId]
			)
		).rows[0];

		const isDeleted = event.deleted;
		const eventStartTimeInMin = event.start_datetime.getTime();
		const eventEndTimeInMin = event.end_datetime.getTime();
		const now = new Date().getTime();

		let isProcessing = true;

		if (eventStartTimeInMin < now && eventEndTimeInMin < now) {
			isProcessing = false;
			//event is finished
		}
		if (isDeleted) {
			isProcessing = false;
			//event was deleted by creator
		}

		if (creator === '1' && isProcessing) {
			//check time collision with existing time-blocks
			//bug: correct end time = 00:00 problem

			const existingActivities = (
				await client.query(
					`
                SELECT start_time, end_time, id FROM time_blocks
                WHERE event_id = $1
				AND date = $2
				AND id != $3
                ORDER BY start_time ASC;
                `,
					[eventId, date, timeBlockId]
				)
			).rows;

			let reject = false;

			const newStartTimeInMin = toMin(req.body.editStartTime);
			const newEndTimeInMin = toMin(req.body.editEndTime);

			existingActivities.forEach((activity) => {
				const startTimeInMin = toMin(activity.start_time);
				const endTimeInMin = toMin(activity.end_time);


				if (newStartTimeInMin > startTimeInMin && newStartTimeInMin < endTimeInMin ) {
					reject = true
					console.log("1")
				}
				if (newEndTimeInMin > startTimeInMin && newEndTimeInMin < endTimeInMin ) {
					reject = true
					console.log("2")
				}
				if (newStartTimeInMin <= startTimeInMin && newEndTimeInMin >= endTimeInMin ) {
					reject = true
					console.log("3")
				}
			});

			//writing update to DB
			if (reject) {
				res.status(400).json({
					msg: '[EER002]: Activity Start Time or End Time Overlapped with Existing Activity'
				});
			} else {
				await client.query(
					`
                UPDATE time_blocks
				SET title = $1,
					start_time = $2,
					end_time = $3,
					color = $4,
					updated_at = $5
				WHERE event_id = $6
				AND id = $7
				AND date = $8
				`,
					[title, startTime, endTime, color, 'now()', eventId, timeBlockId, date]
				);

				res.json({
					status: true,
					msg: 'Edit success'
				});
			}
		} else {
			res.json({
				status: false,
				msg: '[EER001]: Unauthorized Request'
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[TBE002]: Failed to Edit Time & Name'
		});
	}
}

async function editRemark(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.query['event-id'];
		const creator = req.query['is-creator'];
		const timeBlockId = req.query['id'];
		const date = req.query.date;
		const remark = req.body.remark;

		const event = (
			await client.query(
				`
			SELECT start_datetime, end_datetime, deleted FROM events
			WHERE id = $1
		`,
				[eventId]
			)
		).rows[0];

		const isDeleted = event.deleted;
		const eventStartTimeInMin = event.start_datetime.getTime();
		const eventEndTimeInMin = event.end_datetime.getTime();
		const now = new Date().getTime();

		let isProcessing = true;

		if (eventStartTimeInMin < now && eventEndTimeInMin < now) {
			isProcessing = false;
			//event is finished
		}
		if (isDeleted) {
			isProcessing = false;
			//event was deleted by creator
		}

		if (creator === '1' && isProcessing) {
			await client.query(
				`
                UPDATE time_blocks
				SET remark = $1,
					updated_at = $2
				WHERE event_id = $3
				AND id = $4
				AND date = $5
				`,
				[remark, 'now()', eventId, timeBlockId, date]
			);
			res.json({
				status: true,
				msg: 'Edit success'
			});
		} else {
			res.json({
				status: false,
				msg: '[EER001]: Unauthorized Request'
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[TBE001]: Failed to Edit Remark'
		});
	}
}

async function editDescription(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.query['event-id'];
		const creator = req.query['is-creator'];
		const timeBlockId = req.query['id'];
		const date = req.query.date;
		const description = req.body.description;

		const event = (
			await client.query(
				`
			SELECT start_datetime, end_datetime, deleted FROM events
			WHERE id = $1
		`,
				[eventId]
			)
		).rows[0];

		const isDeleted = event.deleted;
		const eventStartTimeInMin = event.start_datetime.getTime();
		const eventEndTimeInMin = event.end_datetime.getTime();
		const now = new Date().getTime();

		let isProcessing = true;

		if (eventStartTimeInMin < now && eventEndTimeInMin < now) {
			isProcessing = false;
			//event is finished
		}
		if (isDeleted) {
			isProcessing = false;
			//event was deleted by creator
		}

		if (creator === '1' && isProcessing) {
			await client.query(
				`
                UPDATE time_blocks
				SET description = $1,
					updated_at = $2
				WHERE event_id = $3
				AND id = $4
				AND date = $5
				`,
				[description, 'now()', eventId, timeBlockId, date]
			);
			res.json({
				status: true,
				msg: 'Edit success'
			});
		} else {
			res.json({
				status: false,
				msg: '[EER001]: Unauthorized Request'
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[TBE003]: Failed to Edit Description'
		});
	}
}

async function deleteTimeBlock(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.query['event-id'];
		const creator = req.query['is-creator'];
		const timeBlockId = req.query['id'];
		const date = req.query.date;

		const event = (
			await client.query(
				`
			SELECT start_datetime, end_datetime, deleted FROM events
			WHERE id = $1
		`,
				[eventId]
			)
		).rows[0];

		const isDeleted = event.deleted;
		const eventStartTimeInMin = event.start_datetime.getTime();
		const eventEndTimeInMin = event.end_datetime.getTime();
		const now = new Date().getTime();

		let isProcessing = true;

		if (eventStartTimeInMin < now && eventEndTimeInMin < now) {
			isProcessing = false;
			//event is finished
		}
		if (isDeleted) {
			isProcessing = false;
			//event was deleted by creator
		}

		if (creator === '1' && isProcessing) {
			await client.query(
				`
                DELETE FROM time_block_item 
                WHERE time_block_id = $1
				`,

				[timeBlockId]
			);

			await client.query(
				`
                DELETE FROM time_blocks 
                WHERE id = $1
                AND event_id = $2
				AND date = $3
				`,

				[timeBlockId, eventId, date]
			);
			res.json({
				status: true,
				msg: 'Delete success'
			});
		} else {
			res.status(400).json({
				status: false,
				msg: '[EER001]: Unauthorized Request'
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[TBD001]: Failed to Delete Time Block'
		});
	}
}

async function getEventSchedule(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.query['event-id'];
		const creator = req.query['is-creator'];
		let date = req.query.date;

		let event;
		if (creator === '1') {
			event = (
				await client.query(
					`
            SELECT * FROM events
            WHERE events.id = $1
            AND events.creator_id = $2

            `,
					[eventId, req.session.user]
				)
			).rows[0];
		} else {
			event = (
				await client.query(
					`
            SELECT * FROM events
            INNER JOIN participants ON participants.event_id = events.id
            WHERE events.id = $1
            AND participants.user_id = $2;
            `,
					[eventId, req.session.user]
				)
			).rows[0];
		}

		if (event.start_datetime) {
			if (date === 'null' || 'undefined') {
				const option = {
					hour12: false,
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				};
				let placeholder = event.start_datetime.toLocaleString('en-GB', option).split('/');
				date = `${placeholder[2]}${placeholder[1]}${placeholder[0]}`;
			}

			const activitiesArr = (
				await client.query(
					`
				SELECT * FROM time_blocks
				WHERE event_id = $1
				AND date = $2
				
			`,
					[eventId, date]
				)
			).rows;

			const itemList = (
				await client.query(
					`
				SELECT * FROM items
				WHERE items.event_id = $1
			`,
					[eventId]
				)
			).rows;

			const savedItemList = (
				await client.query(
					`
				SELECT * FROM items
				JOIN time_block_item ON items.id = time_block_item.item_id
				JOIN time_blocks ON time_block_item.time_block_id = time_blocks.id
				WHERE time_blocks.event_id = $1
				AND time_blocks.date = $2
			`,
					[eventId, date]
				)
			).rows;

			res.json({
				status: true,
				detail: event,
				activities: activitiesArr,
				items: itemList,
				savedItems: savedItemList
			});
		} else {
			res.json({ status: false });
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETS001]: Failed to get Event Schedule'
		});
	}
}

function toMin(timeInput: String) {
	const hourInMin = parseInt(timeInput.slice(0, 2)) * 60;
	const min = parseInt(timeInput.slice(3, 5));
	return hourInMin + min;
}

async function postEventSchedule(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const eventId = req.query['event-id'];
		const creator = req.query['is-creator'];
		const date = req.query.date;

		const event = (
			await client.query(
				`
			SELECT start_datetime, end_datetime, deleted FROM events
			WHERE id = $1
		`,
				[eventId]
			)
		).rows[0];

		const isDeleted = event.deleted;
		const eventStartTimeInMin = event.start_datetime.getTime();
		const eventEndTimeInMin = event.end_datetime.getTime();
		const now = new Date().getTime();

		let isProcessing = true;

		if (eventStartTimeInMin < now && eventEndTimeInMin < now) {
			isProcessing = false;
			//event is finished
		}
		if (isDeleted) {
			isProcessing = false;
			//event was deleted by creator
		}

		if (creator === '1' && isProcessing) {
			//check if start time and end time collided with existing activities

			const existingActivities = (
				await client.query(
					`
                SELECT start_time, end_time FROM time_blocks
                WHERE event_id = $1
				AND date = $2
                ORDER BY start_time ASC;
                `,
					[eventId, date]
				)
			).rows;

			let reject = false;

			existingActivities.forEach((activity) => {
				const startTimeInMin = toMin(activity.start_time);
				const endTimeInMin = toMin(activity.end_time);

				const newStartTimeInMin = toMin(req.body.startTime);
				const newEndTimeInMin = toMin(req.body.endTime);

				if (newStartTimeInMin > startTimeInMin && newStartTimeInMin < endTimeInMin) {
					reject = true;
				} else if (newEndTimeInMin > startTimeInMin && newEndTimeInMin < endTimeInMin) {
					reject = true;
				}
			});

			//writing request to DB
			if (reject) {
				res.status(400).json({
					msg: '[EER002]: Activity Start Time or End Time Overlapped with Existing Activity'
				});
			} else {
				await client.query(
					`
                INSERT INTO time_blocks 
                (title, description, event_id, user_id, start_time, 
                end_time, remark, date, color, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
					[
						req.body.title,
						req.body.description,
						eventId,
						req.session.user,
						req.body.startTime,
						req.body.endTime,
						req.body.remark,
						date,
						req.body.color,
						'now()',
						'now()'
					]
				);

				res.json({
					status: true,
					msg: 'save success'
				});
			}
		} else {
			res.status(400).json({
				msg: '[EER001]: Unauthorized Request'
			});
		}
	} catch (e) {
		logger.error(e);
		res.status(500).json({
			msg: '[ETS002]: Failed to Post Event Schedule'
		});
	}
}
