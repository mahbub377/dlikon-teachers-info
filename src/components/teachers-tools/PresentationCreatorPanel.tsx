import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  FilePlus2,
  ArrowUp,
  ArrowDown,
  MonitorPlay
} from 'lucide-react';
import { SCHOOL_CLASSES } from '../../types/adminTypes';
import { downloadSingleElementAsPdf, printViaIsolatedIframe } from '../../utils/pdfExport';

type SlideLayout = 'title' | 'bullets' | 'two_column' | 'quiz' | 'summary';
type DeckTheme = 'navy' | 'emerald' | 'warm' | 'light';

interface PresentationSlide {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle: string;
  bodyPoints: string[];
  rightColumnPoints?: string[];
  speakerNotes: string;
}

interface SavedPresentation {
  id: string;
  deckTitle: string;
  className: string;
  subject: string;
  teacherName: string;
  theme: DeckTheme;
  slides: PresentationSlide[];
  updatedAt: string;
}

const STORAGE_PRESENTATIONS = 'dlma_tt_presentations_v1';

const LAYOUT_LABELS: Record<SlideLayout, string> = {
  title: 'শিরোনাম স্লাইড',
  bullets: 'মূল পাঠ (পয়েন্ট)',
  two_column: 'দুই কলাম তুলনা',
  quiz: 'কুইজ ও মূল্যায়ন',
  summary: 'সারসংক্ষেপ ও বাড়ির কাজ'
};

const THEME_STYLES: Record<
  DeckTheme,
  { label: string; bg: string; text: string; muted: string; accent: string; surface: string; border: string }
> = {
  navy: {
    label: 'প্রাতিষ্ঠানিক নীল',
    bg: 'bg-slate-900',
    text: 'text-white',
    muted: 'text-slate-300',
    accent: 'text-amber-300',
    surface: 'bg-slate-800/80',
    border: 'border-slate-700'
  },
  emerald: {
    label: 'শ্রেণিকক্ষ সবুজ',
    bg: 'bg-emerald-950',
    text: 'text-emerald-50',
    muted: 'text-emerald-200',
    accent: 'text-amber-300',
    surface: 'bg-emerald-900/60',
    border: 'border-emerald-800'
  },
  warm: {
    label: 'সাদা ক্লাসরুম',
    bg: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-600',
    accent: 'text-indigo-700',
    surface: 'bg-slate-50',
    border: 'border-slate-200'
  },
  light: {
    label: 'আকাশী বোর্ড',
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    muted: 'text-slate-600',
    accent: 'text-teal-700',
    surface: 'bg-white',
    border: 'border-slate-200'
  }
};

const toBanglaDigits = (val: number | string): string => {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => map[Number(d)]);
};

