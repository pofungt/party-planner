import express, { Request, Response } from 'express';
import { logger } from '../util/logger';
import { client } from '../app';

export const itemsRoutes = express.Router();

itemsRoutes.get('/participated', getParticipateEventList);
itemsRoutes.get('/', getItem);
itemsRoutes.post('/eventId/:id', postItem);
itemsRoutes.delete('/:id', deleteItem);
itemsRoutes.get('/pendingItems',getPendingItem);
itemsRoutes.put('/pendingItems/:id',updateItemStatus)

enum TypeName {
	Food = 'food',
	Drink = 'drink',
	Decoration = 'decoration',
	Other = 'other'
}

async function getItem(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');

			const itemResult = await client.query(
				`
				SELECT items.type_name, items.name, items.quantity, items.price, items.id, users.first_name, users.last_name
				FROM items
				INNER JOIN users ON users.id = items.user_id
				WHERE event_id = $1
				`,
				[req.query.eventID]
			);
	
			const itemObj = {
				[TypeName.Food]: [],
				[TypeName.Drink]: [],
				[TypeName.Decoration]: [],
				[TypeName.Other]: []
			};
	

		for (const items of itemResult.rows) {
			itemObj[items.type_name].push(items);
		}
		res.json({ itemObj, status: true, msg: 'get item from DB' });
	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[ITM001]: Failed to post Item' });
	}
}

async function getParticipateEventList(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');
		const participateResult = await client.query(
			`
            SELECT users.first_name, users.last_name, users.id
            FROM participants
            INNER JOIN users ON users.id = participants.user_id
            WHERE event_id =$1
            `,
			[req.query.eventID]
		);

		res.json({
			user: participateResult.rows,
			status: true,
			msg: 'get participant from DB'
		});
	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[ITM002]: Failed to post Item' });
	}
}

async function postItem(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');

		const result = await client.query(
			`INSERT INTO items
                (type_name, name, quantity, price, user_id, event_id, purchased, 
                 created_at, updated_at )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
            RETURNING *
            `,
			[
				req.body.typeName,
				req.body.itemName,
				req.body.itemQuantity,
				req.body.itemPrice,
				req.body.user_id,
				req.params.id,
				'false',
				'now()',
				'now()'
			]
		);

		res.json({ result: result.rows, status: true, msg: 'Posted to DB' });
	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[ITM005]: Failed to post Item' });
	}
}

async function deleteItem(req: Request, res: Response) {
	try {
		logger.debug('Before reading DB');

		await client.query(
			`
            DELETE FROM items where items.id = $1
            `,
			[req.params.id]
		);

		res.json({ status: true, msg: 'successfully delete' });
	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[ITM006]: Failed to post Item' });
	}
}

async function getPendingItem (req: Request, res: Response) {
	try{
		logger.debug('Before reading DB');
		const result = await client.query(
			`
			SELECT items.name, items.id, items.type_name FROM items 
			WHERE purchased = 'false' AND event_id = $1
			`,
			[req.query.eventID]

		);

		const itemObj = {
			[TypeName.Food]: [],
			[TypeName.Drink]: [],
			[TypeName.Decoration]: [],
			[TypeName.Other]: []
		};

		for(const items of result.rows) {
			itemObj[items.type_name].push(items);
		}
		res.json({itemObj, status: true, msg: 'get pending items from DB'})
		
	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[ITM007]: Failed to post Pending Items'})
	}
}

async function updateItemStatus (req: Request, res: Response) {
	try{
		logger.debug('Before reading DB');

		const result = await client.query(
			`
			UPDATE items SET purchased = 'true'
			WHERE items.id = $1
			`,
			[req.params.id]
		);
		res.json({updateItem:result.rows, status: true, msg: 'update pending items from DB'})

	} catch (e) {
		logger.error(e);
		res.status(500).json({ msg: '[ITM008]: Failed to update Pending Items'})
	}
}