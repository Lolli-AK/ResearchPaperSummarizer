import { useState } from "react";
import { UploadSection } from "@/components/upload-section";
import { ProcessingStatus } from "@/components/processing-status";
import { PaperAnalysis } from "@/components/paper-analysis";
import { useQuery } from "@tanstack/react-query";

interface AnalysisData {
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
}

export default function Home() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Get papers history
  const { data: papersData } = useQuery({
    queryKey: ['/api/papers'],
    enabled: true,
  });

  const handleAnalysisComplete = (analysisData: AnalysisData) => {
    setCurrentAnalysis(analysisData);
    setIsProcessing(false);
    setProcessingProgress(0);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setCurrentAnalysis(null);
    
    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setProcessingProgress(progress);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-paper-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i className="fas fa-brain text-academic-blue text-2xl mr-3"></i>
                <span className="text-xl font-semibold text-slate-900">AI Research Tutor</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-slate-600 hover:text-academic-blue px-3 py-2 text-sm font-medium transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-slate-600 hover:text-academic-blue px-3 py-2 text-sm font-medium transition-colors">
                History
              </a>
              <a href="#" className="text-slate-600 hover:text-academic-blue px-3 py-2 text-sm font-medium transition-colors">
                Settings
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                <i className="fas fa-dollar-sign mr-1"></i>
                <span>$12.45</span> credits
              </div>
              <button className="bg-academic-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <i className="fas fa-user-circle mr-2"></i>
                Account
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isProcessing && !currentAnalysis && (
          <UploadSection 
            onProcessingStart={handleProcessingStart}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {isProcessing && (
          <ProcessingStatus 
            progress={processingProgress}
            onComplete={handleAnalysisComplete}
          />
        )}

        {currentAnalysis && (
          <PaperAnalysis analysisData={currentAnalysis} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-brain text-academic-blue text-xl mr-2"></i>
                <span className="font-semibold text-slate-900">AI Research Tutor</span>
              </div>
              <p className="text-sm text-slate-600">
                Transform complex research papers into clear, comprehensive explanations using advanced AI.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-academic-blue">PDF Analysis</a></li>
                <li><a href="#" className="hover:text-academic-blue">arXiv Integration</a></li>
                <li><a href="#" className="hover:text-academic-blue">Audio Summaries</a></li>
                <li><a href="#" className="hover:text-academic-blue">Video Explanations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-academic-blue">Documentation</a></li>
                <li><a href="#" className="hover:text-academic-blue">API Reference</a></li>
                <li><a href="#" className="hover:text-academic-blue">Contact</a></li>
                <li><a href="#" className="hover:text-academic-blue">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Usage Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Papers Analyzed</span>
                  <span className="font-medium text-slate-900">{papersData?.papers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Users</span>
                  <span className="font-medium text-slate-900">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg. Cost/Paper</span>
                  <span className="font-medium text-slate-900">$3.80</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-slate-500">
              © 2025 AI Research Tutor. Built with GPT-4.1 API.
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-slate-400 hover:text-academic-blue">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-academic-blue">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-academic-blue">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
