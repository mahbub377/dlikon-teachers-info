import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  UserCheck, 
  UserX, 
  Sparkles, 
  Filter, 
  FileText,
  Clock,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  StudentRecord, 
  StudentDailyEvaluation,
  HandwritingQuality,
  LessonPreparation,
  AttendanceStatus,
  BehaviorStatus,
  SCHOOL_CLASSES 
} from '../types/adminTypes';
import { TeacherFormData } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { formatBanglaRoll, normalizeClassName, normalizeSection } from './AdminDashboard';
import { downloadSingleElementAsPdf } from '../utils/pdfExport';

export type ReportPeriodType = 'weekly' | 'monthly' | 'quarterly' | 'exam_term' | 'custom';

interface PeriodicEvaluationReportModalProps {
  students: StudentRecord[];
  teachers?: TeacherFormData[];
  defaultClass?: string;
  initialStudent?: StudentRecord | null;
  onClose: () => void;
}

export const PeriodicEvaluationReportModal: React.FC<PeriodicEvaluationReportModalProps> = ({
  students = [],
  teachers = [],
  defaultClass = '১ম শ্রেণি',
  initialStudent = null,
  onClose
}) => {
  // Period Selection
  const [periodType, setPeriodType] = useState<ReportPeriodType>('monthly');
  const [examName, setExamName] = useState<string>('১ম সাময়িক / অর্ধবার্ষিক পরীক্ষা');
  const [quarterName, setQuarterName] = useState<string>('১ম প্রান্তিক (জানুয়ারি - মার্চ)');

  // Date Range state
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // default past 30 days for monthly
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Class & Student Selection
  const availableClasses = useMemo(() => {
    const fromList = Array.from(new Set(students.map(s => normalizeClassName(s.className)))).filter(Boolean);
    return fromList.length > 0 ? fromList : Array.from(SCHOOL_CLASSES);
  }, [students]);

  const [selectedClass, setSelectedClass] = useState<string>(
    initialStudent ? normalizeClassName(initialStudent.className) : (defaultClass || availableClasses[0] || '১ম শ্রেণি')
  );

  const classStudents = useMemo(() => {
    return students
      .filter(s => normalizeClassName(s.className) === selectedClass)
      .sort((a, b) => {
        const rA = parseInt(String(a.roll).replace(/[^0-9]/g, ''), 10) || 0;
        const rB = parseInt(String(b.roll).replace(/[^0-9]/g, ''), 10) || 0;
        return rA - rB;
      });
  }, [students, selectedClass]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.id || (classStudents[0]?.id || '')
  );

  const [reportScope, setReportScope] = useState<'individual' | 'class_summary'>('individual');

  // Load evaluations from localStorage
  const allEvaluations = useMemo<StudentDailyEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem('dlma_student_evaluations_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load evaluations:', e);
    }
    return [];
  }, []);

  // Update date ranges automatically when periodType changes
  const handlePeriodChange = (type: ReportPeriodType) => {
    setPeriodType(type);
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    setEndDate(end);

    if (type === 'weekly') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      setStartDate(start.toISOString().split('T')[0]);
    } else if (type === 'monthly') {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      setStartDate(start.toISOString().split('T')[0]);
    } else if (type === 'quarterly') {
      const start = new Date(now);
      start.setDate(now.getDate() - 90);
      setStartDate(start.toISOString().split('T')[0]);
    } else if (type === 'exam_term') {
      // Semester / Term exam period (e.g. from beginning of term)
      const start = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
      setStartDate(start.toISOString().split('T')[0]);
    }
  };

  // Currently selected student record
  const currentStudent = classStudents.find(s => s.id === selectedStudentId) || classStudents[0] || null;

  // Filter evaluations within the selected date range and class
  const filteredEvaluations = useMemo(() => {
    return allEvaluations.filter(ev => {
      const isClassMatch = normalizeClassName(ev.className) === selectedClass;
      const isDateMatch = (!startDate || ev.date >= startDate) && (!endDate || ev.date <= endDate);
      return isClassMatch && isDateMatch;
    });
  }, [allEvaluations, selectedClass, startDate, endDate]);

  // Student-specific evaluations in range
  const studentEvaluations = useMemo(() => {
    if (!currentStudent) return [];
    return filteredEvaluations.filter(ev => 
      ev.studentId === currentStudent.id ||
      (ev.roll === formatBanglaRoll(currentStudent.roll) && normalizeClassName(ev.className) === selectedClass)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredEvaluations, currentStudent, selectedClass]);

  // Calculations for current student
  const studentMetrics = useMemo(() => {
    const totalDays = studentEvaluations.length;
    const presentDays = studentEvaluations.filter(e => e.attendance === 'উপস্থিত').length;
    const absentDays = studentEvaluations.filter(e => e.attendance === 'অনুপস্থিত').length;
    const lateDays = studentEvaluations.filter(e => e.attendance === 'দেরিতে আসা').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const hwBrought = studentEvaluations.filter(e => e.handwritingBrought === 'এনেছে').length;
    const hwNotBrought = studentEvaluations.filter(e => e.handwritingBrought === 'আনেনি').length;
    const hwRate = totalDays > 0 ? Math.round((hwBrought / totalDays) * 100) : 100;

    const hwQualityCounts: Record<HandwritingQuality, number> = {
      'খুব ভালো': 0,
      'ভালো': 0,
      'মোটামুটি': 0,
      'ভালো নয়': 0,
      'খুবই খারাপ': 0
    };
    studentEvaluations.forEach(e => {
      if (e.handwritingQuality && hwQualityCounts[e.handwritingQuality] !== undefined) {
        hwQualityCounts[e.handwritingQuality]++;
      }
    });

    const lessonFull = studentEvaluations.filter(e => e.lessonPreparation === 'সম্পূর্ণ মুখস্ত').length;
    const lessonPartial = studentEvaluations.filter(e => e.lessonPreparation === 'আংশিক প্রস্তুত').length;
    const lessonUnprepared = studentEvaluations.filter(e => e.lessonPreparation === 'মুখস্ত করেনি').length;
    const lessonRate = totalDays > 0 ? Math.round(((lessonFull + (lessonPartial * 0.5)) / totalDays) * 100) : 100;

    const behaviorGood = studentEvaluations.filter(e => e.behavior === 'উত্তম / স্বাভাবিক').length;
    const misconductCount = studentEvaluations.filter(e => e.behavior === 'শিষ্টাচার লঙ্ঘন করেছে').length;

    // Overall GPA / Performance Rating
    const overallScore = Math.round((attendanceRate * 0.3) + (hwRate * 0.3) + (lessonRate * 0.3) + (misconductCount === 0 ? 10 : 0));
    let gradeTitle = 'সন্তোষজনক';
    let gradeBadge = 'B';
    if (overallScore >= 85 && misconductCount === 0 && hwNotBrought <= 1) {
      gradeTitle = 'চমৎকার ও অনুকরণীয়';
      gradeBadge = 'A+';
    } else if (overallScore >= 75) {
      gradeTitle = 'উত্তম ও প্রশংসনীয়';
      gradeBadge = 'A';
    } else if (overallScore < 60 || hwNotBrought >= 3 || misconductCount >= 2) {
      gradeTitle = 'বিশেষ যত্ন ও সংশোধন প্রয়োজন';
      gradeBadge = 'C (সতর্কতামূলক)';
    }

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendanceRate,
      hwBrought,
      hwNotBrought,
      hwRate,
      hwQualityCounts,
      lessonFull,
      lessonPartial,
      lessonUnprepared,
      lessonRate,
      behaviorGood,
      misconductCount,
      overallScore,
      gradeTitle,
      gradeBadge
    };
  }, [studentEvaluations]);

  // PDF Download State
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  const getPeriodLabel = () => {
    if (periodType === 'weekly') return 'সাপ্তাহিক মূল্যায়ন রিপোর্ট (৭ দিন)';
    if (periodType === 'monthly') return 'মাসিক ধারাবাহিক মূল্যায়ন রিপোর্ট (৩০ দিন)';
    if (periodType === 'quarterly') return `ত্রৈমাসিক মূল্যায়ন রিপোর্ট (${quarterName})`;
    if (periodType === 'exam_term') return `পরীক্ষা পর্যন্ত সার্বিক মূল্যায়ন রিপোর্ট (${examName})`;
    return `পর্যাবৃত্ত মূল্যায়ন রিপোর্ট (${startDate} থেকে ${endDate})`;
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setExportProgress('পিডিএফ ফাইল তৈরি হচ্ছে...');
    try {
      const containerId = reportScope === 'individual' 
        ? 'periodic-individual-report-container' 
        : 'periodic-class-summary-container';
      
      const studentNameClean = currentStudent ? currentStudent.name.replace(/\s+/g, '_') : 'শিক্ষার্থী';
      const periodClean = periodType;
      const filename = `ডি-লিকন_${getPeriodLabel().replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_')}_${studentNameClean}.pdf`;

      await downloadSingleElementAsPdf(
        containerId,
        filename,
        (status) => setExportProgress(status)
      );
    } catch (err) {
      console.error('PDF export error:', err);
      alert('পিডিএফ তৈরিতে সমস্যা হয়েছে। সরাসরি প্রিন্ট বোতামটি ব্যবহার করুন।');
    } finally {
      setIsExportingPdf(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-300 my-6 text-slate-900 print:border-none print:shadow-none print:p-0 print:my-0">
        
        {/* =========================================================
            HEADER & TOOLBAR (Hidden in Print)
            ========================================================= */}
        <div className="border-b pb-4 mb-5 print:hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                  <span>পর্যাবৃত্ত মূল্যায়ন রিপোর্ট জেনারেটর</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    সাপ্তাহিক • মাসিক • ত্রৈমাসিক • পরীক্ষা
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  ডি-লিকন মডেল একাডেমী • অভিভাবকের জন্য অফিসিয়াল অগ্রগতি সনদ ও প্রিন্ট সেন্টার
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
                title="সরাসরি A4 সাইজ পরিচ্ছন্ন PDF ফাইল ডাউনলোড করুন"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span>{isExportingPdf ? (exportProgress || 'PDF হচ্ছে...') : 'সরাসরি PDF ডাউনলোড'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                title="ব্রাউজার প্রিন্ট ডায়ালগ খুলুন"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Period Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            <button
              onClick={() => handlePeriodChange('weekly')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                periodType === 'weekly'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 mx-auto mb-1 text-amber-800" />
              <span className="block text-xs font-bold">১. সাপ্তাহিক রিপোর্ট</span>
              <span className="text-[10px] opacity-80">বিগত ৭ দিনের মূল্যায়ন</span>
            </button>

            <button
              onClick={() => handlePeriodChange('monthly')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                periodType === 'monthly'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4 mx-auto mb-1 text-teal-800" />
              <span className="block text-xs font-bold">২. মাসিক রিপোর্ট</span>
              <span className="text-[10px] opacity-80">বিগত ৩০ দিন / চলতি মাস</span>
            </button>

            <button
              onClick={() => handlePeriodChange('quarterly')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                periodType === 'quarterly'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 mx-auto mb-1 text-blue-800" />
              <span className="block text-xs font-bold">৩. ত্রৈমাসিক রিপোর্ট</span>
              <span className="text-[10px] opacity-80">৩ মাসের প্রান্তিক মূল্যায়ন</span>
            </button>

            <button
              onClick={() => handlePeriodChange('exam_term')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                periodType === 'exam_term'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Award className="w-4 h-4 mx-auto mb-1 text-purple-800" />
              <span className="block text-xs font-bold">৪. পরীক্ষা পর্যন্ত রিপোর্ট</span>
              <span className="text-[10px] opacity-80">পরীক্ষার পূর্বের পূর্ণ মূল্যায়ন</span>
            </button>

            <button
              onClick={() => handlePeriodChange('custom')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                periodType === 'custom'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Filter className="w-4 h-4 mx-auto mb-1 text-slate-800" />
              <span className="block text-xs font-bold">৫. কাস্টম তারিখ সীমা</span>
              <span className="text-[10px] opacity-80">নির্দিষ্ট সময় নির্বাচন</span>
            </button>
          </div>

          {/* Configuration Parameters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            {/* Class Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">শ্রেণি নির্বাচন:</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  const firstInClass = students.find(s => normalizeClassName(s.className) === e.target.value);
                  if (firstInClass) setSelectedStudentId(firstInClass.id);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 cursor-pointer"
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Student Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থী নির্বাচন:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 cursor-pointer"
              >
                {classStudents.map(stu => (
                  <option key={stu.id} value={stu.id}>
                    রোল {formatBanglaRoll(stu.roll)} - {stu.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope / Mode */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">রিপোর্ট ফরম্যাট:</label>
              <div className="flex items-center gap-1 mt-0.5">
                <button
                  type="button"
                  onClick={() => setReportScope('individual')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    reportScope === 'individual'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  একক শিক্ষার্থী সনদ
                </button>
                <button
                  type="button"
                  onClick={() => setReportScope('class_summary')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    reportScope === 'class_summary'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  পুরো শ্রেণি সারাংশ
                </button>
              </div>
            </div>

            {/* Date Range Inputs */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">কার্যকর তারিখ সীমা:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 bg-white border border-slate-300 rounded-lg p-1 text-[11px] font-mono"
                />
                <span className="text-slate-400">থেকে</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 bg-white border border-slate-300 rounded-lg p-1 text-[11px] font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            📄 REPORT CONTENT (INK-FRIENDLY, ZERO DARK FILLS, PURE WHITE)
            ========================================================= */}
        {reportScope === 'individual' && currentStudent ? (
          <div 
            id="periodic-individual-report-container"
            className="bg-white p-6 sm:p-8 border-2 border-slate-900 rounded-xl space-y-4 text-slate-950 font-serif print:border-none print:p-0 print:m-0"
          >
            {/* School Official Header (Ink-Saving) */}
            <div className="text-center pb-3 border-b-2 border-slate-900">
              <div className="flex items-center justify-center gap-3 mb-1">
                <SchoolLogo size={46} className="w-11 h-11" preferVector={true} />
                <div>
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
                    ডি-লিকন মডেল একাডেমী
                  </h1>
                  <p className="text-[12px] font-bold text-slate-800 tracking-wider font-sans">
                    D-LIKON MODEL ACADEMY
                  </p>
                </div>
              </div>
              <p className="text-[10.5px] text-slate-700 font-sans mt-0.5">
                মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর • স্থাপিত: ২০১৮ইং • প্রাতিষ্ঠানিক মূল্যায়ন ও পরীক্ষা নিয়ন্ত্রণ শাখা
              </p>
              
              {/* Report Title Badge */}
              <div className="mt-2.5 inline-block px-5 py-1.5 bg-white border-2 border-slate-900 font-black text-xs uppercase tracking-wider rounded-md font-sans shadow-2xs">
                {getPeriodLabel()} — অগ্রগতি ও আচরণ সনদ
              </div>
            </div>

            {/* Student Bio Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-white border border-slate-800 rounded-lg font-sans text-[11.5px]">
              <div>
                <span className="text-slate-600 block text-[10px]">শিক্ষার্থীর নাম:</span>
                <strong className="text-slate-950 text-[13px]">{currentStudent.name}</strong>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px]">শ্রেণি ও রোল:</span>
                <strong className="text-slate-950 text-[13px]">
                  {normalizeClassName(currentStudent.className)} • রোল: {formatBanglaRoll(currentStudent.roll)} ({normalizeSection(currentStudent.section)})
                </strong>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px]">পিতা / অভিভাবক:</span>
                <strong className="text-slate-950 text-[13px]">{currentStudent.guardianName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px]">মূল্যায়নের সময়কাল:</span>
                <strong className="text-slate-950 text-[12px] font-mono">
                  {startDate} হতে {endDate}
                </strong>
              </div>
            </div>

            {/* 🟢 ১. সামগ্রিক পারফরম্যান্স সারসংক্ষেপ (Cumulative Summary Metrics) */}
            <div className="border border-slate-800 rounded-lg p-3.5 font-sans space-y-2">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 text-xs font-black text-slate-950">
                <span>১. সামগ্রিক কার্যদিবস ও পারফরম্যান্স মেট্রিক্স ({studentMetrics.totalDays} দিনের মূল্যায়ন রেকর্ড)</span>
                <span className="px-2.5 py-0.5 border border-slate-900 rounded font-mono font-bold bg-white">
                  সার্বিক গ্রেড: {studentMetrics.gradeBadge}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                {/* 1. Attendance */}
                <div className="p-2 border border-slate-800 rounded-md bg-white">
                  <span className="block text-[10px] text-slate-600">১. উপস্থিতি হার</span>
                  <strong className="text-base font-black text-slate-950">{studentMetrics.attendanceRate}%</strong>
                  <span className="block text-[9.5px] text-slate-700">
                    উপস্থিত: {studentMetrics.presentDays} দিন | অনুপ: {studentMetrics.absentDays}
                  </span>
                </div>

                {/* 2. Handwriting */}
                <div className="p-2 border border-slate-800 rounded-md bg-white">
                  <span className="block text-[10px] text-slate-600">২. হাতের লেখা আনয়ন</span>
                  <strong className={`text-base font-black ${studentMetrics.hwNotBrought > 0 ? 'text-rose-800' : 'text-slate-950'}`}>
                    {studentMetrics.hwRate}%
                  </strong>
                  <span className="block text-[9.5px] text-slate-700">
                    এনেছে: {studentMetrics.hwBrought} | আনেনি: {studentMetrics.hwNotBrought} দিন
                  </span>
                </div>

                {/* 3. Lesson Preparation */}
                <div className="p-2 border border-slate-800 rounded-md bg-white">
                  <span className="block text-[10px] text-slate-600">৩. পড়া মুখস্ত প্রস্তুতি</span>
                  <strong className={`text-base font-black ${studentMetrics.lessonUnprepared > 0 ? 'text-amber-900' : 'text-slate-950'}`}>
                    {studentMetrics.lessonRate}%
                  </strong>
                  <span className="block text-[9.5px] text-slate-700">
                    মুখস্ত: {studentMetrics.lessonFull} | অপূর্ণ: {studentMetrics.lessonUnprepared}
                  </span>
                </div>

                {/* 4. Discipline */}
                <div className="p-2 border border-slate-800 rounded-md bg-white">
                  <span className="block text-[10px] text-slate-600">৪. শিষ্টাচার ও আচরণ</span>
                  <strong className={`text-base font-black ${studentMetrics.misconductCount > 0 ? 'text-rose-800' : 'text-slate-950'}`}>
                    {studentMetrics.misconductCount === 0 ? 'উত্তম ও সুশৃঙ্খল' : `${studentMetrics.misconductCount} বার লঙ্ঘন`}
                  </strong>
                  <span className="block text-[9.5px] text-slate-700">
                    {studentMetrics.misconductCount > 0 ? 'অভিভাবকের তদারকি প্রয়োজন' : 'ভদ্রোচিত ও পরিপাটি'}
                  </span>
                </div>
              </div>

              {/* Handwriting Quality Breakdown */}
              <div className="p-2 border border-dashed border-slate-400 rounded-md bg-white flex flex-wrap items-center justify-between text-[10.5px]">
                <span className="font-bold text-slate-800">হাতের লেখার মানের বিন্যাস:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span>খুব ভালো: <strong>{studentMetrics.hwQualityCounts['খুব ভালো']}</strong> দিন</span>
                  <span>ভালো: <strong>{studentMetrics.hwQualityCounts['ভালো']}</strong> দিন</span>
                  <span>মোটামুটি: <strong>{studentMetrics.hwQualityCounts['মোটামুটি']}</strong> দিন</span>
                  <span className={studentMetrics.hwQualityCounts['ভালো নয়'] > 0 ? 'text-rose-700 font-bold' : ''}>
                    ভালো নয়: <strong>{studentMetrics.hwQualityCounts['ভালো নয়']}</strong> দিন
                  </span>
                  <span className={studentMetrics.hwQualityCounts['খুবই খারাপ'] > 0 ? 'text-rose-800 font-bold underline' : ''}>
                    খুবই খারাপ: <strong>{studentMetrics.hwQualityCounts['খুবই খারাপ']}</strong> দিন
                  </span>
                </div>
              </div>
            </div>

            {/* 🟢 ২. মূল্যায়ন বিবরণী টেবিল (Chronological Daily Record Table) */}
            <div className="font-sans space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black text-slate-950">
                <span>২. সময়কালের দৈনিক মূল্যায়ন বিশদ বিবরণী ({studentEvaluations.length} টি রেকর্ড)</span>
                <span className="text-[10px] text-slate-600 font-normal">তারিখ ও বিষয়ভিত্তিক নিরীক্ষণ</span>
              </div>

              {studentEvaluations.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-400 rounded-lg text-center text-slate-500 text-xs bg-white">
                  নির্বাচিত সময়সীমায় ({startDate} থেকে {endDate}) এই শিক্ষার্থীর কোনো দৈনিক মূল্যায়ন এন্ট্রি পাওয়া যায়নি।
                </div>
              ) : (
                <table className="w-full border-collapse border border-slate-800 text-[10.5px] text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-800 font-bold text-slate-950">
                      <th className="p-1.5 border border-slate-800 w-8 text-center">ক্র.নং</th>
                      <th className="p-1.5 border border-slate-800 w-20 text-center">তারিখ</th>
                      <th className="p-1.5 border border-slate-800 w-24">বিষয়</th>
                      <th className="p-1.5 border border-slate-800 w-16 text-center">উপস্থিতি</th>
                      <th className="p-1.5 border border-slate-800 w-20 text-center">হাতের লেখা</th>
                      <th className="p-1.5 border border-slate-800 w-18 text-center">লেখার মান</th>
                      <th className="p-1.5 border border-slate-800 w-24 text-center">পড়া মুখস্তকরণ</th>
                      <th className="p-1.5 border border-slate-800 w-20 text-center">আচরণ</th>
                      <th className="p-1.5 border border-slate-800">শিক্ষকের পর্যবেক্ষণ ও মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentEvaluations.slice(0, 15).map((rec, idx) => (
                      <tr key={rec.id || idx} className="border-b border-slate-800">
                        <td className="p-1.5 border border-slate-800 text-center font-mono font-bold">
                          {formatBanglaRoll(idx + 1)}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center font-mono">
                          {rec.date}
                        </td>
                        <td className="p-1.5 border border-slate-800 font-semibold text-slate-950">
                          {rec.subject}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center font-bold">
                          {rec.attendance === 'উপস্থিত' ? 'উপস্থিত' : 'অনুপস্থিত'}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center font-bold">
                          {rec.handwritingBrought === 'আনেনি' ? (
                            <span className="text-rose-800 underline">⚠️ আনেনি</span>
                          ) : 'এনেছে'}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center">
                          {rec.handwritingQuality}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center font-bold">
                          {rec.lessonPreparation === 'মুখস্ত করেনি' ? (
                            <span className="text-rose-800 underline">⚠️ করেনি</span>
                          ) : rec.lessonPreparation}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-center font-bold">
                          {rec.behavior === 'শিষ্টাচার লঙ্ঘন করেছে' ? (
                            <span className="text-rose-800 underline">⚠️ লঙ্ঘন</span>
                          ) : 'স্বাভাবিক'}
                        </td>
                        <td className="p-1.5 border border-slate-800 text-slate-800 text-[10px]">
                          {rec.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 🟢 ৩. শিক্ষকের সামগ্রিক মূল্যায়ন ও অভিভাবকের প্রতি পরামর্শ */}
            <div className="p-3 border-2 border-slate-800 rounded-lg font-sans text-[11px] bg-white space-y-1">
              <strong className="block text-slate-950 font-black">
                ৩. শ্রেণি শিক্ষকের সামগ্রিক অভিমত ও অভিভাবকের প্রতি সুনির্দিষ্ট নির্দেশনা:
              </strong>
              <p className="text-slate-800 leading-relaxed">
                উক্ত {getPeriodLabel()} পর্যালোচনায় শিক্ষার্থীর সার্বিক অবস্থান <strong>"{studentMetrics.gradeTitle}"</strong>। 
                {studentMetrics.hwNotBrought > 0 && ` শিক্ষার্থী মূল্যায়িত সময়ে ${studentMetrics.hwNotBrought} দিন বাড়ির হাতের লেখা আনেনি, তাই নিয়মিত বাড়ির কাজ তদারকি করতে অনুরোধ করা হলো।`}
                {studentMetrics.lessonUnprepared > 0 && ` পাঠ প্রস্তুতিতে ${studentMetrics.lessonUnprepared} দিন দুর্বলতা লক্ষ্য করা গেছে। বাড়িতে নিয়মিত মুখস্ত অনুশীলন বৃদ্ধি করা প্রয়োজন।`}
                {studentMetrics.misconductCount > 0 && ` ক্লাসে শৃঙ্খলা ভঙ্গের রেকর্ড রয়েছে, সন্তানকে নম্র ও শ্রদ্ধাশীল আচরণে উৎসাহিত করুন।`}
                {studentMetrics.hwNotBrought === 0 && studentMetrics.lessonUnprepared === 0 && studentMetrics.misconductCount === 0 && (
                  ` শিক্ষার্থী নিয়মিত বাড়ির কাজ জমা দেয়, পড়া মুখস্ত করে আসে এবং উত্তম আচরণ বজায় রাখে। এই ধারাবাহিকতা বজায় রাখতে অভিভাবককে অভিনন্দন জানানো যাচ্ছে।`
                )}
              </p>
            </div>

            {/* 🟢 ৪. অফিশিয়াল সিল ও স্বাক্ষর ব্লক (Official 3-Signature Block) */}
            <div className="pt-8 grid grid-cols-3 gap-6 text-center font-sans text-xs">
              <div>
                <div className="border-t border-dashed border-slate-900 pt-1">
                  <strong className="block text-slate-950">শ্রেণি শিক্ষকের স্বাক্ষর</strong>
                  <span className="text-[10px] text-slate-600 font-mono">তারিখ: {todayStr}</span>
                </div>
              </div>

              <div>
                <div className="border-t border-dashed border-slate-900 pt-1">
                  <strong className="block text-slate-950">প্রধান শিক্ষকের সিল ও স্বাক্ষর</strong>
                  <span className="text-[10px] text-slate-600">ডি-লিকন মডেল একাডেমী</span>
                </div>
              </div>

              <div>
                <div className="border-t border-dashed border-slate-900 pt-1">
                  <strong className="block text-slate-950">অভিভাবকের স্বাক্ষর ও তারিখ</strong>
                  <span className="text-[10px] text-slate-600">স্বাক্ষরপূর্বক অফিসে জমা দিন</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
              FULL CLASS PERIODIC SUMMARY REGISTER
              ========================================================= */
          <div 
            id="periodic-class-summary-container"
            className="bg-white p-6 border-2 border-slate-900 rounded-xl space-y-4 text-slate-950 font-serif print:border-none print:p-0"
          >
            <div className="text-center pb-3 border-b-2 border-slate-900">
              <div className="flex items-center justify-center gap-3 mb-1">
                <SchoolLogo size={42} className="w-10 h-10" preferVector={true} />
                <h2 className="text-xl font-black text-slate-950 tracking-tight">
                  ডি-লিকন মডেল একাডেমী
                </h2>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {selectedClass} — {getPeriodLabel()} (সকল শিক্ষার্থীর পারফরম্যান্স শিট)
              </p>
              <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                সময়কাল: {startDate} থেকে {endDate} | মোট শিক্ষার্থী: {classStudents.length} জন
              </p>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px] text-left font-sans">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800 font-bold text-slate-950">
                  <th className="p-1.5 border border-slate-800 w-10 text-center">রোল</th>
                  <th className="p-1.5 border border-slate-800">শিক্ষার্থীর নাম</th>
                  <th className="p-1.5 border border-slate-800 w-24 text-center">মূল্যায়ন দিবস</th>
                  <th className="p-1.5 border border-slate-800 w-24 text-center">উপস্থিতি হার</th>
                  <th className="p-1.5 border border-slate-800 w-28 text-center">হাতের লেখা আনেনি</th>
                  <th className="p-1.5 border border-slate-800 w-28 text-center">পড়া মুখস্ত করেনি</th>
                  <th className="p-1.5 border border-slate-800 w-24 text-center">শিষ্টাচার লঙ্ঘন</th>
                  <th className="p-1.5 border border-slate-800 w-24 text-center">সার্বিক মান</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map(stu => {
                  const evs = filteredEvaluations.filter(e => 
                    e.studentId === stu.id ||
                    (e.roll === formatBanglaRoll(stu.roll) && normalizeClassName(e.className) === selectedClass)
                  );
                  const total = evs.length;
                  const pres = evs.filter(e => e.attendance === 'উপস্থিত').length;
                  const rate = total > 0 ? Math.round((pres / total) * 100) : 100;
                  const noHw = evs.filter(e => e.handwritingBrought === 'আনেনি').length;
                  const noLesson = evs.filter(e => e.lessonPreparation === 'মুখস্ত করেনি').length;
                  const misconduct = evs.filter(e => e.behavior === 'শিষ্টাচার লঙ্ঘন করেছে').length;

                  return (
                    <tr key={stu.id} className="border-b border-slate-800">
                      <td className="p-1.5 border border-slate-800 text-center font-mono font-bold">
                        {formatBanglaRoll(stu.roll)}
                      </td>
                      <td className="p-1.5 border border-slate-800 font-bold">
                        {stu.name}
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center font-mono">
                        {total} দিন
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center font-mono font-bold">
                        {rate}%
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center font-bold">
                        {noHw > 0 ? <span className="text-rose-800">{noHw} দিন</span> : '০ দিন'}
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center font-bold">
                        {noLesson > 0 ? <span className="text-amber-800">{noLesson} দিন</span> : '০ দিন'}
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center font-bold">
                        {misconduct > 0 ? <span className="text-rose-800 font-black">{misconduct} বার</span> : 'স্বাভাবিক'}
                      </td>
                      <td className="p-1.5 border border-slate-800 text-center font-bold">
                        {rate >= 80 && noHw === 0 && noLesson === 0 ? 'উত্তম' : 'সন্তোষজনক'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pt-8 flex items-center justify-between font-sans text-xs">
              <div className="text-center w-48 border-t border-dashed border-slate-900 pt-1">
                <strong>শ্রেণি শিক্ষকের স্বাক্ষর</strong>
              </div>
              <div className="text-center w-48 border-t border-dashed border-slate-900 pt-1">
                <strong>প্রধান শিক্ষকের সিল ও স্বাক্ষর</strong>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
