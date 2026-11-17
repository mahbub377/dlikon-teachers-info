import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Printer,
  Download,
  CheckCircle2,
  BookOpen,
  Calendar
} from 'lucide-react';
import { SCHOOL_CLASSES, SyllabusItem, ACADEMY_EXAMS_9 } from '../../types/adminTypes';
import { downloadSingleElementAsPdf, printViaIsolatedIframe } from '../../utils/pdfExport';

const STORAGE_ADMIN_SYLLABUS = 'dlma_admin_syllabus_v1';
const STORAGE_SUBJECT_SYLLABUS = 'dlma_tt_subject_syllabus_v1';

interface ChapterUnit {
  id: string;
  chapterNo: string;
  title: string;
  termName: string;
  totalClasses: string;
  scheduleWeek: string;
  assessmentMethod: string;
}

interface SubjectSyllabusPlan {
  id: string;
  className: string;
  subject: string;
  academicYear: string;
  teacherName: string;
  units: ChapterUnit[];
  updatedAt: string;
}

const TERM_OPTIONS = [
  ...ACADEMY_EXAMS_9.map((e) => e.label),
  'বৃত্তি প্রস্তুতি ও মডেল টেস্ট ২০২৬'
];

const toBanglaDigits = (val: number | string): string => {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => map[Number(d)]);
};

