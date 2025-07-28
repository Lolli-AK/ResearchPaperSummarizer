import fetch from 'node-fetch';
import { parsePDF, ParsedPaperContent } from './pdfParser.js';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export interface ArxivPaperMetadata {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  pdfUrl: string;
}

export async function fetchArxivPaper(arxivUrl: string): Promise<ParsedPaperContent> {
  try {
    // Extract arXiv ID from URL
    const arxivId = extractArxivId(arxivUrl);
    if (!arxivId) {
      throw new Error("Invalid arXiv URL format");
    }

    // Get paper metadata from arXiv API
    const metadata = await fetchArxivMetadata(arxivId);
    
    // Download PDF
    const pdfPath = await downloadArxivPDF(metadata.pdfUrl, arxivId);
    
    try {
      // Parse the PDF
      const parsedContent = await parsePDF(pdfPath);
      
      // Override with arXiv metadata where available
      return {
        ...parsedContent,
        title: metadata.title || parsedContent.title,
        authors: metadata.authors.join(', ') || parsedContent.authors,
        abstract: metadata.abstract || parsedContent.abstract,
      };
    } finally {
      // Clean up temporary PDF file
      try {
        unlinkSync(pdfPath);
      } catch (cleanupError) {
        console.warn("Failed to clean up temporary PDF file:", cleanupError);
      }
    }

  } catch (error) {
    console.error("arXiv fetch error:", error);
    throw new Error(`Failed to fetch arXiv paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractArxivId(url: string): string | null {
  // Handle various arXiv URL formats
  const patterns = [
    /arxiv\.org\/abs\/([0-9]{4}\.[0-9]{4,5})/,
    /arxiv\.org\/pdf\/([0-9]{4}\.[0-9]{4,5})/,
    /arxiv\.org\/abs\/([a-z-]+\/[0-9]{7})/,
    /arxiv\.org\/pdf\/([a-z-]+\/[0-9]{7})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

async function fetchArxivMetadata(arxivId: string): Promise<ArxivPaperMetadata> {
  try {
    const apiUrl = `http://export.arxiv.org/api/query?id_list=${arxivId}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`arXiv API request failed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Parse XML response (simple parsing for the needed fields)
    const titleMatch = xmlText.match(/<title>(.*?)<\/title>/s);
    const abstractMatch = xmlText.match(/<summary>(.*?)<\/summary>/s);
    const publishedMatch = xmlText.match(/<published>(.*?)<\/published>/);
    
    // Extract authors
    const authorMatches = xmlText.match(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g);
    const authors = authorMatches ? 
      authorMatches.map(match => {
        const nameMatch = match.match(/<name>(.*?)<\/name>/);
        return nameMatch ? nameMatch[1].trim() : '';
      }).filter(name => name) : [];

    const title = titleMatch ? titleMatch[1].trim() : '';
    const abstract = abstractMatch ? abstractMatch[1].trim() : '';
    const publishedDate = publishedMatch ? publishedMatch[1].trim() : '';

    return {
      id: arxivId,
      title,
      authors,
      abstract,
      publishedDate,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`
    };

  } catch (error) {
    console.error("arXiv metadata fetch error:", error);
    throw new Error(`Failed to fetch arXiv metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function downloadArxivPDF(pdfUrl: string, arxivId: string): Promise<string> {
  try {
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const pdfBuffer = await response.buffer();
    const tempPath = join(tmpdir(), `arxiv_${arxivId}_${Date.now()}.pdf`);
    
    writeFileSync(tempPath, pdfBuffer);
    
    return tempPath;

  } catch (error) {
    console.error("PDF download error:", error);
    throw new Error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateArxivUrl(url: string): boolean {
  return extractArxivId(url) !== null;
}
