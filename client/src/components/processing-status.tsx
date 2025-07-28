import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ProcessingStatusProps {
  progress: number;
  onComplete: (analysisData: any) => void;
}

export function ProcessingStatus({ progress, onComplete }: ProcessingStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(3.20);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };

  const processingSteps = [
    { 
      label: "Extracting text from PDF", 
      completed: progress > 25,
      active: progress <= 25 && progress > 0
    },
    { 
      label: "Analyzing paper structure", 
      completed: progress > 50,
      active: progress > 25 && progress <= 50
    },
    { 
      label: "Generating explanations", 
      completed: progress > 75,
      active: progress > 50 && progress <= 75
    },
    { 
      label: "Creating summaries", 
      completed: progress > 95,
      active: progress > 75 && progress <= 95
    },
  ];

  return (
    <Card className="border border-slate-200 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            <i className="fas fa-cog fa-spin text-academic-blue mr-2"></i>
            Processing Paper
          </h3>
          <span className="text-sm text-slate-600">{formatTime(timeElapsed)}</span>
        </div>
        
        <div className="space-y-4 mb-4">
          {processingSteps.map((step, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{step.label}</span>
              {step.completed ? (
                <i className="fas fa-check text-emerald-600"></i>
              ) : step.active ? (
                <i className="fas fa-spinner fa-spin text-academic-blue"></i>
              ) : (
                <i className="fas fa-clock text-slate-400"></i>
              )}
            </div>
          ))}
        </div>

        <div className="mb-4 bg-slate-100 rounded-full h-2">
          <div 
            className="bg-academic-blue h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center text-amber-800">
            <i className="fas fa-info-circle mr-2"></i>
            <span className="text-sm">
              Estimated cost: <span className="font-medium">${estimatedCost.toFixed(2)}</span> 
              • Using GPT-4.1 for analysis
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
