import express, { Request, Response } from "express";
import { client } from "../app";
import { isLoggedInAPI } from "../util/guard";
import { logger } from "../util/logger";

export const eventDetailsRoutes = express.Router();

eventDetailsRoutes.get("/created/:id", isLoggedInAPI, getCreatedEventDetails);
eventDetailsRoutes.get("/participated/:id", isLoggedInAPI, getParticipatedEventDetails);

async function getCreatedEventDetails(req:Request, res:Response) {
    try {
        logger.debug("Before reading DB");
        const eventId = req.params.id;
        const [event] = (await client.query(`
            SELECT * FROM events
            WHERE id = $1
            AND creator_id = $2;
        `,
        [parseInt(eventId), req.session.user]
        )).rows;
        if (event) {
            res.json({
                status: true,
                detail: event
            })
        } else {
            res.json({
                status: false
            })
        }
    } catch (e) {
        logger.error(e);
        res.status(500).json({
            msg: "[ETD001]: Failed to get Created Event Details",
        });
    }
}

async function getParticipatedEventDetails(req:Request, res:Response) {
    try {
        logger.debug("Before reading DB");
        const eventId = req.params.id;
        const [event] = (await client.query(`
            SELECT events.* FROM events
            INNER JOIN participants ON participants.event_id = events.id
            INNER JOIN users ON participants.user_id = users.id
            WHERE events.id = $1 AND users.id = $2;
        `,
        [parseInt(eventId), req.session.user]
        )).rows;
        if (event) {
            res.json({
                status: true,
                detail: event
            })
        } else {
            res.json({
                status: false
            })
        }
    } catch (e) {
        logger.error(e);
        res.status(500).json({
            msg: "[ETD002]: Failed to get Participated Event Details",
        });
    }
}