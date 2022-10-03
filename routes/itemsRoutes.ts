import express, { Request, Response } from "express";

export const itemsRoutes = express.Router();

async function getCreatItem (req: Request, res: Response) {
    try {

    } catch(e) {
        res.status(500).json({ msg: "[]: Failed to post Item" });
    }
}