import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UploadSectionProps {
  onProcessingStart: () => void;
  onAnalysisComplete: (analysisData: any) => void;
}

export function UploadSection({ onProcessingStart, onAnalysisComplete }: UploadSectionProps) {
  const [arxivUrl, setArxivUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const analyzePaperMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/papers/analyze", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Your paper has been successfully analyzed.",
      });
      onAnalysisComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze paper",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setArxivUrl(""); // Clear arXiv URL if file is selected
    }
  };

  const handleArxivSubmit = async () => {
    if (!arxivUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter an arXiv URL.",
        variant: "destructive",
      });
      return;
    }

    // Validate arXiv URL format
    const arxivPattern = /arxiv\.org\/(abs|pdf)\/([0-9]{4}\.[0-9]{4,5}|[a-z-]+\/[0-9]{7})/;
    if (!arxivPattern.test(arxivUrl)) {
      toast({
        title: "Invalid arXiv URL",
        description: "Please enter a valid arXiv URL (e.g., https://arxiv.org/abs/1706.03762).",
        variant: "destructive",
      });
      return;
    }

    onProcessingStart();
    
    const formData = new FormData();
    formData.append("arxivUrl", arxivUrl);
    
    analyzePaperMutation.mutate(formData);
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return;
    }

    onProcessingStart();
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    analyzePaperMutation.mutate(formData);
  };

  const examplePapers = [
    {
      title: "Attention Is All You Need",
      authors: "Vaswani et al. • 2017",
      tag: "Transformer",
      url: "https://arxiv.org/abs/1706.03762"
    },
    {
      title: "BERT: Pre-training Bidirectional Encoders", 
      authors: "Devlin et al. • 2018",
      tag: "Language Model",
      url: "https://arxiv.org/abs/1810.04805"
    },
    {
      title: "GPT-3: Language Models are Few-Shot Learners",
      authors: "Brown et al. • 2020", 
      tag: "Generative AI",
      url: "https://arxiv.org/abs/2005.14165"
    }
  ];

  const loadExamplePaper = (url: string) => {
    console.log('Loading example paper:', url);
    setArxivUrl(url);
    setSelectedFile(null);
  };

  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Transform Complex Research Papers into Clear Explanations
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Upload any transformer or attention mechanism research paper and get comprehensive, 
          section-by-section explanations powered by GPT-4.1
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* PDF Upload */}
        <Card className="border-2 border-dashed border-slate-300 hover:border-academic-blue transition-colors">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-academic-blue bg-opacity-10 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-file-pdf text-academic-blue text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload PDF</h3>
            <p className="text-slate-600 mb-4">
              Drag & drop your research paper or click to browse
            </p>
            
            <input 
              type="file" 
              id="pdf-upload" 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileUpload}
            />
            
            <label 
              htmlFor="pdf-upload" 
              className="inline-flex items-center px-4 py-2 bg-academic-blue text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors mb-4"
            >
              <i className="fas fa-upload mr-2"></i>
              Choose File
            </label>
            
            {selectedFile && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <i className="fas fa-file-pdf mr-1"></i>
                  {selectedFile.name}
                </p>
                <Button 
                  onClick={handleFileSubmit}
                  disabled={analyzePaperMutation.isPending}
                  className="w-full bg-academic-blue hover:bg-blue-700"
                >
                  {analyzePaperMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-brain mr-2"></i>
                      Analyze Paper
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <p className="text-xs text-slate-500 mt-2">
              Max file size: 10MB • Supported: PDF
            </p>
          </CardContent>
        </Card>

        {/* arXiv URL */}
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-link text-emerald-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">arXiv URL</h3>
            <p className="text-slate-600 mb-4">
              Paste an arXiv paper URL for direct processing
            </p>
            <div className="space-y-3">
              <Input 
                type="url" 
                placeholder="https://arxiv.org/abs/1706.03762" 
                value={arxivUrl}
                onChange={(e) => setArxivUrl(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={handleArxivSubmit}
                disabled={analyzePaperMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {analyzePaperMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Fetching...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download mr-2"></i>
                    Fetch Paper
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Examples */}
      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            <i className="fas fa-rocket text-academic-blue mr-2"></i>
            Quick Start - Try These Papers
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {examplePapers.map((paper, index) => (
              <button 
                key={index}
                onClick={() => loadExamplePaper(paper.url)}
                className="text-left p-4 border border-slate-200 rounded-lg hover:border-academic-blue hover:bg-blue-50 transition-colors"
              >
                <h4 className="font-medium text-slate-900 mb-1">{paper.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{paper.authors}</p>
                <span className={`text-xs text-white px-2 py-1 rounded-full ${
                  paper.tag === 'Transformer' ? 'bg-academic-blue' :
                  paper.tag === 'Language Model' ? 'bg-emerald-600' : 'bg-purple-600'
                }`}>
                  {paper.tag}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
