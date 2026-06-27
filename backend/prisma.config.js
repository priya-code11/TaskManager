// backend/prisma.config.js
import 'dotenv/config'; // 👈 This line loads your .env variables before anything else runs!
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL, 
  },
});