import express, { Request, Response } from "express";
import { logger } from "../util/logger";
import { client } from "../app";

export const itemsRoutes = express.Router();

itemsRoutes.get("/participated", getParticipateEventList);
itemsRoutes.get("/events", getEventList);
itemsRoutes.get("/", getItem);
itemsRoutes.post("/eventId/:id", postItem);
itemsRoutes.delete("/items/:id", deleteItem);

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
            SELECT items.type_name, items.name, items.quantity, items.price, items.id, users.first_name
            FROM items
            INNER JOIN users ON users.id = items.user_id
            WHERE event_id = $1
            `,
            [req.query.eventID]
        );

        const itemObj = {
            [TypeName.Food]: [],
            [TypeName.Drink]: [],
            [TypeName.Decoration]: [],
            [TypeName.Other]: [],
        };

        for (const items of itemResult.rows) {
            itemObj[items.type_name].push(items);
        }
        res.json({ itemObj, status: true, msg: "get item from DB" });
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM001]: Failed to post Item" });
    }
}

async function getParticipateEventList(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
        const participateResult = await client.query(
            `
            SELECT users.first_name, users.last_name
            FROM participants
            INNER JOIN users ON users.id = participants.user_id
            WHERE event_id =$1
            `,
            [req.query.eventID]
        );

        res.json({
            user: participateResult.rows,
            status: true,
            msg: "get participant from DB",
        });
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM002]: Failed to post Item" });
    }
}

async function getEventList(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM004: Failed to post Item" });
    }
}

async function postItem(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");
        await client.query(
            `INSERT INTO items
                (type_name, name, quantity, price, user_id, event_id,
                 created_at, updated_at )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            `,
            [
                req.body.typeName,
                req.body.itemName,
                req.body.itemQuantity,
                req.body.itemPrice,
                req.session.user,
                req.params.id,
                "now()",
                "now()",
            ]
        );

        res.json({ status: true, msg: "Posted to DB" });
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM005]: Failed to post Item" });
    }
}

async function deleteItem(req: Request, res: Response) {
    try {
        logger.debug("Before reading DB");

        await client.query(
            `
            DELETE FROM items where item.id = $1
            `,
            [req.params.id]
        );

        res.json({ status: true, msg: "successfully delete" });
    } catch (e) {
        logger.error(e);
        res.status(500).json({ msg: "[ITM006]: Failed to post Item" });
    }
}
