import { sql } from "../database/database.js";

let assignmentCached = [];

const findAll = async () => {
  console.log("Fetching all assignments from database and caching them");
  assignmentCached = await sql`SELECT * FROM programming_assignments;`;
  return assignmentCached;
};

const find = async (id) => {
  if (assignmentCached.length > 0) {
    const assignment = assignmentCached.find((a) => a.id == id);
    if (assignment) {
      console.log(`Found assignment ${id} in cache`);
      return assignment;
    }
  }

  console.log(`Fetching assignment ${id} from database`);
  const res =
    await sql`SELECT * FROM programming_assignments WHERE id = ${id};`;
  const assignment = res[0];
  if (assignment) assignmentCached.push(assignment);
  return assignment;
};

export { findAll, find };
