import { sql } from "../database/database.js";

const findAll = async (user_uuid) => {
  return await sql`SELECT * FROM programming_assignment_submissions WHERE user_uuid = ${user_uuid};`;
};

const findAllOfAssignment = async (user_uuid, programming_assignment_id) => {
  return await sql`SELECT * FROM programming_assignment_submissions\
   WHERE user_uuid = ${user_uuid} AND programming_assignment_id = ${programming_assignment_id};`;
};

const find = async (user_uuid, programming_assignment_id, code) => {
  const res = await sql`SELECT * FROM programming_assignment_submissions \
    WHERE user_uuid = ${user_uuid} AND programming_assignment_id = ${programming_assignment_id} AND code = ${code};`;
  return res[0];
};

const findAnotherPending = async (user_uuid) => {
  const res = await sql`SELECT * FROM programming_assignment_submissions \
    WHERE user_uuid = ${user_uuid} AND status = 'pending';`;
  return res[0];
};

const create = async (user_uuid, programming_assignment_id, code) => {
  const res = await sql`INSERT INTO programming_assignment_submissions\
     (user_uuid, programming_assignment_id, code) VALUES (${user_uuid}, ${programming_assignment_id}, ${code}) RETURNING *;`;
  return res[0];
};

const update = async (user_uuid, id, grader_feedback, correct) => {
  const res = await sql`UPDATE programming_assignment_submissions\
     SET grader_feedback = ${grader_feedback}, correct = ${correct}, status = 'processed', last_updated = ${new Date().toISOString()}\
     WHERE user_uuid = ${user_uuid} AND id = ${id};`;
  return res;
};

const findById = async (user_uuid, id) => {
  const res =
    await sql`SELECT * FROM programming_assignment_submissions WHERE user_uuid = ${user_uuid} AND id = ${id};`;
  return res[0];
};

const remove = async (user_uuid, id) => {
  const res = await sql`DELETE FROM programming_assignment_submissions\
     WHERE user_uuid = ${user_uuid} AND id = ${id};`;
  return res;
};

const removeAll = async (user_uuid) => {
  const res = await sql`DELETE FROM programming_assignment_submissions\
     WHERE user_uuid = ${user_uuid};`;
  return res;
};

export {
  findAll,
  findAllOfAssignment,
  find,
  create,
  findById,
  remove,
  update,
  removeAll,
  findAnotherPending,
};
