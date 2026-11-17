import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  Award,
  RotateCcw,
  Save,
  X
} from 'lucide-react';
import {
  ACADEMY_EXAMS_9,
  CalendarEventCategory,
  DEFAULT_EXAM_CALENDAR_2026,
  ExamCalendarEvent,
  SCHOOL_CLASSES,
  SyllabusItem
} from '../types/adminTypes';

export const STORAGE_EXAM_CALENDAR = 'dlma_exam_calendar_v1';

const BANGLA_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর'
];

const WEEKDAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

const toBanglaDigits = (val: number | string): string => {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => map[Number(d)]);
};

const formatBanglaDateReadable = (iso: string): string => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  return `${toBanglaDigits(d)} ${BANGLA_MONTHS[m - 1] || ''} ${toBanglaDigits(y)}`;
};

const daysBetween = (fromIso: string, toIso: string): number => {
  const a = new Date(fromIso + 'T00:00:00');
  const b = new Date(toIso + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
};

export const loadExamCalendarEvents = (): ExamCalendarEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_EXAM_CALENDAR);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_EXAM_CALENDAR_2026;
};

interface ExamCalendarPanelProps {
  syllabusList?: SyllabusItem[];
  onOpenSyllabusTab?: () => void;
  onOpenModelTestTab?: () => void;
}

