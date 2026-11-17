import * as XLSX from 'xlsx';
import { StudentRecord, SCHOOL_CLASSES } from '../types/adminTypes';

export const formatBanglaRoll = (val: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };

  const raw = String(val ?? '').trim();
  if (!raw) return '০১';

  let enNumStr = '';
  for (const ch of raw) {
    if (bnToEnMap[ch] !== undefined) enNumStr += bnToEnMap[ch];
    else if (/[0-9]/.test(ch)) enNumStr += ch;
  }

  const num = parseInt(enNumStr, 10);
  if (isNaN(num) || num <= 0) return raw;

  const padded = num < 10 ? `0${num}` : `${num}`;
  return padded.split('').map(d => bnDigits[parseInt(d, 10)] ?? d).join('');
};

export const parseRollNumber = (roll: string | number): number => {
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const str = String(roll ?? '').trim();
  let numStr = '';
  for (const ch of str) {
    if (bnToEnMap[ch] !== undefined) numStr += bnToEnMap[ch];
    else if (/[0-9]/.test(ch)) numStr += ch;
  }
  const parsed = parseInt(numStr, 10);
  return isNaN(parsed) ? 9999 : parsed;
};

export const isHeaderOrCorruptedStudent = (name: string): boolean => {
  if (!name) return true;
  const clean = name.trim().toLowerCase();
  if (clean.length < 2) return true;

  const headerBlacklist = [
    'ছাত্র-ছাত্রীর নাম', 'ছাত্র/ছাত্রীর নাম', 'ছাত্রছাত্রীর নাম', 'ছাত্র ছাত্রীর নাম',
    'শিক্ষার্থীর নাম', 'শিক্ষার্থী নাম', 'শিক্ষার্থীর নাম (বাংলা)', 'শিক্ষার্থীর নাম (ইংরেজি)',
    'student name', 'student name (english)', 'নাম', 'নাম (বাংলা)', 'নাম (ইংরেজি)',
    'name', 'full name', 'ক্রমিক', 'ক্রমিক নং', 'ক্রমিক নম্বর',
    'রোল', 'রোল নং', 'রোল নম্বর', 'sl', 'sl no', 'sl.', 'roll', 'roll no',
    'পিতার নাম', 'মাতার নাম', 'অভিভাবকের নাম', 'মোবাইল নম্বর', 'মোবাইল নং',
    'রক্তের গ্রুপ', 'বর্তমান ঠিকানা', 'স্থায়ী ঠিকানা', 'ঠিকানা', 'শাখা',
    'শ্রেণি', 'শ্রেণী', 'ক্লাস', 'অফিস কপি', 'স্বাক্ষর', 'মন্তব্য'
  ];

  if (headerBlacklist.some(item => clean === item || clean.startsWith(item + ' ') || clean.endsWith(' ' + item))) {
    return true;
  }

  const classPatterns = [
    /^প্লে(\s*শ্রেণি|\s*শাখা)?$/i,
    /^নার্সারী(\s*শ্রেণি|\s*শাখা)?$/i,
    /^(১ম|প্রথম|২য়|২য়|দ্বিতীয়|৩য়|৩য়|তৃতীয়|৪র্থ|চতুর্থ|৫ম|পঞ্চম|৬ষ্ঠ|ষষ্ঠ|৭ম|সপ্তম|৮ম|অষ্টম|৯ম|নবম|১০ম|দশম)(\s*শ্রেণি|\s*শাখা)?$/i,
    /^শ্রেণি\s*:\s*/i,
    /^class\s*:\s*/i
  ];

  return classPatterns.some(p => p.test(clean));
};

