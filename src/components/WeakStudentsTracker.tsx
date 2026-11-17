import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Upload,
  Filter
} from 'lucide-react';
import { StudentRecord, SCHOOL_CLASSES } from '../types/adminTypes';
import {
  normalizeClassName,
  parseRollNumber,
  formatBanglaRoll
} from '../utils/studentExcelParser';

const STORAGE_STUDENTS = 'dlma_admin_students_v2';
const STORAGE_WEAK_STUDENTS = 'dlma_weak_students_v1';

export interface WeakStudentItem {
  id: string;
  studentId?: string;
  name: string;
  roll: string;
  className: string;
  subject: string;
  issue: string;
  solved: boolean;
  addedAt: string;
}

const WEAK_SUBJECT_OPTIONS = [
  'বাংলা',
  'ইংরেজি',
  'গণিত',
  'বিজ্ঞান',
  'বাংলাদেশ ও বিশ্বপরিচয়',
  'ইসলাম ও নৈতিক শিক্ষা',
  'হাতের লেখা / অঙ্কন',
  'সকল বিষয়'
];

interface WeakStudentsTrackerProps {
  onOpenBulkUpload?: () => void;
}

export const WeakStudentsTracker: React.FC<WeakStudentsTrackerProps> = ({
  onOpenBulkUpload
}) => {
  // Load all uploaded students from Admin Hub storage
  const [uploadedStudents, setUploadedStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Load persisted weak students list (no fake demo data)
  const [weakStudents, setWeakStudents] = useState<WeakStudentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WEAK_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Sync if students were updated in another tab/view
  useEffect(() => {
    const syncStudents = () => {
      try {
        const saved = localStorage.getItem(STORAGE_STUDENTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setUploadedStudents(parsed);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', syncStudents);
    return () => window.removeEventListener('storage', syncStudents);
  }, []);

  const persistWeakStudents = (updated: WeakStudentItem[]) => {
    setWeakStudents(updated);
    try {
      localStorage.setItem(STORAGE_WEAK_STUDENTS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Class Counts across all 12 classes
  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SCHOOL_CLASSES.forEach(cls => {
      counts[cls] = uploadedStudents.filter(s => normalizeClassName(s.className) === cls).length;
    });
    return counts;
  }, [uploadedStudents]);

  // Default selected class to first class that has students, or '৫ম শ্রেণি'
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    const firstNonEmpty = SCHOOL_CLASSES.find(cls =>
      uploadedStudents.some(s => normalizeClassName(s.className) === cls)
    );
    return firstNonEmpty || '৫ম শ্রেণি';
  });

  // Students of the currently selected class sorted sequentially by roll
  const classStudents = useMemo(() => {
    return uploadedStudents
      .filter(s => normalizeClassName(s.className) === selectedClass)
      .sort((a, b) => parseRollNumber(a.roll) - parseRollNumber(b.roll));
  }, [uploadedStudents, selectedClass]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [quickRollInput, setQuickRollInput] = useState<string>('');
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualRoll, setManualRoll] = useState<string>('');
  const [subject, setSubject] = useState<string>('গণিত');
  const [issue, setIssue] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Table Filters
  const [filterClass, setFilterClass] = useState<string>('সকল শ্রেণি');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'solved'>('all');

  // Auto-select first student when changing class if available
  useEffect(() => {
    if (classStudents.length > 0) {
      setSelectedStudentId(classStudents[0].id);
      setQuickRollInput('');
      setManualMode(false);
    } else {
      setSelectedStudentId('');
      setQuickRollInput('');
    }
  }, [selectedClass, classStudents]);

  // Instant Roll Lookup inside selected class
  const handleQuickRollChange = (val: string) => {
    setQuickRollInput(val);
    if (!val.trim() || classStudents.length === 0) return;

    const targetNum = parseRollNumber(val);
    const match = classStudents.find(
      s => parseRollNumber(s.roll) === targetNum || s.roll.includes(val.trim())
    );
    if (match) {
      setSelectedStudentId(match.id);
    }
  };

  const selectedStudentObj = useMemo(() => {
    return classStudents.find(s => s.id === selectedStudentId) || null;
  }, [classStudents, selectedStudentId]);

  const showTempMessage = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const handleAddWeakStudent = (e: React.FormEvent) => {
    e.preventDefault();

    let finalName = '';
    let finalRoll = '';
    let linkedStudentId: string | undefined;

    if (!manualMode && selectedStudentObj) {
      finalName = selectedStudentObj.name;
      finalRoll = formatBanglaRoll(selectedStudentObj.roll);
      linkedStudentId = selectedStudentObj.id;
    } else {
      if (!manualName.trim()) {
        showTempMessage('error', 'অনুগ্রহ করে তালিকা থেকে শিক্ষার্থী নির্বাচন করুন অথবা নাম লিখুন।');
        return;
      }
      finalName = manualName.trim();
      finalRoll = manualRoll.trim() ? formatBanglaRoll(manualRoll.trim()) : '—';
    }

    const newItem: WeakStudentItem = {
      id: `wk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      studentId: linkedStudentId,
      name: finalName,
      roll: finalRoll,
      className: selectedClass,
      subject,
      issue: issue.trim() || 'নির্দিষ্ট পাঠে অতিরিক্ত সহায়তা প্রয়োজন',
      solved: false,
      addedAt: new Date().toLocaleDateString('bn-BD')
    };

    persistWeakStudents([newItem, ...weakStudents]);
    setIssue('');
    setQuickRollInput('');
    setManualName('');
    setManualRoll('');
    showTempMessage('success', `${finalName} (${selectedClass}, রোল: ${finalRoll}) তালিকায় যুক্ত হয়েছে।`);
  };

  const filteredWeakStudents = useMemo(() => {
    return weakStudents.filter(st => {
      if (filterClass !== 'সকল শ্রেণি' && st.className !== filterClass) return false;
      if (filterStatus === 'pending' && st.solved) return false;
      if (filterStatus === 'solved' && !st.solved) return false;
      return true;
    });
  }, [weakStudents, filterClass, filterStatus]);

  const classesWithDataCount = SCHOOL_CLASSES.filter(cls => (classStudentCounts[cls] || 0) > 0).length;

  return (
    <div className="space-y-5">
      {/* Data Readiness Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1 text-xs">
          <div className="font-bold text-slate-900">
            শ্রেণিভিত্তিক শিক্ষার্থী ডেটাবেজ অবস্থা: {classesWithDataCount} / {SCHOOL_CLASSES.length} শ্রেণির ডেটা আপলোডকৃত (মোট {uploadedStudents.length} জন)
          </div>
          <p className="text-slate-600">
            {classStudents.length > 0
              ? `বর্তমান নির্বাচিত [${selectedClass}]: ${classStudents.length} জন শিক্ষার্থী রোল অনুযায়ী ড্রপডাউনে প্রস্তুত।`
              : `বর্তমান নির্বাচিত [${selectedClass}]-তে এখনও কোনো শিক্ষার্থীর এক্সেল ফাইল আপলোড করা হয়নি।`}
          </p>
        </div>

        {onOpenBulkUpload && (
          <button
            type="button"
            onClick={onOpenBulkUpload}
            className="no-print inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>এডমিন হাবে বাল্ক এক্সেল আপলোড করুন</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Rapid Class + Roll Dropdown Quick-Add Form */}
      <form
        onSubmit={handleAddWeakStudent}
        className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900">
            শ্রেণি ও রোল নির্বাচন করে দ্রুত দুর্বল শিক্ষার্থী যুক্ত করুন
          </h3>
          {classStudents.length > 0 && (
            <button
              type="button"
              onClick={() => setManualMode(prev => !prev)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline cursor-pointer self-start sm:self-center"
            >
              {manualMode ? 'ড্রপডাউন তালিকা থেকে বাছুন' : 'তালিকার বাইরে ম্যানুয়ালি লিখুন'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* 1. Class Dropdown */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ১. শ্রেণি নির্বাচন
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 cursor-pointer"
            >
              {SCHOOL_CLASSES.map(cls => {
                const cnt = classStudentCounts[cls] || 0;
                return (
                  <option key={cls} value={cls}>
                    {cls} ({cnt > 0 ? `${cnt} জন` : 'খালি'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Quick Roll Lookup + Student Dropdown OR Manual Fallback */}
          {!manualMode && classStudents.length > 0 ? (
            <>
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ২. রোল খুঁজুন
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={quickRollInput}
                    onChange={(e) => handleQuickRollChange(e.target.value)}
                    placeholder="যেমন: ০৫ বা 5"
                    className="w-full text-xs pl-8 pr-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ৩. শিক্ষার্থী ও রোল (ড্রপডাউন তালিকা)
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 cursor-pointer"
                >
                  {classStudents.map(stu => (
                    <option key={stu.id} value={stu.id}>
                      রোল {formatBanglaRoll(stu.roll)} — {stu.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ২. রোল নম্বর
                </label>
                <input
                  type="text"
                  value={manualRoll}
                  onChange={(e) => setManualRoll(e.target.value)}
                  placeholder="যেমন: ০৫"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ৩. শিক্ষার্থীর নাম
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="শিক্ষার্থীর নাম লিখুন"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  required={manualMode || classStudents.length === 0}
                />
              </div>
            </>
          )}

          {/* 4. Subject Dropdown */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ৪. বিষয়
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 cursor-pointer"
            >
              {WEAK_SUBJECT_OPTIONS.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Issue description + Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              list="weak-student-issue-presets"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="সমস্যা / দুর্বলতার ধরন লিখুন (যেমন: ভগ্নাংশ বুঝতে সমস্যা, বানান ভুল, হাতের লেখা অস্পষ্ট)..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none"
            />
            <datalist id="weak-student-issue-presets">
              <option value="বানান ও বাংলা পঠনে দুর্বলতা" />
              <option value="ইংরেজি রিডিং ও শব্দার্থে জড়তা" />
              <option value="গণিতের মৌলিক হিসাব বুঝতে সমস্যা" />
              <option value="হাতের লেখা অস্পষ্ট ও অনুশীলনের অভাব" />
              <option value="শ্রেণিকক্ষের পড়া মুখস্ত না করে আসা" />
              <option value="বাড়ির কাজ নিয়মিত সম্পন্ন না করা" />
            </datalist>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>তালিকায় যুক্ত করুন</span>
          </button>
        </div>
      </form>

      {/* Filter Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> ফিল্টার:
          </span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 cursor-pointer"
          >
            <option value="সকল শ্রেণি">সকল শ্রেণি</option>
            {SCHOOL_CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'solved')}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 cursor-pointer"
          >
            <option value="all">সকল অবস্থা ({weakStudents.length})</option>
            <option value="pending">যত্ন প্রয়োজন ({weakStudents.filter(s => !s.solved).length})</option>
            <option value="solved">সমাধান হয়েছে ({weakStudents.filter(s => s.solved).length})</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono tabular-nums">
          প্রদর্শিত: {filteredWeakStudents.length} জন
        </span>
      </div>

      {/* Weak Students List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        {filteredWeakStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            এই তালিকায় এখনও কোনো দুর্বল শিক্ষার্থী যুক্ত করা হয়নি। উপরে শ্রেণি ও রোল নির্বাচন করে দ্রুত যুক্ত করুন।
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="p-3">অবস্থা</th>
                <th className="p-3">রোল</th>
                <th className="p-3">শিক্ষার্থীর নাম</th>
                <th className="p-3">শ্রেণি</th>
                <th className="p-3">বিষয়</th>
                <th className="p-3">সমস্যা / প্রতিকারমূলক লক্ষ্য</th>
                <th className="p-3 text-right no-print">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWeakStudents.map((st) => (
                <tr key={st.id} className={st.solved ? 'bg-emerald-50/40 text-slate-500' : 'hover:bg-slate-50'}>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      onClick={() => {
                        persistWeakStudents(
                          weakStudents.map(s => (s.id === st.id ? { ...s, solved: !s.solved } : s))
                        );
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                        st.solved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {st.solved ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-700" />
                      )}
                      <span>{st.solved ? 'সমাধান হয়েছে' : 'যত্ন প্রয়োজন'}</span>
                    </button>
                  </td>
                  <td className="p-3 font-mono tabular-nums font-bold text-slate-900">{st.roll}</td>
                  <td className="p-3 font-bold text-slate-900">{st.name}</td>
                  <td className="p-3 whitespace-nowrap">{st.className}</td>
                  <td className="p-3 font-medium text-slate-700">{st.subject}</td>
                  <td className="p-3 text-slate-600">{st.issue}</td>
                  <td className="p-3 text-right no-print">
                    <button
                      onClick={() => persistWeakStudents(weakStudents.filter(s => s.id !== st.id))}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
