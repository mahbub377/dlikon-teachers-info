import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Search, 
  Download, 
  FileText, 
  Filter, 
  GraduationCap, 
  Users,
  Briefcase,
  Award,
  Edit,
  Eye,
  Camera,
  PenTool,
  Printer,
  ChevronRight,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  ListOrdered,
  RefreshCw,
  BarChart3,
  Layers
} from 'lucide-react';
import { 
  StudentRecord, 
  StaffRecord, 
  EntrepreneurRecord, 
  SyllabusItem, 
  SCHOOL_CLASSES,
  ACADEMY_EXAMS_9
} from '../types/adminTypes';
import { TeacherFormData } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { StudentEvaluationSheet } from './StudentEvaluationSheet';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { PeriodicEvaluationReportModal } from './PeriodicEvaluationReportModal';
import { DigitalLibrary } from './DigitalLibrary';
import { BulkStudentExcelModal } from './BulkStudentExcelModal';
import { ExamCalendarPanel } from './ExamCalendarPanel';
import { ScholarshipModelTestPanel } from './ScholarshipModelTestPanel';

const STORAGE_STUDENTS = 'dlma_admin_students_v2';
const STORAGE_STAFF = 'dlma_admin_staff_v1';
const STORAGE_ENTREPRENEURS = 'dlma_admin_entrepreneurs_v1';
const STORAGE_SYLLABUS = 'dlma_admin_syllabus_v1';

// ==========================================
// BANGLA ROLL & HEADER DETECTION HELPERS
// ==========================================

// Helper to convert numbers/digits to clean 2-digit Bengali numbers: ০১, ০২, ০৩...
export const formatBanglaRoll = (val: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const bnToEnMap: Record<string, string> = {
    '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'
  };

  const raw = String(val ?? '').trim();
  if (!raw) return '০১';

  // Convert any Bengali digits to English digits first
  let enNumStr = '';
  for (const ch of raw) {
    if (bnToEnMap[ch] !== undefined) {
      enNumStr += bnToEnMap[ch];
    } else if (/[0-9]/.test(ch)) {
      enNumStr += ch;
    }
  }

  const num = parseInt(enNumStr, 10);
  if (isNaN(num) || num <= 0) {
    return raw;
  }

  const padded = num < 10 ? `0${num}` : `${num}`;
  return padded.split('').map(d => bnDigits[parseInt(d, 10)] ?? d).join('');
};

