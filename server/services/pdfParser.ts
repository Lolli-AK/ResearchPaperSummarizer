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

    // Better title extraction using first page structure
    let title = "Research Paper";
    let authors = "Unknown Authors";
    
    if (data.pages && data.pages[0] && data.pages[0].content) {
      const firstPage = data.pages[0].content;
      
      // Sort by vertical position (y coordinate) to get logical reading order
      const sortedContent = firstPage
        .filter((item: any) => item.str && item.str.trim())
        .sort((a: any, b: any) => b.y - a.y); // Top to bottom
      
      // Look for title in first few text blocks (usually largest font)
      const titleCandidates = sortedContent
        .slice(0, 10) // Check first 10 text elements
        .filter((item: any) => {
          const text = item.str.trim();
          return text.length > 5 && 
                 text.length < 150 && 
                 !text.toLowerCase().includes('arxiv') &&
                 !text.toLowerCase().includes('preprint') &&
                 !text.toLowerCase().includes('abstract') &&
                 !text.match(/^\d+$/) && // Not just numbers
                 !text.match(/^[A-Z]{2,}$/) && // Not just uppercase abbreviations
                 text.split(' ').length > 1; // More than one word
        });
      
      if (titleCandidates.length > 0) {
        // Take the first reasonable candidate
        title = titleCandidates[0].str.trim();
      }
      
      // Look for authors (usually after title, smaller font)
      const authorCandidates = sortedContent
        .slice(1, 15)
        .filter((item: any) => {
          const text = item.str.trim();
          return text.length > 3 && 
                 text.length < 200 &&
                 !text.toLowerCase().includes('abstract') &&
                 !text.toLowerCase().includes('university') &&
                 (text.includes(' ') || text.includes(','));
        });
      
      if (authorCandidates.length > 0) {
        authors = authorCandidates[0].str.trim();
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
