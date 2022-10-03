import express, { Request, Response } from "express";
import { client } from "../app";
import { Events } from "../util/models";
import { onlyNumbers } from "../util/functions/onlyNumbers";
import { logger } from "../util/logger";

export const eventsRoutes = express.Router();

eventsRoutes.get("/created", getCreateEventList);
eventsRoutes.get("/participated", getParticipateEventList);
eventsRoutes.post("/", postEvent);

async function getCreateEventList(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
        const offset: number = onlyNumbers(req.query.page as string)
            ? (parseInt(req.query.page as string) - 1) * 10
            : 0;
        const result = await client.query(
            `
    SELECT * FROM events 
    WHERE creator_id = $1 
    ORDER BY date DESC, start_time DESC, id DESC
    LIMIT 10 OFFSET $2;
    `,
            [req.session.user || 0, offset]
        );
        const eventList: Events[] = result.rows;
        res.json(eventList);
    } catch (e) {
        logger.error(e);
        res.status(500).json({
            msg: "[EVT001]: Failed to get Created Event List",
        });
    }
}

async function getParticipateEventList(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
        const offset: number = onlyNumbers(req.query.page as string)
            ? (parseInt(req.query.page as string) - 1) * 10
            : 0;
        const result = await client.query(
            `
    SELECT events.* FROM events
    INNER JOIN participants ON participants.event_id = events.id
    INNER JOIN users ON participants.user_id = users.id
    WHERE users.id = $1
    ORDER BY events.date DESC, events.start_time DESC, events.id DESC
    LIMIT 10 OFFSET $2;;
    `,
            [req.session.user || 0, offset]
        );
        const eventList: Events[] = result.rows;
        res.json(eventList);
    } catch (e) {
        logger.error(e);
        res.status(500).json({
            msg: "[EVT002]: Failed to get Participated Event List",
        });
    }
}

async function postEvent(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
        await client.query(
            `INSERT INTO  events (name, venue, indoor, outdoor, date, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
                req.body.eventName,
                req.body.eventVenue,
                req.body.eventDate,
                req.body.indoor,
                req.body.outdoor,
                req.body.startTime.req.body.endTime,
            ]
        );
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[EVT003]: Failed to post Event" });
    }
}
