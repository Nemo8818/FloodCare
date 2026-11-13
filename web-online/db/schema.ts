import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const requests = sqliteTable('requests', { id:text('id').primaryKey(), owner:text('owner').notNull(), payload:text('payload').notNull(), created:text('created').notNull() });
export const sessions = sqliteTable('sessions', { hash:text('hash').primaryKey(), expires:integer('expires').notNull() });
export const attempts = sqliteTable('attempts', { ip:text('ip').primaryKey(), started:integer('started').notNull(), count:integer('count').notNull() });
