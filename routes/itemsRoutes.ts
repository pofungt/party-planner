import express, { Request, Response } from "express";
import { logger } from "../util/logger";
import {}

export const itemsRoutes = express.Router();

itemsRoutes.get("/participated", getParticipateEventList);

async function getItem (req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");


    } catch(e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM]: Failed to post Item" });
    }
}