import express, { Request, Response } from "express";
import { client } from "../app";
import { isLoggedInAPI } from "../util/guard";
import { logger } from "../util/logger";

export const commentRoutes = express.Router();

commentRoutes.get('/', isLoggedInAPI, getComment);
commentRoutes.post('/', isLoggedInAPI, postComment); 

async function getComment (req: Request, res: Response){
    try {
        logger.debug('Before reading DB');
        const userId = req.session.user
        
        const comments = (await client.query(`
        SELECT * FROM events 
        JOIN comments ON events.id = comments.event_id
        JOIN users ON comments.user_id = users.id
        JOIN participants ON users.id = participants.user_id
        WHERE users.id = $1
        `, [userId])).rows

        const participantEvents = (await client.query(`
        SELECT * FROM comments 
        JOIN participants ON participants.user_id = comments.user_id
        JOIN events ON comments.event_id = events.id
        WHERE participants.user_id = $1
        `, [userId])).rows

        const creatorEvents = (await client.query(`
        SELECT * FROM comments 
        JOIN events ON comments.event_id = events.id
        WHERE events.creator_id = $1
        `, [userId])).rows

        res.json({
            status: true,
            pEvents: participantEvents,
            cEvents: creatorEvents,
            comment: comments,
        })
        
    } catch(e){
        logger.error(e)
        res.status(500).json({
            msg: '[CMT001]: Failed to get Comment'
        })
    }
}

async function postComment (){

}