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
    <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-sm flex flex-col overflow-hidden h-full min-h-[280px]">
      {caseStudyQuestion && (
        <div className="p-4 border-b border-[var(--color-border-light)] bg-[var(--color-surface-alt)] flex-shrink-0">
          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-2">Case Study Question</h4>
              <div className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
                {caseStudyQuestion}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Write your notes, thoughts, and key points here..."
          className="w-full flex-1 min-h-[120px] resize-none rounded-lg border border-[var(--color-border-light)] p-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-muted)] focus:border-transparent bg-[var(--color-surface-alt)]"
        />
      </div>
    </div>
  );
}