export const ExamCalendarPanel: React.FC<ExamCalendarPanelProps> = ({
  syllabusList = [],
  onOpenSyllabusTab,
  onOpenModelTestTab
}) => {
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayParts = useMemo(() => {
    const [y, m] = todayIso.split('-').map(Number);
    return { year: y, monthIndex: m - 1 };
  }, [todayIso]);

  const [events, setEvents] = useState<ExamCalendarEvent[]>(loadExamCalendarEvents);
  const [viewYear, setViewYear] = useState<number>(todayParts.year);
  const [viewMonth, setViewMonth] = useState<number>(todayParts.monthIndex); // 0..11
  const [categoryFilter, setCategoryFilter] = useState<'all' | CalendarEventCategory>('all');
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Edit existing event state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Add new Model Test / Exam form
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newShortTitle, setNewShortTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CalendarEventCategory>('model_test');
  const [newStartDate, setNewStartDate] = useState(todayIso);
  const [newEndDate, setNewEndDate] = useState(todayIso);
  const [newClassScope, setNewClassScope] = useState<string>('৫ম শ্রেণি');
  const [newTotalMarks, setNewTotalMarks] = useState('১০০ (পাকাপোক্ত মান: ৮৫%)');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXAM_CALENDAR, JSON.stringify(events));
    } catch {
      // ignore
    }
  }, [events]);

  const notify = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const filteredEvents = useMemo(() => {
    const list =
      categoryFilter === 'all'
        ? events
        : events.filter((ev) => ev.category === categoryFilter);
    return [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, categoryFilter]);

  // Core 9 exams & Model tests statistics
  const calendarStats = useMemo(() => {
    const coreNine = events.filter((e) => Boolean(e.examId));
    const parbikCount = events.filter((e) => e.category === 'parbik').length;
    const termCount = events.filter((e) => e.category === 'term').length;
    const modelTestCount = events.filter((e) => e.category === 'model_test').length;
    const completedCount = coreNine.filter((e) => e.completed).length;

    const upcomingAll = [...events]
      .filter((e) => !e.completed && e.endDate >= todayIso)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const nextEvent = upcomingAll[0] || null;
    const nextCountdown = nextEvent ? daysBetween(todayIso, nextEvent.startDate) : null;

    return {
      coreTotal: coreNine.length,
      parbikCount,
      termCount,
      modelTestCount,
      completedCount,
      nextEvent,
      nextCountdown
    };
  }, [events, todayIso]);

  // Build 42-cell month grid (Sun - Sat)
  const monthGridCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstDayOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: {
      dateIso: string | null;
      dayNum: number | null;
      events: ExamCalendarEvent[];
    }[] = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ dateIso: null, dayNum: null, events: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const iso = `${viewYear}-${mm}-${dd}`;
      const dayEvents = filteredEvents.filter(
        (ev) => iso >= ev.startDate && iso <= (ev.endDate || ev.startDate)
      );
      cells.push({ dateIso: iso, dayNum: d, events: dayEvents });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ dateIso: null, dayNum: null, events: [] });
    }

    return cells;
  }, [viewYear, viewMonth, filteredEvents]);

  // Count how many exams/events occur in each month of viewYear (for 12-month bar)
  const monthEventCounts = useMemo(() => {
    return BANGLA_MONTHS.map((_, mIdx) => {
      const prefix = `${viewYear}-${String(mIdx + 1).padStart(2, '0')}`;
      return filteredEvents.filter(
        (ev) => ev.startDate.startsWith(prefix) || (ev.endDate || '').startsWith(prefix)
      ).length;
    });
  }, [filteredEvents, viewYear]);

  const selectedDayEvents = useMemo(
    () =>
      filteredEvents.filter(
        (ev) => selectedDateIso >= ev.startDate && selectedDateIso <= (ev.endDate || ev.startDate)
      ),
    [filteredEvents, selectedDateIso]
  );

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || selectedDayEvents[0] || null,
    [events, selectedEventId, selectedDayEvents]
  );

  // Synced syllabus snippet for the selected exam (if linked to ACADEMY_EXAMS_9)
  const linkedSyllabusSnippet = useMemo(() => {
    if (!selectedEvent?.examId) return null;
    const def = ACADEMY_EXAMS_9.find((ex) => ex.id === selectedEvent.examId);
    if (!def || syllabusList.length === 0) return null;
    const fifthOrFirst =
      syllabusList.find((s) => s.className === '৫ম শ্রেণি') || syllabusList[0];
    return {
      className: fifthOrFirst.className,
      text: fifthOrFirst[def.syllabusField] || 'এই শ্রেণির সিলেবাস এখনও সংরক্ষিত হয়নি।'
    };
  }, [selectedEvent, syllabusList]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const jumpToDateAndSelectEvent = (ev: ExamCalendarEvent) => {
    const [y, m] = ev.startDate.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      setViewYear(y);
      setViewMonth(m - 1);
    }
    setSelectedDateIso(ev.startDate);
    setSelectedEventId(ev.id);
    setEditingEventId(null);
  };

  const handleToggleCompleted = (ev: ExamCalendarEvent) => {
    setEvents((prev) =>
      prev.map((item) => (item.id === ev.id ? { ...item, completed: !item.completed } : item))
    );
    notify(
      !ev.completed
        ? `"${ev.shortTitle}" সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে।`
        : `"${ev.shortTitle}" পুনরায় চলমান/আসন্ন তালিকায় যুক্ত হয়েছে।`
    );
  };

  const handleStartEditEvent = (ev: ExamCalendarEvent) => {
    setEditingEventId(ev.id);
    setEditStartDate(ev.startDate);
    setEditEndDate(ev.endDate || ev.startDate);
    setEditNotes(ev.notes || '');
  };

  const handleSaveEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId || !editStartDate) return;
    const normalizedEnd = editEndDate && editEndDate >= editStartDate ? editEndDate : editStartDate;
    setEvents((prev) =>
      prev.map((item) =>
        item.id === editingEventId
          ? { ...item, startDate: editStartDate, endDate: normalizedEnd, notes: editNotes.trim() }
          : item
      )
    );
    setSelectedDateIso(editStartDate);
    const [y, m] = editStartDate.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      setViewYear(y);
      setViewMonth(m - 1);
    }
    setEditingEventId(null);
    notify('পরীক্ষার সময়সূচি ও নোট সফলভাবে হালনাগাদ করা হয়েছে।');
  };

  const handleAddNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStartDate) return;
    const end = newEndDate && newEndDate >= newStartDate ? newEndDate : newStartDate;
    const created: ExamCalendarEvent = {
      id: `cal_custom_${Date.now()}`,
      title: newTitle.trim(),
      shortTitle: newShortTitle.trim() || newTitle.trim().slice(0, 22),
      category: newCategory,
      termGroup:
        newCategory === 'model_test' ? 'বৃত্তি ও মডেল টেস্ট' : 'বার্ষিক পর্ব',
      startDate: newStartDate,
      endDate: end,
      classScope: newClassScope.trim() || 'বৃত্তি ব্যাচ',
      totalMarks: newTotalMarks.trim() || '১০০',
      notes: newNotes.trim(),
      completed: end < todayIso
    };
    setEvents((prev) => [...prev, created]);
    setIsAddingEvent(false);
    setNewTitle('');
    setNewShortTitle('');
    setNewNotes('');
    jumpToDateAndSelectEvent(created);
    notify(`নতুন ইভেন্ট "${created.shortTitle}" ক্যালেন্ডারে যুক্ত হয়েছে।`);
  };

  const handleDeleteCustomEvent = (ev: ExamCalendarEvent) => {
    if (ev.examId) return; // Keep core 9 academy exams protected
    setEvents((prev) => prev.filter((item) => item.id !== ev.id));
    setSelectedEventId(null);
    notify(`"${ev.shortTitle}" ক্যালেন্ডার থেকে মুছে ফেলা হয়েছে।`);
  };

  const handleResetDefaultSchedule = () => {
    setEvents(DEFAULT_EXAM_CALENDAR_2026);
    setEditingEventId(null);
    setSelectedEventId(null);
    notify('২০২৬ শিক্ষাবর্ষের মূল ৯ পরীক্ষা ও মডেল টেস্ট ক্যালেন্ডার পুনঃস্থাপন করা হয়েছে।');
  };

  const getCategoryMeta = (cat: CalendarEventCategory) => {
    if (cat === 'parbik') {
      return {
        label: 'পার্বিক (১ পাতা · ১০০ নম্বর)',
        cellClasses: 'bg-teal-50 border-teal-300 text-teal-900 hover:bg-teal-100',
        dotLabel: 'পার্বিক'
      };
    }
    if (cat === 'term') {
      return {
        label: 'মেয়াদী পরীক্ষা (প্রতিদিন ১ বিষয়)',
        cellClasses: 'bg-indigo-50 border-indigo-300 text-indigo-950 hover:bg-indigo-100',
        dotLabel: 'সাময়িক/বার্ষিক'
      };
    }
    return {
      label: 'বৃত্তি ও মডেল টেস্ট',
      cellClasses: 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100',
      dotLabel: 'মডেল টেস্ট'
    };
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>শিক্ষাবর্ষ ২০২৬</span>
              <span aria-hidden="true">·</span>
              <span>৯টি বাৎসরিক পরীক্ষা (৬ পার্বিক + ৩ মেয়াদী)</span>
              <span aria-hidden="true">·</span>
              <span>বৃত্তি ও মডেল টেস্ট সময়সূচি</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              একাডেমিক পরীক্ষা ও বৃত্তি মডেল টেস্ট ক্যালেন্ডার
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              শিক্ষকদের সহজ ট্র্যাকিংয়ের জন্য প্রতিটি পর্বের ২টি পার্বিক, ৩টি মেয়াদী পরীক্ষা এবং বৃত্তি মডেল টেস্টের তারিখ এক নজরে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setNewStartDate(selectedDateIso);
                setNewEndDate(selectedDateIso);
                setIsAddingEvent((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন মডেল টেস্ট / পরীক্ষা যোগ</span>
            </button>
            {onOpenModelTestTab && (
              <button
                type="button"
                onClick={onOpenModelTestTab}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>বৃত্তি প্রস্তুতি ও নম্বর এন্ট্রি</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetDefaultSchedule}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="ডিফল্ট ২০২৬ ক্যালেন্ডারে ফিরিয়ে আনুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>মূল সময়সূচি</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Row (Tabular Numerals, No Pill Enclosures) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500">মূল ৯ পরীক্ষার অগ্রগতি</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {toBanglaDigits(calendarStats.completedCount)} / {toBanglaDigits(calendarStats.coreTotal)}টি সম্পন্ন
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              ৬টি পার্বিক · ৩টি মেয়াদী পরীক্ষা
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500">বৃত্তি ও মডেল টেস্ট সেশন</div>
            <div className="text-lg font-bold text-amber-800 tabular-nums mt-0.5">
              {toBanglaDigits(calendarStats.modelTestCount)}টি নির্ধারিত
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              বৃত্তি প্রস্তুতি যাচাই পরীক্ষা
            </div>
          </div>

          <div className="lg:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-medium text-slate-500">পরবর্তী আসন্ন পরীক্ষা</div>
              {calendarStats.nextEvent ? (
                <>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {calendarStats.nextEvent.title}
                  </div>
                  <div className="text-[11px] text-slate-600 tabular-nums mt-0.5">
                    তারিখ: {formatBanglaDateReadable(calendarStats.nextEvent.startDate)}
                    {calendarStats.nextEvent.endDate > calendarStats.nextEvent.startDate
                      ? ` – ${formatBanglaDateReadable(calendarStats.nextEvent.endDate)}`
                      : ''}
                    {' · '}
                    {calendarStats.nextEvent.classScope}
                  </div>
                </>
              ) : (
                <div className="text-sm font-semibold text-emerald-700 mt-0.5">
                  নির্ধারিত সকল পরীক্ষা সম্পন্ন হয়েছে
                </div>
              )}
            </div>
            {calendarStats.nextEvent && calendarStats.nextCountdown !== null && (
              <button
                type="button"
                onClick={() => jumpToDateAndSelectEvent(calendarStats.nextEvent!)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 tabular-nums shrink-0 cursor-pointer whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {calendarStats.nextCountdown <= 0
                    ? 'চলমান / আজ'
                    : `আর ${toBanglaDigits(calendarStats.nextCountdown)} দিন বাকি`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {statusNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Optional Add New Model Test / Exam Drawer */}
      {isAddingEvent && (
        <form
          onSubmit={handleAddNewEvent}
          className="bg-white border border-amber-300 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              ক্যালেন্ডারে নতুন মডেল টেস্ট বা বিশেষ পরীক্ষার সময়সূচি যুক্ত করুন
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="lg:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">পরীক্ষা / মডেল টেস্টের নাম *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="যেমন: মডেল টেস্ট ০৪ — সরকারি প্রাথমিক বৃত্তি যাচাই"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ক্যালেন্ডার সংক্ষিপ্ত শিরোনাম</label>
              <input
                type="text"
                value={newShortTitle}
                onChange={(e) => setNewShortTitle(e.target.value)}
                placeholder="যেমন: বৃত্তি মডেল টেস্ট ০৪"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">পরীক্ষার ধরন</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CalendarEventCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="model_test">বৃত্তি ও মডেল টেস্ট</option>
                <option value="parbik">পার্বিক প্রস্তুতি (১ দিন · ১০০ নম্বর)</option>
                <option value="term">মেয়াদী পরীক্ষা</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">শুরুর তারিখ *</label>
              <input
                type="date"
                required
                value={newStartDate}
                onChange={(e) => {
                  setNewStartDate(e.target.value);
                  if (!newEndDate || newEndDate < e.target.value) setNewEndDate(e.target.value);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">শেষের তারিখ</label>
              <input
                type="date"
                value={newEndDate}
                min={newStartDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">টার্গেট শ্রেণি</label>
              <input
                type="text"
                list="cal-class-suggestions"
                value={newClassScope}
                onChange={(e) => setNewClassScope(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
              <datalist id="cal-class-suggestions">
                <option value="প্লে – ১০ম শ্রেণি" />
                <option value="বৃত্তি ব্যাচ (২য়–৮ম শ্রেণি)" />
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">পূর্ণমান ও লক্ষ্যমাত্রা</label>
              <input
                type="text"
                value={newTotalMarks}
                onChange={(e) => setNewTotalMarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block font-semibold text-slate-700 mb-1">নির্দেশনা / সিলেবাস নোট</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="যেমন: বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান মিলিয়ে বৃত্তির প্রস্তুতি যাচাই।"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ক্যালেন্ডারে সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Split Workspace: Monthly Grid Calendar (8 cols) + Selected Date & Event Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Visual Calendar Grid */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
          {/* Calendar Toolbar: Filter + Month Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'all', label: 'সকল পরীক্ষা' },
                  { id: 'parbik', label: 'পার্বিক (৬)' },
                  { id: 'term', label: 'সাময়িক/বার্ষিক (৩)' },
                  { id: 'model_test', label: 'বৃত্তি মডেল টেস্ট' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    categoryFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                title="পূর্ববর্তী মাস"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1.5 min-w-[140px] text-center text-sm font-bold text-slate-900 tabular-nums">
                {BANGLA_MONTHS[viewMonth]} {toBanglaDigits(viewYear)}
              </div>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                title="পরবর্তী মাস"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewYear(todayParts.year);
                  setViewMonth(todayParts.monthIndex);
                  setSelectedDateIso(todayIso);
                }}
                className="px-2.5 py-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer whitespace-nowrap"
              >
                আজ
              </button>
            </div>
          </div>

          {/* 12-Month Quick Jump Bar */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
            {BANGLA_MONTHS.map((mName, idx) => {
              const cnt = monthEventCounts[idx];
              const isActive = viewMonth === idx;
              return (
                <button
                  key={mName}
                  type="button"
                  onClick={() => setViewMonth(idx)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : cnt > 0
                      ? 'bg-teal-50/60 border-teal-200 text-slate-900 hover:bg-teal-100'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[11px] font-semibold truncate">{mName.slice(0, 4)}</div>
                  <div
                    className={`text-[10px] tabular-nums ${
                      isActive ? 'text-amber-300' : cnt > 0 ? 'text-teal-800 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {cnt > 0 ? `${toBanglaDigits(cnt)}টি` : '—'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar 7-Column Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center border-b border-slate-200 pb-2">
            {WEEKDAYS_BN.map((day, idx) => (
              <div
                key={day}
                className={`text-xs font-bold ${
                  idx === 5 ? 'text-rose-700' : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {monthGridCells.map((cell, idx) => {
              if (!cell.dateIso || cell.dayNum === null) {
                return (
                  <div
                    key={`empty_${idx}`}
                    className="min-h-[82px] bg-slate-50/60 rounded-lg border border-transparent"
                  />
                );
              }

              const isToday = cell.dateIso === todayIso;
              const isSelected = cell.dateIso === selectedDateIso;
              const isFriday = idx % 7 === 5;

              return (
                <div
                  key={cell.dateIso}
                  onClick={() => {
                    setSelectedDateIso(cell.dateIso!);
                    setSelectedEventId(cell.events[0]?.id || null);
                    setEditingEventId(null);
                  }}
                  className={`min-h-[86px] p-1.5 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : cell.events.length > 0
                      ? 'border-slate-300 bg-white hover:border-slate-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isToday
                          ? 'px-1.5 py-0.5 rounded bg-slate-900 text-white'
                          : isFriday
                          ? 'text-rose-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {toBanglaDigits(cell.dayNum)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold text-slate-700">আজ</span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {cell.events.slice(0, 2).map((ev) => {
                      const meta = getCategoryMeta(ev.category);
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateIso(cell.dateIso!);
                            setSelectedEventId(ev.id);
                            setEditingEventId(null);
                          }}
                          className={`w-full text-left px-1.5 py-0.5 rounded border text-[10px] font-semibold leading-tight truncate cursor-pointer ${
                            meta.cellClasses
                          } ${ev.completed ? 'opacity-75' : ''}`}
                          title={`${ev.title} (${meta.label})`}
                        >
                          {ev.order ? `${toBanglaDigits(ev.order)}. ` : ''}
                          {ev.shortTitle}
                        </button>
                      );
                    })}
                    {cell.events.length > 2 && (
                      <div className="text-[10px] font-semibold text-slate-600 pl-1 tabular-nums">
                        +{toBanglaDigits(cell.events.length - 2)} আরও
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explicit Accessible Color + Label Legend (No color-only state) */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-teal-400 bg-teal-100 inline-block" />
              <span>পার্বিক প্রস্তুতি (৬টি · ১ পাতা · ১০০ নম্বর)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-indigo-400 bg-indigo-100 inline-block" />
              <span>সাময়িক ও বার্ষিক (৩টি · মেয়াদী পরীক্ষা)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-amber-400 bg-amber-100 inline-block" />
              <span>বৃত্তি ও মডেল টেস্ট (প্রস্তুতি যাচাই)</span>
            </span>
          </div>
        </div>

        {/* Right: Selected Date / Exam Inspector & Quick Reschedule */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="text-[11px] font-medium text-slate-500">নির্বাচিত তারিখ</div>
              <h3 className="text-base font-bold text-slate-900 tabular-nums">
                {formatBanglaDateReadable(selectedDateIso)}
              </h3>
            </div>
            <Calendar className="w-5 h-5 text-slate-500" />
          </div>

          {selectedEvent ? (
            <div className="space-y-4">
              {selectedDayEvents.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedDayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border cursor-pointer ${
                        selectedEvent.id === ev.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {ev.shortTitle}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {getCategoryMeta(selectedEvent.category).dotLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedEvent.completed ? 'সম্পন্ন' : 'আসন্ন / নির্ধারিত'}</span>
                  {selectedEvent.order && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">ক্রম {toBanglaDigits(selectedEvent.order)}/৯</span>
                    </>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedEvent.title}
                </h4>

                <div className="space-y-1 text-xs text-slate-700 pt-1">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">সময়কাল:</span>
                    <span className="font-semibold tabular-nums">
                      {formatBanglaDateReadable(selectedEvent.startDate)}
                      {selectedEvent.endDate > selectedEvent.startDate
                        ? ` – ${formatBanglaDateReadable(selectedEvent.endDate)}`
                        : ' (১ দিন)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">শ্রেণিসমূহ:</span>
                    <span className="font-semibold">{selectedEvent.classScope}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">নম্বর / মান:</span>
                    <span className="font-semibold tabular-nums">{selectedEvent.totalMarks}</span>
                  </div>
                </div>

                {selectedEvent.notes && (
                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
                    {selectedEvent.notes}
                  </p>
                )}

                {linkedSyllabusSnippet && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span>সিঙ্ককৃত সিলেবাস ({linkedSyllabusSnippet.className})</span>
                      {onOpenSyllabusTab && (
                        <button
                          type="button"
                          onClick={onOpenSyllabusTab}
                          className="text-teal-700 hover:underline cursor-pointer"
                        >
                          সিলেবাস দেখুন
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {linkedSyllabusSnippet.text}
                    </p>
                  </div>
                )}
              </div>

              {/* Edit Date Form or Action Buttons */}
              {editingEventId === selectedEvent.id ? (
                <form
                  onSubmit={handleSaveEditEvent}
                  className="space-y-3 pt-3 border-t border-slate-200 text-xs"
                >
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">শুরুর তারিখ</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg tabular-nums"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">শেষের তারিখ</label>
                    <input
                      type="date"
                      value={editEndDate}
                      min={editStartDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">পরীক্ষা নোট</label>
                    <textarea
                      rows={2}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingEventId(null)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>সংরক্ষণ</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(selectedEvent)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                      selectedEvent.completed
                        ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                        : 'bg-emerald-700 border-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedEvent.completed ? 'আসন্ন হিসেবে খুলুন' : 'সম্পন্ন চিহ্নিত করুন'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEditEvent(selectedEvent)}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>তারিখ বদল</span>
                  </button>

                  {!selectedEvent.examId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomEvent(selectedEvent)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="কাস্টম ইভেন্ট মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {selectedEvent.category === 'model_test' && onOpenModelTestTab && (
                <button
                  type="button"
                  onClick={onOpenModelTestTab}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>এই মডেল টেস্টের প্রস্তুতি ও নম্বর যাচাই করুন</span>
                </button>
              )}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs text-slate-600">
                এই তারিখে ({formatBanglaDateReadable(selectedDateIso)}) কোনো পরীক্ষা নির্ধারিত নেই।
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewStartDate(selectedDateIso);
                  setNewEndDate(selectedDateIso);
                  setIsAddingEvent(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>এই তারিখে মডেল টেস্ট যোগ করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Chronological 9-Exam + Model Test Master Tracking Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              বাৎসরিক ৯ পরীক্ষা ও মডেল টেস্ট ট্র্যাকিং রোডম্যাপ (এক ক্লিকে ক্যালেন্ডারে যান)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রতিটি সাময়িকের আগে ২টি পার্বিক পরীক্ষা ও বৃত্তির মডেল টেস্টগুলো ক্রমানুসারে সাজানো রয়েছে।
            </p>
          </div>
          <span className="text-xs text-slate-600 tabular-nums">
            মোট ইভেন্ট: {toBanglaDigits(filteredEvents.length)}টি
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            ['১ম সাময়িক পর্ব', '২য় সাময়িক পর্ব', 'বার্ষিক পর্ব', 'বৃত্তি ও মডেল টেস্ট'] as const
          ).map((groupLabel) => {
            const groupEvents = filteredEvents.filter((ev) => ev.termGroup === groupLabel);
            return (
              <div key={groupLabel} className="space-y-2">
                <div className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-200">
                  {groupLabel}
                </div>
                {groupEvents.length === 0 ? (
                  <div className="text-[11px] text-slate-400 py-3">এই ফিল্টারে কোনো পরীক্ষা নেই</div>
                ) : (
                  <div className="space-y-2">
                    {groupEvents.map((ev) => {
                      const meta = getCategoryMeta(ev.category);
                      const isActive = selectedEvent?.id === ev.id;
                      const diff = daysBetween(todayIso, ev.startDate);
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => jumpToDateAndSelectEvent(ev)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                            isActive
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : `${meta.cellClasses}`
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10.5px] opacity-85 tabular-nums">
                            <span>{formatBanglaDateReadable(ev.startDate)}</span>
                            <span>
                              {ev.completed
                                ? 'সম্পন্ন'
                                : diff <= 0
                                ? 'চলমান'
                                : `${toBanglaDigits(diff)} দিন বাকি`}
                            </span>
                          </div>
                          <div className="text-xs font-bold mt-0.5 truncate">
                            {ev.order ? `${toBanglaDigits(ev.order)}। ` : ''}
                            {ev.shortTitle}
                          </div>
                          <div className="text-[10.5px] opacity-80 truncate mt-0.5">
                            {ev.totalMarks}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
