import { useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';

/** Match installed `monaco-editor` (see package-lock); keeps worker URLs consistent. */
const MONACO_VS_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs';

loader.config({ paths: { vs: MONACO_VS_BASE } });

interface CodeEditorPanelProps {
  /** Controlled editor value (sync to a ref in parent for respond payloads). */
  value: string;
  onChange: (code: string) => void;
}

/**
 * Same idea as interviewsta-landing-website InterviewInterface: no separate code submit.
 * Code is attached as `code_input` when the user speaks (VAD) or sends dev text / communication text.
 */
export default function CodeEditorPanel({ value, onChange }: CodeEditorPanelProps) {
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">Code editor</p>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 bg-white"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
        </select>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        Your code is included automatically when you speak or send a text reply (same as the previous app — no separate submit).
      </p>
      <div className="flex-1 min-h-[220px] border border-gray-100 rounded overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={value}
          onChange={(val) => onChange(val ?? '')}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
