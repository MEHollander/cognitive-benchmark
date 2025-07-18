import { TestSession, TrialData, type InsertTestSession, type InsertTrialData } from "@shared/schema";

// Storage interface for cognitive testing platform
export interface IStorage {
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  getTestSession(id: number): Promise<TestSession | undefined>;
  createTrialData(trial: InsertTrialData): Promise<TrialData>;
  getTrialDataBySession(sessionId: number): Promise<TrialData[]>;
}

export class MemStorage implements IStorage {
  private testSessions: Map<number, TestSession>;
  private trialData: Map<number, TrialData>;
  private sessionIdCounter: number;
  private trialIdCounter: number;

  constructor() {
    this.testSessions = new Map();
    this.trialData = new Map();
    this.sessionIdCounter = 1;
    this.trialIdCounter = 1;
  }

  async createTestSession(insertSession: InsertTestSession): Promise<TestSession> {
    const id = this.sessionIdCounter++;
    const session: TestSession = { 
      ...insertSession, 
      id,
      createdAt: new Date()
    };
    this.testSessions.set(id, session);
    return session;
  }

  async getTestSession(id: number): Promise<TestSession | undefined> {
    return this.testSessions.get(id);
  }

  async createTrialData(insertTrial: InsertTrialData): Promise<TrialData> {
    const id = this.trialIdCounter++;
    const trial: TrialData = { 
      ...insertTrial, 
      id,
      timestamp: new Date()
    };
    this.trialData.set(id, trial);
    return trial;
  }

  async getTrialDataBySession(sessionId: number): Promise<TrialData[]> {
    return Array.from(this.trialData.values()).filter(
      trial => trial.sessionId === sessionId
    );
  }
}

export const storage = new MemStorage();
