import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const messages = sqliteTable("messages", {
 id: integer("id").primaryKey({autoIncrement:true}),
 requestId: text("request_id").notNull().unique(),
 message: text("message").notNull(),
 color: text("color").notNull(),
 createdAt: text("created_at").notNull(),
});
