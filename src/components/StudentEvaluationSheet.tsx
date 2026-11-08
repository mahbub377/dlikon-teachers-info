import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Calendar, 
  Save, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  PenTool, 
  BookOpen, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  FileText, 
  ChevronRight, 
  X, 
  HelpCircle,
  Eye,
  ArrowLeft,
  Check,
  Send,
  Download
} from 'lucide-react';
import { 
  StudentRecord, 
  StudentDailyEvaluation, 
  HandwritingQuality, 
  LessonPreparation, 
  AttendanceStatus, 
  BehaviorStatus, 
  HandwritingBrought,
  SCHOOL_CLASSES 
} from '../types/adminTypes';
import { TeacherFormData } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { formatBanglaRoll, normalizeClassName, normalizeSection } from './AdminDashboard';
import { downloadSingleElementAsPdf } from '../utils/pdfExport';

const STORAGE_EVALUATIONS = 'dlma_student_evaluations_v1';

interface StudentEvaluationSheetProps {
  students: StudentRecord[];
  teachers?: TeacherFormData[];
  preSelectedStudent?: StudentRecord | null;
  onClose?: () => void;
  onOpenStudentProfile?: (stu: StudentRecord) => void;
}

export const StudentEvaluationSheet: React.FC<StudentEvaluationSheetProps> = ({
  students = [],
  teachers = [],
  preSelectedStudent = null,
  onClose,
  onOpenStudentProfile
}) => {
  // Available classes that have students, or default school classes
  const classesWithStudents = Array.from(
    new Set(students.map(s => normalizeClassName(s.className)))
  ).filter(Boolean);

  const availableClasses = classesWithStudents.length > 0 
    ? classesWithStudents 
    : Array.from(SCHOOL_CLASSES);

  // Filters & Context State
  const [selectedClass, setSelectedClass] = useState<string>(
    preSelectedStudent ? normalizeClassName(preSelectedStudent.className) : (availableClasses[0] || 'নার্সারী')
  );
  const [selectedSection, setSelectedSection] = useState<string>('সকল শাখা');
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('সার্বিক মূল্যায়ন');
  const [evaluatorTeacher, setEvaluatorTeacher] = useState<string>('শ্রেণি শিক্ষক');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'absent' | 'no_homework' | 'unprepared' | 'misconduct'>('all');

  // Persistence of All Historical Evaluations
  const [evaluations, setEvaluations] = useState<StudentDailyEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EVALUATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading evaluations:', e);
    }
    return [];
  });

  // Current session working evaluations map (studentId -> StudentDailyEvaluation)
  const [workingData, setWorkingData] = useState<Record<string, StudentDailyEvaluation>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modal / Print View State
  const [printableSlip, setPrintableSlip] = useState<{
    student: StudentRecord;
    evaluation: StudentDailyEvaluation;
  } | null>(null);

  const [isPrintClassRegister, setIsPrintClassRegister] = useState(false);

  // Filter students belonging to selected class & section
  const currentClassStudents = students
    .filter(s => normalizeClassName(s.className) === selectedClass)
    .filter(s => selectedSection === 'সকল শাখা' || normalizeSection(s.section) === selectedSection)
    .filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.roll.includes(q) ||
        formatBanglaRoll(s.roll).includes(q)
      );
    })
    .sort((a, b) => {
      const rA = parseInt(String(a.roll).replace(/[^0-9]/g, ''), 10) || 0;
      const rB = parseInt(String(b.roll).replace(/[^0-9]/g, ''), 10) || 0;
      return rA - rB;
    });

  // Load existing evaluation data for this class + date + subject when context changes
  useEffect(() => {
    const existingMap: Record<string, StudentDailyEvaluation> = {};
    
    // Find all evaluations matching this date, class, and subject
    const matching = evaluations.filter(
      ev => ev.date === selectedDate && 
            normalizeClassName(ev.className) === selectedClass &&
            ev.subject === selectedSubject
    );

    matching.forEach(ev => {
      existingMap[ev.studentId] = ev;
    });

    // Populate for students who don't have an entry yet with smart classroom defaults
    currentClassStudents.forEach(stu => {
      if (!existingMap[stu.id]) {
        existingMap[stu.id] = {
          id: `ev_${stu.id}_${selectedDate}_${Date.now()}`,
          studentId: stu.id,
          studentName: stu.name,
          roll: formatBanglaRoll(stu.roll),
          className: normalizeClassName(stu.className),
          section: normalizeSection(stu.section),
          date: selectedDate,
          subject: selectedSubject,
          evaluatorTeacher: evaluatorTeacher,
          attendance: 'উপস্থিত',
          handwritingBrought: 'এনেছে',
          handwritingQuality: 'ভালো',
          lessonPreparation: 'সম্পূর্ণ মুখস্ত',
          behavior: 'উত্তম / স্বাভাবিক',
          uniformCleanliness: 'পরিপাটি',
          remarks: '',
          guardianNoticeSent: false,
          createdAt: new Date().toISOString()
        };
      }
    });

    setWorkingData(existingMap);
  }, [selectedClass, selectedDate, selectedSubject, evaluatorTeacher, evaluations]);

  // Sync evaluations to localStorage
  const saveAllEvaluations = (updated: StudentDailyEvaluation[]) => {
    setEvaluations(updated);
    try {
      localStorage.setItem(STORAGE_EVALUATIONS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Update a single student's field in working state
  const handleUpdateStudent = (studentId: string, field: keyof StudentDailyEvaluation, value: any) => {
    setWorkingData(prev => {
      const current = prev[studentId] || {
        id: `ev_${studentId}_${selectedDate}_${Date.now()}`,
        studentId,
        studentName: students.find(s => s.id === studentId)?.name || '',
        roll: formatBanglaRoll(students.find(s => s.id === studentId)?.roll || '০১'),
        className: selectedClass,
        section: 'ক',
        date: selectedDate,
        subject: selectedSubject,
        evaluatorTeacher,
        attendance: 'উপস্থিত',
        handwritingBrought: 'এনেছে',
        handwritingQuality: 'ভালো',
        lessonPreparation: 'সম্পূর্ণ মুখস্ত',
        behavior: 'উত্তম / স্বাভাবিক',
        uniformCleanliness: 'পরিপাটি',
        remarks: '',
        guardianNoticeSent: false,
        createdAt: new Date().toISOString()
      };

      const updated = {
        ...current,
        [field]: value
      };

      // Auto-set handwriting brought to 'আনেনি' if quality is marked as 'খুবই খারাপ' or 'ভালো নয়' and teacher toggled
      if (field === 'handwritingBrought' && value === 'আনেনি') {
        updated.handwritingQuality = 'ভালো নয়';
      }

      // If absent, reset handwriting and lesson to not applicable/absent
      if (field === 'attendance' && value === 'অনুপস্থিত') {
        updated.handwritingBrought = 'আনেনি';
        updated.lessonPreparation = 'মুখস্ত করেনি';
      }

      return {
        ...prev,
        [studentId]: updated
      };
    });
  };

  // 1-Click Batch Quick Actions (ক্লাসের সময় দ্রুত ফিল করার জন্য)
  const applyBatchPreset = (preset: 'all_present' | 'all_hw_done' | 'all_memorized' | 'all_good' | 'all_disciplined') => {
    setWorkingData(prev => {
      const next = { ...prev };
      currentClassStudents.forEach(stu => {
        if (!next[stu.id]) return;
        if (preset === 'all_present') {
          next[stu.id] = { ...next[stu.id], attendance: 'উপস্থিত' };
        } else if (preset === 'all_hw_done') {
          next[stu.id] = { ...next[stu.id], handwritingBrought: 'এনেছে', handwritingQuality: 'ভালো' };
        } else if (preset === 'all_memorized') {
          next[stu.id] = { ...next[stu.id], lessonPreparation: 'সম্পূর্ণ মুখস্ত' };
        } else if (preset === 'all_disciplined') {
          next[stu.id] = { ...next[stu.id], behavior: 'উত্তম / স্বাভাবিক' };
        } else if (preset === 'all_good') {
          next[stu.id] = {
            ...next[stu.id],
            attendance: 'উপস্থিত',
            handwritingBrought: 'এনেছে',
            handwritingQuality: 'ভালো',
            lessonPreparation: 'সম্পূর্ণ মুখস্ত',
            behavior: 'উত্তম / স্বাভাবিক'
          };
        }
      });
      return next;
    });
  };

  // Save the full class evaluation sheet
  const handleSaveSheet = () => {
    const listToSave = Object.values(workingData).map(ev => ({
      ...ev,
      date: selectedDate,
      subject: selectedSubject,
      evaluatorTeacher: evaluatorTeacher
    }));

    // Merge into master list (replace matching entries for same student + date + subject)
    const existingFiltered = evaluations.filter(
      ev => !(ev.date === selectedDate && ev.subject === selectedSubject && currentClassStudents.some(s => s.id === ev.studentId))
    );

    const merged = [...listToSave, ...existingFiltered];
    saveAllEvaluations(merged);

    setSaveSuccessMsg(`সফলভাবে [${selectedClass}] এর ${listToSave.length} জন শিক্ষার্থীর মূল্যায়ন সংরক্ষিত হয়েছে!`);
    setTimeout(() => setSaveSuccessMsg(null), 4500);
  };

  // Calculate live stats for the current view
  const currentEvaluationsList = currentClassStudents.map(s => workingData[s.id]).filter(Boolean);
  const totalCount = currentClassStudents.length;
  const presentCount = currentEvaluationsList.filter(e => e.attendance === 'উপস্থিত').length;
  const absentCount = currentEvaluationsList.filter(e => e.attendance === 'অনুপস্থিত').length;
  const noHwCount = currentEvaluationsList.filter(e => e.handwritingBrought === 'আনেনি').length;
  const unPreparedCount = currentEvaluationsList.filter(e => e.lessonPreparation === 'মুখস্ত করেনি').length;
  const misconductCount = currentEvaluationsList.filter(e => e.behavior === 'শিষ্টাচার লঙ্ঘন করেছে').length;

  // Filter students based on alert chip
  const displayedStudents = currentClassStudents.filter(stu => {
    const ev = workingData[stu.id];
    if (!ev) return true;
    if (statusFilter === 'absent') return ev.attendance === 'অনুপস্থিত';
    if (statusFilter === 'no_homework') return ev.handwritingBrought === 'আনেনি';
    if (statusFilter === 'unprepared') return ev.lessonPreparation === 'মুখস্ত করেনি';
    if (statusFilter === 'misconduct') return ev.behavior === 'শিষ্টাচার লঙ্ঘন করেছে';
    return true;
  });

  // Direct Browser Print for Parent Slip
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-2 border-amber-400/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl shadow-lg shrink-0">
              <SchoolLogo size={48} className="w-12 h-12" preferVector={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full">
                  দৈনিক শ্রেণিকক্ষ ডায়েরি ও পারফরম্যান্স ট্র্যাকার
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-full hidden sm:inline-block">
                  অভিভাবক অবহিতকরণ ব্যবস্থা
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                শিক্ষার্থী দৈনিক মূল্যায়ন সীট
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                হাতের লেখা, পড়ার প্রস্তুতি, শিষ্টাচার ও উপস্থিতি মূল্যায়ন করুন এবং সরাসরি অভিভাবকের জন্য রিপোর্ট প্রিন্ট দিন
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>তালিকায় ফিরুন</span>
              </button>
            )}
            <button
              onClick={() => setIsPrintClassRegister(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="পুরো শ্রেণির আজকের মূল্যায়ন রেজিস্টার প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>রেজিস্টার প্রিন্ট (A4)</span>
            </button>
            <button
              onClick={handleSaveSheet}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>মূল্যায়ন সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-950/90 border-2 border-emerald-500 text-emerald-100 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold">{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Control & Filter Center */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Class Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>শ্রেণি নির্বাচন:</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* 2. Section Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              শাখা:
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="সকল শাখা">সকল শাখা</option>
              <option value="ক">ক শাখা</option>
              <option value="খ">খ শাখা</option>
              <option value="গ">গ শাখা</option>
            </select>
          </div>

          {/* 3. Evaluation Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>মূল্যায়নের তারিখ:</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* 4. Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5 text-blue-600" />
              <span>বিষয় / ক্ষেত্র:</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="সার্বিক মূল্যায়ন">সার্বিক মূল্যায়ন (দৈনিক ডায়েরি)</option>
              <option value="বাংলা">বাংলা (হাতের লেখা ও পাঠ)</option>
              <option value="ইংরেজি">ইংরেজি (Writing & Reading)</option>
              <option value="গণিত">গণিত (অনুশীলন ও খাতা)</option>
              <option value="বিজ্ঞান">বিজ্ঞান ও পরিবেশ</option>
              <option value="ধর্ম ও নৈতিক শিক্ষা">ধর্ম ও নৈতিক শিক্ষা</option>
              <option value="হাতের লেখা বিশেষ ক্লাস">হাতের লেখা বিশেষ ক্লাস</option>
            </select>
          </div>

          {/* 5. Evaluator Teacher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মূল্যায়নকারী শিক্ষক:
            </label>
            <select
              value={evaluatorTeacher}
              onChange={(e) => setEvaluatorTeacher(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="শ্রেণি শিক্ষক">শ্রেণি শিক্ষক</option>
              {teachers.map(t => (
                <option key={t.id} value={t.fullName}>{t.fullName} ({t.designation})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Classroom Quick Stats & One-Click Presets */}
        <div className="pt-3 border-t border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-600 mr-1">আজকের পরিসংখ্যান:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              মোট: {totalCount} জন
            </button>
            <span className="px-2.5 py-1 rounded-lg font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              উপস্থিত: {presentCount}
            </span>
            <button
              onClick={() => setStatusFilter('absent')}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                statusFilter === 'absent'
                  ? 'bg-rose-700 text-white border-rose-700 ring-2 ring-rose-400'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              }`}
            >
              অনুপস্থিত (এবসেন্ট): {absentCount}
            </button>
            <button
              onClick={() => setStatusFilter('no_homework')}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                statusFilter === 'no_homework'
                  ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-400'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              হাতের লেখা আনেনি: {noHwCount}
            </button>
            <button
              onClick={() => setStatusFilter('unprepared')}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                statusFilter === 'unprepared'
                  ? 'bg-orange-600 text-white border-orange-600 ring-2 ring-orange-400'
                  : 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100'
              }`}
            >
              পড়া মুখস্ত করেনি: {unPreparedCount}
            </button>
            <button
              onClick={() => setStatusFilter('misconduct')}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                statusFilter === 'misconduct'
                  ? 'bg-purple-700 text-white border-purple-700 ring-2 ring-purple-400'
                  : 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
              }`}
            >
              শিষ্টাচার লঙ্ঘন: {misconductCount}
            </button>
          </div>

          {/* Quick Presets for Fast Grading During Class */}
          <div className="flex flex-wrap items-center gap-1.5 self-end lg:self-center">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>১-ক্লিক পূরণ:</span>
            </span>
            <button
              onClick={() => applyBatchPreset('all_present')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 text-[11px] font-bold rounded-lg border border-slate-300 transition-all cursor-pointer"
              title="সকল শিক্ষার্থীকে 'উপস্থিত' চিহ্নিত করুন"
            >
              ✓ সবাই উপস্থিত
            </button>
            <button
              onClick={() => applyBatchPreset('all_hw_done')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-100 text-slate-800 hover:text-teal-900 text-[11px] font-bold rounded-lg border border-slate-300 transition-all cursor-pointer"
              title="সবার হাতের লেখা 'এনেছে' ও 'ভালো' দিন"
            >
              ✓ সবার HW এনেছে
            </button>
            <button
              onClick={() => applyBatchPreset('all_good')}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
              title="সকল শিক্ষার্থীকে ডিফল্ট ভালো ও উপস্থিত রেটিং দিন (এরপর শুধু যারা আনেনি বা খারাপ করেছে তাদের বদলান)"
            >
              ⚡ এক ক্লিকে সবার ভালো রেটিং
            </button>
          </div>
        </div>
      </div>

      {/* Student Assessment Sheet Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Subheader */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900">
              [{selectedClass}] শ্রেণির শিক্ষার্থী তালিকা ({displayedStudents.length} জন)
            </h2>
            <span className="text-xs text-slate-500">
              • রোল ০১ থেকে ক্রমানুসারে সাজানো
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম বা রোল দিয়ে খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>
        </div>

        {displayedStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-sm">এই শ্রেণিতে কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।</p>
            <p className="text-xs text-slate-400">
              উপরের শ্রেণি নির্বাচন পরিবর্তন করুন অথবা এডমিন হাব থেকে এক্সেল ফাইল আপলোড করুন।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedStudents.map((stu) => {
              const ev = workingData[stu.id] || {
                attendance: 'উপস্থিত',
                handwritingBrought: 'এনেছে',
                handwritingQuality: 'ভালো',
                lessonPreparation: 'সম্পূর্ণ মুখস্ত',
                behavior: 'উত্তম / স্বাভাবিক',
                remarks: ''
              };

              const isAbsent = ev.attendance === 'অনুপস্থিত';
              const hasNoHw = ev.handwritingBrought === 'আনেনি';
              const hasUnprepared = ev.lessonPreparation === 'মুখস্ত করেনি';
              const hasMisconduct = ev.behavior === 'শিষ্টাচার লঙ্ঘন করেছে';
              const hasAlert = isAbsent || hasNoHw || hasUnprepared || hasMisconduct;

              return (
                <div 
                  key={stu.id} 
                  className={`p-4 transition-colors ${
                    hasAlert ? 'bg-amber-50/20' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Col 1: Student Identity (3 Cols) */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-mono font-black text-xs text-slate-800 shrink-0 shadow-2xs">
                        {formatBanglaRoll(stu.roll)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-slate-900 text-sm truncate">
                            {stu.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>রোল: {formatBanglaRoll(stu.roll)}</span>
                          <span>•</span>
                          <span className="font-bold text-amber-800">
                            {normalizeClassName(stu.className)} ({normalizeSection(stu.section)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Attendance, Homework & Handwriting Quality (5 Cols) */}
                    <div className="lg:col-span-5 space-y-2.5">
                      {/* Row 1: Attendance & Homework Brought */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Attendance Toggle */}
                        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                          <button
                            onClick={() => handleUpdateStudent(stu.id, 'attendance', 'উপস্থিত')}
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                              ev.attendance === 'উপস্থিত'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'text-slate-700 hover:text-emerald-700'
                            }`}
                          >
                            উপস্থিত
                          </button>
                          <button
                            onClick={() => handleUpdateStudent(stu.id, 'attendance', 'অনুপস্থিত')}
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                              ev.attendance === 'অনুপস্থিত'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'text-slate-700 hover:text-rose-700'
                            }`}
                          >
                            অনুপস্থিত
                          </button>
                        </div>

                        {/* Homework Brought Toggle */}
                        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                          <span className="text-[10px] font-bold text-slate-500 px-1.5 self-center">হাতের লেখা:</span>
                          <button
                            onClick={() => handleUpdateStudent(stu.id, 'handwritingBrought', 'এনেছে')}
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                              ev.handwritingBrought === 'এনেছে'
                                ? 'bg-teal-700 text-white shadow-2xs'
                                : 'text-slate-700 hover:text-teal-800'
                            }`}
                          >
                            এনেছে
                          </button>
                          <button
                            onClick={() => handleUpdateStudent(stu.id, 'handwritingBrought', 'আনেনি')}
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                              ev.handwritingBrought === 'আনেনি'
                                ? 'bg-rose-600 text-white shadow-2xs animate-pulse'
                                : 'text-slate-700 hover:text-rose-700'
                            }`}
                          >
                            আনেনি ⚠️
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Handwriting Quality (ভাল - মোটামুটি - ভাল নয় - খুবই খারাপ) */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[11px] font-bold text-slate-600 mr-1">হাতের লেখার মান:</span>
                        {(['খুব ভালো', 'ভালো', 'মোটামুটি', 'ভালো নয়', 'খুবই খারাপ'] as HandwritingQuality[]).map(q => {
                          const isSelected = ev.handwritingQuality === q;
                          const colorMap: Record<HandwritingQuality, string> = {
                            'খুব ভালো': isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 border-emerald-300',
                            'ভালো': isSelected ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-800 border-teal-300',
                            'মোটামুটি': isSelected ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border-amber-300',
                            'ভালো নয়': isSelected ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-800 border-orange-300',
                            'খুবই খারাপ': isSelected ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-800 border-rose-300'
                          };

                          return (
                            <button
                              key={q}
                              onClick={() => handleUpdateStudent(stu.id, 'handwritingQuality', q)}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${colorMap[q]}`}
                            >
                              {q}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Col 3: Lesson Preparation & Discipline Violation (3 Cols) */}
                    <div className="lg:col-span-3 space-y-2">
                      {/* Lesson Memorization */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 mb-0.5">পড়া মুখস্ত / পাঠ প্রস্তুতি:</div>
                        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 w-full justify-between text-xs">
                          <button
                            onClick={() => handleUpdateStudent(stu.id, 'lessonPreparation', 'সম্পূর্ণ মুখস্ত')}
                            className={`flex-1 py-0.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                              ev.lessonPreparation === 'সম্পূর্ণ মুখস্ত'
                                ? 'bg-emerald-700 text-white'
                                : 'text-slate-700'
                            }`}
                          >
                            মুখস্ত হয়েছে
                          </button>
                          <button
                            onClick={() => handleUpdateStudent(stu.id, 'lessonPreparation', 'আংশিক প্রস্তুত')}
                            className={`flex-1 py-0.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                              ev.lessonPreparation === 'আংশিক প্রস্তুত'
                                ? 'bg-amber-600 text-white'
                                : 'text-slate-700'
                            }`}
                          >
                            আংশিক
                          </button>
                          <button
                            onClick={() => handleUpdateStudent(stu.id, 'lessonPreparation', 'মুখস্ত করেনি')}
                            className={`flex-1 py-0.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                              ev.lessonPreparation === 'মুখস্ত করেনি'
                                ? 'bg-rose-600 text-white font-black'
                                : 'text-slate-700 hover:text-rose-600'
                            }`}
                          >
                            করেনি ⚠️
                          </button>
                        </div>
                      </div>

                      {/* Discipline / Misconduct Violation Button */}
                      <div>
                        <button
                          onClick={() => handleUpdateStudent(
                            stu.id, 
                            'behavior', 
                            ev.behavior === 'শিষ্টাচার লঙ্ঘন করেছে' ? 'উত্তম / স্বাভাবিক' : 'শিষ্টাচার লঙ্ঘন করেছে'
                          )}
                          className={`w-full px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            ev.behavior === 'শিষ্টাচার লঙ্ঘন করেছে'
                              ? 'bg-rose-700 text-white border-rose-800 shadow-xs ring-2 ring-rose-400'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>
                            {ev.behavior === 'শিষ্টাচার লঙ্ঘন করেছে' 
                              ? '⚠️ শিষ্টাচার লঙ্ঘন করেছে!' 
                              : 'শিষ্টাচার: স্বাভাবিক'
                            }
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Col 4: Action & Parent Slip Print (1 Col) */}
                    <div className="lg:col-span-1 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-1.5">
                      <button
                        onClick={() => setPrintableSlip({ student: stu, evaluation: ev })}
                        className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] shadow-2xs transition-all cursor-pointer"
                        title="এই শিক্ষার্থীর অভিভাবকের জন্য অফিসিয়াল মূল্যায়ন স্লিপ প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>অভিভাবক স্লিপ</span>
                      </button>

                      {onOpenStudentProfile && (
                        <button
                          onClick={() => onOpenStudentProfile(stu)}
                          className="w-full inline-flex items-center justify-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-300 transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>প্রোফাইল</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Optional Remarks & Alert Row */}
                  {(hasAlert || ev.remarks) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {hasNoHw && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[10px] rounded-md">
                            ⚠️ হাতের লেখা আনেনি
                          </span>
                        )}
                        {hasUnprepared && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-900 border border-orange-300 font-bold text-[10px] rounded-md">
                            ⚠️ পড়া মুখস্ত করেনি
                          </span>
                        )}
                        {hasMisconduct && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-950 border border-purple-300 font-bold text-[10px] rounded-md">
                            ⚠️ শিষ্টাচার লঙ্ঘন
                          </span>
                        )}
                      </div>

                      <div className="flex-1 max-w-md">
                        <input
                          type="text"
                          value={ev.remarks || ''}
                          onChange={(e) => handleUpdateStudent(stu.id, 'remarks', e.target.value)}
                          placeholder="শিক্ষকের বিশেষ মন্তব্য বা নির্দেশনা..."
                          className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Sticky Save Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-400/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <Check className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300">
              {selectedClass} • {selectedSubject}
            </div>
            <div className="text-xs text-slate-300">
              তারিখ: {selectedDate} | মোট: {totalCount} জন (উপস্থিত: {presentCount}, অনুপস্থিত: {absentCount})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintClassRegister(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-xl cursor-pointer"
          >
            রেজিস্টার প্রিন্ট
          </button>
          <button
            onClick={handleSaveSheet}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg cursor-pointer"
          >
            সংরক্ষণ করুন
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRINT MODAL 1: INDIVIDUAL STUDENT PARENT EVALUATION SLIP
          "পরবর্তীতে যা শিক্ষার্থী প্রোফাইলে দৃশ্যমান হবে, যা প্রিন্ট দিয়ে অভিভাবককে দেখানো হবে।"
          ========================================================================= */}
      {printableSlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border-2 border-slate-300 my-8 text-slate-900 print:border-none print:shadow-none print:p-0 print:my-0">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b pb-3 mb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  অভিভাবকের জন্য অফিশিয়াল মূল্যায়ন পত্র প্রিন্ট প্রিভিউ
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>এখনই প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setPrintableSlip(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Slip Container (Ink-Friendly, Pure White, Clean Black Borders) */}
            <div className="bg-white p-6 border-2 border-slate-800 rounded-xl space-y-4 print:border-2 print:border-black print:p-4 text-xs font-serif">
              {/* Header Banner */}
              <div className="text-center pb-3 border-b-2 border-slate-800">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <SchoolLogo size={42} className="w-10 h-10" preferVector={true} />
                  <div>
                    <h2 className="text-xl font-black text-slate-950 tracking-tight">
                      ডি-লিকন মডেল একাডেমী
                    </h2>
                    <p className="text-[11px] font-bold text-slate-700 tracking-wider">
                      D-LIKON MODEL ACADEMY
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 font-sans">
                  সনমানিয়া, কাপাসিয়া, গাজীপুর • স্থাপিত: ২০১৮ইং • একটি আধুনিক ডিজিটাল শিক্ষাপ্রতিষ্ঠান
                </p>
                <div className="mt-2 inline-block px-4 py-1 bg-white border border-slate-800 font-bold text-xs uppercase tracking-wider rounded-md">
                  শিক্ষার্থী দৈনিক মূল্যায়ন ও অভিভাবক অবহিতকরণ পত্র
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/60 p-2.5 border border-slate-400 rounded-lg text-slate-900 font-sans">
                <div>
                  <span className="text-[10px] text-slate-500 block">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold text-[13px]">{printableSlip.student.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">রোল ও শ্রেণি:</span>
                  <span className="font-bold text-[13px]">
                    রোল: {formatBanglaRoll(printableSlip.student.roll)} • {normalizeClassName(printableSlip.student.className)} ({normalizeSection(printableSlip.student.section)})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">মূল্যায়নের তারিখ:</span>
                  <span className="font-bold text-[13px]">{printableSlip.evaluation.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">বিষয় / ক্ষেত্র:</span>
                  <span className="font-bold text-[13px]">{printableSlip.evaluation.subject || 'সার্বিক মূল্যায়ন'}</span>
                </div>
              </div>

              {/* Assessment Evaluation Table */}
              <table className="w-full border-collapse border border-slate-800 text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-800 font-bold text-slate-900">
                    <th className="p-2 border border-slate-800 w-12 text-center">ক্র.নং</th>
                    <th className="p-2 border border-slate-800">মূল্যায়ন সূচক (Evaluation Indicators)</th>
                    <th className="p-2 border border-slate-800 w-48 text-center">আজকের অর্জিত মান / ফলাফল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2 border border-slate-800 text-center font-mono font-bold">০১</td>
                    <td className="p-2 border border-slate-800 font-bold">দৈনিক শ্রেণিকক্ষ উপস্থিতি</td>
                    <td className="p-2 border border-slate-800 text-center font-bold">
                      {printableSlip.evaluation.attendance === 'উপস্থিত' ? (
                        <span className="text-emerald-800 font-black">✓ উপস্থিত</span>
                      ) : (
                        <span className="text-rose-700 font-black">✗ অনুপস্থিত (এবসেন্ট)</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2 border border-slate-800 text-center font-mono font-bold">০২</td>
                    <td className="p-2 border border-slate-800 font-bold">বাড়ির কাজ / হাতের লেখা আনয়ন</td>
                    <td className="p-2 border border-slate-800 text-center font-bold">
                      {printableSlip.evaluation.handwritingBrought === 'এনেছে' ? (
                        <span className="text-emerald-800 font-black">✓ হাতের লেখা এনেছে</span>
                      ) : (
                        <span className="text-rose-700 font-black underline">⚠️ হাতের লেখা আনেনি</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2 border border-slate-800 text-center font-mono font-bold">০৩</td>
                    <td className="p-2 border border-slate-800 font-bold">হাতের লেখার গুণগত মান ও পরিচ্ছন্নতা</td>
                    <td className="p-2 border border-slate-800 text-center font-bold">
                      <span className="px-2 py-0.5 border border-slate-800 rounded font-black">
                        {printableSlip.evaluation.handwritingQuality}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2 border border-slate-800 text-center font-mono font-bold">০৪</td>
                    <td className="p-2 border border-slate-800 font-bold">দৈনিক পাঠ প্রস্তুতি ও পড়া মুখস্ত</td>
                    <td className="p-2 border border-slate-800 text-center font-bold">
                      {printableSlip.evaluation.lessonPreparation === 'সম্পূর্ণ মুখস্ত' ? (
                        <span className="text-emerald-800 font-black">✓ সম্পূর্ণ মুখস্ত প্রস্তুত</span>
                      ) : printableSlip.evaluation.lessonPreparation === 'আংশিক প্রস্তুত' ? (
                        <span className="text-amber-800 font-black">আংশিক মুখস্ত</span>
                      ) : (
                        <span className="text-rose-700 font-black underline">⚠️ পড়া মুখস্ত করেনি</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2 border border-slate-800 text-center font-mono font-bold">০৫</td>
                    <td className="p-2 border border-slate-800 font-bold">শ্রেণিকক্ষে আচরণ ও শিষ্টাচার</td>
                    <td className="p-2 border border-slate-800 text-center font-bold">
                      {printableSlip.evaluation.behavior === 'উত্তম / স্বাভাবিক' ? (
                        <span className="text-emerald-800 font-black">✓ উত্তম ও ভদ্রোচিত</span>
                      ) : (
                        <span className="text-rose-700 font-black underline">⚠️ শিষ্টাচার লঙ্ঘন করেছে</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2 border border-slate-800 text-center font-mono font-bold">০৬</td>
                    <td className="p-2 border border-slate-800 font-bold">পোশাক, ইউনিফর্ম ও ব্যক্তিগত পরিচ্ছন্নতা</td>
                    <td className="p-2 border border-slate-800 text-center font-bold">
                      {printableSlip.evaluation.uniformCleanliness || 'পরিপাটি'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Special Parent Alert Notice (if any alert detected) */}
              {(printableSlip.evaluation.handwritingBrought === 'আনেনি' ||
                printableSlip.evaluation.lessonPreparation === 'মুখস্ত করেনি' ||
                printableSlip.evaluation.behavior === 'শিষ্টাচার লঙ্ঘন করেছে' ||
                printableSlip.evaluation.handwritingQuality === 'খুবই খারাপ' ||
                printableSlip.evaluation.handwritingQuality === 'ভালো নয়') && (
                <div className="p-3 border-2 border-slate-800 bg-slate-50 rounded-lg text-slate-900 font-sans">
                  <div className="font-bold text-xs text-rose-800 flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                    <span>সম্মানিত অভিভাবকের দৃষ্টি আকর্ষণ:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-800">
                    আজকের মূল্যায়নে দেখা গেছে আপনার সন্তান{' '}
                    {printableSlip.evaluation.handwritingBrought === 'আনেনি' && ' [বাড়ির হাতের লেখা আনেনি] '}
                    {printableSlip.evaluation.lessonPreparation === 'মুখস্ত করেনি' && ' [পড়া মুখস্ত করে আসেনি] '}
                    {printableSlip.evaluation.behavior === 'শিষ্টাচার লঙ্ঘন করেছে' && ' [শ্রেণিকক্ষে শিষ্টাচার লঙ্ঘন করেছে] '}
                    {(printableSlip.evaluation.handwritingQuality === 'ভালো নয়' || printableSlip.evaluation.handwritingQuality === 'খুবই খারাপ') && ' [হাতের লেখা খুবই দুর্বল ও অপাঠ্য] '}। 
                    বাড়িতে তাকে যত্নসহকারে নিয়মিত পড়ার টেবিলে বসানো ও বাড়ির কাজ সম্পন্নে আপনার সক্রিয় সহযোগিতা একান্ত কাম্য।
                  </p>
                </div>
              )}

              {/* Teacher Remarks Box */}
              <div className="p-2.5 border border-slate-800 rounded-lg font-sans">
                <span className="font-bold text-[11px] block mb-0.5">শ্রেণি শিক্ষক / মূল্যায়নকারী শিক্ষকের বিশেষ মন্তব্য:</span>
                <p className="text-xs text-slate-800 italic">
                  {printableSlip.evaluation.remarks || 'নিয়মিত বিদ্যালয়ে উপস্থিত থাকা এবং মনোযোগ দিয়ে পাঠ অনুশীলন করা আবশ্যক।'}
                </p>
              </div>

              {/* Signatures Block (3 Columns) */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center font-sans text-xs">
                <div>
                  <div className="border-t border-dashed border-slate-800 pt-1">
                    <span className="font-bold block">শ্রেণি শিক্ষকের স্বাক্ষর</span>
                    <span className="text-[10px] text-slate-500 font-mono">তারিখ: {printableSlip.evaluation.date}</span>
                  </div>
                </div>

                <div>
                  <div className="border-t border-dashed border-slate-800 pt-1">
                    <span className="font-bold block">প্রধান শিক্ষকের সিল ও স্বাক্ষর</span>
                    <span className="text-[10px] text-slate-500 font-mono">ডি-লিকন মডেল একাডেমী</span>
                  </div>
                </div>

                <div>
                  <div className="border-t border-dashed border-slate-800 pt-1">
                    <span className="font-bold block">অভিভাবকের স্বাক্ষর ও মন্তব্য</span>
                    <span className="text-[10px] text-slate-500 font-mono">তারিখ: ____________</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINT MODAL 2: FULL CLASS DAILY ASSESSMENT REGISTER (A4 LANDSCAPE)
          ========================================================================= */}
      {isPrintClassRegister && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border-2 border-slate-300 my-8 text-slate-900 print:border-none print:shadow-none print:p-0 print:my-0">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b pb-3 mb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  পুরো শ্রেণির দৈনিক মূল্যায়ন রেজিস্টার প্রিন্ট প্রিভিউ
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>এখনই প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setIsPrintClassRegister(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Register Sheet */}
            <div className="bg-white p-6 border-2 border-slate-800 rounded-xl space-y-4 print:border-none print:p-2 text-xs font-serif">
              <div className="text-center pb-2 border-b-2 border-slate-800">
                <h2 className="text-lg font-black text-slate-950">ডি-লিকন মডেল একাডেমী</h2>
                <p className="text-xs font-bold text-slate-700">দৈনিক শ্রেণিকক্ষ শিক্ষার্থী মূল্যায়ন ও উপস্থিতি রেজিস্টার</p>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  শ্রেণি: {selectedClass} | শাখা: {selectedSection} | বিষয়: {selectedSubject} | তারিখ: {selectedDate}
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-800 text-left font-sans text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-800 font-bold text-slate-900">
                    <th className="p-1.5 border border-slate-800 w-12 text-center">রোল</th>
                    <th className="p-1.5 border border-slate-800">শিক্ষার্থীর নাম</th>
                    <th className="p-1.5 border border-slate-800 w-20 text-center">উপস্থিতি</th>
                    <th className="p-1.5 border border-slate-800 w-24 text-center">হাতের লেখা</th>
                    <th className="p-1.5 border border-slate-800 w-28 text-center">হাতের লেখার মান</th>
                    <th className="p-1.5 border border-slate-800 w-28 text-center">পড়া মুখস্ত</th>
                    <th className="p-1.5 border border-slate-800 w-24 text-center">শিষ্টাচার</th>
                    <th className="p-1.5 border border-slate-800">মন্তব্য / নোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {currentClassStudents.map((stu) => {
                    const ev = workingData[stu.id] || {
                      attendance: 'উপস্থিত',
                      handwritingBrought: 'এনেছে',
                      handwritingQuality: 'ভালো',
                      lessonPreparation: 'সম্পূর্ণ মুখস্ত',
                      behavior: 'উত্তম / স্বাভাবিক',
                      remarks: ''
                    };

                    return (
                      <tr key={stu.id} className="border-b border-slate-800">
                        <td className="p-1.5 border border-slate-800 text-center font-mono font-bold">
                          {formatBanglaRoll(stu.roll)}
                        </td>
                        <td className="p-1.5 border border-slate-800 font-bold">
                          {stu.name}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center font-bold">
                          {ev.attendance}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center font-bold">
                          {ev.handwritingBrought}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center">
                          {ev.handwritingQuality}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center">
                          {ev.lessonPreparation}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center font-bold">
                          {ev.behavior === 'শিষ্টাচার লঙ্ঘন করেছে' ? '⚠️ লঙ্ঘন' : 'স্বাভাবিক'}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-slate-700">
                          {ev.remarks || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="pt-8 flex items-center justify-between font-sans text-xs">
                <div className="text-center">
                  <div className="border-t border-dashed border-slate-800 pt-1 w-44">
                    <span className="font-bold block">শ্রেণি শিক্ষকের স্বাক্ষর</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-dashed border-slate-800 pt-1 w-44">
                    <span className="font-bold block">প্রধান শিক্ষকের সিল ও স্বাক্ষর</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
