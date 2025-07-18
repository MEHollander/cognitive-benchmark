import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const testSessions = pgTable("test_sessions", {
  id: serial("id").primaryKey(),
  participantId: text("participant_id"),
  age: integer("age"),
  gender: text("gender"),
  sessionData: json("session_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trialData = pgTable("trial_data", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => testSessions.id),
  testType: text("test_type").notNull(),
  trialNumber: integer("trial_number").notNull(),
  stimulus: text("stimulus"),
  response: text("response"),
  reactionTime: integer("reaction_time"),
  accuracy: integer("accuracy"), // 1 for correct, 0 for incorrect
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  createdAt: true,
});

export const insertTrialDataSchema = createInsertSchema(trialData).omit({
  id: true,
  timestamp: true,
});

export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTrialData = z.infer<typeof insertTrialDataSchema>;
export type TrialData = typeof trialData.$inferSelect;

// Test result types for frontend
export interface TestResult {
  testType: string;
  completed: boolean;
  score: number;
  meanRT: number;
  accuracy: number;
  errors: number;
  totalTrials: number;
}

export interface ParticipantInfo {
  age?: number;
  gender?: string;
  participantId?: string;
}

export interface TestSessionData {
  participantInfo: ParticipantInfo;
  tests: Record<string, TestResult>;
  trialData: TrialData[];
}
