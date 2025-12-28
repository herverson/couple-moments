import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  coupleId: int("coupleId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Couples table - represents a relationship between two users
 */
export const couples = mysqlTable("couples", {
  id: int("id").autoincrement().primaryKey(),
  user1Id: int("user1Id").notNull(),
  user2Id: int("user2Id").notNull(),
  relationshipStartDate: timestamp("relationshipStartDate").notNull(),
  coupleName: varchar("coupleName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Couple = typeof couples.$inferSelect;
export type InsertCouple = typeof couples.$inferInsert;

/**
 * Photos table - stores photo metadata, actual files are in S3
 */
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  coupleId: int("coupleId").notNull(),
  uploadedByUserId: int("uploadedByUserId").notNull(),
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  s3Url: text("s3Url").notNull(),
  description: text("description"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

/**
 * YouTube Videos table - stores YouTube video links and metadata
 */
export const youtubeVideos = mysqlTable("youtubeVideos", {
  id: int("id").autoincrement().primaryKey(),
  coupleId: int("coupleId").notNull(),
  addedByUserId: int("addedByUserId").notNull(),
  videoId: varchar("videoId", { length: 255 }).notNull(),
  title: varchar("title", { length: 512 }),
  description: text("description"),
  thumbnail: text("thumbnail"),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type YoutubeVideo = typeof youtubeVideos.$inferSelect;
export type InsertYoutubeVideo = typeof youtubeVideos.$inferInsert;

/**
 * Romantic Phrases table - collection of romantic phrases organized by categories
 */
export const romanticPhrases = mysqlTable("romanticPhrases", {
  id: int("id").autoincrement().primaryKey(),
  phrase: text("phrase").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  author: varchar("author", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RomanticPhrase = typeof romanticPhrases.$inferSelect;
export type InsertRomanticPhrase = typeof romanticPhrases.$inferInsert;