import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaperSidebar } from "./paper-sidebar";
import { DiagramGenerator } from "./diagram-generator";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PaperAnalysisProps {
  analysisData: {
    paper: {
      id: string;
      title: string;
      authors: string;
      status: string;
      createdAt: string;
    };
    analysis: {
      id: string;
      overview: string;
      sections: any[];
      keyConcepts: string[];
      complexity: string;
      readingTime: string;
      analysisTime: string;
      totalCost: string;
      createdAt: string;
    };
  };
}

export function PaperAnalysis({ analysisData }: PaperAnalysisProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const { paper, analysis } = analysisData;

  const exportAnalysis = async () => {
    console.log('Generating PDF export...');
    console.log('Paper title:', paper.title);
    console.log('Title length:', paper.title.length);
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      let yPosition = margin;
      
      // Title page - Extract proper title from potentially corrupted data
      let cleanTitle = paper.title;
      
      // If title is too long, it's likely the entire paper content - extract a better title
      if (paper.title.length > 200) {
        // Try to find a proper title by looking for patterns
        const titleMatch = paper.title.match(/^([^.!?]{10,150}[.!?])/);
        if (titleMatch) {
          cleanTitle = titleMatch[1].trim();
        } else {
          // Fallback: take first meaningful sentence
          cleanTitle = paper.title.substring(0, 80).trim() + '...';
        }
      }
      
      // Add a header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Research Paper Analysis', margin, yPosition);
      yPosition += 30;
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(cleanTitle, pageWidth - 2 * margin);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 22;
      
      // Authors
      yPosition += 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Authors: ${paper.authors}`, margin, yPosition);
      yPosition += 30;
      
      // Analysis date
      pdf.text(`Analysis Date: ${new Date(paper.createdAt).toLocaleDateString()}`, margin, yPosition);
      yPosition += 30;
      
      // Analysis metadata
      pdf.setFontSize(12);
      pdf.text(`Complexity: ${analysis.complexity} | Reading Time: ${analysis.readingTime} | Cost: $${analysis.totalCost}`, margin, yPosition);
      yPosition += 40;
      
      // Overview section
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Overview', margin, yPosition);
      yPosition += 25;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const overviewLines = pdf.splitTextToSize(analysis.overview, pageWidth - 2 * margin);
      
      // Handle page breaks
      if (yPosition + overviewLines.length * 15 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(overviewLines, margin, yPosition);
      yPosition += overviewLines.length * 15 + 30;
      
      // Key Concepts section
      if (yPosition > pageHeight - 150) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Concepts', margin, yPosition);
      yPosition += 25;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const conceptsText = analysis.keyConcepts.join(' • ');
      const conceptLines = pdf.splitTextToSize(conceptsText, pageWidth - 2 * margin);
      pdf.text(conceptLines, margin, yPosition);
      yPosition += conceptLines.length * 15 + 30;
      
      // Sections
      for (let i = 0; i < analysis.sections.length; i++) {
        const section = analysis.sections[i];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 200) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Section title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${i + 1}. ${section.title || `Section ${i + 1}`}`, margin, yPosition);
        yPosition += 25;
        
        // Section explanation
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const explanation = section.explanation || 'No explanation available';
        const explanationLines = pdf.splitTextToSize(explanation, pageWidth - 2 * margin);
        
        // Handle page breaks for long sections
        if (yPosition + explanationLines.length * 15 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(explanationLines, margin, yPosition);
        yPosition += explanationLines.length * 15;
        
        // Original content (if available)
        if (section.originalContent) {
          yPosition += 15;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Original Content:', margin, yPosition);
          yPosition += 15;
          
          const originalLines = pdf.splitTextToSize(
            section.originalContent.substring(0, 500) + (section.originalContent.length > 500 ? '...' : ''),
            pageWidth - 2 * margin
          );
          
          if (yPosition + originalLines.length * 12 > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.text(originalLines, margin, yPosition);
          yPosition += originalLines.length * 12;
        }
        
        yPosition += 25; // Space between sections
      }
      
      // Add a final page with visual summary
      pdf.addPage();
      yPosition = margin;
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Visual Summary', margin, yPosition);
      yPosition += 40;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Key Concepts Flowchart:', margin, yPosition);
      yPosition += 30;
      
      // Create a simple text-based flowchart for concepts
      const concepts = analysis.keyConcepts.slice(0, 8);
      concepts.forEach((concept, index) => {
        const x = margin + (index % 2) * 250;
        const y = yPosition + Math.floor(index / 2) * 60;
        
        // Draw concept box
        pdf.rect(x, y - 15, 200, 30);
        pdf.text(concept.length > 25 ? concept.substring(0, 25) + '...' : concept, x + 10, y);
        
        // Draw arrow to next concept
        if (index < concepts.length - 1) {
          pdf.line(x + 200, y, x + 240, y);
          pdf.text('→', x + 220, y + 5);
        }
      });
      
      // Generate filename with cleaner title
      let safeTitle = cleanTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      if (safeTitle.length > 50) {
        safeTitle = safeTitle.substring(0, 50);
      }
      const filename = `${safeTitle}_analysis.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      console.log('PDF generated successfully with diagrams!');
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('PDF export failed: ' + errorMessage);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <PaperSidebar 
        sections={analysis.sections}
        keyConcepts={analysis.keyConcepts}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Paper Header */}
        <Card className="border border-slate-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {paper.title}
                </h1>
                <p className="text-slate-600 mb-3">
                  {paper.authors}
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span><i className="fas fa-calendar mr-1"></i>
                    {new Date(paper.createdAt).getFullYear()}
                  </span>
                  <span><i className="fas fa-quote-left mr-1"></i>Citations: N/A</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={exportAnalysis} className="bg-academic-blue hover:bg-blue-700">
                  <i className="fas fa-download mr-1"></i>Export Analysis
                </Button>
                <Button variant="outline">
                  <i className="fas fa-share mr-1"></i>Share
                </Button>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-academic-blue">{analysis.readingTime}</div>
                <div className="text-sm text-slate-600">Est. Reading Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{analysis.complexity}</div>
                <div className="text-sm text-slate-600">Complexity Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysis.analysisTime}</div>
                <div className="text-sm text-slate-600">Analysis Tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Section */}
        <Card id="overview" className="border border-slate-200 mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              <i className="fas fa-eye text-academic-blue mr-2"></i>
              Overview & Key Insights
            </h2>
            
            <div className="prose max-w-none">
              <div className="bg-blue-50 border-l-4 border-academic-blue p-4 mb-6">
                <h3 className="text-lg font-semibold text-academic-blue mb-2">TL;DR - What This Paper Achieves</h3>
                <p className="text-slate-700">
                  {analysis.overview}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-800 mb-2">
                    <i className="fas fa-plus-circle mr-1"></i>Key Concepts
                  </h4>
                  <div className="space-y-1">
                    {analysis.keyConcepts.slice(0, 5).map((concept, index) => (
                      <div key={index} className="text-sm text-emerald-700">
                        • {concept}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    <i className="fas fa-target mr-1"></i>Analysis Metrics
                  </h4>
                  <div className="space-y-2 text-sm text-amber-700">
                    <div className="flex justify-between">
                      <span>Sections Analyzed:</span>
                      <span className="font-medium">{analysis.sections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key Concepts:</span>
                      <span className="font-medium">{analysis.keyConcepts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-medium">${analysis.totalCost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Sections */}
        {analysis.sections.map((section, index) => (
          <Card key={index} id={`section-${index}`} className="border border-slate-200 mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                <i className="fas fa-file-alt text-academic-blue mr-2"></i>
                {section.title || `Section ${index + 1}`}
              </h2>
              
              {section.originalContent && (
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">Original Content</h3>
                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 italic">
                      {section.originalContent.substring(0, 300)}
                      {section.originalContent.length > 300 && "..."}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">AI Tutor Explanation</h3>
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-slate-700">
                      {section.explanation || "Detailed explanation of this section's content and significance."}
                    </div>
                  </div>
                </div>
              )}

              {!section.originalContent && (
                <div className="bg-blue-50 p-4 rounded-lg text-slate-700">
                  {section.explanation || "Comprehensive analysis and explanation of this section."}
                </div>
              )}

              {section.keyConcepts && section.keyConcepts.length > 0 && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Key Concepts in This Section</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.keyConcepts.map((concept: string, idx: number) => (
                      <span key={idx} className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add diagrams for all sections - flowcharts help visualize any content */}
              <DiagramGenerator 
                sectionTitle={section.title}
                sectionContent={section.explanation || section.originalContent || ""}
                keyConcepts={section.keyConcepts || analysis.keyConcepts.slice(0, 6)}
                paperTitle={paper.title}
              />
            </CardContent>
          </Card>
        ))}

        {/* Analysis Summary */}
        <div className="bg-gradient-to-r from-academic-blue to-purple-600 text-white rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            <i className="fas fa-flag-checkered mr-2"></i>
            Analysis Complete - Ready to Explore
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="text-2xl font-bold">{analysis.sections.length}</div>
              <div className="text-sm opacity-90">Sections Analyzed</div>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="text-2xl font-bold">{analysis.keyConcepts.length}</div>
              <div className="text-sm opacity-90">Key Concepts</div>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="text-2xl font-bold">${analysis.totalCost}</div>
              <div className="text-sm opacity-90">Analysis Cost</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={exportAnalysis} className="bg-white text-academic-blue hover:bg-gray-100">
              <i className="fas fa-download mr-2"></i>
              Export Full Analysis
            </Button>
            <Button className="bg-white bg-opacity-20 text-white hover:bg-opacity-30">
              <i className="fas fa-volume-up mr-2"></i>
              Generate Audio Summary
            </Button>
            <Button className="bg-white bg-opacity-20 text-white hover:bg-opacity-30">
              <i className="fas fa-video mr-2"></i>
              Create Video Explanation
            </Button>
            <Button className="bg-white bg-opacity-20 text-white hover:bg-opacity-30">
              <i className="fas fa-share mr-2"></i>
              Share Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
