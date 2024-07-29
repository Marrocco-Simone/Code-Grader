import { redis } from "../deps.js";

const store = async (key, value) => {
  await redis.set(key, JSON.stringify(value));
};

const retrieve = async (key) => {
  const value = await redis.get(key);
  return JSON.parse(value);
};

const remove = async (key) => {
  await redis.del(key);
};

export { store, retrieve, remove };
