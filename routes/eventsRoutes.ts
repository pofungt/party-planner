import express, { Request, Response } from 'express';
import { client } from '../app';
import { Events } from '../util/models';

export const eventsRoutes = express.Router();

eventsRoutes.get("/", getEventList);
eventsRoutes.post("/", postEvent);

async function getEventList(req: Request, res: Response) {
	const result = await client.query("SELECT * FROM events;");
	const eventList: Events[] = result.rows;
	res.json(eventList);
}

async function postEvent(req: Request, res: Response) {
	await client.query (
		`INSERT INTO  events (name, venue, indoor, outdoor, date, start_time,end_time) VALUES ($1,$2,$3,$4,$5)`,
		[req.body.eventName, req.body.eventVenue, req.body.eventDate, req.body.indoor, req.body.outdoor, req.body.startTime. req.body.endTime]
	);
}
