import { Card, CardContent } from "@/components/ui/card";

interface PaperSidebarProps {
  sections: any[];
  keyConcepts: string[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export function PaperSidebar({ sections, keyConcepts, activeSection, onSectionClick }: PaperSidebarProps) {
  const navigationSections = [
    { id: "overview", title: "Overview", icon: "fas fa-eye" },
    ...sections.map((section, index) => ({
      id: `section-${index}`,
      title: section.title || `Section ${index + 1}`,
      icon: "fas fa-file-alt"
    }))
  ];

  return (
    <div className="lg:col-span-1">
      <Card className="border border-slate-200 sticky top-8">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Paper Sections</h3>
          <nav className="space-y-2">
            {navigationSections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  activeSection === section.id
                    ? "text-academic-blue bg-blue-50"
                    : "text-slate-600 hover:text-academic-blue hover:bg-blue-50"
                }`}
              >
                <i className={`${section.icon} mr-2`}></i>
                {section.title}
              </button>
            ))}
          </nav>

          {keyConcepts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="font-medium text-slate-900 mb-2">Key Concepts</h4>
              <div className="space-y-2">
                {keyConcepts.slice(0, 8).map((concept, index) => (
                  <span 
                    key={index}
                    className={`inline-block text-white text-xs px-2 py-1 rounded-full mr-1 mb-1 ${
                      index % 4 === 0 ? 'bg-academic-blue' :
                      index % 4 === 1 ? 'bg-emerald-600' :
                      index % 4 === 2 ? 'bg-purple-600' : 'bg-amber-600'
                    }`}
                  >
                    {concept}
                  </span>
                ))}
                {keyConcepts.length > 8 && (
                  <span className="text-xs text-slate-500">
                    +{keyConcepts.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
