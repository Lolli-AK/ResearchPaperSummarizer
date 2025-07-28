import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  credits: decimal("credits", { precision: 10, scale: 2 }).default("10.00"),
});

export const papers = pgTable("papers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  authors: text("authors"),
  arxivUrl: text("arxiv_url"),
  fileName: text("file_name"),
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  processingCost: decimal("processing_cost", { precision: 10, scale: 2 }),
});

export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paperId: varchar("paper_id").references(() => papers.id).notNull(),
  sections: jsonb("sections").notNull(), // structured analysis data
  keyConcepts: jsonb("key_concepts").notNull(),
  overview: text("overview").notNull(),
  complexity: text("complexity").notNull(),
  readingTime: text("reading_time").notNull(),
  analysisTime: text("analysis_time").notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  credits: true,
});

export const insertPaperSchema = createInsertSchema(papers).omit({
  id: true,
  createdAt: true,
  status: true,
  processingCost: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type Paper = typeof papers.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// API response types
export const paperUploadSchema = z.object({
  file: z.any().optional(),
  arxivUrl: z.string().url().optional(),
}).refine(data => data.file || data.arxivUrl, {
  message: "Either file or arXiv URL must be provided"
});

export type PaperUploadRequest = z.infer<typeof paperUploadSchema>;
