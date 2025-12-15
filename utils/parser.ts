import * as XLSX from 'xlsx';
import { AppointmentRecord, HeaderPositionInfo, OperatorGroups } from '../types';

export const INCLUDED_OPERATORS = ["Amber", "Brittany", "Megan", "Sarah", "Stephanie", "Vanessa", "Kaylee"];

function parseMonthHeader(text: string): Date | null {
  if (!text) return null;
  const m = String(text).match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-zA-Z]*\s+\d{1,2}\s+\d{4}/i);
  if (!m) return null;
  const s = m[0].replace(/\s{2,}/g, " ");
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function detectHeaderPositions(rows: any[][]): HeaderPositionInfo | null {
  for (let r = 0; r < rows.length; r++) {
    const vals = rows[r].map(v => String(v || '').trim());
    const upp = vals.map(v => v.toUpperCase());
    const want = ["TIME", "GUEST", "SERVICE", "DURATION"];
    // Find indices for all required columns
    const foundEntries = want
      .filter(w => upp.includes(w))
      .map(w => [w, upp.indexOf(w)] as [string, number]);
      
    const found = Object.fromEntries(foundEntries);

    if (Object.keys(found).length === want.length) {
      return { 
        rowIndex: r, 
        map: found as HeaderPositionInfo['map'] 
      };
    }
  }
  return null;
}

const isTimeToken = (t: any) => /(\d{1,2}:\d{2})/.test(String(t || ''));
const firstNameKey = (s: any) => String(s || '').trim().split(/\s+/)[0] || '';

export function parseBook4TimeMatrix(rows: any[][]): AppointmentRecord[] {
  const headerInfo = detectHeaderPositions(rows);
  if (!headerInfo) {
    throw new Error("Could not locate the TIME/GUEST/SERVICE/DURATION header row.");
  }
  const { rowIndex: hdrRow, map } = headerInfo;

  let currentDate: Date | null = null;
  let currentOperator: string | null = null;
  const out: AppointmentRecord[] = [];

  for (let r = hdrRow + 1; r < rows.length; r++) {
    const row = rows[r].map(v => String(v || '').trim());
    const joined = row.filter(Boolean).join(' ');
    const dateCandidate = parseMonthHeader(joined);
    
    if (dateCandidate) { 
      currentDate = dateCandidate; 
      continue; 
    }

    const timeCell = row[map.TIME] || '';
    const guestCell = row[map.GUEST] || '';
    const serviceCell = row[map.SERVICE] || '';

    // Operator header line lives in TIME column without a time token and empty guest/service
    if (timeCell && !isTimeToken(timeCell) && !guestCell && !serviceCell) {
      currentOperator = timeCell;
      continue;
    }

    if (isTimeToken(timeCell) && guestCell && serviceCell && currentDate && currentOperator) {
      const durationCell = row[map.DURATION] || '';
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      out.push({
        operator: currentOperator,
        operatorKey: firstNameKey(currentOperator),
        date: dateStr,
        time: timeCell,
        service: serviceCell,
        duration: (String(durationCell).match(/\d+/) || [''])[0],
        guest: guestCell
      });
    }
  }
  return out;
}

export function groupByOperator(records: AppointmentRecord[]): OperatorGroups {
  const groups: OperatorGroups = Object.fromEntries(INCLUDED_OPERATORS.map(k => [k, []]));
  
  for (const rec of records) {
    const key = (rec.operatorKey || '').toLowerCase();
    for (const inc of INCLUDED_OPERATORS) {
      if (key === inc.toLowerCase()) {
        groups[inc].push(rec);
        break;
      }
    }
  }
  // sort each group by (date,time)
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => (`${a.date} ${a.time}`).localeCompare(`${b.date} ${b.time}`));
  }
  return groups;
}

export async function processFile(file: File): Promise<OperatorGroups> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File is empty");
        
        const wb = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false }) as any[][];
        const recs = parseBook4TimeMatrix(rows);
        const g = groupByOperator(recs);
        resolve(g);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}