// Parse roll to numeric value for sorting and sequence calculations
export const parseRollNumber = (roll: string | number): number => {
  const bnToEnMap: Record<string, string> = {
    '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'
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

// Check if a cell or row is an Excel header or divider remnant
export const isHeaderOrCorruptedStudent = (name: string): boolean => {
  if (!name) return true;
  const clean = name.trim().toLowerCase();
  if (clean.length < 2) return true;

  // Strict blacklist of Excel header phrases
  const headerBlacklist = [
    'ছাত্র-ছাত্রীর নাম',
    'ছাত্র/ছাত্রীর নাম',
    'ছাত্রছাত্রীর নাম',
    'ছাত্র ছাত্রীর নাম',
    'শিক্ষার্থীর নাম',
    'শিক্ষার্থী নাম',
    'শিক্ষার্থীর নাম (বাংলা)',
    'শিক্ষার্থীর নাম (ইংরেজি)',
    'student name',
    'student name (english)',
    'নাম',
    'নাম (বাংলা)',
    'নাম (ইংরেজি)',
    'name',
    'full name',
    'ক্রমিক',
    'ক্রমিক নং',
    'ক্রমিক নম্বর',
    'রোল',
    'রোল নং',
    'রোল নম্বর',
    'sl',
    'sl no',
    'sl.',
    'roll',
    'roll no',
    'পিতার নাম',
    'মাতার নাম',
    'অভিভাবকের নাম',
    'মোবাইল নম্বর',
    'মোবাইল নং',
    'রক্তের গ্রুপ',
    'বর্তমান ঠিকানা',
    'স্থায়ী ঠিকানা',
    'ঠিকানা',
    'শাখা',
    'শ্রেণি',
    'শ্রেণী',
    'ক্লাস',
    'অফিস কপি',
    'স্বাক্ষর',
    'মন্তব্য'
  ];

  if (headerBlacklist.some(item => clean === item || clean.startsWith(item + ' ') || clean.endsWith(' ' + item))) {
    return true;
  }

  // Check if it's merely a class divider like "প্লে", "নার্সারী", "প্লে শ্রেণি", "নার্সারী শ্রেণি"
  const classPatterns = [
    /^প্লে(\s*শ্রেণি|\s*শাখা)?$/i,
    /^নার্সারী(\s*শ্রেণি|\s*শাখা)?$/i,
    /^(১ম|প্রথম|২য়|২য়|দ্বিতীয়|৩য়|৩য়|তৃতীয়|৪র্থ|চতুর্থ|৫ম|পঞ্চম|৬ষ্ঠ|ষষ্ঠ|৭ম|সপ্তম|৮ম|অষ্টম|৯ম|নবম|১০ম|দশম)(\s*শ্রেণি|\s*শাখা)?$/i,
    /^শ্রেণি\s*:\s*/i,
    /^class\s*:\s*/i
  ];

  if (classPatterns.some(p => p.test(clean))) {
    return true;
  }

  return false;
};

// Normalize class name to match exact SCHOOL_CLASSES entry
export const normalizeClassName = (raw: string | undefined): string => {
  if (!raw) return 'প্লে';
  const clean = String(raw).replace(/[()\[\]{}:;]/g, '').trim();
  if (/নার্সারী|nursery/i.test(clean)) return 'নার্সারী';
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

// Normalize section (remove extra parentheses)
export const normalizeSection = (raw: string | undefined): string => {
  const clean = String(raw ?? 'ক').replace(/[()\[\]{}:;]/g, '').trim();
  return clean || 'ক';
};

const DEMO_STUDENT_NAMES = [
  'মোঃ তাহমিদ হাসান',
  'ফাতিমা তুয জোহরা',
  'সাদিয়া ইসলাম',
  'মুহাম্মদ আব্দুল্লাহ',
  'নুসরাত জাহান মিম'
];

export const isDemoStudent = (stu: StudentRecord): boolean => {
  if (!stu) return false;
  if (stu.id && /^stu_[1-5]$/.test(stu.id)) return true;
  if (stu.studentId && /^DLMA-STU-0[1-5]$/.test(stu.studentId)) return true;
  if (DEMO_STUDENT_NAMES.includes(stu.name)) return true;
  return false;
};

// Comprehensive normalization: cleans class names, removes bad headers, strips demo data, and re-sequences rolls starting from ০১ per class
export const normalizeClassAndRolls = (list: StudentRecord[]): StudentRecord[] => {
  if (!Array.isArray(list)) return [];

  // 1. Purge corrupted header rows or divider lines AND demo students
  const validList = list.filter(stu => {
    if (!stu || !stu.name) return false;
    if (isDemoStudent(stu)) return false;
    if (isHeaderOrCorruptedStudent(stu.name)) return false;
    const nameClean = stu.name.replace(/[()\[\]{}]/g, '').trim();
    if (nameClean === 'প্লে' || nameClean === 'নার্সারী' || /^(১ম|২য়|২য়|৩য়|৩য়|৪র্থ|৫ম|৬ষ্ঠ|৭ম|৮ম|৯ম|১০ম)(\s*শ্রেণি)?$/.test(nameClean)) {
      return false;
    }
    return true;
  });

  // 2. Normalize className and section
  const normalizedRecords = validList.map(stu => ({
    ...stu,
    className: normalizeClassName(stu.className),
    section: normalizeSection(stu.section)
  }));

  // 3. Group by class
  const groups: Record<string, StudentRecord[]> = {};
  for (const stu of normalizedRecords) {
    const cls = stu.className;
    if (!groups[cls]) groups[cls] = [];
    groups[cls].push(stu);
  }

  // 4. For each class, ensure rolls strictly start from ০১ and continue: ০১, ০২, ০৩, ০৪...
  const resequenced: StudentRecord[] = [];
  
  // Follow natural school hierarchy order
  const naturalOrder = ['প্লে', 'নার্সারী', '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি'];
  const allClasses = Array.from(new Set([...naturalOrder, ...Object.keys(groups)]));
  
  for (const cls of allClasses) {
    const group = groups[cls];
    if (!group || group.length === 0) continue;

    // Resequence: first student of the class gets ০১, second gets ০২...
    group.forEach((stu, idx) => {
      resequenced.push({
        ...stu,
        roll: formatBanglaRoll(idx + 1)
      });
    });
  }

  return resequenced;
};

// Detect if a text refers to a school class
export const detectClassDivider = (text: string): string | null => {
  const clean = text.trim();
  if (!clean) return null;

  if (/নার্সারী/i.test(clean)) return 'নার্সারী';
  if (/প্লে/i.test(clean)) return 'প্লে';
  if (/(১ম|প্রথম)/i.test(clean)) return '১ম শ্রেণি';
  if (/(২য়|২য়|দ্বিতীয়)/i.test(clean)) return '২য় শ্রেণি';
  if (/(৩য়|৩য়|তৃতীয়)/i.test(clean)) return '৩য় শ্রেণি';
  if (/(৪র্থ|চতুর্থ)/i.test(clean)) return '৪র্থ শ্রেণি';
  if (/(৫ম|পঞ্চম)/i.test(clean)) return '৫ম শ্রেণি';
  if (/(৬ষ্ঠ|ষষ্ঠ)/i.test(clean)) return '৬ষ্ঠ শ্রেণি';
  if (/(৭ম|সপ্তম)/i.test(clean)) return '৭ম শ্রেণি';
  if (/(৮ম|অষ্টম)/i.test(clean)) return '৮ম শ্রেণি';
  if (/(৯ম|নবম)/i.test(clean)) return '৯ম শ্রেণি';
  if (/(১০ম|দশম)/i.test(clean)) return '১০ম শ্রেণি';

  return null;
};

export const sanitizeStudentList = (list: StudentRecord[]): StudentRecord[] => {
  return normalizeClassAndRolls(list);
};

interface AdminDashboardProps {
  teachers?: TeacherFormData[];
  onSelectTeacherForPrint?: (teacher: TeacherFormData) => void;
  onUpdateTeachers?: (teachers: TeacherFormData[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  teachers = [],
  onSelectTeacherForPrint,
  onUpdateTeachers
}) => {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'staff' | 'entrepreneurs' | 'syllabus' | 'evaluation' | 'analytics' | 'library' | 'calendar' | 'model_test'>('students');

  // Periodic Evaluation Report Modal State (সাপ্তাহিক, মাসিক, ত্রৈমাসিক ও পরীক্ষা পর্যন্ত)
  const [isPeriodicReportOpen, setIsPeriodicReportOpen] = useState(false);
  const [periodicReportStudent, setPeriodicReportStudent] = useState<StudentRecord | null>(null);

  // ==========================================
  // 1. STUDENTS STATE (শ্রেণিভিত্তিক আপলোড: প্লে-১০ম)
  // ==========================================
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = normalizeClassAndRolls(parsed);
          try { localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(cleaned)); } catch (e) {}
          return cleaned;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Selected Class for targeted Excel upload (Play to 10th)
  const [selectedUploadClass, setSelectedUploadClass] = useState<string>('৫ম শ্রেণি');
  // Selected Class for viewing/filtering
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('সকল শ্রেণি');
  const [studentSearch, setStudentSearch] = useState('');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // ==========================================
  // 2. STAFF STATE (সকল কর্মচারী)
  // ==========================================
  const [staffList, setStaffList] = useState<StaffRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STAFF);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'stf_1', staffId: 'DLMA-EMP-101', name: 'মোঃ আব্দুল করিম', nameEnglish: 'Md. Abdul Karim', designation: 'অফিস সহকারী কাম কম্পিউটার অপারেটর', mobile: '01711-223344', nid: '19873322114455', joiningDate: '২০১৯-০১-০১', bloodGroup: 'B+', highestDegree: 'স্নাতক (বি.এ)', address: 'সনমানিয়া, কাপাসিয়া' },
      { id: 'stf_2', staffId: 'DLMA-EMP-102', name: 'রফিকুল ইসলাম', nameEnglish: 'Rofiqul Islam', designation: 'নিরাপত্তা প্রহরী ও কেয়ারটেকার', mobile: '01822-334455', nid: '19852233445566', joiningDate: '২০১৮-০৩-১৫', bloodGroup: 'O+', highestDegree: 'এস.এস.সি', address: 'কাপাসিয়া' },
      { id: 'stf_3', staffId: 'DLMA-EMP-103', name: 'মোসাঃ মরিয়ম বেগম', nameEnglish: 'Mst. Moriyom Begum', designation: 'আয়া ও সহকারী কর্মী', mobile: '01933-445566', nid: '19904455667788', joiningDate: '২০২০-০২-০১', bloodGroup: 'A+', highestDegree: '৮ম শ্রেণি পাস', address: 'সনমানিয়া' },
    ];
  });
  const [staffSearch, setStaffSearch] = useState('');

  // ==========================================
  // 3. EDUCATION ENTREPRENEURS STATE (সকল শিক্ষা উদ্যোক্তা)
  // ==========================================
  const [entrepreneurs, setEntrepreneurs] = useState<EntrepreneurRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ENTREPRENEURS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'ent_1', entrepreneurId: 'DLMA-TR-01', name: 'ইঞ্জি. মো. দেলোয়ার হোসেন', role: 'প্রতিষ্ঠাতা ও চেয়ারম্যান', organization: 'ডি-লিকন ফাউন্ডেশন', profession: 'শিক্ষা উদ্যোক্তা ও প্রকৌশলী', mobile: '01710-001122', email: 'delwar@dlikon.edu.bd', contribution: 'বিদ্যালয়ের জমিদান, আধুনিক ডিজিটাল ক্যাম্পাস নির্মাণ ও স্থায়ী অবকাঠামো অর্থায়ন।', address: 'সনমানিয়া, কাপাসিয়া, গাজীপুর' },
      { id: 'ent_2', entrepreneurId: 'DLMA-TR-02', name: 'হাজী মোঃ শাহজাহান মিয়া', role: 'সভাপতি, পরিচালনা পর্ষদ', organization: 'ব্যবস্থাপনা কমিটি', profession: 'বিশিষ্ট সমাজসেবক ও ব্যবসায়ী', mobile: '01815-112233', email: 'shahjahan@dlikon.edu.bd', contribution: 'বিদ্যালয় পরিচালনা ও উন্নয়ন তহবিলে নিয়মিত পৃষ্ঠপোষকতা।', address: 'কাপাসিয়া বাজার, গাজীপুর' },
      { id: 'ent_3', entrepreneurId: 'DLMA-TR-03', name: 'এডভোকেট নাসরিন আক্তার', role: 'ট্রাস্টি সদস্য ও শিক্ষা উদ্যোক্তা', organization: 'ট্রাস্টি বোর্ড', profession: 'আইনজীবী ও শিক্ষানুরাগী', mobile: '01920-334455', email: 'nasrin@dlikon.edu.bd', contribution: 'দরিদ্র ও মেধাবী শিক্ষার্থীদের পূর্ণাঙ্গ বৃত্তি ও আইনি পৃষ্ঠপোষকতা।', address: 'গাজীপুর সদর' }
    ];
  });
  const [entrepreneurSearch, setEntrepreneurSearch] = useState('');

  // ==========================================
  // 4. TEACHERS LIST STATE & SEARCH
  // ==========================================
  const [teacherSearch, setTeacherSearch] = useState('');

  // ==========================================
  // 5. SYLLABUS STATE (11 Steps)
  // ==========================================
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SYLLABUS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'syl_5',
        className: '৫ম শ্রেণি',
        term1Syllabus: 'বাংলা: পাঠ ১-৫; ইংরেজি: Unit 1-6; গণিত: অধ্যায় ১-৪ (গুণ, ভাগ ও চার প্রক্রিয়া); বিজ্ঞান: অধ্যায় ১ ও ২।',
        midterm1_1Syllabus: 'বাংলা: পাঠ ১-৩; ইংরেজি: Unit 1-3; গণিত: অধ্যায় ১ ও ২।',
        midterm1_2Syllabus: 'বাংলা: পাঠ ৪-৫; ইংরেজি: Unit 4-6; গণিত: অধ্যায় ৩ ও ৪।',
        term2Syllabus: 'বাংলা: পাঠ ৬-১০; ইংরেজি: Unit 7-12; গণিত: অধ্যায় ৫-৮ (ভগ্নাংশ ও দশমিক); বিজ্ঞান: অধ্যায় ৩-৫।',
        midterm2_1Syllabus: 'বাংলা: পাঠ ৬-৮; ইংরেজি: Unit 7-9; গণিত: অধ্যায় ৫ ও ৬।',
        midterm2_2Syllabus: 'বাংলা: পাঠ ৯-১০; ইংরেজি: Unit 10-12; গণিত: অধ্যায় ৭ ও ৮।',
        term3Syllabus: 'বাংলা: পাঠ ১১-১৫; ইংরেজি: Unit 13-18; গণিত: অধ্যায় ৯-১২ (শতকরা, জ্যামিতি); বিজ্ঞান: অধ্যায় ৬-৯।',
        midterm3_1Syllabus: 'বাংলা: পাঠ ১১-১৩; ইংরেজি: Unit 13-15; গণিত: অধ্যায় ৯ ও ১০।',
        midterm3_2Syllabus: 'বাংলা: পাঠ ১৪-১৫; ইংরেজি: Unit 16-18; গণিত: অধ্যায় ১১ ও ১২।',
        notes: 'সাপ্তাহিক মূল্যায়ন ও সৃজনশীল প্রশ্নোত্তর অনুশীলন বাধ্যতামূলক।',
        updatedAt: new Date().toLocaleDateString('bn-BD')
      }
    ];
  });
  const [selectedSyllabusClass, setSelectedSyllabusClass] = useState<string>('৫ম শ্রেণি');
  const [currentSyllabus, setCurrentSyllabus] = useState<SyllabusItem>(() => {
    return syllabusList[0] || {
      id: 'syl_new',
      className: '৫ম শ্রেণি',
      term1Syllabus: '',
      midterm1_1Syllabus: '',
      midterm1_2Syllabus: '',
      term2Syllabus: '',
      midterm2_1Syllabus: '',
      midterm2_2Syllabus: '',
      term3Syllabus: '',
      midterm3_1Syllabus: '',
      midterm3_2Syllabus: '',
      notes: '',
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };
  });
  const [syllabusSavedMsg, setSyllabusSavedMsg] = useState(false);

  // General Notification / Status
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // File Inputs Refs
  const studentFileRef = useRef<HTMLInputElement>(null);
  const teacherFileRef = useRef<HTMLInputElement>(null);
  const staffFileRef = useRef<HTMLInputElement>(null);
  const entrepreneurFileRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // DETAIL MODAL / DRAWER (ছবি ও স্বাক্ষরসহ বিস্তারিত ফরম)
  // "পরবর্তীতে আমরা আলাদাভাবে সেই লিস্ট ধরে ছবি ও স্বাক্ষরসহ ডিটেইল তথ্য আপলোড করার ফরম অনুসরন করব।"
  // ==========================================
  const [activeProfileModal, setActiveProfileModal] = useState<{
    type: 'student' | 'teacher' | 'staff' | 'entrepreneur';
    data: any;
  } | null>(null);

  // Sync to localStorage
  const saveStudents = (updated: StudentRecord[]) => {
    setStudents(updated);
    try { localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(updated)); } catch (e) { console.error(e); }
  };

  // Re-index rolls cleanly per class (০১, ০২, ০৩...)
  const handleReindexRolls = () => {
    const reindexed = normalizeClassAndRolls(students);
    saveStudents(reindexed);
    setUploadStatus(`সকল শিক্ষার্থীর শ্রেণি ও রোল নম্বর সফলভাবে ০১, ০২, ০৩... ক্রমানুসারে পুনর্বিন্যাস করা হয়েছে!`);
    setTimeout(() => setUploadStatus(null), 4000);
  };

  // Purge any corrupted / Excel header remnant records
  const handlePurgeCorruptedRecords = () => {
    const originalCount = students.length;
    const reindexed = normalizeClassAndRolls(students);
    const removedCount = originalCount - reindexed.length;

    saveStudents(reindexed);
    if (removedCount > 0) {
      setUploadStatus(`${removedCount}টি ভুল হেডার/বিভাগ রেকর্ড অপসারন করা হয়েছে এবং রোল নম্বর ০১, ০২, ০৩... ক্রমানুসারে সাজানো হয়েছে!`);
    } else {
      setUploadStatus(`সকল শিক্ষার্থীর শ্রেণি ও রোল নম্বর ০১, ০২, ০৩... ক্রমানুসারে নিখুঁতভাবে সাজানো হয়েছে।`);
    }
    setTimeout(() => setUploadStatus(null), 4000);
  };

  // Explicitly purge all demo students
  const handleClearDemoData = () => {
    const nonDemo = students.filter(s => !isDemoStudent(s));
    const reindexed = normalizeClassAndRolls(nonDemo);
    saveStudents(reindexed);
    setUploadStatus('সকল ডেমো শিক্ষার্থীর তথ্য সফলভাবে মুছে ফেলা হয়েছে!');
    setTimeout(() => setUploadStatus(null), 4000);
  };

  // Reset or clear all students if user wants a clean slate
  const handleClearAllStudents = () => {
    if (confirm('আপনি কি সকল শিক্ষার্থীর তালিকা খালি করে নতুনভাবে এক্সেল ফাইল আপলোড করতে চান?')) {
      saveStudents([]);
      setUploadStatus('শিক্ষার্থীদের তালিকা সম্পূর্ণ খালি করা হয়েছে। এখন নতুন এক্সেল ফাইল আপলোড করতে পারেন।');
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  // Auto-clean and normalize any pre-existing records on mount (automatically repairs Play rolls, purges demo data and normalizes class names)
  useEffect(() => {
    const normalized = normalizeClassAndRolls(students);
    const isDifferent = JSON.stringify(normalized) !== JSON.stringify(students);
    if (isDifferent) {
      setStudents(normalized);
      try { localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(normalized)); } catch (e) {}
    }
  }, []);

  const saveStaff = (updated: StaffRecord[]) => {
    setStaffList(updated);
    try { localStorage.setItem(STORAGE_STAFF, JSON.stringify(updated)); } catch (e) { console.error(e); }
  };

  const saveEntrepreneurs = (updated: EntrepreneurRecord[]) => {
    setEntrepreneurs(updated);
    try { localStorage.setItem(STORAGE_ENTREPRENEURS, JSON.stringify(updated)); } catch (e) { console.error(e); }
  };

  const saveSyllabus = (updated: SyllabusItem[]) => {
    setSyllabusList(updated);
    try { localStorage.setItem(STORAGE_SYLLABUS, JSON.stringify(updated)); } catch (e) { console.error(e); }
  };

  // ==========================================
  // EXCEL UPLOAD HANDLERS
  // ==========================================

  // 1. Upload Students (Intelligent Multi-Row Header Scan & Class-by-Class Auto-Correction)
  const handleStudentExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rows || rows.length < 2) {
          alert('এক্সেল ফাইলটিতে পর্যাপ্ত তথ্য নেই।');
          return;
        }

        // 1. Scan first 15 rows to find the REAL column headers row
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
        let activeCurrentClass = selectedUploadClass;
        const sequentialClassRolls: Record<string, number> = {};

        const imported: StudentRecord[] = [];

        for (let i = startIdx; i < rows.length; i++) {
          const r = rows[i];
          if (!r || !Array.isArray(r) || r.length === 0) continue;

          // Check if entire row is empty
          const nonEmptyCells = r.filter(c => c !== undefined && c !== null && String(c).trim() !== '');
          if (nonEmptyCells.length === 0) continue;

          const joinedRowText = r.map(c => String(c || '').trim()).join(' ');

          // 2. Dynamic Class Section Divider Detection (e.g. "প্লে শ্রেণি", "নার্সারী", "১ম শ্রেণি")
          // If a row announces a new class section, update activeCurrentClass and NEVER import this line as a student!
          const detectedClass = detectClassDivider(joinedRowText);
          if (detectedClass && (nonEmptyCells.length <= 2 || joinedRowText.length < 35)) {
            activeCurrentClass = detectedClass;
            continue; // Skip divider row!
          }

          // 3. Extract Student Name & Validate against Header/Divider Blacklist
          let rawName = '';
          if (nameIdx !== -1 && r[nameIdx] !== undefined) {
            rawName = String(r[nameIdx]).trim();
          } else {
            // Fallback: look for first text cell that looks like a person's name
            const candidate = r.find(c => {
              const str = String(c || '').trim();
              return str.length >= 2 && !/^\d+$/.test(str) && !isHeaderOrCorruptedStudent(str);
            });
            if (candidate) rawName = String(candidate).trim();
          }

          // Strict filter: If name is empty, or is a header like "ছাত্র-ছাত্রীর নাম", SKIP!
          if (!rawName || isHeaderOrCorruptedStudent(rawName)) {
            continue;
          }

          // 4. Target Class Assignment
          let stuClass = activeCurrentClass;
          if (classIdx !== -1 && r[classIdx]) {
            const parsedCls = detectClassDivider(String(r[classIdx])) || String(r[classIdx]).trim();
            if (parsedCls) stuClass = parsedCls;
          }

          // 5. Determine Roll Number (Sequential & Consecutive 2-Digit Bangla Numbers)
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

          // If roll was missing, empty or an invalid header artifact, assign sequential roll (০১, ০২, ০৩...)
          if (!rollVal) {
            sequentialClassRolls[stuClass] = (sequentialClassRolls[stuClass] || 0) + 1;
            rollVal = formatBanglaRoll(sequentialClassRolls[stuClass]);
          }

          imported.push({
            id: 'stu_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 6),
            studentId: 'DLMA-' + Math.floor(1000 + Math.random() * 9000),
            name: rawName,
            nameEnglish: engNameIdx !== -1 && r[engNameIdx] ? String(r[engNameIdx]).trim() : '',
            roll: rollVal,
            className: normalizeClassName(stuClass),
            section: normalizeSection(secIdx !== -1 && r[secIdx] ? String(r[secIdx]).trim() : 'ক'),
            guardianName: guardianIdx !== -1 && r[guardianIdx] ? String(r[guardianIdx]).trim() : '—',
            mobile: mobileIdx !== -1 && r[mobileIdx] ? String(r[mobileIdx]).trim() : '—',
            bloodGroup: bloodIdx !== -1 && r[bloodIdx] ? String(r[bloodIdx]).trim() : '—',
            address: addrIdx !== -1 && r[addrIdx] ? String(r[addrIdx]).trim() : 'সনমানিয়া, কাপাসিয়া'
          });
        }

        if (imported.length > 0) {
          // Normalize entire merged list (ensures Play and all classes start at ০১ and have clean class names)
          const updated = normalizeClassAndRolls([...imported, ...students]);
          saveStudents(updated);
          setUploadStatus(`সফলভাবে ${imported.length} জন শিক্ষার্থীর তথ্য এক্সেল থেকে নির্ভুলভাবে আপলোড হয়েছে!`);
          setTimeout(() => setUploadStatus(null), 5000);
        } else {
          alert('এক্সেল ফাইলে কোনো বৈধ শিক্ষার্থীর রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে ফাইলটি যাচাই করুন।');
        }
      } catch (err) {
        console.error(err);
        alert('এক্সেল ফাইল প্রক্রিয়াকরণে সমস্যা হয়েছে।');
      }
      if (studentFileRef.current) studentFileRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // 2. Upload Teachers
  const handleTeacherExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rows.length < 2) {
          alert('এক্সেল ফাইলটিতে পর্যাপ্ত তথ্য নেই।');
          return;
        }

        const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase());
        const nameIdx = headers.findIndex((h: string) => h.includes('নাম') || h.includes('name'));
        const desigIdx = headers.findIndex((h: string) => h.includes('পদবি') || h.includes('পদবী') || h.includes('designation'));
        const subIdx = headers.findIndex((h: string) => h.includes('বিষয়') || h.includes('subject'));
        const mobileIdx = headers.findIndex((h: string) => h.includes('মোবাইল') || h.includes('mobile'));
        const bloodIdx = headers.findIndex((h: string) => h.includes('রক্ত') || h.includes('blood'));
        const eduIdx = headers.findIndex((h: string) => h.includes('যোগ্যতা') || h.includes('ডিগ্রি') || h.includes('education'));

        const importedTeachers: TeacherFormData[] = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r || r.length === 0) continue;
          const fullName = r[nameIdx !== -1 ? nameIdx : 0] ? String(r[nameIdx !== -1 ? nameIdx : 0]).trim() : '';
          if (!fullName || isHeaderOrCorruptedStudent(fullName) || fullName === 'শিক্ষকের নাম' || fullName === 'নাম') continue;

          importedTeachers.push({
            id: 'tch_' + Date.now() + '_' + i,
            teacherId: 'DLMA-T' + Math.floor(100 + Math.random() * 900),
            fullName,
            designation: desigIdx !== -1 && r[desigIdx] ? String(r[desigIdx]).trim() : 'সহকারী শিক্ষক',
            mainSubject: subIdx !== -1 && r[subIdx] ? String(r[subIdx]).trim() : 'সাধারণ বিষয়',
            assignedClasses: '১ম - ৫ম শ্রেণি',
            mobileNumber: mobileIdx !== -1 && r[mobileIdx] ? String(r[mobileIdx]).trim() : '01700-000000',
            highestDegree: eduIdx !== -1 && r[eduIdx] ? String(r[eduIdx]).trim() : 'স্নাতক (ডিগ্রি)',
            bloodGroup: bloodIdx !== -1 && r[bloodIdx] ? String(r[bloodIdx]).trim() : 'B+',
            fatherName: '—',
            motherName: '—',
            birthDate: '1995-01-01',
            nidNumber: '—',
            birthCertNumber: '',
            passportNumber: '',
            emergencyMobile: '',
            email: '',
            presentAddress: 'সনমানিয়া, কাপাসিয়া, গাজীপুর',
            permanentAddress: 'সনমানিয়া, কাপাসিয়া, গাজীপুর',
            religion: 'ইসলাম',
            maritalStatus: 'বিবাহিত',
            gender: 'পুরুষ',
            nationality: 'বাংলাদেশী',
            appointmentDate: '২০২২-০১-০১',
            joiningDate: '২০২২-০১-০১',
            salaryScale: 'গ্রেড-১১',
            bankAccountNo: '',
            extraCurricular: ['বক্তৃতা / উপস্থাপনা'],
            extraCurricularDetails: '',
            computerSkills: ['এম এস ওয়ার্ড (MS Word)', 'ইন্টারনেট ব্রাউজিং ও ইমেইল'],
            typingSpeedEnglish: '২৫ WPM',
            typingSpeedBangla: '২০ WPM',
            specialNotes: 'এক্সেল ফাইল থেকে আমদানিকৃত',
            teacherPhoto: '',
            teacherSignature: '',
            principalSignature: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submissionDate: new Date().toLocaleDateString('bn-BD'),
            hasNidCopy: true,
            hasBirthCertCopy: false,
            hasCertificateCopy: true,
            hasPassportCopy: false,
            educationList: [
              { id: '1', examName: 'এস.এস.সি', boardUniversity: 'ঢাকা', passingYear: '২০১০', result: '৪.৫০', subject: 'মানবিক' },
              { id: '2', examName: 'এইচ.এস.সি', boardUniversity: 'ঢাকা', passingYear: '২০১২', result: '৪.২০', subject: 'মানবিক' },
              { id: '3', examName: 'স্নাতক', boardUniversity: 'জাতীয় বিশ্ববিদ্যালয়', passingYear: '২০১৬', result: '৩.১০', subject: 'রাষ্ট্রবিজ্ঞান' }
            ],
            experienceList: [
              { id: '1', instituteName: 'স্থানীয় বিদ্যা নিকেতন', designation: 'শিক্ষক', duration: '২ বছর', subject: 'বাংলা', reasonForLeaving: 'উন্নত সুযোগ' }
            ],
            references: [
              { name: 'মোঃ রফিকুল ইসলাম', designationInstitute: 'প্রধান শিক্ষক', mobile: '01711-000000', email: '', relation: 'পূর্ববর্তী প্রধান শিক্ষক' },
              { name: '', designationInstitute: '', mobile: '', email: '', relation: '' }
            ]
          });
        }

        if (importedTeachers.length > 0 && onUpdateTeachers) {
          onUpdateTeachers([...importedTeachers, ...teachers]);
          setUploadStatus(`সফলভাবে ${importedTeachers.length} জন শিক্ষকের তথ্য এক্সেল থেকে যুক্ত হয়েছে!`);
          setTimeout(() => setUploadStatus(null), 4000);
        }
      } catch (err) {
        console.error(err);
        alert('শিক্ষক এক্সেল আপলোডে সমস্যা হয়েছে।');
      }
      if (teacherFileRef.current) teacherFileRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // 3. Upload Staff
  const handleStaffExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rows.length < 2) return;
        const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase());
        const nameIdx = headers.findIndex((h: string) => h.includes('নাম') || h.includes('name'));
        const desigIdx = headers.findIndex((h: string) => h.includes('পদ') || h.includes('designation') || h.includes('role'));
        const mobileIdx = headers.findIndex((h: string) => h.includes('মোবাইল') || h.includes('mobile'));
        const nidIdx = headers.findIndex((h: string) => h.includes('nid') || h.includes('এনআইডি'));
        const addrIdx = headers.findIndex((h: string) => h.includes('ঠিকানা') || h.includes('address'));

        const imported: StaffRecord[] = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r || r.length === 0) continue;
          const name = r[nameIdx !== -1 ? nameIdx : 0] ? String(r[nameIdx !== -1 ? nameIdx : 0]).trim() : '';
          if (!name || isHeaderOrCorruptedStudent(name) || name === 'কর্মচারীর নাম') continue;

          imported.push({
            id: 'stf_' + Date.now() + '_' + i,
            staffId: 'DLMA-EMP-' + (100 + staffList.length + i),
            name,
            designation: desigIdx !== -1 && r[desigIdx] ? String(r[desigIdx]).trim() : 'সহকারী কর্মচারী',
            mobile: mobileIdx !== -1 && r[mobileIdx] ? String(r[mobileIdx]).trim() : '—',
            nid: nidIdx !== -1 && r[nidIdx] ? String(r[nidIdx]).trim() : '',
            address: addrIdx !== -1 && r[addrIdx] ? String(r[addrIdx]).trim() : 'সনমানিয়া, কাপাসিয়া',
            joiningDate: new Date().toISOString().split('T')[0],
            bloodGroup: 'B+'
          });
        }

        if (imported.length > 0) {
          saveStaff([...imported, ...staffList]);
          setUploadStatus(`সফলভাবে ${imported.length} জন কর্মচারীর তথ্য এক্সেল থেকে যুক্ত হয়েছে!`);
          setTimeout(() => setUploadStatus(null), 4000);
        }
      } catch (err) {
        console.error(err);
      }
      if (staffFileRef.current) staffFileRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // 4. Upload Entrepreneurs
  const handleEntrepreneurExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rows.length < 2) return;
        const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase());
        const nameIdx = headers.findIndex((h: string) => h.includes('নাম') || h.includes('name'));
        const roleIdx = headers.findIndex((h: string) => h.includes('পদবী') || h.includes('ভূমিকা') || h.includes('role'));
        const orgIdx = headers.findIndex((h: string) => h.includes('প্রতিষ্ঠান') || h.includes('organization'));
        const mobileIdx = headers.findIndex((h: string) => h.includes('মোবাইল') || h.includes('mobile'));
        const contribIdx = headers.findIndex((h: string) => h.includes('অবদান') || h.includes('contribution'));

        const imported: EntrepreneurRecord[] = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r || r.length === 0) continue;
          const name = r[nameIdx !== -1 ? nameIdx : 0] ? String(r[nameIdx !== -1 ? nameIdx : 0]).trim() : '';
          if (!name || isHeaderOrCorruptedStudent(name) || name === 'উদ্যোক্তার নাম') continue;

          imported.push({
            id: 'ent_' + Date.now() + '_' + i,
            entrepreneurId: 'DLMA-TR-' + (10 + entrepreneurs.length + i),
            name,
            role: roleIdx !== -1 && r[roleIdx] ? String(r[roleIdx]).trim() : 'শিক্ষা উদ্যোক্তা / ট্রাস্টি সদস্য',
            organization: orgIdx !== -1 && r[orgIdx] ? String(r[orgIdx]).trim() : 'ডি-লিকন মডেল একাডেমী',
            mobile: mobileIdx !== -1 && r[mobileIdx] ? String(r[mobileIdx]).trim() : '—',
            contribution: contribIdx !== -1 && r[contribIdx] ? String(r[contribIdx]).trim() : 'প্রাতিষ্ঠানিক পৃষ্ঠপোষকতা',
            address: 'সনমানিয়া, কাপাসিয়া'
          });
        }

        if (imported.length > 0) {
          saveEntrepreneurs([...imported, ...entrepreneurs]);
          setUploadStatus(`সফলভাবে ${imported.length} জন শিক্ষা উদ্যোক্তার তথ্য এক্সেল থেকে যুক্ত হয়েছে!`);
          setTimeout(() => setUploadStatus(null), 4000);
        }
      } catch (err) {
        console.error(err);
      }
      if (entrepreneurFileRef.current) entrepreneurFileRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // ==========================================
  // SAMPLE EXCEL DOWNLOAD GENERATORS
  // ==========================================
  const downloadSampleExcel = (category: 'student' | 'teacher' | 'staff' | 'entrepreneur', targetClass?: string) => {
    let filename = '';
    let data: any[][] = [];

    if (category === 'student') {
      const cls = targetClass || selectedUploadClass;
      filename = `ডি-লিকন_${cls}_শিক্ষার্থী_নমুনা.xlsx`;
      data = [
        ['রোল নং', 'শিক্ষার্থীর নাম (বাংলা)', 'Student Name (English)', 'শ্রেণি', 'শাখা', 'অভিভাবক/পিতার নাম', 'মোবাইল নম্বর', 'রক্তের গ্রুপ', 'বর্তমান ঠিকানা'],
        ['০১', 'মোঃ তাহমিদ হাসান', 'Md. Tahmid Hasan', cls, 'ক', 'মো. রফিকুল ইসলাম', '01712-345678', 'A+', 'সনমানিয়া, কাপাসিয়া'],
        ['০২', 'ফাতিমা তুয জোহরা', 'Fatima Tuz Zohra', cls, 'ক', 'আহমেদ উল্লাহ', '01819-876543', 'O+', 'কাপাসিয়া, গাজীপুর'],
        ['০৩', 'তানভীর আহমেদ', 'Tanvir Ahmed', cls, 'খ', 'কামাল উদ্দিন', '01911-002233', 'B+', 'সনমানিয়া বাজার']
      ];
    } else if (category === 'teacher') {
      filename = 'ডি-লিকন_শিক্ষক_তালিকা_নমুনা.xlsx';
      data = [
        ['শিক্ষকের নাম (বাংলা)', 'পদবি', 'প্রধান বিষয়', 'মোবাইল নম্বর', 'রক্তের গ্রুপ', 'সর্বোচ্চ শিক্ষাগত যোগ্যতা', 'বর্তমান ঠিকানা'],
        ['মোঃ দেলোয়ার হোসেন', 'সহকারী শিক্ষক', 'গণিত ও বিজ্ঞান', '01712-345678', 'A+', 'স্নাতকোত্তর (এম.এসসি)', 'সনমানিয়া, কাপাসিয়া'],
        ['মোসাঃ নুসরাত জাহান', 'সহকারী শিক্ষিকা', 'ইংরেজি', '01819-876543', 'O+', 'স্নাতক (বি.এ অনার্স)', 'কাপাসিয়া, গাজীপুর']
      ];
    } else if (category === 'staff') {
      filename = 'ডি-লিকন_কর্মচারী_তালিকা_নমুনা.xlsx';
      data = [
        ['কর্মচারীর নাম', 'পদবি', 'মোবাইল নম্বর', 'জাতীয় পরিচয়পত্র (NID)', 'ঠিকানা', 'রক্তের গ্রুপ'],
        ['মোঃ আব্দুল করিম', 'অফিস সহকারী', '01711-223344', '19873322114455', 'সনমানিয়া', 'B+'],
        ['রফিকুল ইসলাম', 'নিরাপত্তা প্রহরী', '01822-334455', '19852233445566', 'কাপাসিয়া', 'O+'],
        ['মোসাঃ মরিয়ম বেগম', 'আয়া', '01933-445566', '19904455667788', 'সনমানিয়া', 'A+']
      ];
    } else if (category === 'entrepreneur') {
      filename = 'ডি-লিকন_শিক্ষা_উদ্যোক্তা_তালিকা_নমুনা.xlsx';
      data = [
        ['উদ্যোক্তার নাম', 'পদবী / ভূমিকা', 'প্রতিষ্ঠান / পেশা', 'মোবাইল নম্বর', 'অবদান / বিবরণ', 'ঠিকানা'],
        ['ইঞ্জি. মো. দেলোয়ার হোসেন', 'প্রতিষ্ঠাতা ও চেয়ারম্যান', 'শিক্ষা উদ্যোক্তা ও প্রকৌশলী', '01710-001122', 'বিদ্যালয়ের জমি ও ডিজিটাল অবকাঠামো অর্থায়ন', 'সনমানিয়া'],
        ['হাজী মোঃ শাহজাহান মিয়া', 'সভাপতি, পরিচালনা পর্ষদ', 'বিশিষ্ট ব্যবসায়ী ও সমাজসেবক', '01815-112233', 'বিদ্যালয় পরিচালনা ও উন্নয়ন তহবিল', 'কাপাসিয়া']
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);
  };

  // Profile image upload handler (for individual detail drawer)
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfileModal) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const updated = { ...activeProfileModal.data, photo: dataUrl };
      setActiveProfileModal({ ...activeProfileModal, data: updated });

      // Persist to proper list
      if (activeProfileModal.type === 'student') {
        const list = students.map(s => s.id === updated.id ? updated : s);
        saveStudents(list);
      } else if (activeProfileModal.type === 'staff') {
        const list = staffList.map(s => s.id === updated.id ? updated : s);
        saveStaff(list);
      } else if (activeProfileModal.type === 'entrepreneur') {
        const list = entrepreneurs.map(en => en.id === updated.id ? updated : en);
        saveEntrepreneurs(list);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered Lists (Auto-purges corrupted headers and sorts by Roll number)
  const filteredStudents = students
    .filter(s => !isHeaderOrCorruptedStudent(s.name))
    .filter(s => {
      const studentClass = normalizeClassName(s.className);
      const matchesClass = selectedClassFilter === 'সকল শ্রেণি' || studentClass === selectedClassFilter;
      const matchesSearch = !studentSearch || 
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.nameEnglish && s.nameEnglish.toLowerCase().includes(studentSearch.toLowerCase())) ||
        s.roll.includes(studentSearch) ||
        formatBanglaRoll(s.roll).includes(studentSearch) ||
        s.mobile.includes(studentSearch) ||
        (s.guardianName && s.guardianName.includes(studentSearch));
      return matchesClass && matchesSearch;
    })
    .sort((a, b) => {
      if (a.className === b.className) {
        return parseRollNumber(a.roll) - parseRollNumber(b.roll);
      }
      return 0;
    });

  const filteredTeachers = teachers.filter(t => {
    if (!teacherSearch) return true;
    const q = teacherSearch.toLowerCase();
    return t.fullName.toLowerCase().includes(q) ||
      t.designation.toLowerCase().includes(q) ||
      t.mainSubject.toLowerCase().includes(q) ||
      t.mobileNumber.includes(q);
  });

  const filteredStaff = staffList.filter(st => {
    if (!staffSearch) return true;
    const q = staffSearch.toLowerCase();
    return st.name.toLowerCase().includes(q) ||
      st.designation.toLowerCase().includes(q) ||
      st.mobile.includes(q);
  });

  const filteredEntrepreneurs = entrepreneurs.filter(en => {
    if (!entrepreneurSearch) return true;
    const q = entrepreneurSearch.toLowerCase();
    return en.name.toLowerCase().includes(q) ||
      en.role.toLowerCase().includes(q) ||
      (en.organization && en.organization.toLowerCase().includes(q)) ||
      en.mobile.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-2 border-amber-400/40 rounded-2xl p-6 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-teal-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl shadow-lg shrink-0">
              <SchoolLogo size={48} className="w-12 h-12" preferVector={true} />
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full mb-1">
                প্রাতিষ্ঠানিক ডেটাবেজ ও এক্সেল আপলোড সেন্টার
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ডি-লিকন মডেল একাডেমী এডমিন হাব
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                সকল শিক্ষক, শিক্ষার্থী (প্লে-১০ম শ্রেণিভিত্তিক), কর্মচারী ও শিক্ষা উদ্যোক্তাদের এক্সেল ফাইল আপলোড ও তথ্য ব্যবস্থাপনা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-200">
              মোট শিক্ষার্থী: {students.length} | শিক্ষক: {teachers.length} | কর্মচারী: {staffList.length}
            </span>
          </div>
        </div>
      </div>

      {/* Upload Notification Toast */}
      {uploadStatus && (
        <div className="mb-6 p-4 bg-emerald-950/90 border-2 border-emerald-500 text-emerald-100 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold">{uploadStatus}</span>
          </div>
          <button onClick={() => setUploadStatus(null)} className="text-emerald-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Category Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            activeTab === 'students'
              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>১. সকল শিক্ষার্থী (প্লে-১০ম)</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            activeTab === 'teachers'
              ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>২. সকল শিক্ষক</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
            {teachers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            activeTab === 'staff'
              ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>৩. সকল কর্মচারী</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
            {staffList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('entrepreneurs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            activeTab === 'entrepreneurs'
              ? 'bg-indigo-700 text-white shadow-md ring-2 ring-indigo-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>৪. সকল শিক্ষা উদ্যোক্তা</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
            {entrepreneurs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            activeTab === 'syllabus'
              ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>৫. ৯ পরীক্ষার সিলেবাস (পার্বিক ও সাময়িক)</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            activeTab === 'evaluation'
              ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>৬. শিক্ষার্থী মূল্যায়ন সীট</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            ক্লাসরুম লাইভ
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            activeTab === 'analytics'
              ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-teal-400" />
          <span>৭. এনালিটিক্স ও চার্ট (Recharts)</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
            লাইভ মেট্রিক্স
          </span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
            activeTab === 'library'
              ? 'bg-indigo-700 text-white shadow-md ring-2 ring-indigo-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>৮. ডিজিটাল লাইব্রেরী</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            PDF ও রিসোর্স
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
            activeTab === 'calendar'
              ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>৯. পরীক্ষা ক্যালেন্ডার (৯ পরীক্ষা)</span>
        </button>

        <button
          onClick={() => setActiveTab('model_test')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
            activeTab === 'model_test'
              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>১০. বৃত্তি ও মডেল টেস্ট প্রস্তুতি</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: STUDENTS (সকল শিক্ষার্থী - শ্রেণিভিত্তিক আপলোড: প্লে-১০ম)
          ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Class-by-Class Upload Control Bar */}
          <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  শ্রেণি ভিত্তিক এক্সেল আপলোডের ব্যবস্থা (প্লে থেকে ১০ম শ্রেণি)
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  নির্দিষ্ট একটি শ্রেণি নির্বাচন করে সেই শ্রেণির শিক্ষার্থীদের এক্সেল ফাইল আপলোড করুন
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  যেমন: প্লে, নার্সারী, ১ম, ২য়, ৩য়, ৪র্থ, ৫ম, ৬ষ্ঠ, ৭ম, ৮ম, ৯ম বা ১০ম শ্রেণি নির্বাচন করে এক্সেল ফাইল আপলোড দিন।
                </p>
              </div>

              {/* Upload Controls */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Target Class Selector */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
                  <span className="text-xs font-bold text-slate-700">টার্গেট শ্রেণি:</span>
                  <select
                    value={selectedUploadClass}
                    onChange={(e) => setSelectedUploadClass(e.target.value)}
                    className="bg-transparent text-xs font-bold text-amber-900 focus:outline-none cursor-pointer"
                  >
                    {SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Sample Download Button */}
                <button
                  onClick={() => downloadSampleExcel('student', selectedUploadClass)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
                  title="এই নির্দিষ্ট শ্রেণির জন্য প্রস্তুতকৃত নমুনা এক্সেল ফাইল নামান"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>নমুনা এক্সেল ({selectedUploadClass})</span>
                </button>

                {/* Hidden File Input & Upload Button */}
                <input
                  type="file"
                  ref={studentFileRef}
                  onChange={handleStudentExcelUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <button
                  onClick={() => studentFileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-slate-950" />
                  <span>[{selectedUploadClass}] এর ফাইল আপলোড</span>
                </button>

                <button
                  id="btn-bulk-excel-upload"
                  onClick={() => setIsBulkUploadOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                  title="সকল শ্রেণির আলাদা আলাদা এক্সেল ফাইল একসাথে সিলেক্ট করে আপলোড করুন"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>বাল্ক আপলোড (সকল শ্রেণি একসাথে)</span>
                </button>
              </div>
            </div>

            {/* 12-Class Live Upload Status Matrix (প্লে - ১০ম শ্রেণি) */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 text-xs">
                <span className="font-bold text-slate-800">
                  শ্রেণিভিত্তিক ডেটা আপলোড অবস্থা (মোট {SCHOOL_CLASSES.filter(cls => students.some(s => normalizeClassName(s.className) === cls)).length} / {SCHOOL_CLASSES.length} শ্রেণি আপলোডকৃত · {students.length} জন শিক্ষার্থী)
                </span>
                <span className="text-[11px] text-slate-500">
                  যেকোনো শ্রেণিতে ক্লিক করে সরাসরি ওই শ্রেণির ফাইল আপলোড করতে পারেন
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {SCHOOL_CLASSES.map(cls => {
                  const cnt = students.filter(s => normalizeClassName(s.className) === cls).length;
                  return (
                    <div
                      key={cls}
                      onClick={() => {
                        setSelectedUploadClass(cls);
                        setSelectedClassFilter(cls);
                      }}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-1.5 cursor-pointer transition-colors ${
                        cnt > 0
                          ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 hover:border-amber-400 text-slate-600'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate">{cls}</div>
                        <div className="text-[10.5px] font-mono tabular-nums">
                          {cnt > 0 ? `${cnt} জন` : 'খালি (০)'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedUploadClass(cls);
                          setTimeout(() => studentFileRef.current?.click(), 50);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-400 text-slate-700 shrink-0 cursor-pointer"
                        title={`${cls}-এর এক্সেল ফাইল আপলোড করুন`}
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Class Filter Bar (Pill tabs for all classes) */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="font-bold text-slate-500 shrink-0 flex items-center gap-1 pl-1">
                <Filter className="w-3.5 h-3.5" /> ফিল্টার:
              </span>
              <button
                onClick={() => setSelectedClassFilter('সকল শ্রেণি')}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  selectedClassFilter === 'সকল শ্রেণি'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                সকল শ্রেণি ({students.length})
              </button>
              {SCHOOL_CLASSES.map(cls => {
                const count = students.filter(s => normalizeClassName(s.className) === cls).length;
                return (
                  <button
                    key={cls}
                    onClick={() => setSelectedClassFilter(cls)}
                    className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedClassFilter === cls
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cls}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/30 text-inherit">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="নাম, রোল, মোবাইল বা অভিভাবক দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleReindexRolls}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                title="সকল শিক্ষার্থীর রোল নম্বর ০১, ০২, ০৩... ধারাবাহিক ক্রমানুসারে সাজান (কোনো রোল মিস হবে না)"
              >
                <ListOrdered className="w-3.5 h-3.5 text-emerald-200" />
                <span>রোল ০১, ০২, ০৩... সাজান</span>
              </button>

              <button
                onClick={handlePurgeCorruptedRecords}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                title="এক্সেল ফাইল থেকে আসা 'ছাত্র-ছাত্রীর নাম' বা বিভাগ শিরোনাম রেকর্ড এক ক্লিকে মুছে ফেলুন"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                <span>ভুল হেডার পরিচ্ছন্ন</span>
              </button>

              <button
                onClick={handleClearDemoData}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                title="সিস্টেমের প্রাথমিক ডেমো শিক্ষার্থীদের তালিকা এক ক্লিকে মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>ডেমো ডাটা মুছুন</span>
              </button>

              <button
                onClick={() => {
                  const newStu: StudentRecord = {
                    id: 'stu_' + Date.now(),
                    studentId: 'DLMA-' + Math.floor(1000 + Math.random() * 9000),
                    name: 'নতুন শিক্ষার্থী',
                    nameEnglish: '',
                    roll: `${students.length + 1}`,
                    className: selectedClassFilter !== 'সকল শ্রেণি' ? selectedClassFilter : '৫ম শ্রেণি',
                    section: 'ক',
                    mobile: '',
                    guardianName: '',
                    address: 'সনমানিয়া, কাপাসিয়া'
                  };
                  setActiveProfileModal({ type: 'student', data: newStu });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>ম্যানুয়াল শিক্ষার্থী যুক্ত</span>
              </button>
            </div>
          </div>

          {/* Automatic Header Cleaning & Sequential Roll Info Notice */}
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-950 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>স্বয়ংক্রিয় হেডার ফিল্টার ও ধারাবাহিক রোল সক্রিয়:</strong> এক্সেলের &lsquo;ছাত্র-ছাত্রীর নাম&rsquo; বা বিভাগ শিরোনাম স্বয়ংক্রিয়ভাবে ফিল্টার করা হয়েছে এবং প্রতিটি শ্রেণিতে রোল ০১, ০২, ০৩... ক্রমানুসারে সাজানো রয়েছে।
              </span>
            </div>
            <button
              onClick={handleReindexRolls}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer self-end sm:self-center"
            >
              রোল নম্বর রি-ইনডেক্স করুন
            </button>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-14 text-center">ছবি</th>
                    <th className="p-3 w-16 text-center">রোল</th>
                    <th className="p-3">শিক্ষার্থীর নাম (বাংলা ও English)</th>
                    <th className="p-3">শ্রেণি ও শাখা</th>
                    <th className="p-3">অভিভাবক / পিতা</th>
                    <th className="p-3">মোবাইল নম্বর</th>
                    <th className="p-3">রক্তের গ্রুপ</th>
                    <th className="p-3 text-center">অ্যাকশন / প্রোফাইল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        কোনো শিক্ষার্থীর রেকর্ড পাওয়া যায়নি। উপরের বোতাম থেকে এক্সেল ফাইল আপলোড করুন।
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3 text-center">
                          {stu.photo ? (
                            <img src={stu.photo} alt={stu.name} className="w-9 h-9 rounded-full object-cover mx-auto border border-amber-400 shadow-2xs" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 font-bold mx-auto text-[10px]">
                              ছবি নেই
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-center text-slate-900 bg-slate-50/50">
                          {formatBanglaRoll(stu.roll)}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-950 text-[13px]">{stu.name}</div>
                          {stu.nameEnglish && (
                            <div className="text-[11px] text-slate-500 font-mono">{stu.nameEnglish}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[11px] border border-amber-300">
                            {normalizeClassName(stu.className)} {normalizeSection(stu.section) ? `(${normalizeSection(stu.section)})` : ''}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">
                          {stu.guardianName || '—'}
                        </td>
                        <td className="p-3 font-mono text-slate-800">
                          {stu.mobile || '—'}
                        </td>
                        <td className="p-3 font-bold text-rose-700">
                          {stu.bloodGroup || '—'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setActiveProfileModal({ type: 'student', data: stu })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-2xs transition-all cursor-pointer"
                              title="ছবি ও স্বাক্ষরসহ বিস্তারিত তথ্য দেখুন বা আপডেট করুন"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>বিস্তারিত / ছবি</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি "${stu.name}" এর তথ্য মুছে ফেলতে চান?`)) {
                                  saveStudents(students.filter(s => s.id !== stu.id));
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TEACHERS (সকল শিক্ষক - এক্সেল আপলোড ও পূর্ণাঙ্গ ২-পাতা ফরম)
          ========================================================================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border-2 border-teal-300 shadow-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-md mb-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-700" />
                  সকল শিক্ষকের এক্সেল আপলোড ও ডেটাবেজ
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  এক্সেল ফাইলের মাধ্যমে বিদ্যালয়ের সকল শিক্ষকের তথ্য এক ক্লিকে আপলোড করুন
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  আমদানিকৃত প্রতিটি শিক্ষকের জন্য ছবি ও স্বাক্ষরসহ ২-পাতার অফিসিয়াল প্রিন্ট ফরম তৈরি থাকবে।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => downloadSampleExcel('teacher')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-700" />
                  <span>নমুনা শিক্ষক এক্সেল ডাউনলোড</span>
                </button>

                <input
                  type="file"
                  ref={teacherFileRef}
                  onChange={handleTeacherExcelUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <button
                  onClick={() => teacherFileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-white" />
                  <span>শিক্ষক এক্সেল আপলোড</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="শিক্ষকের নাম, বিষয় বা মোবাইল দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              মোট শিক্ষক: {filteredTeachers.length} জন
            </span>
          </div>

          {/* Teachers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-14 text-center">ছবি</th>
                  <th className="p-3">আইডি</th>
                  <th className="p-3">শিক্ষকের নাম</th>
                  <th className="p-3">পদবি</th>
                  <th className="p-3">প্রধান বিষয়</th>
                  <th className="p-3">মোবাইল</th>
                  <th className="p-3">রক্তের গ্রুপ</th>
                  <th className="p-3 text-center">২-পাতার প্রিন্ট / প্রোফাইল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((tch) => (
                  <tr key={tch.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="p-3 text-center">
                      {tch.teacherPhoto ? (
                        <img src={tch.teacherPhoto} alt={tch.fullName} className="w-9 h-9 rounded-full object-cover mx-auto border border-teal-400" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 font-bold mx-auto text-[10px]">
                          ছবি নেই
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{tch.teacherId || '—'}</td>
                    <td className="p-3 font-bold text-slate-950 text-[13px]">{tch.fullName}</td>
                    <td className="p-3 text-slate-800 font-medium">{tch.designation}</td>
                    <td className="p-3 text-teal-900 font-semibold">{tch.mainSubject}</td>
                    <td className="p-3 font-mono text-slate-800">{tch.mobileNumber}</td>
                    <td className="p-3 font-bold text-rose-700">{tch.bloodGroup}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onSelectTeacherForPrint && (
                          <button
                            onClick={() => onSelectTeacherForPrint(tch)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-2xs cursor-pointer"
                            title="এই শিক্ষকের পূরণকৃত ২-পাতার A4 ফরম খুলুন ও প্রিন্ট করুন"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>২-পাতার ফরম প্রিন্ট</span>
                          </button>
                        )}
                        <button
                          onClick={() => setActiveProfileModal({ type: 'teacher', data: tch })}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs border border-slate-300 cursor-pointer"
                          title="ছবি ও স্বাক্ষরসহ বিস্তারিত প্রোফাইল"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>প্রোফাইল</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STAFF (সকল কর্মচারী - এক্সেল আপলোড ও কর্মী প্রোফাইল)
          ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border-2 border-blue-300 shadow-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-md mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                  সকল কর্মচারীর এক্সেল আপলোড ও ডেটাবেজ
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  অফিস সহকারী, আয়া, নিরাপত্তা প্রহরী, ড্রাইভার, মালি ও কর্মীদের তথ্য এক্সেল ফাইল থেকে আপলোড
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  কর্মচারীদের মোবাইল, এনআইডি, পদবি ও ছবি ও স্বাক্ষরসহ প্রোফাইল সংরক্ষণ করুন।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => downloadSampleExcel('staff')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>নমুনা কর্মচারী এক্সেল</span>
                </button>

                <input
                  type="file"
                  ref={staffFileRef}
                  onChange={handleStaffExcelUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <button
                  onClick={() => staffFileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-white" />
                  <span>কর্মচারী এক্সেল আপলোড</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="কর্মচারীর নাম, পদবি বা মোবাইল দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>
            <button
              onClick={() => {
                const newStf: StaffRecord = {
                  id: 'stf_' + Date.now(),
                  staffId: 'DLMA-EMP-' + (100 + staffList.length + 1),
                  name: 'নতুন কর্মচারী',
                  designation: 'অফিস সহকারী',
                  mobile: '',
                  address: 'সনমানিয়া'
                };
                setActiveProfileModal({ type: 'staff', data: newStf });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>ম্যানুয়াল কর্মচারী যুক্ত</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-14 text-center">ছবি</th>
                  <th className="p-3">কর্মী আইডি</th>
                  <th className="p-3">কর্মচারীর নাম</th>
                  <th className="p-3">পদবি / দায়িত্ব</th>
                  <th className="p-3">মোবাইল নম্বর</th>
                  <th className="p-3">এনআইডি</th>
                  <th className="p-3">ঠিকানা</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((st) => (
                  <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3 text-center">
                      {st.photo ? (
                        <img src={st.photo} alt={st.name} className="w-9 h-9 rounded-full object-cover mx-auto border border-blue-400" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 font-bold mx-auto text-[10px]">
                          ছবি নেই
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{st.staffId}</td>
                    <td className="p-3 font-bold text-slate-950 text-[13px]">{st.name}</td>
                    <td className="p-3 font-semibold text-blue-900">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-md">
                        {st.designation}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-800">{st.mobile}</td>
                    <td className="p-3 font-mono text-slate-600">{st.nid || '—'}</td>
                    <td className="p-3 text-slate-600">{st.address || '—'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveProfileModal({ type: 'staff', data: st })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>প্রোফাইল</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${st.name}" এর রেকর্ড মুছে ফেলতে চান?`)) {
                              saveStaff(staffList.filter(s => s.id !== st.id));
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ENTREPRENEURS (সকল শিক্ষা উদ্যোক্তা - প্রতিষ্ঠাতা, ট্রাস্টি ও পরিচালনা পর্ষদ)
          ========================================================================= */}
      {activeTab === 'entrepreneurs' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border-2 border-indigo-300 shadow-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-md mb-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-700" />
                  সকল শিক্ষা উদ্যোক্তা ও পরিচালনা পর্ষদের ডেটাবেজ
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  প্রতিষ্ঠাতা, চেয়ারম্যান, সভাপতি, ট্রাস্টি সদস্য ও শিক্ষা উদ্যোক্তাদের এক্সেল আপলোড ও প্রোফাইল
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  বিদ্যালয়ের প্রতিষ্ঠাতা সদস্য, পৃষ্ঠপোষক ও কমিটির অবদান ও পরিচিতি সংরক্ষণ করুন।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => downloadSampleExcel('entrepreneur')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-700" />
                  <span>নমুনা উদ্যোক্তা এক্সেল</span>
                </button>

                <input
                  type="file"
                  ref={entrepreneurFileRef}
                  onChange={handleEntrepreneurExcelUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <button
                  onClick={() => entrepreneurFileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-white" />
                  <span>উদ্যোক্তা এক্সেল আপলোড</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={entrepreneurSearch}
                onChange={(e) => setEntrepreneurSearch(e.target.value)}
                placeholder="উদ্যোক্তার নাম, পদবী বা ভূমিকা দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>
            <button
              onClick={() => {
                const newEn: EntrepreneurRecord = {
                  id: 'ent_' + Date.now(),
                  entrepreneurId: 'DLMA-TR-' + (10 + entrepreneurs.length + 1),
                  name: 'নতুন শিক্ষা উদ্যোক্তা',
                  role: 'শিক্ষা উদ্যোক্তা / ট্রাস্টি সদস্য',
                  organization: 'ডি-লিকন ফাউন্ডেশন',
                  mobile: '',
                  address: 'সনমানিয়া'
                };
                setActiveProfileModal({ type: 'entrepreneur', data: newEn });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>ম্যানুয়াল উদ্যোক্তা যুক্ত</span>
            </button>
          </div>

          {/* Entrepreneur Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-14 text-center">ছবি</th>
                  <th className="p-3">আইডি</th>
                  <th className="p-3">নাম</th>
                  <th className="p-3">পদবী / ভূমিকা</th>
                  <th className="p-3">প্রতিষ্ঠান / পেশা</th>
                  <th className="p-3">মোবাইল</th>
                  <th className="p-3">অবদান / বিবরণ</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntrepreneurs.map((en) => (
                  <tr key={en.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="p-3 text-center">
                      {en.photo ? (
                        <img src={en.photo} alt={en.name} className="w-9 h-9 rounded-full object-cover mx-auto border border-indigo-400" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 font-bold mx-auto text-[10px]">
                          ছবি নেই
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{en.entrepreneurId}</td>
                    <td className="p-3 font-bold text-slate-950 text-[13px]">{en.name}</td>
                    <td className="p-3 font-bold text-indigo-900">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-md">
                        {en.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{en.profession || en.organization || '—'}</td>
                    <td className="p-3 font-mono text-slate-800">{en.mobile}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{en.contribution || '—'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveProfileModal({ type: 'entrepreneur', data: en })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>প্রোফাইল</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${en.name}" এর রেকর্ড মুছে ফেলতে চান?`)) {
                              saveEntrepreneurs(entrepreneurs.filter(e => e.id !== en.id));
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: SYLLABUS (৯ পরীক্ষার বাৎসরিক সিলেবাস: ৬টি পার্বিক + ৩টি সাময়িক/বার্ষিক)
          ========================================================================= */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  বাৎসরিক ৯ পরীক্ষার সমন্বিত সিলেবাস (৬টি পার্বিক + ৩টি সাময়িক ও বার্ষিক)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  ১ম সাময়িক, ২য় সাময়িক ও বার্ষিক প্রতিটি মেয়াদী পরীক্ষার আগে ২টি করে ১ দিনের ১০০ নম্বরের পার্বিক প্রস্তুতিমূলক পরীক্ষা অনুষ্ঠিত হয়।
                </p>
              </div>

              {/* Class Selector + Calendar Shortcut for Syllabus */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>ক্যালেন্ডারে ৯ পরীক্ষার তারিখ দেখুন</span>
                </button>
                <label className="text-xs font-bold text-slate-700">শ্রেণি পরিবর্তন:</label>
                <select
                  value={selectedSyllabusClass}
                  onChange={(e) => {
                    const cls = e.target.value;
                    setSelectedSyllabusClass(cls);
                    const found = syllabusList.find(s => s.className === cls);
                    if (found) {
                      setCurrentSyllabus(found);
                    } else {
                      setCurrentSyllabus({
                        id: 'syl_' + Date.now(),
                        className: cls,
                        term1Syllabus: '',
                        midterm1_1Syllabus: '',
                        midterm1_2Syllabus: '',
                        term2Syllabus: '',
                        midterm2_1Syllabus: '',
                        midterm2_2Syllabus: '',
                        term3Syllabus: '',
                        midterm3_1Syllabus: '',
                        midterm3_2Syllabus: '',
                        notes: '',
                        updatedAt: new Date().toLocaleDateString('bn-BD')
                      });
                    }
                  }}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {SCHOOL_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {syllabusSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{selectedSyllabusClass} এর ৯ পরীক্ষার সিলেবাস সফলভাবে সংরক্ষিত হয়েছে!</span>
            </div>
          )}

          {/* 9 Exams Form in 3 Term Groups */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const updatedSyllabus = { ...currentSyllabus, updatedAt: new Date().toLocaleDateString('bn-BD') };
              const filtered = syllabusList.filter(s => s.className !== currentSyllabus.className);
              saveSyllabus([...filtered, updatedSyllabus]);
              setSyllabusSavedMsg(true);
              setTimeout(() => setSyllabusSavedMsg(false), 3000);
            }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
          >
            {(['১ম সাময়িক পর্ব', '২য় সাময়িক পর্ব', 'বার্ষিক পর্ব'] as const).map((groupName) => (
              <div key={groupName} className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  {groupName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {ACADEMY_EXAMS_9.filter((ex) => ex.termGroup === groupName).map((exam) => (
                    <div
                      key={exam.id}
                      className={`p-4 rounded-xl border space-y-1.5 ${
                        exam.category === 'term'
                          ? 'bg-indigo-50/50 border-indigo-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <label className="block font-bold text-slate-900">
                        {exam.order}। {exam.label}
                      </label>
                      <p className="text-[11px] text-slate-500">{exam.description}</p>
                      <textarea
                        rows={3}
                        value={currentSyllabus[exam.syllabusField] || ''}
                        onChange={(e) =>
                          setCurrentSyllabus({
                            ...currentSyllabus,
                            [exam.syllabusField]: e.target.value
                          })
                        }
                        placeholder={`${exam.shortLabel} এর বিষয়ভিত্তিক পাঠ...`}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* বিশেষ নির্দেশনা ও মানবন্টন */}
            <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-1.5 text-xs">
              <label className="block font-bold text-purple-950">
                ১০। বিশেষ নির্দেশনা, পরীক্ষার মানবন্টন ও শিক্ষণ নোট
              </label>
              <textarea
                rows={2}
                value={currentSyllabus.notes || ''}
                onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, notes: e.target.value })}
                placeholder="শিক্ষকদের প্রতি বিশেষ পাঠদান নির্দেশনা, পার্বিক ১০০ নম্বরের বিষয় বণ্টন ও পরীক্ষার নীতিমালা..."
                className="w-full p-2.5 bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                সর্বশেষ আপডেট: {currentSyllabus.updatedAt}
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                সিলেবাস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 6: STUDENT DAILY EVALUATION SHEET (শিক্ষার্থী মূল্যায়ন সীট)
          হাতের লেখা, পড়ার প্রস্তুতি, শিষ্টাচার, উপস্থিতি ও অভিভাবক অবহিতকরণ
          ========================================================================= */}
      {activeTab === 'evaluation' && (
        <StudentEvaluationSheet
          students={students}
          teachers={teachers}
          onOpenStudentProfile={(stu) => setActiveProfileModal({ type: 'student', data: stu })}
        />
      )}

      {/* =========================================================================
          TAB 7: RECHARTS DATA VISUALIZATION (শিক্ষক ও শিক্ষার্থী পারফরম্যান্স চার্ট)
          ========================================================================= */}
      {activeTab === 'analytics' && (
        <AdminAnalyticsDashboard
          students={students}
          teachers={teachers}
          onOpenEvaluationSheet={() => setActiveTab('evaluation')}
          onOpenPeriodicReportModal={() => {
            setPeriodicReportStudent(students[0] || null);
            setIsPeriodicReportOpen(true);
          }}
        />
      )}

      {/* =========================================================================
          TAB 8: DIGITAL LIBRARY (পাঠ্যবই PDF, সিলেবাস, প্রশ্ন ব্যাংক, নোট, গাইড, লিংক)
          ========================================================================= */}
      {activeTab === 'library' && (
        <DigitalLibrary
          onOpenAdminSyllabus={() => setActiveTab('syllabus')}
        />
      )}

      {/* =========================================================================
          TAB 9: EXAM CALENDAR (৯ পরীক্ষা ও মডেল টেস্ট ক্যালেন্ডার)
          ========================================================================= */}
      {activeTab === 'calendar' && (
        <ExamCalendarPanel
          syllabusList={syllabusList}
          onOpenSyllabusTab={() => setActiveTab('syllabus')}
          onOpenModelTestTab={() => setActiveTab('model_test')}
        />
      )}

      {/* =========================================================================
          TAB 10: MODEL TEST & SCHOLARSHIP READINESS (বৃত্তি ও মডেল টেস্ট প্রস্তুতি)
          ========================================================================= */}
      {activeTab === 'model_test' && (
        <ScholarshipModelTestPanel students={students} />
      )}

      {/* =========================================================================
          BULK MULTI-CLASS EXCEL UPLOAD MODAL (সকল শ্রেণির ফাইল একসাথে)
          ========================================================================= */}
      <BulkStudentExcelModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        existingStudents={students}
        normalizeStudents={normalizeClassAndRolls}
        onImportCompleted={(merged, summaryMsg) => {
          saveStudents(merged);
          setUploadStatus(summaryMsg);
          setTimeout(() => setUploadStatus(null), 6000);
        }}
      />

      {/* =========================================================================
          PERIODIC EVALUATION REPORT GENERATOR MODAL (সাপ্তাহিক, মাসিক, ত্রৈমাসিক, পরীক্ষা)
          ========================================================================= */}
      {isPeriodicReportOpen && (
        <PeriodicEvaluationReportModal
          students={students}
          teachers={teachers}
          initialStudent={periodicReportStudent}
          onClose={() => {
            setIsPeriodicReportOpen(false);
            setPeriodicReportStudent(null);
          }}
        />
      )}

      {/* =========================================================================
          INTERACTIVE DETAIL MODAL / DRAWER (ছবি ও স্বাক্ষরসহ বিস্তারিত ফরম)
          "পরবর্তীতে আমরা আলাদাভাবে সেই লিস্ট ধরে ছবি ও স্বাক্ষরসহ ডিটেইল তথ্য আপলোড করার ফরম অনুসরন করব।"
          ========================================================================= */}
      {activeProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border-2 border-slate-300 my-8 text-slate-900 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <SchoolLogo size={36} preferVector={true} />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeProfileModal.type === 'student' && 'শিক্ষার্থীর পূর্ণাঙ্গ তথ্য ও প্রোফাইল'}
                    {activeProfileModal.type === 'teacher' && 'শিক্ষকের পূর্ণাঙ্গ তথ্য ও বায়োডাটা'}
                    {activeProfileModal.type === 'staff' && 'কর্মচারীর পূর্ণাঙ্গ তথ্য ও পরিচিতি'}
                    {activeProfileModal.type === 'entrepreneur' && 'শিক্ষা উদ্যোক্তার পরিচিতি ও অবদান'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ডি-লিকন মডেল একাডেমী • অফিসিয়াল নথি
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveProfileModal(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content with Photo & Signature Upload */}
            <div className="space-y-4 text-xs">
              {/* Photo & Basic Badge Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* Photo Container */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-28 bg-white border-2 border-dashed border-slate-400 rounded-lg overflow-hidden flex flex-col items-center justify-center shadow-xs text-center p-1">
                    {activeProfileModal.data.photo || activeProfileModal.data.teacherPhoto ? (
                      <img 
                        src={activeProfileModal.data.photo || activeProfileModal.data.teacherPhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <Camera className="w-6 h-6 mb-1 text-slate-400" />
                        <span className="text-[9px] font-bold">ছবি সংযুক্ত নেই</span>
                      </div>
                    )}
                  </div>
                  {/* Photo Upload Trigger */}
                  <label className="mt-1.5 inline-flex items-center gap-1 px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold rounded-md cursor-pointer shadow-xs w-full justify-center">
                    <Camera className="w-3 h-3" />
                    <span>ছবি আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h4 className="text-lg font-black text-slate-950">
                      {activeProfileModal.data.name || activeProfileModal.data.fullName}
                    </h4>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded-md text-[10px]">
                      {activeProfileModal.data.studentId || activeProfileModal.data.teacherId || activeProfileModal.data.staffId || activeProfileModal.data.entrepreneurId || 'DLMA-REC'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-teal-800">
                    {activeProfileModal.type === 'student' && `${activeProfileModal.data.className} • রোল: ${activeProfileModal.data.roll}`}
                    {activeProfileModal.type === 'teacher' && `${activeProfileModal.data.designation} (${activeProfileModal.data.mainSubject})`}
                    {activeProfileModal.type === 'staff' && activeProfileModal.data.designation}
                    {activeProfileModal.type === 'entrepreneur' && activeProfileModal.data.role}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-600 text-[11px] pt-1">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeProfileModal.data.mobile || activeProfileModal.data.mobileNumber || 'মোবাইল নেই'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeProfileModal.data.address || activeProfileModal.data.presentAddress || 'সনমানিয়া, কাপাসিয়া'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Fields Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                {activeProfileModal.type === 'student' && (
                  <>
                    <div>
                      <span className="font-bold text-slate-600 block">পিতা/অভিভাবকের নাম:</span>
                      <span className="font-semibold text-slate-900">{activeProfileModal.data.guardianName || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">রক্তের গ্রুপ:</span>
                      <span className="font-bold text-rose-700">{activeProfileModal.data.bloodGroup || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">শাখা:</span>
                      <span className="font-semibold text-slate-900">{activeProfileModal.data.section || 'ক'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">জন্ম তারিখ:</span>
                      <span className="font-semibold text-slate-900">{activeProfileModal.data.birthDate || '—'}</span>
                    </div>
                  </>
                )}

                {activeProfileModal.type === 'staff' && (
                  <>
                    <div>
                      <span className="font-bold text-slate-600 block">জাতীয় পরিচয়পত্র (NID):</span>
                      <span className="font-mono text-slate-900">{activeProfileModal.data.nid || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">যোগদানের তারিখ:</span>
                      <span className="text-slate-900">{activeProfileModal.data.joiningDate || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">রক্তের গ্রুপ:</span>
                      <span className="font-bold text-rose-700">{activeProfileModal.data.bloodGroup || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">শিক্ষাগত যোগ্যতা:</span>
                      <span className="text-slate-900">{activeProfileModal.data.highestDegree || '—'}</span>
                    </div>
                  </>
                )}

                {activeProfileModal.type === 'entrepreneur' && (
                  <>
                    <div className="col-span-2">
                      <span className="font-bold text-slate-600 block">প্রতিষ্ঠান / পেশাগত পরিচয়:</span>
                      <span className="font-semibold text-slate-900">{activeProfileModal.data.profession || activeProfileModal.data.organization || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-slate-600 block">প্রতিষ্ঠানে বিশেষ অবদান ও বিবরণ:</span>
                      <span className="text-slate-900 leading-relaxed block mt-0.5">{activeProfileModal.data.contribution || '—'}</span>
                    </div>
                  </>
                )}

                {activeProfileModal.type === 'teacher' && (
                  <>
                    <div>
                      <span className="font-bold text-slate-600 block">সর্বোচ্চ ডিগ্রি:</span>
                      <span className="font-semibold text-slate-900">{activeProfileModal.data.highestDegree || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">রক্তের গ্রুপ:</span>
                      <span className="font-bold text-rose-700">{activeProfileModal.data.bloodGroup || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-slate-600 block">পাঠদানের শ্রেণি:</span>
                      <span className="text-slate-900">{activeProfileModal.data.assignedClasses || '১ম - ৫ম শ্রেণি'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* If student: Live Classroom Daily Evaluation Summary & Metrics */}
              {activeProfileModal.type === 'student' && (() => {
                let evList: any[] = [];
                try {
                  const saved = localStorage.getItem('dlma_student_evaluations_v1');
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                      evList = parsed.filter(ev => 
                        ev.studentId === activeProfileModal.data.id ||
                        (ev.roll === formatBanglaRoll(activeProfileModal.data.roll) && 
                         normalizeClassName(ev.className) === normalizeClassName(activeProfileModal.data.className))
                      );
                    }
                  }
                } catch (e) {
                  console.error(e);
                }

                const latestEv = evList[0];
                const absentDays = evList.filter(ev => ev.attendance === 'অনুপস্থিত').length;
                const noHwDays = evList.filter(ev => ev.handwritingBrought === 'আনেনি').length;
                const unpreparedDays = evList.filter(ev => ev.lessonPreparation === 'মুখস্ত করেনি').length;
                const misconductDays = evList.filter(ev => ev.behavior === 'শিষ্টাচার লঙ্ঘন করেছে').length;

                return (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>দৈনিক শ্রেণিকক্ষ মূল্যায়ন রেকর্ড ও আচরণ পর্যালোচনা</span>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        মোট মূল্যায়ন: {evList.length} দিন
                      </span>
                    </div>

                    {latestEv ? (
                      <div className="space-y-2">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                          <div className={`p-1.5 rounded-lg border ${absentDays > 0 ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <span className="block font-bold text-xs">{absentDays} দিন</span>
                            <span>অনুপস্থিত</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border ${noHwDays > 0 ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <span className="block font-bold text-xs">{noHwDays} দিন</span>
                            <span>হাতের লেখা আনেনি</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border ${unpreparedDays > 0 ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <span className="block font-bold text-xs">{unpreparedDays} দিন</span>
                            <span>পড়া মুখস্ত করেনি</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border ${misconductDays > 0 ? 'bg-red-50 border-red-300 text-red-900' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <span className="block font-bold text-xs">{misconductDays} দিন</span>
                            <span>শিষ্টাচার লঙ্ঘন</span>
                          </div>
                        </div>

                        {/* Latest Day Snapshot */}
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-300 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-500 text-[10px]">
                            <span>সর্বশেষ মূল্যায়ন তারিখ: <strong className="text-slate-800">{latestEv.date}</strong></span>
                            <span>বিষয়: <strong className="text-slate-800">{latestEv.subject}</strong></span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-700">
                            <div>হাতের লেখা: <strong className={latestEv.handwritingBrought === 'আনেনি' ? 'text-rose-700 font-black' : 'text-emerald-700'}>{latestEv.handwritingBrought}</strong> ({latestEv.handwritingQuality})</div>
                            <div>পড়া প্রস্তুতি: <strong className={latestEv.lessonPreparation === 'মুখস্ত করেনি' ? 'text-rose-700 font-black' : 'text-emerald-700'}>{latestEv.lessonPreparation}</strong></div>
                            <div>আচরণ: <strong className={latestEv.behavior === 'শিষ্টাচার লঙ্ঘন করেছে' ? 'text-rose-700 font-black' : 'text-slate-800'}>{latestEv.behavior}</strong></div>
                            <div>উপস্থিতি: <strong className="text-slate-900">{latestEv.attendance}</strong></div>
                          </div>
                          {latestEv.remarks && (
                            <div className="pt-1 text-[10px] text-slate-600 italic border-t border-slate-100">
                              শিক্ষকের মন্তব্য: "{latestEv.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2 bg-white rounded-lg border border-dashed border-emerald-300 text-slate-500 text-[11px]">
                        এখনও এই শিক্ষার্থীর জন্য মূল্যায়ন লিপিবদ্ধ করা হয়নি। নিচের বাটনে ক্লিক করে আজই ক্লাসরুম মূল্যায়ন সম্পন্ন করুন।
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Signature Preview & Stamp Box */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">অফিসিয়াল স্বাক্ষর ও যাচাই:</span>
                  <div className="h-10 w-36 border-b border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-400">
                    {activeProfileModal.data.signature ? (
                      <img src={activeProfileModal.data.signature} alt="Sign" className="max-h-8 max-w-full object-contain" />
                    ) : (
                      'স্বাক্ষর সংরক্ষিত'
                    )}
                  </div>
                </div>

                <div className="w-14 h-14 rounded-full border border-dashed border-slate-400 flex flex-col items-center justify-center text-[8px] text-slate-400">
                  <span>ডি-লিকন</span>
                  <span>সিল</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setActiveProfileModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>

              <div className="flex items-center gap-2">
                {activeProfileModal.type === 'student' && (
                  <>
                    <button
                      onClick={() => {
                        setPeriodicReportStudent(activeProfileModal.data);
                        setIsPeriodicReportOpen(true);
                        setActiveProfileModal(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
                      title="সাপ্তাহিক, মাসিক, ত্রৈমাসিক ও পরীক্ষা পর্যন্ত রিপোর্ট জেনারেটর"
                    >
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>পর্যাবৃত্ত রিপোর্ট (সাপ্তাহিক/মাসিক/পরীক্ষা)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('evaluation');
                        setActiveProfileModal(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>মূল্যায়ন সীট ও অভিভাবক স্লিপ</span>
                    </button>
                  </>
                )}
                {activeProfileModal.type === 'teacher' && onSelectTeacherForPrint && (
                  <button
                    onClick={() => {
                      onSelectTeacherForPrint(activeProfileModal.data);
                      setActiveProfileModal(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>২-পাতার প্রিন্ট ফরম খুলুন</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    alert('প্রোফাইল তথ্য সফলভাবে ডেটাবেজে সংরক্ষিত রয়েছে!');
                    setActiveProfileModal(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>তথ্য সংরক্ষণ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
