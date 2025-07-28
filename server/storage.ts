import { type User, type InsertUser, type Paper, type InsertPaper, type Analysis, type InsertAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPaper(id: string): Promise<Paper | undefined>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  updatePaperStatus(id: string, status: string, cost?: number): Promise<void>;
  getAllPapers(): Promise<Paper[]>;
  
  getAnalysis(id: string): Promise<Analysis | undefined>;
  getAnalysisByPaperId(paperId: string): Promise<Analysis | undefined>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private papers: Map<string, Paper>;
  private analyses: Map<string, Analysis>;

  constructor() {
    this.users = new Map();
    this.papers = new Map();
    this.analyses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      credits: "10.00"
    };
    this.users.set(id, user);
    return user;
  }

  async getPaper(id: string): Promise<Paper | undefined> {
    return this.papers.get(id);
  }

  async createPaper(insertPaper: InsertPaper): Promise<Paper> {
    const id = randomUUID();
    const paper: Paper = {
      ...insertPaper,
      id,
      status: "pending",
      createdAt: new Date(),
      processingCost: null,
    };
    this.papers.set(id, paper);
    return paper;
  }

  async updatePaperStatus(id: string, status: string, cost?: number): Promise<void> {
    const paper = this.papers.get(id);
    if (paper) {
      paper.status = status;
      if (cost !== undefined) {
        paper.processingCost = cost.toString();
      }
      this.papers.set(id, paper);
    }
  }

  async getAllPapers(): Promise<Paper[]> {
    return Array.from(this.papers.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getAnalysis(id: string): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalysisByPaperId(paperId: string): Promise<Analysis | undefined> {
    return Array.from(this.analyses.values()).find(
      analysis => analysis.paperId === paperId
    );
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = randomUUID();
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }
}

export const storage = new MemStorage();