const createBlankMasterSyllabus = (cls: string): SyllabusItem => ({
  id: `syl_${cls}_${Date.now()}`,
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

export const SyllabusMakerPanel: React.FC = () => {
  const [subMode, setSubMode] = useState<'subject_planner' | 'master_11'>('subject_planner');

  // --- Mode 1: Subject & Chapter-wise Syllabus Maker ---
  const [savedSubjectPlans, setSavedSubjectPlans] = useState<SubjectSyllabusPlan[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SUBJECT_SYLLABUS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [planId, setPlanId] = useState<string>(() => `sp_${Date.now()}`);
  const [selectedClass, setSelectedClass] = useState<string>('৫ম শ্রেণি');
  const [subject, setSubject] = useState('প্রাথমিক গণিত');
  const [academicYear, setAcademicYear] = useState('২০২৬');
  const [teacherName, setTeacherName] = useState('');
  const [units, setUnits] = useState<ChapterUnit[]>([
    {
      id: 'u_1',
      chapterNo: 'অধ্যায় ১',
      title: 'গুণ ও ভাগ পদ্ধতি অনুশীলন',
      termName: ACADEMY_EXAMS_9[0].label,
      totalClasses: '৬',
      scheduleWeek: 'জানুয়ারি ১ম-২য় সপ্তাহ',
      assessmentMethod: '১ম পার্বিক পরীক্ষা (১০০ নম্বর)'
    },
    {
      id: 'u_2',
      chapterNo: 'অধ্যায় ২ ও ৩',
      title: 'চার প্রক্রিয়া সম্পর্কিত সমস্যাবলি',
      termName: ACADEMY_EXAMS_9[1].label,
      totalClasses: '৮',
      scheduleWeek: 'ফেব্রুয়ারি ৩য়-৪র্থ সপ্তাহ',
      assessmentMethod: '২য় পার্বিক ও শ্রেণি অনুশীলন'
    },
    {
      id: 'u_3',
      chapterNo: 'অধ্যায় ১-৪',
      title: 'প্রথম সাময়িক পূর্ণাঙ্গ রিভিশন ও সৃজনশীল',
      termName: ACADEMY_EXAMS_9[2].label,
      totalClasses: '১০',
      scheduleWeek: 'এপ্রিল ১ম-২য় সপ্তাহ',
      assessmentMethod: 'প্রথম সাময়িক মেয়াদী পরীক্ষা'
    }
  ]);

  // Add Chapter Unit Inputs
  const [chapterNo, setChapterNo] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [termName, setTermName] = useState(TERM_OPTIONS[0]);
  const [totalClasses, setTotalClasses] = useState('৬');
  const [scheduleWeek, setScheduleWeek] = useState('');
  const [assessmentMethod, setAssessmentMethod] = useState('শ্রেণি মূল্যায়ন ও পরীক্ষা');

  // --- Mode 2: 11-Step Master Exam Syllabus (Synced with Admin Hub) ---
  const [masterSyllabusList, setMasterSyllabusList] = useState<SyllabusItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_SYLLABUS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [masterClass, setMasterClass] = useState<string>('৫ম শ্রেণি');
  const [currentMaster, setCurrentMaster] = useState<SyllabusItem>(() => {
    const found = masterSyllabusList.find((s) => s.className === '৫ম শ্রেণি');
    return found || createBlankMasterSyllabus('৫ম শ্রেণি');
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUBJECT_SYLLABUS, JSON.stringify(savedSubjectPlans));
    } catch {
      // ignore
    }
  }, [savedSubjectPlans]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3200);
  };

  const handleMasterClassChange = (cls: string) => {
    setMasterClass(cls);
    const found = masterSyllabusList.find((s) => s.className === cls);
    setCurrentMaster(found || createBlankMasterSyllabus(cls));
  };

  const handleSaveMasterSyllabus = () => {
    const updatedItem: SyllabusItem = {
      ...currentMaster,
      className: masterClass,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };
    const nextList = [
      ...masterSyllabusList.filter((s) => s.className !== masterClass),
      updatedItem
    ];
    setMasterSyllabusList(nextList);
    try {
      localStorage.setItem(STORAGE_ADMIN_SYLLABUS, JSON.stringify(nextList));
    } catch {
      // ignore
    }
    showToast(`${masterClass} এর সামগ্রিক সিলেবাস এডমিন হাবসহ সংরক্ষিত হয়েছে।`);
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitTitle.trim()) return;
    const newUnit: ChapterUnit = {
      id: `u_${Date.now()}`,
      chapterNo: chapterNo.trim() || `অধ্যায় ${toBanglaDigits(units.length + 1)}`,
      title: unitTitle.trim(),
      termName,
      totalClasses: totalClasses.trim() || '৫',
      scheduleWeek: scheduleWeek.trim() || 'নির্ধারিত সপ্তাহ',
      assessmentMethod: assessmentMethod.trim() || 'শ্রেণি মূল্যায়ন'
    };
    setUnits((prev) => [...prev, newUnit]);
    setChapterNo('');
    setUnitTitle('');
    setScheduleWeek('');
    showToast('নতুন অধ্যায় সিলেবাসে যুক্ত হয়েছে।');
  };

  const handleSaveSubjectPlan = () => {
    const plan: SubjectSyllabusPlan = {
      id: planId,
      className: selectedClass,
      subject: subject.trim() || 'সাধারণ',
      academicYear: academicYear.trim() || '২০২৬',
      teacherName: teacherName.trim(),
      units,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };
    setSavedSubjectPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === planId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = plan;
        return next;
      }
      return [plan, ...prev];
    });
    showToast('বিষয়ভিত্তিক সিলেবাস সংরক্ষিত হয়েছে।');
  };

  const handleLoadSubjectPlan = (p: SubjectSyllabusPlan) => {
    setPlanId(p.id);
    setSelectedClass(p.className);
    setSubject(p.subject);
    setAcademicYear(p.academicYear);
    setTeacherName(p.teacherName);
    setUnits(p.units);
    showToast(`"${p.className} - ${p.subject}" লোড করা হয়েছে।`);
  };

  const handleDeleteSubjectPlan = (id: string) => {
    setSavedSubjectPlans((prev) => prev.filter((p) => p.id !== id));
    showToast('সিলেবাস মুছে ফেলা হয়েছে।');
  };

  const printElementId =
    subMode === 'subject_planner' ? 'tt-printable-subject-syllabus' : 'tt-printable-master-syllabus';

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const clsName = subMode === 'subject_planner' ? `${selectedClass}_${subject}` : masterClass;
      await downloadSingleElementAsPdf(printElementId, `সিলেবাস_${clsName}.pdf`);
      showToast('সিলেবাস PDF ডাউনলোড সম্পন্ন হয়েছে।');
    } catch {
      showToast('PDF তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const totalClassesCount = units.reduce((sum, u) => {
    const en = u.totalClasses.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
    const n = parseInt(en, 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Action & Mode Selector */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setSubMode('subject_planner')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subMode === 'subject_planner'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            বিষয় ও অধ্যায়ভিত্তিক সিলেবাস মেকার
          </button>
          <button
            type="button"
            onClick={() => setSubMode('master_11')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subMode === 'master_11'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ৯ পরীক্ষার মাস্টার সিলেবাস (পার্বিক ও সাময়িক)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statusMessage && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mr-1">
              <CheckCircle2 className="w-4 h-4" />
              {statusMessage}
            </span>
          )}
          <button
            type="button"
            onClick={subMode === 'subject_planner' ? handleSaveSubjectPlan : handleSaveMasterSyllabus}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            সংরক্ষণ করুন
          </button>
          <button
            type="button"
            onClick={() => printViaIsolatedIframe(printElementId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            প্রিন্ট
          </button>
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            {isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}
          </button>
        </div>
      </div>

      {/* MODE 1: SUBJECT & CHAPTER PLANNER */}
      {subMode === 'subject_planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Builder Form */}
          <div className="no-print lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                সিলেবাস পরিচিতি
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">শ্রেণি</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">বিষয়</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">শিক্ষাবর্ষ</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">প্রস্তুতকারী শিক্ষক</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="শিক্ষকের নাম"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleAddUnit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                নতুন অধ্যায় / পাঠ ইউনিট যোগ করুন
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">অধ্যায় নম্বর</label>
                  <input
                    type="text"
                    value={chapterNo}
                    onChange={(e) => setChapterNo(e.target.value)}
                    placeholder="যেমন: অধ্যায় ৩"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">পরীক্ষার পর্ব</label>
                  <select
                    value={termName}
                    onChange={(e) => setTermName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {TERM_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">পাঠ ও বিষয়বস্তুর শিরোনাম</label>
                <input
                  type="text"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  placeholder="যেমন: জ্যামিতিক আকৃতি ও কোণ পরিমাপ"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">সম্ভাব্য সপ্তাহ / মাস</label>
                  <input
                    type="text"
                    value={scheduleWeek}
                    onChange={(e) => setScheduleWeek(e.target.value)}
                    placeholder="যেমন: ফেব্রুয়ারি ২য় সপ্তাহ"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">মোট ক্লাস সংখ্যা</label>
                  <input
                    type="text"
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">মূল্যায়ন পদ্ধতি</label>
                <input
                  type="text"
                  value={assessmentMethod}
                  onChange={(e) => setAssessmentMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                সিলেবাসে অধ্যায় যোগ করুন
              </button>
            </form>

            {savedSubjectPlans.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  সংরক্ষিত বিষয়ভিত্তিক সিলেবাস ({toBanglaDigits(savedSubjectPlans.length)})
                </h4>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {savedSubjectPlans.map((p) => (
                    <div key={p.id} className="py-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadSubjectPlan(p)}
                        className="text-left flex-1 min-w-0 cursor-pointer group"
                      >
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700 truncate">
                          {p.className} · {p.subject} ({p.academicYear})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {toBanglaDigits(p.units.length)}টি অধ্যায় · আপডেট: {p.updatedAt}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubjectPlan(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Printable Subject Syllabus Table */}
          <div className="lg:col-span-7">
            <div
              id="tt-printable-subject-syllabus"
              className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs text-slate-900 space-y-5"
            >
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h1 className="text-xl font-black text-slate-950">ডি-লিকন মডেল একাডেমী</h1>
                <p className="text-xs text-slate-600">
                  মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর · শিক্ষাবর্ষ: {academicYear}
                </p>
                <h2 className="text-base font-bold text-slate-900 mt-2">
                  বার্ষিক পাঠ্যক্রম ও বিষয়ভিত্তিক সিলেবাস পরিকল্পনা
                </h2>
                <div className="flex flex-wrap justify-between items-center text-xs font-semibold text-slate-800 mt-3 pt-2 border-t border-slate-200">
                  <span>শ্রেণি: {selectedClass}</span>
                  <span>বিষয়: {subject}</span>
                  <span className="tabular-nums">
                    মোট অধ্যায়: {toBanglaDigits(units.length)} · মোট ক্লাস: {toBanglaDigits(totalClassesCount)}টি
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold">
                    <tr>
                      <th className="p-2.5 border border-slate-300">পরীক্ষার পর্ব</th>
                      <th className="p-2.5 border border-slate-300">অধ্যায়</th>
                      <th className="p-2.5 border border-slate-300">পাঠের শিরোনাম ও বিষয়বস্তু</th>
                      <th className="p-2.5 border border-slate-300">সময়সূচী</th>
                      <th className="p-2.5 border border-slate-300 text-right">ক্লাস</th>
                      <th className="p-2.5 border border-slate-300">মূল্যায়ন</th>
                      <th className="no-print p-2.5 border border-slate-300 text-center">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          বাম পাশ থেকে নতুন অধ্যায় যোগ করুন।
                        </td>
                      </tr>
                    ) : (
                      units.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70">
                          <td className="p-2.5 border border-slate-300 font-medium text-slate-800">
                            {u.termName}
                          </td>
                          <td className="p-2.5 border border-slate-300 font-semibold text-slate-900">
                            {u.chapterNo}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-slate-800">{u.title}</td>
                          <td className="p-2.5 border border-slate-300 text-slate-600">
                            {u.scheduleWeek}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-right tabular-nums font-semibold">
                            {u.totalClasses}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-slate-600">
                            {u.assessmentMethod}
                          </td>
                          <td className="no-print p-2.5 border border-slate-300 text-center">
                            <button
                              type="button"
                              onClick={() => setUnits((prev) => prev.filter((item) => item.id !== u.id))}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-8 flex justify-between items-end text-xs text-slate-600">
                <div>
                  <p className="border-t border-slate-400 pt-1 px-3">
                    {teacherName ? `প্রস্তুতকারী: ${teacherName}` : 'বিষয় শিক্ষকের স্বাক্ষর'}
                  </p>
                </div>
                <div>
                  <p className="border-t border-slate-400 pt-1 px-3">প্রধান শিক্ষকের অনুমোদন</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: 9-EXAM MASTER SYLLABUS (Synced with Admin Hub) */}
      {subMode === 'master_11' && (
        <div className="space-y-5">
          <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-teal-700" />
              <label className="text-xs font-bold text-slate-800">শ্রেণি নির্বাচন করুন:</label>
              <select
                value={masterClass}
                onChange={(e) => handleMasterClassChange(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                {SCHOOL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500">
              ৬টি পার্বিক (১০০ নম্বরের ১ দিনের পরীক্ষা) ও ৩টি সাময়িক/বার্ষিক (মেয়াদী পরীক্ষা) — এডমিন হাবের সাথে স্বয়ংক্রিয়ভাবে সমন্বিত
            </p>
          </div>

          <div
            id="tt-printable-master-syllabus"
            className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 space-y-6"
          >
            <div className="text-center border-b-2 border-slate-800 pb-3">
              <h2 className="text-lg font-black text-slate-950">ডি-লিকন মডেল একাডেমী</h2>
              <p className="text-xs text-slate-600">
                {masterClass} · বাৎসরিক ৯ পরীক্ষার সমন্বিত সিলেবাস (৬টি পার্বিক + ৩টি সাময়িক ও বার্ষিক)
              </p>
            </div>

            {(['১ম সাময়িক পর্ব', '২য় সাময়িক পর্ব', 'বার্ষিক পর্ব'] as const).map((groupName) => (
              <div key={groupName} className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">
                  {groupName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ACADEMY_EXAMS_9.filter((ex) => ex.termGroup === groupName).map((exam) => (
                    <div
                      key={exam.id}
                      className={`p-3 rounded-lg border space-y-1.5 ${
                        exam.category === 'term'
                          ? 'bg-indigo-50/40 border-indigo-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <label className="block text-xs font-bold text-slate-800">
                        {exam.order}। {exam.label}
                      </label>
                      <p className="text-[11px] text-slate-500">{exam.description}</p>
                      <textarea
                        rows={3}
                        value={currentMaster[exam.syllabusField] || ''}
                        onChange={(e) =>
                          setCurrentMaster({
                            ...currentMaster,
                            [exam.syllabusField]: e.target.value
                          })
                        }
                        placeholder={`${exam.shortLabel} এর সিলেবাস...`}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ১০। বিশেষ শিক্ষণ নোট ও পরীক্ষার মানবণ্টন নির্দেশনা
              </label>
              <textarea
                rows={2}
                value={currentMaster.notes || ''}
                onChange={(e) => setCurrentMaster({ ...currentMaster, notes: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
