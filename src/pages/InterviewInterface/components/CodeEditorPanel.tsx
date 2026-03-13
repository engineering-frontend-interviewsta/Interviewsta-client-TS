import Editor from '@monaco-editor/react';
import { useState } from 'react';

interface CodeEditorPanelProps {
  initialCode?: string;
  onSend: (code: string) => Promise<void> | void;
  disabled?: boolean;
}

export default function CodeEditorPanel({ initialCode = '', onSend, disabled }: CodeEditorPanelProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');

  const handleSend = async () => {
    if (!code.trim() || disabled) return;
    await onSend(code);
  };

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
      <div className="flex-1 min-h-[220px] border border-gray-100 rounded overflow-hidden mb-3">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={(val) => setCode(val ?? '')}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !code.trim()}
          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
        >
          Send code
        </button>
      </div>
    </div>
  );
}

