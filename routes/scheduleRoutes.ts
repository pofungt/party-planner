import express, { Request, Response } from "express";
import { client } from "../app";
import { isLoggedInAPI } from "../util/guard";
import { logger } from "../util/logger";

export const scheduleRoutes = express.Router();

scheduleRoutes.get("/event/:id", isLoggedInAPI, getEventSchedule)
scheduleRoutes.post("/event/:id", isLoggedInAPI)
scheduleRoutes.put("/event/:id", isLoggedInAPI)
scheduleRoutes.delete("/event/:id", isLoggedInAPI)

async function getEventSchedule (req: Request, res:Response) {
    try {
        logger.debug("Before reading DB");
        const eventId = req.params.id;
        const event = (await client.query(`
        SELECT * FROM events
        JOIN participants ON participants.event_id = events.id
        JOIN user ON participants.user_id = user.id
        WHERE id = $1
        AND user.id =$2;
    `,
    [parseInt(eventId), req.session.user]
    )).rows;

    console.log(event)

    res.json({
        status: true,
        detail: event,
    })
   
    } catch (e){
        logger.error(e);
        res.status(500).json({
            msg: "[ETS001]: Failed to get Event Schedule",
        });
    }
}