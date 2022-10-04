import express, { Request, Response } from "express";
import { logger } from "../util/logger";

export const itemsRoutes = express.Router();

itemsRoutes.get("/participated", getParticipateEventList);
itemsRoutes.get("/", getUserID);
itemsRoutes.get("/events",getEventList);

async function getItem (req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");


    } catch(e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM]: Failed to post Item" });
    }
}