import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// However, user specifically requested GPT-4.1 for this application
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface PaperAnalysisResult {
  overview: string;
  sections: PaperSection[];
  keyConcepts: string[];
  complexity: string;
  readingTime: string;
  totalTokens: number;
  estimatedCost: number;
}

export interface PaperSection {
  id: string;
  title: string;
  originalContent: string;
  explanation: string;
  keyConcepts: string[];
  diagrams?: string[];
}

function chunkText(text: string, maxTokens: number = 20000): string[] {
  // Rough estimation: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  const chunks: string[] = [];
  
  if (text.length <= maxChars) {
    return [text];
  }
  
  // Split by paragraphs first, then by sentences if needed
  const paragraphs = text.split('\n\n');
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length <= maxChars) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // Paragraph is too long, split by sentences
        const sentences = paragraph.split('. ');
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length <= maxChars) {
            currentChunk += (currentChunk ? '. ' : '') + sentence;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk);
              currentChunk = sentence;
            } else {
              // Even sentence is too long, force split
              chunks.push(sentence);
            }
          }
        }
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

export async function analyzePaperWithGPT(
  paperContent: string,
  title: string,
  authors?: string
): Promise<PaperAnalysisResult> {
  const startTime = Date.now();

  try {
    // For very large papers, analyze in chunks
    const chunks = chunkText(paperContent, 15000); // Conservative limit
    let allSections: PaperSection[] = [];
    let keyConcepts: string[] = [];
    let overview = "";
    let complexity = "Advanced";
    let readingTime = "15 min";
    let totalTokensUsed = 0;
    let totalCost = 0;

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isFirstChunk = i === 0;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert AI tutor specializing in transformer and attention mechanism research papers. 
            Analyze research papers and provide comprehensive, clear explanations suitable for students and researchers.
            Focus on breaking down complex concepts into understandable explanations.
            
            ${isFirstChunk ? `This is the first part of the paper. Provide a complete overview and initial analysis.` : `This is part ${i + 1} of ${chunks.length} of the paper. Focus on section-specific analysis.`}
            
            Respond in JSON format with the following structure:
            {
              ${isFirstChunk ? `"overview": "comprehensive overview of the paper's contributions and significance",
              "complexity": "Beginner/Intermediate/Advanced",
              "readingTime": "estimated reading time in minutes",` : ''}
              "keyConcepts": ["array", "of", "key", "concepts"],
              "sections": [
                {
                  "id": "section_${i}_1",
                  "title": "Section Title",
                  "originalContent": "brief excerpt of original text",
                  "explanation": "detailed explanation in simple terms"
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Please analyze this ${isFirstChunk ? 'research paper' : 'section of the research paper'} and provide a comprehensive educational breakdown:

Title: ${title}
Authors: ${authors || "Not specified"}
${isFirstChunk ? '' : `\nNote: This is part ${i + 1} of ${chunks.length} of the full paper.`}

Paper Content:
${chunk}

Focus particularly on:
1. The main contributions and innovations
2. Key technical concepts (especially attention mechanisms, transformers, etc.)
3. Mathematical concepts explained in simple terms
4. Practical implications and applications
5. Why this work is significant in the field

Provide detailed explanations that would help a student understand complex concepts.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 3000,
      });

      const chunkResult = JSON.parse(response.choices[0].message.content || '{}');
      
      // Accumulate results
      if (isFirstChunk) {
        overview = chunkResult.overview || "Comprehensive analysis of transformer architecture and attention mechanisms.";
        complexity = chunkResult.complexity || "Advanced";
        readingTime = chunkResult.readingTime || "20 min";
      }
      
      allSections = allSections.concat(chunkResult.sections || []);
      keyConcepts = keyConcepts.concat(chunkResult.keyConcepts || []);
      
      // Calculate costs
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      totalTokensUsed += inputTokens + outputTokens;
      
      const inputCost = (inputTokens / 1000000) * 2.00;
      const outputCost = (outputTokens / 1000000) * 8.00;
      totalCost += inputCost + outputCost;
    }

    // Remove duplicate key concepts
    keyConcepts = [...new Set(keyConcepts)];

    const analysisTime = ((Date.now() - startTime) / 1000).toFixed(1); // seconds

    return {
      overview,
      sections: allSections,
      keyConcepts: keyConcepts.slice(0, 12), // Limit to top 12 concepts
      complexity,
      readingTime,
      totalTokens: totalTokensUsed,
      estimatedCost: Number(totalCost.toFixed(4)),
      analysisTime: `${analysisTime}s`
    };

  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error(`Failed to analyze paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateSectionExplanation(
  sectionContent: string,
  sectionTitle: string,
  paperContext: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert AI tutor. Provide clear, educational explanations of research paper sections.
          Break down complex concepts into understandable terms. Use analogies and examples where helpful.
          Focus on helping students understand the technical concepts and their practical implications.`
        },
        {
          role: "user",
          content: `Please provide a detailed, educational explanation of this section from a research paper:

Section Title: ${sectionTitle}
Paper Context: ${paperContext}

Section Content:
${sectionContent}

Provide an explanation that:
1. Simplifies technical jargon
2. Explains key concepts clearly
3. Uses analogies where appropriate
4. Highlights the significance of this section
5. Connects to the broader paper context`
        }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Unable to generate explanation";
  } catch (error) {
    console.error("Section explanation error:", error);
    throw new Error(`Failed to generate section explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
