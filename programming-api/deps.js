export { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";

import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";
export { postgres };

import { connect } from "https://deno.land/x/redis@v0.31.0/mod.ts";
const redis = await connect({
  hostname: "redis",
  port: 6379,
});
export { redis };
