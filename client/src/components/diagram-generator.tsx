import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DiagramGeneratorProps {
  sectionTitle: string;
  sectionContent: string;
  keyConcepts: string[];
  paperTitle: string;
}

// Track which diagram types have been used
const usedDiagramTypes = new Set<string>();

export function DiagramGenerator({ sectionTitle, sectionContent, keyConcepts, paperTitle }: DiagramGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Determine unique diagram type for this section
  const getDiagramType = (): 'flowchart' | 'concept' | 'architecture' | null => {
    const diagramKey = `${sectionTitle}-${paperTitle}`;
    
    // Check if we've already generated a diagram for this exact section
    if (usedDiagramTypes.has(diagramKey)) {
      return null; // Don't generate duplicate
    }
    
    // Assign diagram types based on content and what hasn't been used
    if (sectionTitle.toLowerCase().includes('attention') || 
        sectionTitle.toLowerCase().includes('transformer') ||
        sectionTitle.toLowerCase().includes('architecture')) {
      if (!usedDiagramTypes.has('architecture')) {
        usedDiagramTypes.add('architecture');
        usedDiagramTypes.add(diagramKey);
        return 'architecture';
      }
    }
    
    if (sectionTitle.toLowerCase().includes('method') ||
        sectionTitle.toLowerCase().includes('approach') ||
        sectionTitle.toLowerCase().includes('algorithm')) {
      if (!usedDiagramTypes.has('flowchart')) {
        usedDiagramTypes.add('flowchart');
        usedDiagramTypes.add(diagramKey);
        return 'flowchart';
      }
    }
    
    // Default to concept map if available
    if (!usedDiagramTypes.has('concept')) {
      usedDiagramTypes.add('concept');
      usedDiagramTypes.add(diagramKey);
      return 'concept';
    }
    
    return null; // All diagram types used
  };
  
  const [diagramType, setDiagramType] = useState<'flowchart' | 'concept' | 'architecture' | null>(getDiagramType());

  const generateTransformerDiagram = useCallback(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    svg.innerHTML = ''; // Clear previous content
    
    // Set SVG dimensions
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '400');
    svg.setAttribute('viewBox', '0 0 800 400');
    
    // Define colors
    const colors = {
      input: '#e3f2fd',
      attention: '#1976d2',
      feedforward: '#388e3c',
      output: '#f57c00',
      text: '#333333',
      arrow: '#666666'
    };
    
    // Create transformer architecture diagram
    const components = [
      { name: 'Input\nEmbedding', x: 100, y: 350, width: 80, height: 40, color: colors.input },
      { name: 'Positional\nEncoding', x: 100, y: 290, width: 80, height: 40, color: colors.input },
      { name: 'Multi-Head\nAttention', x: 100, y: 230, width: 80, height: 40, color: colors.attention },
      { name: 'Add & Norm', x: 100, y: 170, width: 80, height: 30, color: colors.feedforward },
      { name: 'Feed Forward', x: 100, y: 120, width: 80, height: 40, color: colors.feedforward },
      { name: 'Add & Norm', x: 100, y: 70, width: 80, height: 30, color: colors.feedforward },
      { name: 'Output\nLinear', x: 100, y: 20, width: 80, height: 40, color: colors.output }
    ];
    
    // Draw components
    components.forEach(comp => {
      // Rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', comp.x.toString());
      rect.setAttribute('y', comp.y.toString());
      rect.setAttribute('width', comp.width.toString());
      rect.setAttribute('height', comp.height.toString());
      rect.setAttribute('fill', comp.color);
      rect.setAttribute('stroke', '#333');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('rx', '5');
      svg.appendChild(rect);
      
      // Text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (comp.x + comp.width / 2).toString());
      text.setAttribute('y', (comp.y + comp.height / 2 + 4).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-family', 'Arial, sans-serif');
      text.setAttribute('fill', colors.text);
      
      // Handle multi-line text
      const lines = comp.name.split('\n');
      if (lines.length > 1) {
        lines.forEach((line, index) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', (comp.x + comp.width / 2).toString());
          tspan.setAttribute('dy', index === 0 ? '-6' : '12');
          tspan.textContent = line;
          text.appendChild(tspan);
        });
      } else {
        text.textContent = comp.name;
      }
      svg.appendChild(text);
      
      // Draw arrows between components (except for the last one)
      if (comp !== components[components.length - 1]) {
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startY = comp.y - 10;
        const endY = startY - 20;
        arrow.setAttribute('d', `M ${comp.x + comp.width / 2} ${startY} L ${comp.x + comp.width / 2} ${endY}`);
        arrow.setAttribute('stroke', colors.arrow);
        arrow.setAttribute('stroke-width', '2');
        arrow.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(arrow);
      }
    });
    
    // Add arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', colors.arrow);
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // Add attention mechanism detail
    if (sectionTitle.toLowerCase().includes('attention') || sectionContent.toLowerCase().includes('attention')) {
      // Add attention detail box
      const detailBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      detailBox.setAttribute('x', '250');
      detailBox.setAttribute('y', '200');
      detailBox.setAttribute('width', '500');
      detailBox.setAttribute('height', '150');
      detailBox.setAttribute('fill', '#f5f5f5');
      detailBox.setAttribute('stroke', colors.attention);
      detailBox.setAttribute('stroke-width', '2');
      detailBox.setAttribute('rx', '10');
      svg.appendChild(detailBox);
      
      // Add attention formula
      const formulaText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      formulaText.setAttribute('x', '500');
      formulaText.setAttribute('y', '230');
      formulaText.setAttribute('text-anchor', 'middle');
      formulaText.setAttribute('font-size', '16');
      formulaText.setAttribute('font-family', 'monospace');
      formulaText.setAttribute('font-weight', 'bold');
      formulaText.textContent = 'Attention(Q, K, V) = softmax(QKᵀ/√dₖ)V';
      svg.appendChild(formulaText);
      
      // Add explanation
      const explanations = [
        'Q: Query matrix',
        'K: Key matrix', 
        'V: Value matrix',
        'dₖ: Dimension of key vectors',
        'Softmax: Attention weights'
      ];
      
      explanations.forEach((exp, index) => {
        const expText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        expText.setAttribute('x', '270');
        expText.setAttribute('y', (260 + index * 16).toString());
        expText.setAttribute('font-size', '12');
        expText.setAttribute('font-family', 'Arial, sans-serif');
        expText.setAttribute('fill', colors.text);
        expText.textContent = exp;
        svg.appendChild(expText);
      });
    }
    
  }, [sectionTitle, sectionContent]);

  const generateConceptMap = useCallback(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    svg.innerHTML = '';
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '500');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const centerX = 400;
    const centerY = 250;
    const radius = 150;
    
    // Central concept
    const centralRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    centralRect.setAttribute('x', (centerX - 60).toString());
    centralRect.setAttribute('y', (centerY - 20).toString());
    centralRect.setAttribute('width', '120');
    centralRect.setAttribute('height', '40');
    centralRect.setAttribute('fill', '#1976d2');
    centralRect.setAttribute('stroke', '#333');
    centralRect.setAttribute('stroke-width', '2');
    centralRect.setAttribute('rx', '8');
    svg.appendChild(centralRect);
    
    const centralText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centralText.setAttribute('x', centerX.toString());
    centralText.setAttribute('y', (centerY + 5).toString());
    centralText.setAttribute('text-anchor', 'middle');
    centralText.setAttribute('font-size', '12');
    centralText.setAttribute('font-weight', 'bold');
    centralText.setAttribute('fill', 'white');
    centralText.textContent = sectionTitle;
    svg.appendChild(centralText);
    
    // Surrounding concepts
    keyConcepts.slice(0, 6).forEach((concept, index) => {
      const angle = (index * 60) * Math.PI / 180; // 60 degrees apart
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Concept box
      const conceptRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      conceptRect.setAttribute('x', (x - 40).toString());
      conceptRect.setAttribute('y', (y - 15).toString());
      conceptRect.setAttribute('width', '80');
      conceptRect.setAttribute('height', '30');
      conceptRect.setAttribute('fill', '#e3f2fd');
      conceptRect.setAttribute('stroke', '#1976d2');
      conceptRect.setAttribute('stroke-width', '1');
      conceptRect.setAttribute('rx', '5');
      svg.appendChild(conceptRect);
      
      // Concept text
      const conceptText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      conceptText.setAttribute('x', x.toString());
      conceptText.setAttribute('y', (y + 4).toString());
      conceptText.setAttribute('text-anchor', 'middle');
      conceptText.setAttribute('font-size', '10');
      conceptText.setAttribute('fill', '#333');
      conceptText.textContent = concept.length > 12 ? concept.substring(0, 12) + '...' : concept;
      svg.appendChild(conceptText);
      
      // Connection line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX.toString());
      line.setAttribute('y1', centerY.toString());
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#666');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    });
    
  }, [sectionTitle, keyConcepts]);

  const downloadDiagram = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sectionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_diagram.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (diagramType === 'concept') {
      generateConceptMap();
    } else {
      generateTransformerDiagram();
    }
  }, [diagramType, generateConceptMap, generateTransformerDiagram]);

  return (
    <Card className="border border-slate-200 mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-slate-800">
            <i className="fas fa-project-diagram text-academic-blue mr-2"></i>
            Visual Diagram
          </h4>
          <div className="flex space-x-2">
            <Button 
              variant={diagramType === 'flowchart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDiagramType('flowchart')}
            >
              Architecture
            </Button>
            <Button 
              variant={diagramType === 'concept' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDiagramType('concept')}
            >
              Concept Map
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadDiagram}
            >
              <i className="fas fa-download mr-1"></i>
              Download
            </Button>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4 overflow-auto">
          <svg 
            ref={svgRef}
            className="w-full h-auto max-w-full"
            style={{ minHeight: '300px' }}
          />
        </div>
        
        <p className="text-xs text-slate-500 mt-2">
          Interactive diagrams generated based on section content and key concepts
        </p>
      </CardContent>
    </Card>
  );
}