import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CRON_SECRET: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LEETCODE_SESSION: z.string().optional(),
  LEETCODE_CSRFTOKEN: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  CRON_SECRET: process.env.CRON_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  LEETCODE_SESSION: process.env.LEETCODE_SESSION,
  LEETCODE_CSRFTOKEN: process.env.LEETCODE_CSRFTOKEN,
});
