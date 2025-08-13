import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import { join } from 'path';
import { tmpdir } from 'os';
import { paperUploadSchema } from "@shared/schema";
import { analyzePaperWithGPT } from "./services/openai";
import { parsePDF, validatePDF } from "./services/pdfParser";
import { fetchArxivPaper, validateArxivUrl } from "./services/arxivFetcher";
import { unlinkSync } from 'fs';

// Configure multer for file uploads
const upload = multer({
  dest: tmpdir(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and analyze paper
  app.post('/api/papers/analyze', upload.single('file'), async (req, res) => {
    let tempFilePath: string | null = null;
    
    try {
      const { arxivUrl } = req.body;
      const file = req.file;

      // Validate input
      if (!file && !arxivUrl) {
        return res.status(400).json({ 
          message: "Either PDF file or arXiv URL must be provided" 
        });
      }

      if (arxivUrl && !validateArxivUrl(arxivUrl)) {
        return res.status(400).json({ 
          message: "Invalid arXiv URL format" 
        });
      }

      let parsedContent;
      let fileName = null;

      if (file) {
        tempFilePath = file.path;
        
        // Validate PDF
        if (!validatePDF(tempFilePath)) {
          return res.status(400).json({ 
            message: "Invalid PDF file" 
          });
        }

        fileName = file.originalname;
        parsedContent = await parsePDF(tempFilePath);
      } else {
        // Fetch from arXiv
        parsedContent = await fetchArxivPaper(arxivUrl);
      }

      // Store paper in database
      const paper = await storage.createPaper({
        title: parsedContent.title || "Research Paper", // Fallback title
        authors: parsedContent.authors,
        arxivUrl: arxivUrl || null,
        fileName: fileName,
        content: parsedContent.content,
        userId: null, // For now, not implementing user authentication
      });

      // Update paper status to processing
      await storage.updatePaperStatus(paper.id, 'processing');

      // Analyze with OpenAI (this could be moved to a background job in production)
      const analysisResult = await analyzePaperWithGPT(
        parsedContent.content,
        parsedContent.title || "Research Paper",
        parsedContent.authors
      );

      // Store analysis results
      const analysis = await storage.createAnalysis({
        paperId: paper.id,
        sections: analysisResult.sections,
        keyConcepts: analysisResult.keyConcepts,
        overview: analysisResult.overview,
        complexity: analysisResult.complexity,
        readingTime: analysisResult.readingTime,
        analysisTime: `${Math.round(analysisResult.totalTokens / 1000)} tokens processed`,
        totalCost: analysisResult.estimatedCost.toString(),
      });

      // Update paper status to completed
      await storage.updatePaperStatus(paper.id, 'completed', analysisResult.estimatedCost);

      res.json({
        success: true,
        paper: {
          id: paper.id,
          title: paper.title,
          authors: paper.authors,
          status: 'completed'
        },
        analysis: {
          id: analysis.id,
          overview: analysis.overview,
          sections: analysis.sections,
          keyConcepts: analysis.keyConcepts,
          complexity: analysis.complexity,
          readingTime: analysis.readingTime,
          analysisTime: analysis.analysisTime,
          totalCost: analysis.totalCost,
        }
      });

    } catch (error) {
      console.error("Paper analysis error:", error);
      
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze paper" 
      });
    } finally {
      // Clean up temporary file
      if (tempFilePath) {
        try {
          unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.warn("Failed to clean up temporary file:", cleanupError);
        }
      }
    }
  });

  // Get paper analysis by ID
  app.get('/api/papers/:id/analysis', async (req, res) => {
    try {
      const { id } = req.params;
      
      const paper = await storage.getPaper(id);
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      const analysis = await storage.getAnalysisByPaperId(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json({
        paper: {
          id: paper.id,
          title: paper.title,
          authors: paper.authors,
          status: paper.status,
          createdAt: paper.createdAt,
        },
        analysis: {
          id: analysis.id,
          overview: analysis.overview,
          sections: analysis.sections,
          keyConcepts: analysis.keyConcepts,
          complexity: analysis.complexity,
          readingTime: analysis.readingTime,
          analysisTime: analysis.analysisTime,
          totalCost: analysis.totalCost,
          createdAt: analysis.createdAt,
        }
      });

    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve analysis" 
      });
    }
  });

  // Get all papers (for history/dashboard)
  app.get('/api/papers', async (req, res) => {
    try {
      const papers = await storage.getAllPapers();
      res.json({ papers });
    } catch (error) {
      console.error("Get papers error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve papers" 
      });
    }
  });

  // Validate arXiv URL
  app.post('/api/arxiv/validate', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const isValid = validateArxivUrl(url);
      res.json({ valid: isValid });

    } catch (error) {
      console.error("arXiv validation error:", error);
      res.status(500).json({ 
        message: "Failed to validate arXiv URL" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
