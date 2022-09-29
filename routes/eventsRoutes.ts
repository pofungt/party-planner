import express, { Request, Response } from 'express';
import { client } from '../app';
import { EventList } from '../util/models';

export const eventsRoutes = express.Router();

eventsRoutes.get("/", getEventList);

async function getEventList(req: Request, res: Response) {
    const result = await client.query(
        "select events.id as ID, events.name as name, event_venues.name as party_name, event_date_time.date as date, events.start_time as start_time, events.end_time as end_time join event_venues on events.id = event_venues.id, join event_date_time on id = id"
    );
    const eventList: EventList[] = result.rows;

	const result = await client.query("SELECT * FROM events;");
	const eventList: EventList[] = result.rows;
	res.json(eventList);
}


// add new event page
eventsRoutes.post("/", postEvent);

async function postEvent(req: Request, res: Response) {

	console.log
	req.session.user = awiat client.query (
		`INSERT INTO  events (name, venue, indoor, outdoor, date, start_time,end_time) VALUES ($1,$2,$3,$4,$5)`,
		[req.body.eventName, req.body.eventVenue, req.body.eventDate, req.body.indoor, req.body.outdoor, req.body.startTime. req.body.endTime]
	);
}
