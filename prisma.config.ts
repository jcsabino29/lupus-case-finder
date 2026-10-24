import "dotenv/config";
import { defineConfig } from "prisma/config";

// The Prisma CLI uses the direct (non-pooled) connection. The app itself
// connects at runtime through @prisma/adapter-pg with DATABASE_URL, as a
// least-privilege role, never as the database owner.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] ?? "",
  },
});
