import express, { Request, Response } from "express";
import { client } from "../app";
import { isLoggedInAPI } from "../util/guard";
import { logger } from "../util/logger";

export const scheduleRoutes = express.Router();

scheduleRoutes.get("/", isLoggedInAPI, getEventSchedule)
scheduleRoutes.post("/", isLoggedInAPI)
scheduleRoutes.put("/", isLoggedInAPI)
scheduleRoutes.delete("/", isLoggedInAPI)

async function getEventSchedule(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
        const eventId = req.query["event-id"];
        const creator = req.query["is-creator"];
        
        let event
        
        if (creator === "1") {
            event = (await client.query(`
            SELECT * FROM events
            WHERE events.id = $1
            AND events.creator_id = $2;
            `,
                [eventId, req.session.user]
            )).rows[0];

        } else {
            event = (await client.query(`
            SELECT * FROM events
            INNER JOIN participants ON participants.event_id = events.id
            WHERE events.id = $1
            AND participants.user_id = $2;
            `,
                [eventId, req.session.user]
            )).rows[0];
        }

        console.log(event)

        res.json({
            status: true,
            detail: event,
        })


    } catch (e) {
        logger.error(e);
        res.status(500).json({
            msg: "[ETS001]: Failed to get Event Schedule",
        });
    }
}