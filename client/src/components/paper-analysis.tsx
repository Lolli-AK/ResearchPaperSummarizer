import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaperSidebar } from "./paper-sidebar";
import { DiagramGenerator } from "./diagram-generator";

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

  const exportAnalysis = () => {
    console.log('Export button clicked!');
    console.log('Paper data:', paper);
    console.log('Analysis data:', analysis);
    
    try {
      const exportData = {
        paper: {
          title: paper.title,
          authors: paper.authors,
          analyzedDate: new Date(paper.createdAt).toLocaleDateString()
        },
        analysis: {
          overview: analysis.overview,
          sections: analysis.sections,
          keyConcepts: analysis.keyConcepts,
          complexity: analysis.complexity,
          readingTime: analysis.readingTime,
          totalCost: analysis.totalCost
        }
      };
      
      console.log('Export data prepared:', exportData);
      
      const jsonString = JSON.stringify(exportData, null, 2);
      console.log('JSON string length:', jsonString.length);
      
      const blob = new Blob([jsonString], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const filename = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.json`;
      
      console.log('Creating download link with filename:', filename);
      
      // Simple and reliable blob download method
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      console.log('Triggering download via blob method...');
      a.click();
      
      // Clean up
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
        console.log('Cleanup completed');
      }, 100);
      
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Export failed: ' + errorMessage);
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

              {/* Add diagram for sections with key concepts or technical content */}
              {(section.keyConcepts || section.title.toLowerCase().includes('attention') || 
                section.title.toLowerCase().includes('transformer') || 
                section.title.toLowerCase().includes('architecture')) && (
                <DiagramGenerator 
                  sectionTitle={section.title}
                  sectionContent={section.explanation || section.originalContent || ""}
                  keyConcepts={section.keyConcepts || analysis.keyConcepts.slice(0, 6)}
                  paperTitle={paper.title}
                />
              )}
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
