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

export async function analyzePaperWithGPT(
  paperContent: string,
  title: string,
  authors?: string
): Promise<PaperAnalysisResult> {
  const startTime = Date.now();

  try {
    // First, get an overview and structure analysis
    const overviewResponse = await openai.chat.completions.create({
      model: "gpt-4.1", // Using GPT-4.1 as specifically requested
      messages: [
        {
          role: "system",
          content: `You are an expert AI tutor specializing in transformer and attention mechanism research papers. 
          Analyze research papers and provide comprehensive, clear explanations suitable for students and researchers.
          Focus on breaking down complex concepts into understandable explanations.
          
          Respond in JSON format with the following structure:
          {
            "overview": "comprehensive overview of the paper's contributions and significance",
            "complexity": "Beginner/Intermediate/Advanced",
            "readingTime": "estimated reading time in minutes",
            "keyConcepts": ["array", "of", "key", "concepts"],
            "sections": [
              {
                "id": "section_id",
                "title": "Section Title",
                "originalContent": "brief excerpt of original text",
                "explanation": "detailed explanation in simple terms"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Please analyze this research paper and provide a comprehensive educational breakdown:

Title: ${title}
Authors: ${authors || "Not specified"}

Paper Content:
${paperContent}

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
      max_tokens: 4000,
    });

    const analysisResult = JSON.parse(overviewResponse.choices[0].message.content || '{}');

    // Calculate costs based on GPT-4.1 pricing: $2.00 input, $8.00 output per 1M tokens
    const inputTokens = overviewResponse.usage?.prompt_tokens || 0;
    const outputTokens = overviewResponse.usage?.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;
    
    const inputCost = (inputTokens / 1000000) * 2.00;
    const outputCost = (outputTokens / 1000000) * 8.00;
    const estimatedCost = inputCost + outputCost;

    const analysisTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1); // minutes

    return {
      overview: analysisResult.overview || "Analysis completed",
      sections: analysisResult.sections || [],
      keyConcepts: analysisResult.keyConcepts || [],
      complexity: analysisResult.complexity || "Advanced",
      readingTime: analysisResult.readingTime || "15 min",
      totalTokens,
      estimatedCost: Number(estimatedCost.toFixed(4))
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
      model: "gpt-4.1",
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
