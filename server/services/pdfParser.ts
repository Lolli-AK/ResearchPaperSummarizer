import { readFileSync } from 'fs';
import { PDFExtract } from 'pdf.js-extract';

const pdfExtract = new PDFExtract();

export interface ParsedPaperContent {
  title: string;
  authors: string;
  content: string;
  abstract: string;
  sections: PaperSectionRaw[];
}

export interface PaperSectionRaw {
  title: string;
  content: string;
  page: number;
}

export async function parsePDF(filePath: string): Promise<ParsedPaperContent> {
  try {
    const data = await new Promise<any>((resolve, reject) => {
      pdfExtract.extract(filePath, {}, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (!data || !data.pages) {
      throw new Error("Failed to extract content from PDF");
    }

    // Extract text from all pages
    let fullText = '';
    const pages: string[] = [];
    
    for (const page of data.pages) {
      let pageText = '';
      if (page.content) {
        for (const item of page.content) {
          if (item.str && item.str.trim()) {
            pageText += item.str + ' ';
          }
        }
      }
      pages.push(pageText.trim());
      fullText += pageText + '\n';
    }

    // Much better title extraction focusing on the FIRST page only
    let title = "Research Paper";
    let authors = "Unknown Authors";
    
    if (data.pages && data.pages[0] && data.pages[0].content) {
      const firstPage = data.pages[0].content;
      
      // Get only the very top elements of the first page (where title actually is)
      const topElements = firstPage
        .filter((item: any) => item.str && item.str.trim() && item.str.trim().length > 3)
        .sort((a: any, b: any) => b.y - a.y) // Sort by position (top to bottom)
        .slice(0, 20); // Look at only first 20 text elements
      
      // Find title by looking for meaningful text in large font at the top
      for (const item of topElements) {
        const text = item.str.trim();
        const isLikelyTitle = text.length >= 10 && 
                             text.length <= 100 && 
                             !text.toLowerCase().includes('arxiv') &&
                             !text.toLowerCase().includes('preprint') &&
                             !text.toLowerCase().includes('abstract') &&
                             !text.toLowerCase().includes('cs.') && // arXiv categories
                             !text.match(/^\d{4}\.\d{4,5}/) && // arXiv ID pattern
                             !text.match(/^[A-Z]{2,}$/) && // Not just abbreviations
                             !text.match(/^\d+$/) && // Not just numbers
                             !text.match(/^[^a-zA-Z]*$/) && // Must contain letters
                             text.split(' ').length >= 2 && // At least 2 words
                             text.split(' ').length <= 15; // Not too many words
        
        if (isLikelyTitle) {
          title = text;
          break; // Take the first match
        }
      }
      
      // Simple author detection - look for names after title
      for (let i = 1; i < Math.min(topElements.length, 10); i++) {
        const text = topElements[i].str.trim();
        const isLikelyAuthor = text.length > 3 && 
                              text.length < 100 &&
                              !text.toLowerCase().includes('abstract') &&
                              !text.toLowerCase().includes('arxiv') &&
                              (text.includes(' ') || text.includes(',')) &&
                              !text.includes('©') && // Copyright symbols
                              !text.includes('University') && // Skip affiliations for now
                              text.split(' ').length <= 8; // Reasonable name length
        
        if (isLikelyAuthor) {
          authors = text;
          break;
        }
      }
    }

    // Extract abstract
    let abstract = "";
    const abstractMatch = fullText.match(/abstract\s*:?\s*(.*?)(?=\n\n|\nintroduction|\n1\s|\nkeywords)/is);
    if (abstractMatch) {
      abstract = abstractMatch[1].trim();
    }

    // Try to identify sections
    const sections: PaperSectionRaw[] = [];
    const sectionPattern = /(?:^|\n)(\d+\.?\s+|[IVX]+\.?\s+)?([A-Z][A-Za-z\s&-]+)(?=\n)/g;
    let match;
    
    while ((match = sectionPattern.exec(fullText)) !== null) {
      const sectionTitle = match[2].trim();
      if (sectionTitle.length > 3 && sectionTitle.length < 100) {
        sections.push({
          title: sectionTitle,
          content: "", // Will be filled by extracting content between sections
          page: 1
        });
      }
    }

    // If no clear sections found, create default sections
    if (sections.length === 0) {
      const textChunks = fullText.split('\n\n').filter(chunk => chunk.trim().length > 100);
      textChunks.forEach((chunk, index) => {
        sections.push({
          title: `Section ${index + 1}`,
          content: chunk.trim(),
          page: 1
        });
      });
    }

    return {
      title: title,
      authors: authors,
      content: fullText,
      abstract: abstract || "No abstract found",
      sections: sections
    };

  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validatePDF(filePath: string): boolean {
  try {
    const fileContent = readFileSync(filePath);
    // Check for PDF magic number
    const pdfHeader = fileContent.subarray(0, 4);
    return pdfHeader.toString() === '%PDF';
  } catch (error) {
    return false;
  }
}
