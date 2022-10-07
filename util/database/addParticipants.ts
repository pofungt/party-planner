import pg from "pg";
import dotenv from "dotenv";
import { logger } from "../logger";

dotenv.config();

const client = new pg.Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

let eventId: number = 0;
const eventIdString: string | undefined = process.argv[2];
if (eventIdString) {
  if (/^\d+$/.test(eventIdString)) {
    eventId = parseInt(eventIdString);
  }
}

let participantAmount: number = 1;
const participantAmountString: string | undefined = process.argv[3];
if (participantAmountString) {
  if (/^\d+$/.test(participantAmountString)) {
    participantAmount = parseInt(participantAmountString);
  }
}

async function main() {
  await client.connect();
  try {
    // Get creator ID of the event (need to exclude)
    const [creatorUserObj] = (
      await client.query(
        `
        SELECT creator_id FROM events WHERE id = $1;
    `,
        [eventId]
      )
    ).rows;

    if (!creatorUserObj) {
      throw new Error(`No such event (event id: ${eventId})!`);
    }

    const creatorUser: number = creatorUserObj.creator_id;

    // Get participant ID of the event (need to exclude)
    const participantsObj: { [key: string]: number }[] = (
      await client.query(
        `
        SELECT user_id FROM participants
        WHERE event_id = $1;
    `,
        [eventId]
      )
    ).rows;
    const participants = participantsObj.map((each) => {
      return each.user_id;
    });

    // Obtain users info for event creation for each user (excluding creator)
    const userIdListRawObj: { [key: string]: number }[] = (
      await client.query(
        `
        SELECT id FROM users 
        WHERE id != $1;
    `,
        [creatorUser]
      )
    ).rows;

    const userIdListRaw: number[] = userIdListRawObj.map((each) => {
      return each.id;
    });
    const participantsSet = new Set(participants);
    const userIdList = userIdListRaw.filter((userId) => {
      return !participantsSet.has(userId);
    });

    const loopTimes: number = Math.min(userIdList.length, participantAmount);

    for (let i = 0; i < loopTimes; i++) {
      const usersIndex: number = Math.floor(Math.random() * userIdList.length);
      const [userId] = userIdList.splice(usersIndex, 1);
      await client.query(
        `INSERT INTO participants 
                  (event_id,user_id,created_at,updated_at) 
                  VALUES ($1,$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);`,
        [eventId, userId]
      );
    }
  } catch (e) {
    logger.error(e);
  }
  client.end();
}

main();