export const normalizeClassName = (raw: string | undefined): string => {
  if (!raw) return 'প্লে';
  const clean = String(raw).replace(/[()\[\]{}:;]/g, '').trim();
  if (/নার্সারী|নার্সারি|nursery/i.test(clean)) return 'নার্সারী';
  if (/প্লে|play/i.test(clean)) return 'প্লে';
  if (/১ম|প্রথম|1st/i.test(clean)) return '১ম শ্রেণি';
  if (/২য়|২য়|দ্বিতীয়|দ্বিতীয়|2nd/i.test(clean)) return '২য় শ্রেণি';
  if (/৩য়|৩য়|তৃতীয়|তৃতীয়|3rd/i.test(clean)) return '৩য় শ্রেণি';
  if (/৪র্থ|চতুর্থ|4th/i.test(clean)) return '৪র্থ শ্রেণি';
  if (/৫ম|পঞ্চম|5th/i.test(clean)) return '৫ম শ্রেণি';
  if (/৬ষ্ঠ|ষষ্ঠ|6th/i.test(clean)) return '৬ষ্ঠ শ্রেণি';
  if (/৭ম|সপ্তম|7th/i.test(clean)) return '৭ম শ্রেণি';
  if (/৮ম|অষ্টম|8th/i.test(clean)) return '৮ম শ্রেণি';
  if (/৯ম|নবম|9th/i.test(clean)) return '৯ম শ্রেণি';
  if (/১০ম|দশম|10th/i.test(clean)) return '১০ম শ্রেণি';
  return clean || 'প্লে';
};

export const detectClassDivider = (text: string): string | null => {
  const clean = text.trim();
  if (!clean) return null;

  if (/নার্সারী|নার্সারি|nursery/i.test(clean)) return 'নার্সারী';
  if (/প্লে|play/i.test(clean)) return 'প্লে';
  if (/(১ম|প্রথম|class[-_\s]*0?1\b|\bone\b|1st)/i.test(clean)) return '১ম শ্রেণি';
  if (/(২য়|২য়|দ্বিতীয়|দ্বিতীয়|class[-_\s]*0?2\b|\btwo\b|2nd)/i.test(clean)) return '২য় শ্রেণি';
  if (/(৩য়|৩য়|তৃতীয়|তৃতীয়|class[-_\s]*0?3\b|\bthree\b|3rd)/i.test(clean)) return '৩য় শ্রেণি';
  if (/(৪র্থ|চতুর্থ|class[-_\s]*0?4\b|\bfour\b|4th)/i.test(clean)) return '৪র্থ শ্রেণি';
  if (/(৫ম|পঞ্চম|class[-_\s]*0?5\b|\bfive\b|5th)/i.test(clean)) return '৫ম শ্রেণি';
  if (/(৬ষ্ঠ|ষষ্ঠ|class[-_\s]*0?6\b|\bsix\b|6th)/i.test(clean)) return '৬ষ্ঠ শ্রেণি';
  if (/(৭ম|সপ্তম|class[-_\s]*0?7\b|\bseven\b|7th)/i.test(clean)) return '৭ম শ্রেণি';
  if (/(৮ম|অষ্টম|class[-_\s]*0?8\b|\beight\b|8th)/i.test(clean)) return '৮ম শ্রেণি';
  if (/(৯ম|নবম|class[-_\s]*0?9\b|\bnine\b|9th)/i.test(clean)) return '৯ম শ্রেণি';
  if (/(১০ম|দশম|class[-_\s]*10\b|\bten\b|10th)/i.test(clean)) return '১০ম শ্রেণি';

  return null;
};