const createInitialSlides = (): PresentationSlide[] => [
  {
    id: 'sl_1',
    layout: 'title',
    title: 'ভগ্নাংশের যোগ ও বিয়োগ',
    subtitle: 'অধ্যায় ৬ · প্রাথমিক গণিত · ডি-লিকন মডেল একাডেমী',
    bodyPoints: ['শিক্ষার্থীরা সমহর বিশিষ্ট ভগ্নাংশ চিনতে পারবে', 'সহজ পদ্ধতিতে ভগ্নাংশের যোগফল নির্ণয় করতে পারবে'],
    speakerNotes: 'শুরুতে একটি রুটি বা কাগজ সমান ৪ ভাগে ভাগ করে বাস্তব ধারণা দিন।'
  },
  {
    id: 'sl_2',
    layout: 'bullets',
    title: 'মূল ধারণা ও নিয়মাবলি',
    subtitle: 'পাঠের প্রধান অংশ',
    bodyPoints: [
      'কোনো বস্তুর সমান অংশের প্রকাশই হলো ভগ্নাংশ।',
      'উপরের সংখ্যাটিকে লব এবং নিচের সংখ্যাটিকে হর বলা হয়।',
      'সমহর বিশিষ্ট ভগ্নাংশ যোগ করতে হর ঠিক রেখে লবগুলো যোগ করতে হয়।'
    ],
    speakerNotes: 'বোর্ডে ৩/৫ ও ১/৫ লিখে লব ও হর চিহ্নিত করে দেখান।'
  },
  {
    id: 'sl_3',
    layout: 'two_column',
    title: 'সমহর বনাম অসমহর ভগ্নাংশ',
    subtitle: 'তুলনামূলক উদাহরণ',
    bodyPoints: ['সমহর ভগ্নাংশ:', 'যেসব ভগ্নাংশের হর একই থাকে', 'যেমন: ২/৭, ৪/৭, ৫/৭'],
    rightColumnPoints: ['অসমহর ভগ্নাংশ:', 'যেসব ভগ্নাংশের হর ভিন্ন থাকে', 'যেমন: ১/২, ২/৩, ৩/৫'],
    speakerNotes: 'শিক্ষার্থীদের জোড়ায় ভাগ করে ২টি করে উদাহরণ লিখতে বলুন।'
  },
  {
    id: 'sl_4',
    layout: 'quiz',
    title: 'শ্রেণিকক্ষ কুইজ ও মূল্যায়ন',
    subtitle: 'তাৎক্ষণিক যাচাই',
    bodyPoints: [
      '১। ৫/৮ ভগ্নাংশটির হর কত?',
      '২। ২/৯ + ৪/৯ = কত?',
      '৩। প্রকৃত ভগ্নাংশের লব হরের চেয়ে ছোট না বড়?'
    ],
    speakerNotes: 'সবাইকে ১ মিনিট সময় দিয়ে মৌখিক উত্তর জিজ্ঞেস করুন।'
  }
];

