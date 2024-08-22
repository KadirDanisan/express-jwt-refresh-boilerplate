import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  schema: "./src/database/schema.ts",
  dialect: 'sqlite',
  out: "./src/database/migrations",
});