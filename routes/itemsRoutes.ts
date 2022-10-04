import express, { Request, Response } from "express";
import { logger } from "../util/logger";
import { client } from "../app";

export const itemsRoutes = express.Router();

itemsRoutes.get("/participated", getParticipateEventList);
itemsRoutes.get("/", getUserID);
itemsRoutes.get("/events", getEventList);
itemsRoutes.get("/items", getItem);

enum TypeName {
    Food = "food",
    Drink = "drink",
    Decoration = "decoration",
    Other = "other",
}

async function getItem(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
        const itemResult = await client.query(
            `
            SELECT item.type_name, item.name, item.quantity, item.price
            FROM items
            WHERE event_id = $1
            `
        );
        TypeName.Food;

        const itemObj = {
            [TypeName.Food]: [],
            [TypeName.Drink]: [],
            [TypeName.Decoration]: [],
            [TypeName.Other]: [],
        };

        for (const items of itemResult.rows) {
            itemObj[items.type_name].push(items);
        }
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM001]: Failed to post Item" });
    }
}

async function getParticipateEventList(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM]: Failed to post Item" });
    }
}

async function getUserID(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM]: Failed to post Item" });
    }
}

async function getEventList(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM]: Failed to post Item" });
    }
}