export const PresentationCreatorPanel: React.FC = () => {
  const [savedDecks, setSavedDecks] = useState<SavedPresentation[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PRESENTATIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [deckId, setDeckId] = useState<string>(() => `deck_${Date.now()}`);
  const [deckTitle, setDeckTitle] = useState('ভগ্নাংশের যোগ ও বিয়োগ — ক্লাস প্রেজেন্টেশন');
  const [className, setClassName] = useState<string>('৫ম শ্রেণি');
  const [subject, setSubject] = useState('প্রাথমিক গণিত');
  const [teacherName, setTeacherName] = useState('');
  const [theme, setTheme] = useState<DeckTheme>('navy');
  const [slides, setSlides] = useState<PresentationSlide[]>(createInitialSlides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeakerNotesInFullscreen, setShowSpeakerNotesInFullscreen] = useState(true);
  const [newPointText, setNewPointText] = useState('');
  const [newRightPointText, setNewRightPointText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRESENTATIONS, JSON.stringify(savedDecks));
    } catch {
      // ignore
    }
  }, [savedDecks]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3200);
  };

  const safeIndex = Math.min(activeSlideIndex, Math.max(0, slides.length - 1));
  const currentSlide = slides[safeIndex];
  const themeStyle = THEME_STYLES[theme];

  // Keyboard navigation during Fullscreen Present Mode
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    },
    [isFullscreen, slides.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const updateCurrentSlide = (patch: Partial<PresentationSlide>) => {
    setSlides((prev) =>
      prev.map((sl, idx) => (idx === safeIndex ? { ...sl, ...patch } : sl))
    );
  };

  const handleAddSlide = () => {
    const newSlide: PresentationSlide = {
      id: `sl_${Date.now()}`,
      layout: 'bullets',
      title: `স্লাইড ${toBanglaDigits(slides.length + 1)}: নতুন পাঠ্যাংশ`,
      subtitle: `${className} · ${subject}`,
      bodyPoints: ['প্রথম মূল পয়েন্ট এখানে লিখুন', 'দ্বিতীয় গুরুত্বপূর্ণ পয়েন্ট'],
      rightColumnPoints: ['ডান কলাম পয়েন্ট ১'],
      speakerNotes: ''
    };
    const nextSlides = [...slides, newSlide];
    setSlides(nextSlides);
    setActiveSlideIndex(nextSlides.length - 1);
  };

  const handleDuplicateSlide = () => {
    if (!currentSlide) return;
    const clone: PresentationSlide = {
      ...currentSlide,
      id: `sl_${Date.now()}`,
      title: `${currentSlide.title} (কপি)`
    };
    const next = [...slides];
    next.splice(safeIndex + 1, 0, clone);
    setSlides(next);
    setActiveSlideIndex(safeIndex + 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) {
      showToast('অন্তত ১টি স্লাইড থাকতে হবে।');
      return;
    }
    const next = slides.filter((_, i) => i !== idx);
    setSlides(next);
    setActiveSlideIndex(Math.max(0, Math.min(idx, next.length - 1)));
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    const [removed] = next.splice(idx, 1);
    next.splice(target, 0, removed);
    setSlides(next);
    setActiveSlideIndex(target);
  };

  const handleSaveDeck = () => {
    const record: SavedPresentation = {
      id: deckId,
      deckTitle: deckTitle.trim() || 'শিরোনামহীন প্রেজেন্টেশন',
      className,
      subject: subject.trim() || 'সাধারণ',
      teacherName: teacherName.trim(),
      theme,
      slides,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };
    setSavedDecks((prev) => {
      const idx = prev.findIndex((d) => d.id === deckId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
    showToast('প্রেজেন্টেশন ডেকটি সংরক্ষিত হয়েছে।');
  };

  const handleNewDeck = () => {
    setDeckId(`deck_${Date.now()}`);
    setDeckTitle('নতুন ক্লাস প্রেজেন্টেশন');
    setSlides([
      {
        id: `sl_${Date.now()}`,
        layout: 'title',
        title: 'পাঠের শিরোনাম',
        subtitle: `${className} · ${subject}`,
        bodyPoints: ['মূল শিখনফল ১', 'মূল শিখনফল ২'],
        speakerNotes: ''
      }
    ]);
    setActiveSlideIndex(0);
    showToast('নতুন খালি প্রেজেন্টেশন তৈরি হয়েছে।');
  };

  const handleLoadDeck = (d: SavedPresentation) => {
    setDeckId(d.id);
    setDeckTitle(d.deckTitle);
    setClassName(d.className);
    setSubject(d.subject);
    setTeacherName(d.teacherName);
    setTheme(d.theme);
    setSlides(d.slides);
    setActiveSlideIndex(0);
    showToast(`"${d.deckTitle}" লোড করা হয়েছে।`);
  };

  const handleDeleteDeck = (id: string) => {
    setSavedDecks((prev) => prev.filter((d) => d.id !== id));
    showToast('সংরক্ষিত প্রেজেন্টেশন মুছে ফেলা হয়েছে।');
  };

  const handleDownloadHandoutPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadSingleElementAsPdf(
        'tt-printable-presentation-handout',
        `প্রেজেন্টেশন_${className}_${subject}.pdf`
      );
      showToast('প্রেজেন্টেশন হ্যান্ডআউট PDF ডাউনলোড হয়েছে।');
    } catch {
      showToast('PDF ডাউনলোডে সমস্যা হয়েছে।');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const renderSlideContent = (slide: PresentationSlide, index: number, large: boolean) => (
    <div
      className={`relative w-full aspect-video rounded-xl border p-6 sm:p-10 flex flex-col justify-between overflow-hidden ${themeStyle.bg} ${themeStyle.text} ${themeStyle.border}`}
    >
      {/* Top quiet header */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs opacity-80">
        <span>
          ডি-লিকন মডেল একাডেমী · {className} · {subject}
        </span>
        <span className="tabular-nums">
          স্লাইড {toBanglaDigits(index + 1)} / {toBanglaDigits(slides.length)}
        </span>
      </div>

      {/* Center Body */}
      <div className="my-auto py-4">
        {slide.layout === 'title' ? (
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className={`text-xs sm:text-sm font-semibold ${themeStyle.accent}`}>
              {slide.subtitle || `${className} · ${subject}`}
            </p>
            <h2
              className={`${
                large ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-3xl'
              } font-black leading-tight tracking-tight`}
            >
              {slide.title}
            </h2>
            {slide.bodyPoints.length > 0 && (
              <div className={`pt-3 text-xs sm:text-sm ${themeStyle.muted} space-y-1`}>
                {slide.bodyPoints.map((pt, i) => (
                  <p key={i}>{pt}</p>
                ))}
              </div>
            )}
          </div>
        ) : slide.layout === 'two_column' ? (
          <div className="space-y-4">
            <div>
              {slide.subtitle && (
                <p className={`text-xs font-semibold ${themeStyle.accent}`}>{slide.subtitle}</p>
              )}
              <h2 className={`${large ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-2xl'} font-bold`}>
                {slide.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`${themeStyle.surface} border ${themeStyle.border} rounded-lg p-4 space-y-2`}>
                {slide.bodyPoints.map((pt, i) => (
                  <p key={i} className={large ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}>
                    • {pt}
                  </p>
                ))}
              </div>
              <div className={`${themeStyle.surface} border ${themeStyle.border} rounded-lg p-4 space-y-2`}>
                {(slide.rightColumnPoints || []).map((pt, i) => (
                  <p key={i} className={large ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}>
                    • {pt}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              {slide.subtitle && (
                <p className={`text-xs font-semibold ${themeStyle.accent}`}>{slide.subtitle}</p>
              )}
              <h2 className={`${large ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-2xl'} font-bold`}>
                {slide.title}
              </h2>
            </div>
            <ul className="space-y-2.5">
              {slide.bodyPoints.map((pt, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 ${
                    large ? 'text-base sm:text-xl' : 'text-xs sm:text-sm'
                  } leading-relaxed`}
                >
                  <span className={`font-bold tabular-nums ${themeStyle.accent}`}>
                    {toBanglaDigits(i + 1)}।
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom footer */}
      <div className={`flex items-center justify-between text-[11px] ${themeStyle.muted}`}>
        <span>{teacherName ? `উপস্থাপনায়: ${teacherName}` : deckTitle}</span>
        <span>{LAYOUT_LABELS[slide.layout]}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">ক্লাস প্রেজেন্টেশন ক্রিয়েটর ও প্রজেক্টর</h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            মোট স্লাইড: {toBanglaDigits(slides.length)}টি · স্লাইড সাজিয়ে সরাসরি শ্রেণিকক্ষে ফুলস্ক্রিনে উপস্থাপন করুন
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
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            প্রেজেন্টেশন চালান
          </button>
          <button
            type="button"
            onClick={handleNewDeck}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            নতুন ডেক
          </button>
          <button
            type="button"
            onClick={handleSaveDeck}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            সংরক্ষণ করুন
          </button>
          <button
            type="button"
            onClick={() => printViaIsolatedIframe('tt-printable-presentation-handout')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            হ্যান্ডআউট প্রিন্ট
          </button>
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleDownloadHandoutPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            {isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Deck Metadata Strip */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">প্রেজেন্টেশনের শিরোনাম</label>
          <input
            type="text"
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
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
          <label className="block text-xs font-medium text-slate-600 mb-1">স্লাইড থিম</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as DeckTheme)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {Object.entries(THEME_STYLES).map(([k, val]) => (
              <option key={k} value={k}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace: Slide Thumbnails (3 cols) + Stage & Editor (9 cols) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Slide List Sidebar */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-800">স্লাইড তালিকা ({toBanglaDigits(slides.length)})</h4>
            <button
              type="button"
              onClick={handleAddSlide}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3 h-3" />
              নতুন স্লাইড
            </button>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {slides.map((sl, idx) => (
              <div
                key={sl.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  idx === safeIndex
                    ? 'border-indigo-600 bg-indigo-50/70'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                    স্লাইড {toBanglaDigits(idx + 1)} · {LAYOUT_LABELS[sl.layout]}
                  </span>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => moveSlide(idx, -1)}
                      disabled={idx === 0}
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(idx, 1)}
                      disabled={idx === slides.length - 1}
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      className="p-0.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-900 truncate">{sl.title || 'শিরোনামহীন'}</p>
              </div>
            ))}
          </div>

          {/* Saved Decks */}
          {savedDecks.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h5 className="text-xs font-bold text-slate-700">সংরক্ষিত ডেক ({toBanglaDigits(savedDecks.length)})</h5>
              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {savedDecks.map((d) => (
                  <div key={d.id} className="py-1.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadDeck(d)}
                      className="text-left flex-1 min-w-0 cursor-pointer group"
                    >
                      <p className="text-xs font-medium text-slate-800 group-hover:text-indigo-700 truncate">
                        {d.deckTitle}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {d.className} · {toBanglaDigits(d.slides.length)} স্লাইড
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDeck(d.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Stage & Slide Editor (9 cols) */}
        <div className="lg:col-span-9 space-y-5">
          {currentSlide && renderSlideContent(currentSlide, safeIndex, false)}

          {/* Active Slide Editor Form */}
          {currentSlide && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <h4 className="text-sm font-bold text-slate-900">
                  স্লাইড {toBanglaDigits(safeIndex + 1)} সম্পাদনা
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDuplicateSlide}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    ডুপ্লিকেট
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">স্লাইডের ধরন / লেআউট</label>
                  <select
                    value={currentSlide.layout}
                    onChange={(e) => updateCurrentSlide({ layout: e.target.value as SlideLayout })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {Object.entries(LAYOUT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">স্লাইড শিরোনাম</label>
                  <input
                    type="text"
                    value={currentSlide.title}
                    onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">উপ-শিরোনাম / অধ্যায়</label>
                  <input
                    type="text"
                    value={currentSlide.subtitle}
                    onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Bullet Points Editors */}
              <div className={`grid grid-cols-1 ${currentSlide.layout === 'two_column' ? 'sm:grid-cols-2' : ''} gap-4`}>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {currentSlide.layout === 'two_column' ? 'বাম কলাম পয়েন্ট' : 'মূল বিষয়বস্তু / পয়েন্টসমূহ'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newPointText}
                      onChange={(e) => setNewPointText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newPointText.trim()) {
                            updateCurrentSlide({ bodyPoints: [...currentSlide.bodyPoints, newPointText.trim()] });
                            setNewPointText('');
                          }
                        }
                      }}
                      placeholder="নতুন লাইন লিখে Enter চাপুন..."
                      className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPointText.trim()) {
                          updateCurrentSlide({ bodyPoints: [...currentSlide.bodyPoints, newPointText.trim()] });
                          setNewPointText('');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg cursor-pointer shrink-0"
                    >
                      যোগ
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {currentSlide.bodyPoints.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pt}
                          onChange={(e) => {
                            const updated = [...currentSlide.bodyPoints];
                            updated[i] = e.target.value;
                            updateCurrentSlide({ bodyPoints: updated });
                          }}
                          className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateCurrentSlide({
                              bodyPoints: currentSlide.bodyPoints.filter((_, idx) => idx !== i)
                            })
                          }
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {currentSlide.layout === 'two_column' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">ডান কলাম পয়েন্ট</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newRightPointText}
                        onChange={(e) => setNewRightPointText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newRightPointText.trim()) {
                              updateCurrentSlide({
                                rightColumnPoints: [...(currentSlide.rightColumnPoints || []), newRightPointText.trim()]
                              });
                              setNewRightPointText('');
                            }
                          }
                        }}
                        placeholder="ডান কলামে নতুন লাইন..."
                        className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newRightPointText.trim()) {
                            updateCurrentSlide({
                              rightColumnPoints: [...(currentSlide.rightColumnPoints || []), newRightPointText.trim()]
                            });
                            setNewRightPointText('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg cursor-pointer shrink-0"
                      >
                        যোগ
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {(currentSlide.rightColumnPoints || []).map((pt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={pt}
                            onChange={(e) => {
                              const updated = [...(currentSlide.rightColumnPoints || [])];
                              updated[i] = e.target.value;
                              updateCurrentSlide({ rightColumnPoints: updated });
                            }}
                            className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateCurrentSlide({
                                rightColumnPoints: (currentSlide.rightColumnPoints || []).filter(
                                  (_, idx) => idx !== i
                                )
                              })
                            }
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    শিক্ষকের বক্তৃতা নোট (Speaker Notes)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.speakerNotes}
                    onChange={(e) => updateCurrentSlide({ speakerNotes: e.target.value })}
                    placeholder="পাঠদানের সময় মনে রাখার নোট..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">উপস্থাপক শিক্ষক</label>
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
          )}
        </div>
      </div>

      {/* Printable All-Slides Handout View (Hidden until Print/PDF or visible below on scroll) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="no-print flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-indigo-600" />
            প্রিন্টযোগ্য সবগুলো স্লাইড হ্যান্ডআউট প্রিভিউ
          </h4>
          <span className="text-xs text-slate-500 tabular-nums">
            মোট {toBanglaDigits(slides.length)} পাতা/স্লাইড
          </span>
        </div>

        <div id="tt-printable-presentation-handout" className="space-y-6 bg-white p-2">
          <div className="text-center border-b border-slate-300 pb-3">
            <h2 className="text-lg font-black text-slate-900">ডি-লিকন মডেল একাডেমী</h2>
            <p className="text-xs text-slate-600">
              {deckTitle} · {className} · বিষয়: {subject}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slides.map((sl, idx) => (
              <div key={sl.id} className="space-y-1.5 break-inside-avoid">
                {renderSlideContent(sl, idx, false)}
                {sl.speakerNotes && (
                  <p className="text-[11px] text-slate-600 px-1">
                    নোট: {sl.speakerNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Projector Presentation Overlay */}
      {isFullscreen && currentSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 text-xs text-slate-300">
            <span className="font-semibold truncate">{deckTitle}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSpeakerNotesInFullscreen((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer whitespace-nowrap"
              >
                {showSpeakerNotesInFullscreen ? 'নোট লুকান' : 'বক্তৃতা নোট'}
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold cursor-pointer whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                বন্ধ করুন
              </button>
            </div>
          </div>

          {/* Slide Canvas */}
          <div className="flex-1 flex items-center justify-center max-w-6xl w-full mx-auto my-4">
            {renderSlideContent(currentSlide, safeIndex, true)}
          </div>

          {/* Bottom Controls + Speaker Note */}
          <div className="max-w-6xl w-full mx-auto space-y-2">
            {showSpeakerNotesInFullscreen && currentSlide.speakerNotes && (
              <div className="text-center text-xs sm:text-sm text-amber-200 bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2">
                শিক্ষকের নোট: {currentSlide.speakerNotes}
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={safeIndex === 0}
                onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                পূর্ববর্তী স্লাইড
              </button>
              <span className="text-xs text-slate-300 tabular-nums">
                স্লাইড {toBanglaDigits(safeIndex + 1)} / {toBanglaDigits(slides.length)} (কীবোর্ড তীর চিহ্ন বা Esc চাপুন)
              </span>
              <button
                type="button"
                disabled={safeIndex === slides.length - 1}
                onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer"
              >
                পরবর্তী স্লাইড
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
