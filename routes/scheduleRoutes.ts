import express, { Request, Response } from "express";
import { client } from "../app";
import { isLoggedInAPI } from "../util/guard";
import { logger } from "../util/logger";

export const scheduleRoutes = express.Router();

scheduleRoutes.get("/", isLoggedInAPI, getEventSchedule);
scheduleRoutes.post("/activity", isLoggedInAPI, postEventSchedule);
scheduleRoutes.put("/", isLoggedInAPI);
scheduleRoutes.delete("/", isLoggedInAPI);



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
        )
      ).rows[0];
    } else {
      event = (
        await client.query(
          `
            SELECT * FROM events
            INNER JOIN participants ON participants.event_id = events.id
            WHERE events.id = $1
            AND participants.user_id = $2;
            `,
          [eventId, req.session.user]
        )
      ).rows[0];
    }

    const activitiesArr = (
      await client.query(
        `
            SELECT * FROM time_blocks
            WHERE event_id = $1
        `, [eventId])).rows

    console.log(activitiesArr);

    res.json({
      status: true,
      detail: event,
      activities: activitiesArr,
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      msg: "[ETS001]: Failed to get Event Schedule",
    });
  }
}

function toMin(timeInput: String) {
    const hourInMin = parseInt(timeInput.slice(0, 2)) * 60
    const min = parseInt(timeInput.slice(3, 5))
    return hourInMin + min
}

async function postEventSchedule(req: Request, res: Response) {

    try {
        logger.debug("Before reading DB");
        const eventId = req.query["event-id"];
        const creator = req.query["is-creator"];

        if (creator) {

            //check if start time and end time collided with existing activities

            const existingActivities = (await client.query(`
                SELECT start_time, end_time FROM time_blocks
                WHERE event_id = $1
                ORDER BY start_time ASC;
                `, [eventId])).rows

            let reject = false

            existingActivities.forEach((activity) => {
                const startTimeInMin = toMin(activity.start_time)
                const endTimeInMin = toMin(activity.end_time)

                const newStartTimeInMin = toMin(req.body.startTime)
                const newEndTimeInMin = toMin(req.body.endTime)

                if (newStartTimeInMin > startTimeInMin && newStartTimeInMin < endTimeInMin) {
                    reject = true
                } else if (newEndTimeInMin > startTimeInMin && newEndTimeInMin < endTimeInMin) {
                    reject = true
                }

                if (reject) {
                    res.status(400).json({
                        msg: "[EER002]: Activity Start Time or End Time Overlapped with Existing Activity",
                    });
                }
            })

            //writing request to DB

            if (!reject) {
                await client.query(`
                INSERT INTO time_blocks 
                (title, description, event_id, user_id, start_time, 
                end_time, remark, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        req.body.title,
                        req.body.description,
                        eventId,
                        req.session.user,
                        req.body.startTime,
                        req.body.endTime,
                        req.body.remark,
                        "now()",
                        "now()"
                    ]
                )

                res.json({
                    status: true,
                    msg: "save success"
                })
            }

        } else {
            res.status(400).json({
                msg: "[EER001]: Something went wrong, please try relogging-in",
            });
        }

    } catch (e) {
        logger.error(e);
        res.status(500).json({
            msg: "[ETS002]: Failed to Post Event Schedule",
        });
    }
} 
