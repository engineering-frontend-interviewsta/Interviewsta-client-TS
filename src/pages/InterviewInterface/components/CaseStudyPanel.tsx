import { FileText } from 'lucide-react';

export interface CaseStudyPanelProps {
  caseStudyQuestion: string | null;
  notes: string;
  onNotesChange: (value: string) => void;
}

export default function CaseStudyPanel({
  caseStudyQuestion,
  notes,
  onNotesChange,
}: CaseStudyPanelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden h-full min-h-[280px]">
      {caseStudyQuestion && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Case Study Question</h4>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {caseStudyQuestion}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Write your notes, thoughts, and key points here..."
          className="w-full flex-1 min-h-[120px] resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>
    </div>
  );
}
