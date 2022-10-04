import express, { Request, Response } from "express";
import { logger } from "../util/logger";

export const itemsRoutes = express.Router();

itemsRoutes.get("/participated", getParticipateEventList);
itemsRoutes.get("/", getUserID);
itemsRoutes.get("/events",getEventList);
itemsRoutes.get("/items", getItem);

async function getItem (req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");


    } catch(e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM001]: Failed to post Item" });
    }
}

async function getParticipateEventList (req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");


    } catch(e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM]: Failed to post Item" });
    }
}

async function getUserID (req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");


    } catch(e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM]: Failed to post Item" });
    }
}

async function getEventList (req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");


    } catch(e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM]: Failed to post Item" });
    }
}