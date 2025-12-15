import React, { useState } from 'react';
import { AppointmentRecord } from '../types';

interface OperatorPanelProps {
  name: string;
  items: AppointmentRecord[];
  openDefault?: boolean;
}

// Consistent grid layout for headers and rows
const GRID_CLASS = "grid grid-cols-[1.2fr_0.9fr_1.8fr_0.7fr_1.6fr] gap-3";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export const OperatorPanel: React.FC<OperatorPanelProps> = ({ name, items, openDefault = false }) => {
  const [isOpen, setIsOpen] = useState(openDefault);

  return (
    <div 
      id={`panel-${name}`} 
      className="scroll-mt-24 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-white/60 dark:bg-white/5 shadow-sm transition-all"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {name} <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">({items.length})</span>
        </span>
        <ChevronDownIcon 
          className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="bg-white/40 dark:bg-transparent">
          {/* Header */}
          <div className={`${GRID_CLASS} px-4 py-3 border-b border-black/5 dark:border-white/5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400`}>
            <div>Operator</div>
            <div>Date</div>
            <div>Service</div>
            <div>Dur</div>
            <div>Guest</div>
          </div>

          {/* Rows */}
          {items.length === 0 ? (
            <div className="p-4 text-slate-500 italic text-sm text-center">No appointments found.</div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {items.map((r, i) => (
                <div key={i} className={`${GRID_CLASS} px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}>
                  <div className="truncate font-medium text-slate-900 dark:text-slate-100" title={r.operator}>{r.operator}</div>
                  <div className="truncate opacity-90">{r.date} <span className="text-xs opacity-70 ml-1">{r.time}</span></div>
                  <div className="truncate" title={r.service}>{r.service}</div>
                  <div className="truncate font-mono text-xs pt-0.5 opacity-80">{r.duration}m</div>
                  <div className="truncate" title={r.guest}>{r.guest}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};