export const detectClassFromFileName = (fileName: string): string | null => {
  const base = fileName.replace(/\.(xlsx|xls|csv)$/i, '').replace(/[_-]+/g, ' ').trim();
  const direct = detectClassDivider(base);
  if (direct) return direct;

  // Standalone digit matching in filename like "1.xlsx", "5.xlsx", "10.xlsx"
  if (/\b10\b/.test(base)) return '১০ম শ্রেণি';
  if (/\b9\b/.test(base)) return '৯ম শ্রেণি';
  if (/\b8\b/.test(base)) return '৮ম শ্রেণি';
  if (/\b7\b/.test(base)) return '৭ম শ্রেণি';
  if (/\b6\b/.test(base)) return '৬ষ্ঠ শ্রেণি';
  if (/\b5\b/.test(base)) return '৫ম শ্রেণি';
  if (/\b4\b/.test(base)) return '৪র্থ শ্রেণি';
  if (/\b3\b/.test(base)) return '৩য় শ্রেণি';
  if (/\b2\b/.test(base)) return '২য় শ্রেণি';
  if (/\b1\b/.test(base)) return '১ম শ্রেণি';

  return null;
};

export interface ParsedStudentExcelResult {
  fileName: string;
  detectedClass: string;
  classConfidence: 'filename' | 'sheet' | 'fallback';
  students: StudentRecord[];
}

