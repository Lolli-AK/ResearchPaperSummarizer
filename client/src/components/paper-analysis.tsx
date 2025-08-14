import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperSidebar } from "./paper-sidebar";
import { DiagramGenerator } from "./diagram-generator";
import { Edit3, Check, X } from "lucide-react";
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
    generatedTitle?: string;
    generatedSubtitle?: string;
  };
}

export function PaperAnalysis({ analysisData }: PaperAnalysisProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSubtitle, setEditedSubtitle] = useState("");
  const [displayTitle, setDisplayTitle] = useState("");
  const [displaySubtitle, setDisplaySubtitle] = useState("");
  const { paper, analysis, generatedTitle, generatedSubtitle } = analysisData;

  // Initialize display title and subtitle
  useEffect(() => {
    const title = generatedTitle || paper.title;
    const subtitle = generatedSubtitle || "";
    setDisplayTitle(title);
    setEditedTitle(title);
    setDisplaySubtitle(subtitle);
    setEditedSubtitle(subtitle);
  }, [generatedTitle, generatedSubtitle, paper.title]);

  const handleStartEditingTitle = () => {
    setIsEditingTitle(true);
    setEditedTitle(displayTitle);
  };

  const handleSaveTitle = () => {
    setDisplayTitle(editedTitle);
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setEditedTitle(displayTitle);
    setIsEditingTitle(false);
  };

  const handleStartEditingSubtitle = () => {
    setIsEditingSubtitle(true);
    setEditedSubtitle(displaySubtitle);
  };

  const handleSaveSubtitle = () => {
    setDisplaySubtitle(editedSubtitle);
    setIsEditingSubtitle(false);
  };

  const handleCancelEditSubtitle = () => {
    setEditedSubtitle(displaySubtitle);
    setIsEditingSubtitle(false);
  };

  const generateEnhancedPDF = async () => {
    console.log('Generating enhanced PDF export...');
    
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      let yPosition = margin;
      
      // Enhanced PDF with website-like formatting
      const addPageIfNeeded = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Cover Page with Colors
      pdf.setFillColor(59, 130, 246); // Blue background
      pdf.rect(0, 0, pageWidth, 140, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      
      // Use the display title (editable)
      const titleLines = pdf.splitTextToSize(displayTitle, pageWidth - 80);
      pdf.text(titleLines, 40, 50);
      
      // Add subtitle if it exists
      if (displaySubtitle) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'italic');
        const subtitleLines = pdf.splitTextToSize(displaySubtitle, pageWidth - 80);
        const titleHeight = titleLines.length * 28;
        pdf.text(subtitleLines, 40, 50 + titleHeight + 10);
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Authors: Unknown Authors`, 40, 120);
      
      yPosition = 180;
      pdf.setTextColor(0, 0, 0);

      // Overview Section with colored header
      addPageIfNeeded(100);
      pdf.setFillColor(16, 185, 129); // Green
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Overview', margin + 10, yPosition + 20);
      
      yPosition += 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const overviewLines = pdf.splitTextToSize(analysis.overview, pageWidth - 2 * margin);
      pdf.text(overviewLines, margin, yPosition);
      yPosition += overviewLines.length * 14 + 20;

      // Key Insights Section
      addPageIfNeeded(100);
      pdf.setFillColor(251, 146, 60); // Orange
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights', margin + 10, yPosition + 20);
      
      yPosition += 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      
      const insights = [
        `Complexity Level: ${analysis.complexity}`,
        `Reading Time: ${analysis.readingTime}`,
        `Analysis completed in: ${analysis.analysisTime}`,
        `Processing Cost: $${analysis.totalCost}`
      ];
      
      insights.forEach(insight => {
        pdf.text(`• ${insight}`, margin + 10, yPosition);
        yPosition += 16;
      });
      yPosition += 20;

      // Key Concepts Section
      addPageIfNeeded(100);
      pdf.setFillColor(139, 92, 246); // Purple
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Concepts', margin + 10, yPosition + 20);
      
      yPosition += 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      
      // Display concepts in a grid
      let conceptX = margin + 10;
      let conceptY = yPosition;
      const conceptWidth = 140;
      
      analysis.keyConcepts.forEach((concept: string, index: number) => {
        if (conceptX + conceptWidth > pageWidth - margin) {
          conceptX = margin + 10;
          conceptY += 20;
        }
        
        addPageIfNeeded(25);
        pdf.setFillColor(243, 244, 246); // Light gray background
        pdf.rect(conceptX - 5, conceptY - 12, conceptWidth, 16, 'F');
        pdf.text(`• ${concept}`, conceptX, conceptY);
        conceptX += conceptWidth + 10;
      });
      
      yPosition = conceptY + 30;

      // Paper Sections with embedded diagrams
      analysis.sections.forEach((section: any, index: number) => {
        addPageIfNeeded(150);
        
        // Section header with color
        pdf.setFillColor(236, 72, 153); // Pink
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${section.title}`, margin + 10, yPosition + 20);
        
        yPosition += 40;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        // Original content
        if (section.originalContent) {
          pdf.setFillColor(249, 250, 251); // Light background
          pdf.rect(margin, yPosition, pageWidth - 2 * margin, 60, 'F');
          const originalLines = pdf.splitTextToSize(section.originalContent, pageWidth - 2 * margin - 20);
          pdf.text(originalLines.slice(0, 4), margin + 10, yPosition + 15); // Limit original content
          yPosition += 70;
        }
        
        // Explanation
        const explanationLines = pdf.splitTextToSize(section.explanation, pageWidth - 2 * margin);
        pdf.text(explanationLines, margin, yPosition);
        yPosition += explanationLines.length * 12 + 30;
        
        // Add enhanced visual diagram representation
        if (index < 3) { // Only for first 3 sections to avoid repetition
          addPageIfNeeded(150);
          
          // Draw enhanced visual diagram
          pdf.setFillColor(243, 244, 246);
          pdf.rect(margin, yPosition, pageWidth - 2 * margin, 120, 'F');
          
          const diagramTypes = ['Architecture Diagram', 'Concept Map', 'Process Flowchart'];
          const diagramType = diagramTypes[index];
          
          // Draw meaningful diagram based on type
          if (diagramType === 'Architecture Diagram') {
            // Draw system architecture
            pdf.setFillColor(59, 130, 246);
            pdf.rect(margin + 20, yPosition + 20, 100, 40, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.text('User Interface', margin + 35, yPosition + 45);
            
            pdf.setFillColor(16, 185, 129);
            pdf.rect(margin + 20, yPosition + 70, 100, 40, 'F');
            pdf.text('Application Layer', margin + 30, yPosition + 95);
            
            pdf.setFillColor(251, 146, 60);
            pdf.rect(margin + 140, yPosition + 45, 80, 40, 'F');
            pdf.text('Database', margin + 165, yPosition + 70);
            
            // Draw arrows
            pdf.setDrawColor(107, 114, 128);
            pdf.setLineWidth(2);
            pdf.line(margin + 120, yPosition + 90, margin + 140, yPosition + 65);
            
          } else if (diagramType === 'Concept Map') {
            // Draw concept relationships
            pdf.setFillColor(139, 92, 246);
            pdf.circle(margin + 70, yPosition + 40, 25, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(7);
            pdf.text('Core', margin + 60, yPosition + 45);
            
            pdf.setFillColor(236, 72, 153);
            pdf.circle(margin + 150, yPosition + 30, 20, 'F');
            pdf.text('Input', margin + 140, yPosition + 35);
            
            pdf.setFillColor(34, 197, 94);
            pdf.circle(margin + 150, yPosition + 70, 20, 'F');
            pdf.text('Output', margin + 138, yPosition + 75);
            
            // Connect with lines
            pdf.setDrawColor(107, 114, 128);
            pdf.setLineWidth(1.5);
            pdf.line(margin + 95, yPosition + 35, margin + 130, yPosition + 30);
            pdf.line(margin + 95, yPosition + 55, margin + 130, yPosition + 70);
            
          } else { // Process Flowchart
            // Draw process flow
            pdf.setFillColor(34, 197, 94);
            pdf.rect(margin + 20, yPosition + 30, 60, 25, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(7);
            pdf.text('Start', margin + 45, yPosition + 45);
            
            pdf.setFillColor(59, 130, 246);
            // Diamond shape for decision
            const points = [
              [margin + 120, yPosition + 25],
              [margin + 150, yPosition + 42],
              [margin + 120, yPosition + 60],
              [margin + 90, yPosition + 42]
            ];
            pdf.setFillColor(59, 130, 246);
            for (let i = 0; i < points.length; i++) {
              const next = (i + 1) % points.length;
              if (i === 0) pdf.moveTo(points[i][0], points[i][1]);
              pdf.lineTo(points[next][0], points[next][1]);
            }
            pdf.fill();
            pdf.setTextColor(255, 255, 255);
            pdf.text('Process', margin + 110, yPosition + 45);
            
            pdf.setFillColor(251, 146, 60);
            pdf.rect(margin + 170, yPosition + 30, 50, 25, 'F');
            pdf.text('End', margin + 190, yPosition + 45);
            
            // Connect with arrows
            pdf.setDrawColor(107, 114, 128);
            pdf.setLineWidth(2);
            pdf.line(margin + 80, yPosition + 42, margin + 90, yPosition + 42);
            pdf.line(margin + 150, yPosition + 42, margin + 170, yPosition + 42);
          }
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(diagramType, margin + 260, yPosition + 35);
          
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Visual representation of ${section.title}`, margin + 260, yPosition + 55);
          pdf.text('concepts and relationships', margin + 260, yPosition + 70);
          
          yPosition += 140;
        }
      });

      // Save the enhanced PDF
      pdf.save(`${displayTitle.slice(0, 50)}_analysis.pdf`);
      console.log('Enhanced PDF generated successfully with colors and embedded diagrams!');
      
    } catch (error) {
      console.error('Error generating enhanced PDF:', error);
    }
  };

  const renderContent = () => {
    if (activeSection === "overview") {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-l-blue-500">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">📖 Overview</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysis.overview}
            </p>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border-l-4 border-l-orange-500">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">💡 Key Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="font-medium">Complexity:</span> {analysis.complexity}
              </div>
              <div className="text-sm">
                <span className="font-medium">Reading Time:</span> {analysis.readingTime}
              </div>
              <div className="text-sm">
                <span className="font-medium">Analysis Time:</span> {analysis.analysisTime}
              </div>
              <div className="text-sm">
                <span className="font-medium">Cost:</span> ${analysis.totalCost}
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-l-4 border-l-purple-500">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">🔑 Key Concepts</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.keyConcepts.map((concept, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const section = analysis.sections.find(s => s.id === activeSection);
    if (section) {
      return (
        <div className="space-y-6">
          <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-lg border-l-4 border-l-pink-500">
            <h3 className="font-semibold text-pink-800 dark:text-pink-200 mb-3">📝 {section.title}</h3>
            
            {section.originalContent && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded border-l-4 border-l-gray-400">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Original Content:</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  {section.originalContent}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-pink-700 dark:text-pink-300 mb-2">Explanation:</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {section.explanation}
              </p>
            </div>
          </div>

          <DiagramGenerator 
            sectionTitle={section.title}
            sectionContent={section.explanation}
            keyConcepts={analysis.keyConcepts}
            sectionId={section.id}
          />
        </div>
      );
    }

    return <div>Section not found</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with editable title */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-xl font-bold"
                      placeholder="Enter paper title..."
                    />
                    <Button size="sm" onClick={handleSaveTitle}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEditTitle}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {displayTitle}
                    </h1>
                    <Button size="sm" variant="ghost" onClick={handleStartEditingTitle}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  By Unknown Authors
                </p>
                
                {isEditingSubtitle ? (
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      value={editedSubtitle}
                      onChange={(e) => setEditedSubtitle(e.target.value)}
                      className="text-lg italic"
                      placeholder="Enter paper subtitle..."
                    />
                    <Button size="sm" onClick={handleSaveSubtitle}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEditSubtitle}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3">
                    {displaySubtitle ? (
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium italic">
                          {displaySubtitle}
                        </p>
                        <Button size="sm" variant="ghost" onClick={handleStartEditingSubtitle}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleStartEditingSubtitle}
                        className="text-sm"
                      >
                        + Add Subtitle
                      </Button>
                    )}
                  </div>
                )}
                
                {generatedTitle && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    ✨ AI-generated title and subtitle - click edit icons to customize
                  </p>
                )}
              </div>
              
              <Button onClick={generateEnhancedPDF} className="ml-4">
                Export Enhanced PDF
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <PaperSidebar
                sections={analysis.sections}
                keyConcepts={analysis.keyConcepts}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
            <div className="lg:col-span-3">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardContent className="p-8">
                  {renderContent()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}