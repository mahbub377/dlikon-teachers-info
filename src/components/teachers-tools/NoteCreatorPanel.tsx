import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Save,
  CheckCircle2,
  FilePlus2,
  Search,
  BookOpen
} from 'lucide-react';
import { SCHOOL_CLASSES } from '../../types/adminTypes';
import { downloadSingleElementAsPdf, printViaIsolatedIframe } from '../../utils/pdfExport';

interface StructuredNote {
  id: string;
  title: string;
  className: string;
  subject: string;
  chapter: string;
  date: string;
  teacherName: string;
  summary: string;
  keyPoints: string[];
  examplesOrFormulas: string;
  homework: string;
  updatedAt: string;
}

const STORAGE_NOTES = 'dlma_tt_notes_v1';

const toBanglaDigits = (val: number | string): string => {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => map[Number(d)]);
};

export const NoteCreatorPanel: React.FC = () => {
  const [savedNotes, setSavedNotes] = useState<StructuredNote[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_NOTES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [noteId, setNoteId] = useState<string>(() => `note_${Date.now()}`);
  const [title, setTitle] = useState('গুণনীয়ক ও গুণিতক (ল.সা.গু ও গ.সা.গু)');
  const [className, setClassName] = useState<string>('৫ম শ্রেণি');
  const [subject, setSubject] = useState('প্রাথমিক গণিত');
  const [chapter, setChapter] = useState('অধ্যায় ৫');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teacherName, setTeacherName] = useState('');
  const [summary, setSummary] = useState(
    'কোনো সংখ্যাকে যে যে সংখ্যা দিয়ে নিঃশেষে ভাগ করা যায়, সেগুলো ওই সংখ্যার গুণনীয়ক। আর যে সংখ্যাগুলো একটি নির্দিষ্ট সংখ্যা দ্বারা নিঃশেষে বিভাজ্য, সেগুলো ওই সংখ্যার গুণিতক।'
  );
  const [keyPoints, setKeyPoints] = useState<string[]>([
    '১। প্রতিটি সংখ্যার সবচেয়ে ছোট গুণনীয়ক ১ এবং সবচেয়ে বড় গুণনীয়ক সংখ্যাটি নিজেই।',
    '২। মৌলিক সংখ্যার কেবল ২টি গুণনীয়ক থাকে (১ এবং সংখ্যাটি নিজেই)।',
    '৩। গ.সা.গু = গরিষ্ঠ সাধারণ গুণনীয়ক এবং ল.সা.গু = লঘিষ্ঠ সাধারণ গুণিতক।'
  ]);
  const [newPointInput, setNewPointInput] = useState('');
  const [examplesOrFormulas, setExamplesOrFormulas] = useState(
    'উদাহরণ: ১২ এর গুণনীয়ক = ১, ২, ৩, ৪, ৬, ১২ এবং ১৮ এর গুণনীয়ক = ১, ২, ৩, ৬, ৯, ১৮। অতএব গ.সা.গু = ৬।'
  );
  const [homework, setHomework] = useState('অনুশীলনী ৫ এর ১ থেকে ৪ নম্বর অঙ্ক খাতায় করে আনবে।');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('সকল শ্রেণি');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTES, JSON.stringify(savedNotes));
    } catch {
      // ignore
    }
  }, [savedNotes]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3200);
  };

  const handleAddPoint = () => {
    if (!newPointInput.trim()) return;
    setKeyPoints((prev) => [...prev, newPointInput.trim()]);
    setNewPointInput('');
  };

  const handleRemovePoint = (idx: number) => {
    setKeyPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveNote = () => {
    if (!title.trim()) return;
    const record: StructuredNote = {
      id: noteId,
      title: title.trim(),
      className,
      subject: subject.trim() || 'সাধারণ',
      chapter: chapter.trim(),
      date,
      teacherName: teacherName.trim(),
      summary,
      keyPoints,
      examplesOrFormulas,
      homework,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };

    setSavedNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === noteId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });
    showToast('নোটটি সফলভাবে সংরক্ষিত হয়েছে।');
  };

  const handleNewNote = () => {
    setNoteId(`note_${Date.now()}`);
    setTitle('');
    setChapter('');
    setSummary('');
    setKeyPoints([]);
    setExamplesOrFormulas('');
    setHomework('');
    showToast('নতুন নোটের পাতা খোলা হয়েছে।');
  };

  const handleLoadNote = (n: StructuredNote) => {
    setNoteId(n.id);
    setTitle(n.title);
    setClassName(n.className);
    setSubject(n.subject);
    setChapter(n.chapter);
    setDate(n.date);
    setTeacherName(n.teacherName);
    setSummary(n.summary);
    setKeyPoints(n.keyPoints);
    setExamplesOrFormulas(n.examplesOrFormulas);
    setHomework(n.homework);
    showToast(`"${n.title}" লোড করা হয়েছে।`);
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('নোটটি মুছে ফেলা হয়েছে।');
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadSingleElementAsPdf(
        'tt-printable-note-sheet',
        `ক্লাস_নোট_${className}_${subject}.pdf`
      );
      showToast('নোট হ্যান্ডআউট PDF ডাউনলোড সম্পন্ন হয়েছে।');
    } catch {
      showToast('PDF তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const filteredNotes = savedNotes.filter((n) => {
    const matchClass = filterClass === 'সকল শ্রেণি' || n.className === filterClass;
    const q = searchQuery.trim().toLowerCase();
    const matchText =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q) ||
      n.chapter.toLowerCase().includes(q);
    return matchClass && matchText;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">নোট ক্রিয়েটর ও হ্যান্ডআউট মেকার</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            পাঠের সারসংক্ষেপ, মূল পয়েন্ট, উদাহরণ ও বাড়ির কাজ সাজিয়ে প্রিন্টযোগ্য শিট তৈরি করুন
          </p>
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
            onClick={handleNewNote}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            নতুন নোট
          </button>
          <button
            type="button"
            onClick={handleSaveNote}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            সংরক্ষণ করুন
          </button>
          <button
            type="button"
            onClick={() => printViaIsolatedIframe('tt-printable-note-sheet')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            প্রিন্ট
          </button>
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            {isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Column (5 cols) */}
        <div className="no-print lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              পাঠ পরিচিতি ও নোট সম্পাদনা
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">নোটের শিরোনাম</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: অধ্যায় ভিত্তিক মূল আলোচনা"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">শ্রেণি</label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
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
                <label className="block text-xs font-medium text-slate-600 mb-1">অধ্যায় / পাঠ</label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">তারিখ</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">বিষয় শিক্ষক</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="শিক্ষকের নাম (ঐচ্ছিক)"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">মূল ধারণা / পাঠ সারসংক্ষেপ</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="সংজ্ঞা বা পাঠের মূল বিষয়বস্তু লিখুন..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">গুরুত্বপূর্ণ পয়েন্টসমূহ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPointInput}
                  onChange={(e) => setNewPointInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPoint();
                    }
                  }}
                  placeholder="নতুন পয়েন্ট লিখে Enter চাপুন..."
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {keyPoints.length > 0 && (
                <ul className="mt-2.5 space-y-1.5">
                  {keyPoints.map((pt, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                    >
                      <span className="text-slate-700 leading-relaxed">{pt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(i)}
                        className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">বোর্ড ওয়ার্ক / সূত্র / উদাহরণ</label>
              <textarea
                rows={3}
                value={examplesOrFormulas}
                onChange={(e) => setExamplesOrFormulas(e.target.value)}
                placeholder="শ্রেণিকক্ষে প্রদর্শনের উদাহরণ বা সূত্র..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">বাড়ির কাজ / অনুশীলন</label>
              <textarea
                rows={2}
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="শিক্ষার্থীদের জন্য বাড়ির কাজ..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Saved Notes List */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                সংরক্ষিত নোটসমূহ ({toBanglaDigits(savedNotes.length)})
              </h4>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নোট খুঁজুন..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="সকল শ্রেণি">সকল শ্রেণি</option>
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {filteredNotes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                কোনো সংরক্ষিত নোট নেই। উপরে "সংরক্ষণ করুন" বাটনে ক্লিক করে সংরক্ষণ করুন।
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {filteredNotes.map((n) => (
                  <div key={n.id} className="py-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadNote(n)}
                      className="text-left flex-1 min-w-0 cursor-pointer group"
                    >
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-teal-700 truncate">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {n.className} · {n.subject} · {n.chapter || n.updatedAt}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Printable A4 Handout Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div
            id="tt-printable-note-sheet"
            className="bg-white border border-slate-300 rounded-xl p-6 sm:p-10 shadow-xs text-slate-900 space-y-6"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="text-lg font-black text-slate-950">ডি-লিকন মডেল একাডেমী</h1>
                <span className="text-xs text-slate-500 tabular-nums">তারিখ: {date}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                <span>{className}</span>
                <span aria-hidden="true">·</span>
                <span>বিষয়: {subject}</span>
                {chapter && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{chapter}</span>
                  </>
                )}
                {teacherName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>শিক্ষক: {teacherName}</span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-3">{title || 'শিরোনামহীন নোট'}</h2>
            </div>

            {/* Summary Section */}
            {summary && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-700">মূল ধারণা ও পাঠ সারসংক্ষেপ</h3>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200 rounded-lg p-4">
                  {summary}
                </p>
              </section>
            )}

            {/* Key Points */}
            {keyPoints.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700">গুরুত্বপূর্ণ আলোচ্য বিষয়সমূহ</h3>
                <ul className="space-y-2 text-sm text-slate-800 leading-relaxed">
                  {keyPoints.map((pt, i) => (
                    <li key={i} className="pb-2 border-b border-slate-100 last:border-b-0">
                      {pt}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Examples / Formula Box */}
            {examplesOrFormulas && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-700">উদাহরণ / বোর্ড ওয়ার্ক</h3>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line border border-slate-200 rounded-lg p-4">
                  {examplesOrFormulas}
                </div>
              </section>
            )}

            {/* Homework */}
            {homework && (
              <section className="space-y-1.5 pt-2 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-700">বাড়ির কাজ ও অনুশীলন</h3>
                <p className="text-sm text-slate-900 font-medium whitespace-pre-line">{homework}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