export async function parseStudentExcelFile(
  file: File,
  fallbackClass: string = '৫ম শ্রেণি'
): Promise<ParsedStudentExcelResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const wsname = wb.SheetNames[0];
  const ws = wb.Sheets[wsname];
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const fromFile = detectClassFromFileName(file.name);
  const fromSheetName = detectClassDivider(wsname || '');

  let detectedClass = fromFile || fromSheetName || fallbackClass;
  let classConfidence: 'filename' | 'sheet' | 'fallback' = fromFile
    ? 'filename'
    : fromSheetName
      ? 'sheet'
      : 'fallback';

  if (!rows || rows.length < 2) {
    return { fileName: file.name, detectedClass, classConfidence, students: [] };
  }

  // Check top 5 title rows for class hint if filename didn't give one
  if (!fromFile && !fromSheetName) {
    for (let rIdx = 0; rIdx < Math.min(rows.length, 6); rIdx++) {
      const text = (rows[rIdx] || []).map((c: any) => String(c || '').trim()).join(' ');
      const found = detectClassDivider(text);
      if (found) {
        detectedClass = found;
        classConfidence = 'sheet';
        break;
      }
    }
  }

  // Scan first 15 rows for header row
  let headerRowIdx = -1;
  let rollIdx = -1;
  let nameIdx = -1;
  let engNameIdx = -1;
  let classIdx = -1;
  let secIdx = -1;
  let guardianIdx = -1;
  let mobileIdx = -1;
  let bloodIdx = -1;
  let addrIdx = -1;

  for (let rIdx = 0; rIdx < Math.min(rows.length, 15); rIdx++) {
    const row = rows[rIdx];
    if (!row || !Array.isArray(row)) continue;

    const rowCells = row.map((c: any) => String(c || '').trim().toLowerCase());
    const potentialName = rowCells.findIndex(h =>
      (h.includes('নাম') || h.includes('name') || h.includes('ছাত্র') || h.includes('শিক্ষার্থী')) &&
      !h.includes('পিতা') && !h.includes('মাতা') && !h.includes('অভিভাবক') && !h.includes('স্কুল') && !h.includes('প্রতিষ্ঠান')
    );
    const potentialRoll = rowCells.findIndex(h =>
      h.includes('রোল') || h.includes('roll') || h.includes('ক্রমিক') || h.includes('sl')
    );

    if (potentialName !== -1 || potentialRoll !== -1) {
      headerRowIdx = rIdx;
      nameIdx = potentialName;
      rollIdx = potentialRoll;
      engNameIdx = rowCells.findIndex(h => h.includes('english') || h.includes('ইংরেজি'));
      classIdx = rowCells.findIndex(h => h.includes('শ্রেণি') || h.includes('শ্রেণী') || h.includes('class'));
      secIdx = rowCells.findIndex(h => h.includes('শাখা') || h.includes('sec'));
      guardianIdx = rowCells.findIndex(h => h.includes('পিতা') || h.includes('অভিভাবক') || h.includes('guardian'));
      mobileIdx = rowCells.findIndex(h => h.includes('মোবাইল') || h.includes('mobile') || h.includes('phone') || h.includes('যোগাযোগ'));
      bloodIdx = rowCells.findIndex(h => h.includes('রক্ত') || h.includes('blood'));
      addrIdx = rowCells.findIndex(h => h.includes('ঠিকানা') || h.includes('address'));
      break;
    }
  }

  const startIdx = headerRowIdx !== -1 ? headerRowIdx + 1 : 1;
  let activeCurrentClass = detectedClass;
  const sequentialClassRolls: Record<string, number> = {};
  const imported: StudentRecord[] = [];

  for (let i = startIdx; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !Array.isArray(r) || r.length === 0) continue;

    const nonEmptyCells = r.filter(c => c !== undefined && c !== null && String(c).trim() !== '');
    if (nonEmptyCells.length === 0) continue;

    const joinedRowText = r.map(c => String(c || '').trim()).join(' ');
    const dividerCls = detectClassDivider(joinedRowText);
    if (dividerCls && (nonEmptyCells.length <= 2 || joinedRowText.length < 35)) {
      activeCurrentClass = dividerCls;
      continue;
    }

    let rawName = '';
    if (nameIdx !== -1 && r[nameIdx] !== undefined) {
      rawName = String(r[nameIdx]).trim();
    } else {
      const candidate = r.find(c => {
        const str = String(c || '').trim();
        return str.length >= 2 && !/^\d+$/.test(str) && !isHeaderOrCorruptedStudent(str);
      });
      if (candidate) rawName = String(candidate).trim();
    }

    if (!rawName || isHeaderOrCorruptedStudent(rawName)) {
      continue;
    }

    let stuClass = activeCurrentClass;
    if (classIdx !== -1 && r[classIdx]) {
      const parsedCls = detectClassDivider(String(r[classIdx])) || String(r[classIdx]).trim();
      if (parsedCls) stuClass = parsedCls;
    }

    let rollVal = '';
    if (rollIdx !== -1 && r[rollIdx] !== undefined) {
      const rawRoll = String(r[rollIdx]).trim();
      if (rawRoll && !isHeaderOrCorruptedStudent(rawRoll)) {
        const numVal = parseRollNumber(rawRoll);
        if (numVal > 0 && numVal < 1000) {
          rollVal = formatBanglaRoll(numVal);
          sequentialClassRolls[stuClass] = Math.max(sequentialClassRolls[stuClass] || 0, numVal);
        }
      }
    }

    if (!rollVal) {
      sequentialClassRolls[stuClass] = (sequentialClassRolls[stuClass] || 0) + 1;
      rollVal = formatBanglaRoll(sequentialClassRolls[stuClass]);
    }

    imported.push({
      id: `stu_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: 'DLMA-' + Math.floor(1000 + Math.random() * 9000),
      name: rawName,
      nameEnglish: engNameIdx !== -1 && r[engNameIdx] ? String(r[engNameIdx]).trim() : '',
      roll: rollVal,
      className: normalizeClassName(stuClass),
      section: (secIdx !== -1 && r[secIdx] ? String(r[secIdx]).replace(/[()\[\]{}:;]/g, '').trim() : '') || 'ক',
      guardianName: guardianIdx !== -1 && r[guardianIdx] ? String(r[guardianIdx]).trim() : '—',
      mobile: mobileIdx !== -1 && r[mobileIdx] ? String(r[mobileIdx]).trim() : '—',
      bloodGroup: bloodIdx !== -1 && r[bloodIdx] ? String(r[bloodIdx]).trim() : '—',
      address: addrIdx !== -1 && r[addrIdx] ? String(r[addrIdx]).trim() : 'সনমানিয়া, কাপাসিয়া'
    });
  }

  return {
    fileName: file.name,
    detectedClass: SCHOOL_CLASSES.includes(detectedClass as any) ? detectedClass : normalizeClassName(detectedClass),
    classConfidence,
    students: imported,
  };
}
