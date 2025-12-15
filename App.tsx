import React, { useState, useEffect } from 'react';
import { processFile, INCLUDED_OPERATORS } from './utils/parser';
import { OperatorGroups } from './types';
import { OperatorPanel } from './components/OperatorPanel';

// Icons
function SunIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function App() {
  const [groups, setGroups] = useState<OperatorGroups | null>(null);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem("oporg-theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem("oporg-theme", theme);
  }, [theme]);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setError("");
    setGroups(null);
    try {
      const result = await processFile(file);
      setGroups(result);
    } catch (err) {
      console.error(err);
      setError("I couldn't parse that file. Make sure it's your Book4Time 'Appointment List - By Operator' XLSX export.");
    }
  };

  const downloadCSV = () => {
    if (!groups) return;
    const rows = [["Operator", "Date", "Service", "Duration", "Guest"]];
    for (const name of INCLUDED_OPERATORS) {
      for (const r of (groups[name] || [])) {
        rows.push([r.operator, r.date, r.service, r.duration, r.guest]);
      }
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pre_arrival_talliez.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToPanel = (name: string) => {
    const el = document.getElementById(`panel-${name}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div 
      className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto font-sans"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
              Pre Arrival Talliez
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
              Single file preview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
            title="Toggle Theme"
          >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>

          {/* Export Button */}
          <button
            onClick={downloadCSV}
            disabled={!groups}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              !groups
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700'
            }`}
          >
            Export CSV
          </button>

          {/* Upload Button */}
          <label className="cursor-pointer px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
            <UploadIcon className="w-4 h-4" />
            Upload XLSX
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              className="hidden" 
              onChange={handleFileInput} 
            />
          </label>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-100/50 dark:bg-slate-800/30 p-5 rounded-lg text-sm text-slate-600 dark:text-slate-400 mb-6 border border-slate-200/50 dark:border-slate-700/50 leading-relaxed">
        <p>
          Drop in your Book4Time <strong className="text-slate-800 dark:text-slate-200 font-semibold">Appointment List – By Operator</strong> export.
          <br />
          Filters for: <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded ml-1">{INCLUDED_OPERATORS.join(", ")}</span>.
        </p>
      </div>

      {/* Drag Drop Zone (Visible when no data) */}
      {!groups && (
        <div 
          className={`border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ease-out group cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]' 
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:border-blue-400 dark:hover:border-blue-600'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
        >
          <div className="pointer-events-none flex flex-col items-center">
            <div className={`p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 transition-transform group-hover:scale-110 duration-200 ${isDragging ? 'text-blue-500 scale-110' : 'text-slate-400'}`}>
              <UploadIcon className="w-10 h-10" />
            </div>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Drag & drop your file here
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              or click to browse from your computer
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-300 text-sm flex items-start gap-3">
          <AlertTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="pt-0.5 font-medium">{error}</p>
        </div>
      )}

      {/* Results View */}
      {groups && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Jump Links Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {INCLUDED_OPERATORS.map(name => {
              const count = (groups[name] || []).length;
              const hasData = count > 0;
              return (
                <button
                  key={name}
                  onClick={() => scrollToPanel(name)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${hasData 
                      ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 shadow-sm' 
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-transparent cursor-default'
                    }
                  `}
                >
                  {name} <span className="opacity-60 ml-1 font-normal">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Panels Grid */}
          <div className="grid gap-6">
            {INCLUDED_OPERATORS.map((name) => (
              <OperatorPanel 
                key={name} 
                name={name} 
                items={groups[name] || []} 
                openDefault={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}