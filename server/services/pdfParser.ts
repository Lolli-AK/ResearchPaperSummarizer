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

    // Extract title (usually in the first few lines and often in larger font)
    const lines = fullText.split('\n').filter(line => line.trim().length > 0);
    let title = "Untitled Paper";
    let authors = "Unknown Authors";

    // Try to identify title and authors from the first page
    if (lines.length > 0) {
      // Title is usually the first substantial line
      const titleCandidate = lines.find(line => 
        line.trim().length > 10 && 
        !line.toLowerCase().includes('arxiv') &&
        !line.toLowerCase().includes('abstract')
      );
      if (titleCandidate) {
        title = titleCandidate.trim();
      }

      // Authors usually follow the title
      const titleIndex = lines.findIndex(line => line.includes(title));
      if (titleIndex >= 0 && titleIndex < lines.length - 1) {
        const authorCandidate = lines[titleIndex + 1];
        if (authorCandidate && authorCandidate.length > 5 && authorCandidate.length < 200) {
          authors = authorCandidate.trim();
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
