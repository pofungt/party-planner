import fs from 'fs';
import jsonfile from "jsonfile";

export async function newJsonFile() {
    if (!fs.existsSync("./util/database/data/users.json")) {
      await jsonfile.writeFile("./util/database/data/users.json", []);
    }
  }