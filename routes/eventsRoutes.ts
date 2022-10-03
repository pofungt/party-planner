import express, { Request, Response } from "express";
import { client } from "../app";
import { Events } from "../util/models";

export const eventsRoutes = express.Router();

eventsRoutes.get("/created", getCreateEventList);
eventsRoutes.get("/participated", getParticipateEventList);
eventsRoutes.post("/", postEvent);

async function getCreateEventList(req: Request, res: Response) {
  const result = await client.query(
    `
	SELECT * FROM events 
	WHERE creator_id = $1 
	ORDER BY date DESC, start_time DESC, id DESC;
	`,
    [req.session.user || 0]
  );
  const eventList: Events[] = result.rows;
  res.json(eventList);
}

async function getParticipateEventList(req: Request, res: Response) {
  const result = await client.query(
    `
	SELECT events.* FROM events
	INNER JOIN participants ON participants.event_id = events.id
	INNER JOIN users ON participants.user_id = users.id
	WHERE users.id = $1
	ORDER BY events.date DESC, events.start_time DESC, events.id DESC;
	`,
    [req.session.user || 0]
  );
  const eventList: Events[] = result.rows;
  res.json(eventList);
}

async function postEvent(req: Request, res: Response) {
  await client.query(
    `INSERT INTO  events (name, venue, indoor, outdoor, date, start_time,end_time) VALUES ($1,$2,$3,$4,$5)`,
    [
      req.body.eventName,
      req.body.eventVenue,
      req.body.eventDate,
      req.body.indoor,
      req.body.outdoor,
      req.body.startTime.req.body.endTime,
    ]
  );
}
