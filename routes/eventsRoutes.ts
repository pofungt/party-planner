import express, { Request, Response } from 'express';
import { client } from '../app';
import { EventList } from '../util/models';

export const eventsRoutes = express.Router();

eventsRoutes.get('/', getEventList);

async function getEventList (req: Request, res: Response) {

	const result = await client.query("SELECT * FROM events;");
	const eventList: EventList[] = result.rows;
	res.json(eventList);
}

eventsRoutes.post('/')