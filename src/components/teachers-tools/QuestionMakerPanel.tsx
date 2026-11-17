import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Save,
  CheckCircle2,
  BookOpen,
  ArrowUp,
  ArrowDown,
  FilePlus2,
  Edit3,
  Copy,
  Shuffle,
  BookmarkPlus,
  FileText,
  Layers,
  SlidersHorizontal,
  ClipboardPaste,
  Search
} from 'lucide-react';
import { SCHOOL_CLASSES, ACADEMY_EXAMS_9 } from '../../types/adminTypes';
import { downloadSingleElementAsPdf, printViaIsolatedIframe } from '../../utils/pdfExport';
import {
  QuestionType,
  QuestionItem,
  SavedQuestionPaper,
  QuestionBankEntry,
  ExamPaperMode,
  PaperLanguage,
  PaperLayoutColumns,
  PaperFontSize,
  AnswerViewMode,
  SectionInstructionMap,
  MatchingPair,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_LABELS_EN,
  SECTION_OPTIONS,
  DEFAULT_SECTION_BY_TYPE,
  PARBIK_SUBJECT_OPTIONS,
  SCHOLARSHIP_MODEL_EXAMS,
  SUBJECT_PRESETS,
  STARTER_PAPER_TEMPLATES,
  formatNumberByLang,
  parseNumericMarks,
  getMcqOptionLabels,
  loadClassSyllabusFromStorage,
  exportElementToWordDoc
} from './questionMakerData';

const STORAGE_QUESTIONS = 'dlma_tt_questions_v1';
const STORAGE_QBANK = 'dlma_tt_qbank_v1';

type LeftPanelTab = 'compose' | 'bulk' | 'bank' | 'settings';

export const QuestionMakerPanel: React.FC = () => {
  // Saved Exam Papers Archive
  const [savedPapers, setSavedPapers] = useState<SavedQuestionPaper[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_QUESTIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Reusable Personal Question Bank
  const [questionBank, setQuestionBank] = useState<QuestionBankEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_QBANK);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Exam Format Mode: Parbik (All subjects, 1 page, 100 marks, 1 day) vs Term (Single subject per day)
  const [examPaperMode, setExamPaperMode] = useState<ExamPaperMode>('parbik_combined');
  const [selectedExamId, setSelectedExamId] = useState<string>(ACADEMY_EXAMS_9[0].id);

  // Active Paper Metadata & Formatting State
  const [paperId, setPaperId] = useState<string>(() => `qp_${Date.now()}`);
  const [examName, setExamName] = useState<string>(ACADEMY_EXAMS_9[0].label);
  const [className, setClassName] = useState<string>('৫ম শ্রেণি');
  const [subject, setSubject] = useState('সকল বিষয় (সমন্বিত)');
  const [examTime, setExamTime] = useState('২ ঘণ্টা ৩০ মিনিট');
  const [totalMarks, setTotalMarks] = useState('১০০');
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teacherName, setTeacherName] = useState('');
  const [setCode, setSetCode] = useState('সেট - ক');
  const [language, setLanguage] = useState<PaperLanguage>('bn');
  const [layoutColumns, setLayoutColumns] = useState<PaperLayoutColumns>(2);
  const [fontSize, setFontSize] = useState<PaperFontSize>('sm');
  const [showStudentInfoBox, setShowStudentInfoBox] = useState(false);
  const [groupBySection, setGroupBySection] = useState(true);
  const [sectionInstructions, setSectionInstructions] = useState<SectionInstructionMap>({});
  const [instructions, setInstructions] = useState(
    'এক দিনের সমন্বিত পার্বিক পরীক্ষা। সকল বিষয়ের উত্তর প্রদত্ত উত্তরপত্রে আলাদাভাবে পরিচ্ছন্ন অক্ষরে লিখতে হবে।'
  );
  const [answerViewMode, setAnswerViewMode] = useState<AnswerViewMode>('paper_only');

  const [items, setItems] = useState<QuestionItem[]>(() =>
    STARTER_PAPER_TEMPLATES[0].items.map((it) => ({ ...it }))
  );

  // Left Panel Tabs & Feedback
  const [leftTab, setLeftTab] = useState<LeftPanelTab>('compose');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Question Composer State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qType, setQType] = useState<QuestionType>('short');
  const [qSectionKey, setQSectionKey] = useState<string>('sec_c');
  const [qSubjectTag, setQSubjectTag] = useState<string>(PARBIK_SUBJECT_OPTIONS[0]);
  const [qPrompt, setQPrompt] = useState('');
  const [qMarks, setQMarks] = useState('১০');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [subInputs, setSubInputs] = useState<string[]>(['', '', '']);
  const [wordBankInput, setWordBankInput] = useState('');
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' }
  ]);
  const [qAnswerHint, setQAnswerHint] = useState('');

  // Bulk Paste Import State
  const [bulkText, setBulkText] = useState('');
  const [bulkType, setBulkType] = useState<QuestionType>('short');
  const [bulkMarks, setBulkMarks] = useState('৫');
  const [bulkSection, setBulkSection] = useState('sec_c');
  const [bulkSubjectTag, setBulkSubjectTag] = useState<string>(PARBIK_SUBJECT_OPTIONS[0]);

  // Question Bank Filter State
  const [bankSearch, setBankSearch] = useState('');
  const [bankClassFilter, setBankClassFilter] = useState('সকল শ্রেণি');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_QUESTIONS, JSON.stringify(savedPapers));
    } catch {
      // ignore
    }
  }, [savedPapers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_QBANK, JSON.stringify(questionBank));
    } catch {
      // ignore
    }
  }, [questionBank]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3200);
  };

  const activeExamDef = useMemo(
    () => ACADEMY_EXAMS_9.find((e) => e.id === selectedExamId) || ACADEMY_EXAMS_9[0],
    [selectedExamId]
  );

  const activeClassSyllabus = useMemo(() => loadClassSyllabusFromStorage(className), [className]);

  // Switch between Parbik (1-page combined), Term (Single subject), and Model Test (Scholarship)
  const isCombinedMultiSubject =
    examPaperMode === 'parbik_combined' || examPaperMode === 'model_test_scholarship';

  const applyPaperMode = (mode: ExamPaperMode, explicitExamId?: string) => {
    setExamPaperMode(mode);
    if (mode === 'parbik_combined') {
      const targetEx =
        ACADEMY_EXAMS_9.find((e) => e.id === explicitExamId && e.category === 'parbik') ||
        ACADEMY_EXAMS_9.find((e) => e.category === 'parbik')!;
      setSelectedExamId(targetEx.id);
      setExamName(targetEx.label);
      setSubject('সকল বিষয় (সমন্বিত)');
      setTotalMarks('১০০');
      setExamTime('২ ঘণ্টা ৩০ মিনিট');
      setLayoutColumns(2);
      setFontSize('sm');
      setInstructions(
        'এক দিনের সমন্বিত পার্বিক পরীক্ষা। সকল বিষয়ের উত্তর প্রদত্ত উত্তরপত্রে আলাদাভাবে পরিচ্ছন্ন অক্ষরে লিখতে হবে।'
      );
      setQMarks('১০');
    } else if (mode === 'model_test_scholarship') {
      const targetMt =
        SCHOLARSHIP_MODEL_EXAMS.find((e) => e.id === explicitExamId) ||
        SCHOLARSHIP_MODEL_EXAMS[0];
      setSelectedExamId(targetMt.id);
      setExamName(targetMt.label);
      setSubject('সকল বিষয় (বৃত্তি প্রস্তুতি)');
      setTotalMarks('১০০');
      setExamTime('২ ঘণ্টা ৩০ মিনিট');
      setLayoutColumns(2);
      setFontSize('sm');
      setInstructions(
        'বৃত্তি প্রস্তুতি যাচাই মডেল টেস্ট। প্রতিটি প্রশ্নের সঠিক উত্তর ও সময়ানুবর্তিতা বৃত্তি যোগ্যতার (লক্ষ্যমাত্রা ৮৫%+) জন্য মূল্যায়িত হবে।'
      );
      setQMarks('১০');
    } else {
      const targetEx =
        ACADEMY_EXAMS_9.find((e) => e.id === explicitExamId && e.category === 'term') ||
        ACADEMY_EXAMS_9.find((e) => e.category === 'term')!;
      setSelectedExamId(targetEx.id);
      setExamName(targetEx.label);
      if (subject.includes('সমন্বিত') || subject.includes('বৃত্তি')) setSubject('প্রাথমিক গণিত');
      setLayoutColumns(1);
      setFontSize('md');
      setInstructions(
        'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। সকল প্রশ্নের উত্তর স্পষ্ট ও পরিচ্ছন্ন অক্ষরে লিখতে হবে।'
      );
      setQMarks(language === 'en' ? '2' : '২');
    }
  };

  const handleExamDropdownChange = (examId: string) => {
    const foundCore = ACADEMY_EXAMS_9.find((e) => e.id === examId);
    if (foundCore) {
      setSelectedExamId(foundCore.id);
      setExamName(foundCore.label);
      if (foundCore.category === 'parbik') {
        applyPaperMode('parbik_combined', foundCore.id);
      } else {
        applyPaperMode('term_single_subject', foundCore.id);
      }
      return;
    }
    const foundMt = SCHOLARSHIP_MODEL_EXAMS.find((m) => m.id === examId);
    if (foundMt) {
      applyPaperMode('model_test_scholarship', foundMt.id);
    }
  };

  const resetComposer = () => {
    setEditingId(null);
    setQPrompt('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setSubInputs(['', '', '']);
    setWordBankInput('');
    setMatchingPairs([
      { left: '', right: '' },
      { left: '', right: '' },
      { left: '', right: '' },
      { left: '', right: '' }
    ]);
    setQAnswerHint('');
  };

  const handleComposerTypeChange = (nextType: QuestionType) => {
    setQType(nextType);
    if (!editingId) {
      setQSectionKey(DEFAULT_SECTION_BY_TYPE[nextType]);
      if (isCombinedMultiSubject) {
        setQMarks('১০');
      } else if (nextType === 'mcq' || nextType === 'true_false') {
        setQMarks(language === 'en' ? '1' : '১');
      } else if (nextType === 'creative' || nextType === 'passage') {
        setQMarks(language === 'en' ? '10' : '১০');
      } else if (nextType === 'matching') {
        setQMarks(language === 'en' ? '4' : '৪');
      } else {
        setQMarks(language === 'en' ? '2' : '২');
      }
    }
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qPrompt.trim() && qType !== 'matching') return;

    const builtItem: QuestionItem = {
      id: editingId || `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: qType,
      sectionKey: qSectionKey,
      subjectTag: isCombinedMultiSubject ? qSubjectTag.trim() || 'বাংলা' : undefined,
      prompt:
        qPrompt.trim() ||
        (qType === 'matching'
          ? language === 'en'
            ? 'Match Column A with Column B:'
            : 'বাম পাশের অংশের সাথে ডান পাশের অংশ মিল কর:'
          : ''),
      marks: qMarks.trim() || (language === 'en' ? '2' : '২'),
      answerHint: qAnswerHint.trim() || undefined
    };

    if (qType === 'mcq') {
      builtItem.options = [
        optA.trim() || (language === 'en' ? 'Option A' : 'ক বিকল্প'),
        optB.trim() || (language === 'en' ? 'Option B' : 'খ বিকল্প'),
        optC.trim() || (language === 'en' ? 'Option C' : 'গ বিকল্প'),
        optD.trim() || (language === 'en' ? 'Option D' : 'ঘ বিকল্প')
      ];
    } else if (qType === 'creative' || qType === 'passage') {
      builtItem.subQuestions = subInputs.map((s) => s.trim()).filter(Boolean);
    } else if (qType === 'fill_blank' && wordBankInput.trim()) {
      builtItem.wordBank = wordBankInput.trim();
    } else if (qType === 'matching') {
      const validPairs = matchingPairs.filter((p) => p.left.trim() || p.right.trim());
      if (validPairs.length === 0) return;
      builtItem.matchingPairs = validPairs;
    }

    if (editingId) {
      setItems((prev) => prev.map((it) => (it.id === editingId ? builtItem : it)));
      showToast('প্রশ্নটি সফলভাবে হালনাগাদ করা হয়েছে।');
    } else {
      setItems((prev) => [...prev, builtItem]);
      showToast('নতুন প্রশ্ন প্রশ্নপত্রে যুক্ত করা হয়েছে।');
    }
    resetComposer();
  };

  const handleStartEditQuestion = (item: QuestionItem) => {
    setEditingId(item.id);
    setQType(item.type);
    setQSectionKey(item.sectionKey || DEFAULT_SECTION_BY_TYPE[item.type]);
    if (item.subjectTag) setQSubjectTag(item.subjectTag);
    setQPrompt(item.prompt);
    setQMarks(item.marks);
    setOptA(item.options?.[0] || '');
    setOptB(item.options?.[1] || '');
    setOptC(item.options?.[2] || '');
    setOptD(item.options?.[3] || '');
    setSubInputs(
      item.subQuestions && item.subQuestions.length > 0 ? [...item.subQuestions] : ['', '', '']
    );
    setWordBankInput(item.wordBank || '');
    setMatchingPairs(
      item.matchingPairs && item.matchingPairs.length > 0
        ? item.matchingPairs.map((p) => ({ ...p }))
        : [
            { left: '', right: '' },
            { left: '', right: '' }
          ]
    );
    setQAnswerHint(item.answerHint || '');
    setLeftTab('compose');
  };

  const handleDuplicateQuestion = (item: QuestionItem) => {
    const copy: QuestionItem = {
      ...item,
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      options: item.options ? [...item.options] : undefined,
      subQuestions: item.subQuestions ? [...item.subQuestions] : undefined,
      matchingPairs: item.matchingPairs ? item.matchingPairs.map((p) => ({ ...p })) : undefined
    };
    const idx = items.findIndex((i) => i.id === item.id);
    const next = [...items];
    next.splice(idx + 1, 0, copy);
    setItems(next);
    showToast('প্রশ্নটির একটি কপি যুক্ত হয়েছে।');
  };

  const handleSaveToBank = (item: QuestionItem) => {
    const entry: QuestionBankEntry = {
      id: `qb_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      className,
      subject: item.subjectTag || subject,
      item: { ...item },
      savedAt: new Date().toLocaleDateString('bn-BD')
    };
    setQuestionBank((prev) => [entry, ...prev]);
    showToast('প্রশ্নটি আপনার নিজস্ব প্রশ্ন ব্যাংকে সংরক্ষিত হয়েছে।');
  };

  const handleInsertFromBank = (item: QuestionItem, entrySubject?: string) => {
    const clone: QuestionItem = {
      ...item,
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      subjectTag:
        examPaperMode === 'parbik_combined'
          ? item.subjectTag || entrySubject || PARBIK_SUBJECT_OPTIONS[0]
          : item.subjectTag,
      options: item.options ? [...item.options] : undefined,
      subQuestions: item.subQuestions ? [...item.subQuestions] : undefined,
      matchingPairs: item.matchingPairs ? item.matchingPairs.map((p) => ({ ...p })) : undefined
    };
    setItems((prev) => [...prev, clone]);
    showToast('প্রশ্ন ব্যাংক থেকে প্রশ্ন যোগ করা হয়েছে।');
  };

  const handleBulkImport = () => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/^([০-৯\d]+[।.)\s-]+)\s*/, ''))
      .filter(Boolean);
    if (lines.length === 0) return;

    const batch: QuestionItem[] = lines.map((line, i) => ({
      id: `q_bulk_${Date.now()}_${i}`,
      type: bulkType,
      sectionKey: bulkSection,
      subjectTag: isCombinedMultiSubject ? bulkSubjectTag : undefined,
      prompt: line,
      marks: bulkMarks.trim() || (language === 'en' ? '2' : '২')
    }));

    setItems((prev) => [...prev, ...batch]);
    setBulkText('');
    showToast(`${formatNumberByLang(batch.length, 'bn')}টি প্রশ্ন একসাথে যুক্ত করা হয়েছে।`);
  };

  const handleShuffleQuestions = () => {
    if (items.length < 2) return;
    const shuffled = [...items].map((q) => {
      if (q.type === 'mcq' && q.options) {
        const opts = [...q.options] as [string, string, string, string];
        for (let i = opts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        return { ...q, options: opts };
      }
      return q;
    });
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
    setSetCode((prev) => (prev.includes('ক') ? 'সেট - খ' : prev.includes('খ') ? 'সেট - গ' : 'সেট - ক'));
    showToast('প্রশ্ন ও বহুনির্বাচনী বিকল্পগুলো শাফল করে নতুন সেট তৈরি হয়েছে।');
  };

  const moveQuestion = (id: string, dir: -1 | 1) => {
    const index = items.findIndex((i) => i.id === id);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= items.length) return;
    const copy = [...items];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    setItems(copy);
  };

  const deleteQuestion = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetComposer();
  };

  const handleSavePaper = () => {
    const record: SavedQuestionPaper = {
      id: paperId,
      examPaperMode,
      selectedExamId,
      examName,
      className,
      subject,
      examTime,
      totalMarks,
      examDate,
      teacherName,
      setCode,
      language,
      layoutColumns,
      fontSize,
      showStudentInfoBox,
      groupBySection,
      sectionInstructions,
      instructions,
      items,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };

    setSavedPapers((prev) => {
      const idx = prev.findIndex((p) => p.id === paperId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });
    showToast('প্রশ্নপত্রটি সংরক্ষিত তালিকায় সেভ করা হয়েছে।');
  };

  const handleNewPaper = () => {
    setPaperId(`qp_${Date.now()}`);
    setItems([]);
    resetComposer();
    showToast('নতুন খালি প্রশ্নপত্র তৈরি হয়েছে।');
  };

  const handleLoadPaper = (paper: SavedQuestionPaper) => {
    setPaperId(paper.id);
    setExamPaperMode(paper.examPaperMode || 'term_single_subject');
    if (paper.selectedExamId) setSelectedExamId(paper.selectedExamId);
    setExamName(paper.examName);
    setClassName(paper.className);
    setSubject(paper.subject);
    setExamTime(paper.examTime);
    setTotalMarks(paper.totalMarks);
    setExamDate(paper.examDate);
    setTeacherName(paper.teacherName);
    setSetCode(paper.setCode || 'সেট - ক');
    setLanguage(paper.language || 'bn');
    setLayoutColumns(paper.layoutColumns || 1);
    setFontSize(paper.fontSize || 'md');
    setShowStudentInfoBox(Boolean(paper.showStudentInfoBox));
    setGroupBySection(paper.groupBySection !== false);
    setSectionInstructions(paper.sectionInstructions || {});
    setInstructions(paper.instructions);
    setItems(paper.items);
    resetComposer();
    showToast(`"${paper.examName}" লোড করা হয়েছে।`);
  };

  const handleLoadStarterTemplate = (tplId: string) => {
    const tpl = STARTER_PAPER_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setPaperId(`qp_${Date.now()}`);
    setExamPaperMode(tpl.examPaperMode);
    setSelectedExamId(tpl.selectedExamId);
    const ex = ACADEMY_EXAMS_9.find((e) => e.id === tpl.selectedExamId);
    const mt = SCHOLARSHIP_MODEL_EXAMS.find((m) => m.id === tpl.selectedExamId);
    setExamName(ex ? ex.label : mt ? mt.label : tpl.label);
    setClassName(tpl.className);
    setSubject(tpl.subject);
    setLanguage(tpl.language);
    setExamTime(tpl.examTime);
    setTotalMarks(tpl.totalMarks);
    const multi = tpl.examPaperMode === 'parbik_combined' || tpl.examPaperMode === 'model_test_scholarship';
    setLayoutColumns(multi ? 2 : 1);
    setFontSize(multi ? 'sm' : 'md');
    setInstructions(
      tpl.examPaperMode === 'parbik_combined'
        ? 'এক দিনের সমন্বিত পার্বিক পরীক্ষা। সকল বিষয়ের উত্তর প্রদত্ত উত্তরপত্রে আলাদাভাবে পরিচ্ছন্ন অক্ষরে লিখতে হবে।'
        : tpl.examPaperMode === 'model_test_scholarship'
        ? 'বৃত্তি প্রস্তুতি যাচাই মডেল টেস্ট। সকল বিষয়ে ৮৫%+ নম্বর প্রাপ্তি বৃত্তির পাকাপোক্ত প্রস্তুতির মানদণ্ড।'
        : tpl.language === 'en'
        ? 'The figures in the right margin indicate full marks. Answer all questions neatly.'
        : 'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। সকল প্রশ্নের উত্তর স্পষ্ট ও পরিচ্ছন্ন অক্ষরে লিখতে হবে।'
    );
    setItems(tpl.items.map((it, i) => ({ ...it, id: `q_tpl_${Date.now()}_${i}` })));
    resetComposer();
    showToast(`"${tpl.label}" লোড করা হয়েছে।`);
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const prefix =
        answerViewMode === 'answer_sheet_only'
          ? 'উত্তরপত্র'
          : examPaperMode === 'parbik_combined'
          ? 'পার্বিক_সমন্বিত_প্রশ্নপত্র'
          : 'সাময়িক_প্রশ্নপত্র';
      await downloadSingleElementAsPdf(
        'tt-printable-question-paper',
        `${prefix}_${className}_${subject}.pdf`
      );
      showToast('PDF ডাউনলোড সম্পন্ন হয়েছে।');
    } catch {
      showToast('PDF তৈরিতে সমস্যা হয়েছে, প্রিন্ট ব্যবহার করে দেখতে পারেন।');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadWord = () => {
    const prefix = answerViewMode === 'answer_sheet_only' ? 'উত্তরপত্র' : 'প্রশ্নপত্র';
    const ok = exportElementToWordDoc(
      'tt-printable-question-paper',
      `${prefix}_${className}_${subject}.doc`
    );
    if (ok) showToast('MS Word (.doc) ফাইল ডাউনলোড হয়েছে।');
  };

  // Auto-sum of marks
  const calculatedMarksSum = useMemo(
    () => items.reduce((sum, q) => sum + parseNumericMarks(q.marks), 0),
    [items]
  );

  // Subject breakdown for Parbik Combined Mode (100 marks across all subjects)
  const parbikSubjectGroups = useMemo(() => {
    const map = new Map<string, { subject: string; marks: number; questions: QuestionItem[] }>();
    items.forEach((item) => {
      const subj = item.subjectTag || 'সাধারণ বিষয়';
      if (!map.has(subj)) {
        map.set(subj, { subject: subj, marks: 0, questions: [] });
      }
      const entry = map.get(subj)!;
      entry.marks += parseNumericMarks(item.marks);
      entry.questions.push(item);
    });
    return Array.from(map.values());
  }, [items]);

  // Term Single-Subject Section Grouping
  const sectionedDisplayGroups = useMemo(() => {
    if (!groupBySection) {
      return [
        {
          key: 'all',
          title: '',
          instruction: '',
          sectionMarks: calculatedMarksSum,
          questions: items
        }
      ];
    }

    const groups: {
      key: string;
      title: string;
      instruction: string;
      sectionMarks: number;
      questions: QuestionItem[];
    }[] = [];

    for (const sec of SECTION_OPTIONS) {
      const secItems = items.filter(
        (it) => (it.sectionKey || DEFAULT_SECTION_BY_TYPE[it.type]) === sec.key
      );
      if (secItems.length > 0) {
        const secMarks = secItems.reduce((s, q) => s + parseNumericMarks(q.marks), 0);
        groups.push({
          key: sec.key,
          title: language === 'en' ? sec.labelEn : sec.labelBn,
          instruction: sectionInstructions[sec.key] || '',
          sectionMarks: secMarks,
          questions: secItems
        });
      }
    }

    const unmatched = items.filter(
      (it) =>
        !SECTION_OPTIONS.some((s) => s.key === (it.sectionKey || DEFAULT_SECTION_BY_TYPE[it.type]))
    );
    if (unmatched.length > 0) {
      groups.push({
        key: 'other',
        title: language === 'en' ? 'Other Questions' : 'অন্যান্য প্রশ্ন',
        instruction: '',
        sectionMarks: unmatched.reduce((s, q) => s + parseNumericMarks(q.marks), 0),
        questions: unmatched
      });
    }
    return groups;
  }, [items, groupBySection, language, sectionInstructions, calculatedMarksSum]);

  // Filtered Question Bank
  const filteredBank = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    return questionBank.filter((entry) => {
      const matchClass = bankClassFilter === 'সকল শ্রেণি' || entry.className === bankClassFilter;
      const matchText =
        !q ||
        entry.item.prompt.toLowerCase().includes(q) ||
        entry.subject.toLowerCase().includes(q) ||
        entry.className.toLowerCase().includes(q);
      return matchClass && matchText;
    });
  }, [questionBank, bankSearch, bankClassFilter]);

  const fontSizeClass =
    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';
  const mcqLabels = getMcqOptionLabels(language);

  let runningQuestionNumber = 0;

  return (
    <div className="space-y-5">
      {/* Top Toolbar with Official 2-Format Exam Switcher */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              স্মার্ট প্রশ্নপত্র মেকার (পার্বিক সমন্বিত ও সাময়িক একক বিষয়)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              মোট প্রশ্ন: {formatNumberByLang(items.length, 'bn')}টি · হিসাবকৃত মান:{' '}
              <span
                className={
                  examPaperMode === 'parbik_combined' && calculatedMarksSum === 100
                    ? 'font-bold text-emerald-700'
                    : 'font-bold text-slate-800'
                }
              >
                {formatNumberByLang(calculatedMarksSum, 'bn')}
              </span>{' '}
              / নির্ধারিত পূর্ণমান: {totalMarks}
              {setCode ? ` · ${setCode}` : ''}
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
              onClick={handleShuffleQuestions}
              title="প্রশ্ন ও MCQ অপশন এলোমেলো করে সেট-খ / সেট-গ তৈরি করুন"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              সেট শাফল
            </button>
            <button
              type="button"
              onClick={handleNewPaper}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              নতুন
            </button>
            <button
              type="button"
              onClick={handleSavePaper}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              সংরক্ষণ
            </button>
            <button
              type="button"
              onClick={() => printViaIsolatedIframe('tt-printable-question-paper')}
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
              {isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF'}
            </button>
            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Word (.doc)
            </button>
          </div>
        </div>

        {/* Row 2: 3 Exam Format Modes + 9 Academy Exams & Model Tests Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => applyPaperMode('parbik_combined')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                examPaperMode === 'parbik_combined'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ১. পার্বিক (১ পাতা · সব বিষয়)
            </button>
            <button
              type="button"
              onClick={() => applyPaperMode('term_single_subject')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                examPaperMode === 'term_single_subject'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ২. সাময়িক / বার্ষিক (একক বিষয়)
            </button>
            <button
              type="button"
              onClick={() => applyPaperMode('model_test_scholarship')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                examPaperMode === 'model_test_scholarship'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ৩. বৃত্তি / মডেল টেস্ট (প্রস্তুতি যাচাই)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              পরীক্ষা / মডেল টেস্ট:
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => handleExamDropdownChange(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 max-w-xs"
            >
              <optgroup label="বাৎসরিক ৯ পরীক্ষা (পার্বিক ও সাময়িক)">
                {ACADEMY_EXAMS_9.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.order}। {ex.label} ({ex.category === 'parbik' ? 'সব বিষয় ১০০' : 'একক বিষয়'})
                  </option>
                ))}
              </optgroup>
              <optgroup label="বৃত্তি ও বিশেষ মডেল টেস্ট">
                {SCHOLARSHIP_MODEL_EXAMS.map((mt) => (
                  <option key={mt.id} value={mt.id}>
                    {mt.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Live Subject Marks Tally when in Parbik or Scholarship Model Test Mode */}
        {isCombinedMultiSubject && (
          <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <span className="font-bold text-slate-700">বিষয়ভিত্তিক নম্বর বণ্টন:</span>
            {parbikSubjectGroups.length === 0 ? (
              <span className="text-slate-400">এখনো কোনো প্রশ্ন যোগ করা হয়নি</span>
            ) : (
              parbikSubjectGroups.map((sg) => (
                <span key={sg.subject} className="text-slate-700 tabular-nums">
                  {sg.subject}: <strong>{formatNumberByLang(sg.marks, 'bn')}</strong> ·
                </span>
              ))
            )}
            <span
              className={`font-bold tabular-nums ${
                calculatedMarksSum === 100 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              মোট = {formatNumberByLang(calculatedMarksSum, 'bn')} / {totalMarks}
            </span>
          </div>
        )}

        {/* Row 3: View Mode & Print Column Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setAnswerViewMode('paper_only')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                answerViewMode === 'paper_only'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              প্রশ্নপত্র (ছাত্র কপি)
            </button>
            <button
              type="button"
              onClick={() => setAnswerViewMode('paper_with_answers')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                answerViewMode === 'paper_with_answers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              প্রশ্ন + উত্তর সংকেত
            </button>
            <button
              type="button"
              onClick={() => setAnswerViewMode('answer_sheet_only')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                answerViewMode === 'answer_sheet_only'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              শুধু উত্তরপত্র (শিক্ষক কপি)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as PaperLanguage)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
              aria-label="প্রশ্নপত্রের ভাষা"
            >
              <option value="bn">ভাষা: বাংলা (১, ২, ক, খ)</option>
              <option value="en">Language: English (1, 2, a, b)</option>
            </select>
            <select
              value={layoutColumns}
              onChange={(e) => setLayoutColumns(Number(e.target.value) as PaperLayoutColumns)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
              aria-label="কলাম লেআউট"
            >
              <option value={1}>১ কলাম (স্ট্যান্ডার্ড A4)</option>
              <option value={2}>২ কলাম (একপাতা কম্প্যাক্ট)</option>
            </select>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as PaperFontSize)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
              aria-label="ফন্ট সাইজ"
            >
              <option value="sm">ফন্ট: ছোট (১ পাতা কম্প্যাক্ট)</option>
              <option value="md">ফন্ট: মাঝারি (স্ট্যান্ডার্ড)</option>
              <option value="lg">ফন্ট: বড় (প্লে-৩য় শ্রেণি)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Tabbed Builder (5 cols) */}
        <div className="no-print lg:col-span-5 space-y-4">
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setLeftTab('compose')}
              className={`inline-flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                leftTab === 'compose'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {editingId ? 'সম্পাদনা' : 'প্রশ্ন যোগ'}
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('bulk')}
              className={`inline-flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                leftTab === 'bulk'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              বাল্ক পেস্ট
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('bank')}
              className={`inline-flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                leftTab === 'bank'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              প্রশ্ন ব্যাংক
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('settings')}
              className={`inline-flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                leftTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              হেডার ও সেটিংস
            </button>
          </div>

          {/* TAB 1: COMPOSE / EDIT SINGLE QUESTION */}
          {leftTab === 'compose' && (
            <form
              onSubmit={handleSubmitQuestion}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-sm font-bold text-slate-900">
                  {editingId ? 'নির্বাচিত প্রশ্ন সম্পাদনা করুন' : 'নতুন প্রশ্ন যুক্ত করুন'}
                </h4>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetComposer}
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    সম্পাদনা বাতিল
                  </button>
                )}
              </div>

              {/* Subject selector for Parbik & Scholarship Model Test Modes */}
              {isCombinedMultiSubject && (
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1">
                    কোন বিষয়ের প্রশ্ন? ({examPaperMode === 'model_test_scholarship' ? 'বৃত্তি মডেল টেস্ট' : 'পার্বিক সমন্বিত'})
                  </label>
                  <input
                    type="text"
                    list="tt-parbik-subjects"
                    value={qSubjectTag}
                    onChange={(e) => setQSubjectTag(e.target.value)}
                    placeholder="যেমন: বাংলা, ইংরেজি, গণিত, বিজ্ঞান"
                    className="w-full text-xs px-3 py-2 border border-indigo-300 bg-indigo-50/40 rounded-lg font-semibold"
                  />
                  <datalist id="tt-parbik-subjects">
                    {PARBIK_SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">প্রশ্নের ধরন</label>
                  <select
                    value={qType}
                    onChange={(e) => handleComposerTypeChange(e.target.value as QuestionType)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">নম্বর / মান</label>
                  <input
                    type="text"
                    value={qMarks}
                    onChange={(e) => setQMarks(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {examPaperMode === 'term_single_subject' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">বিভাগ নির্বাচন</label>
                  <select
                    value={qSectionKey}
                    onChange={(e) => setQSectionKey(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {SECTION_OPTIONS.map((sec) => (
                      <option key={sec.key} value={sec.key}>
                        {language === 'en' ? sec.labelEn : sec.labelBn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {qType === 'creative'
                    ? 'উদ্দীপক / মূল প্রশ্ন'
                    : qType === 'passage'
                    ? 'অনুচ্ছেদ / প্যাসেজ টেক্সট'
                    : qType === 'fill_blank'
                    ? 'শূন্যস্থান বাক্য (______ ব্যবহার করুন)'
                    : qType === 'matching'
                    ? 'মিলকরণ নির্দেশনা'
                    : 'প্রশ্নের বিবরণ'}
                </label>
                <textarea
                  rows={qType === 'passage' ? 4 : 3}
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  placeholder={
                    qType === 'matching'
                      ? 'যেমন: বাম পাশের সাথে ডান পাশের সঠিক শব্দ মিল কর:'
                      : 'প্রশ্নটি এখানে স্পষ্টভাবে লিখুন...'
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {qType === 'mcq' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder={`${mcqLabels[0]} বিকল্প ১`}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder={`${mcqLabels[1]} বিকল্প ২`}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder={`${mcqLabels[2]} বিকল্প ৩`}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder={`${mcqLabels[3]} বিকল্প ৪`}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              {qType === 'fill_blank' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    শব্দ সংকেত / Word Bank (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={wordBankInput}
                    onChange={(e) => setWordBankInput(e.target.value)}
                    placeholder="যেমন: লব · হর · ভগ্নাংশ"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              {(qType === 'creative' || qType === 'passage') && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">উপ-প্রশ্নসমূহ (ক, খ, গ...)</label>
                    <button
                      type="button"
                      onClick={() => setSubInputs((prev) => [...prev, ''])}
                      className="text-[11px] font-semibold text-indigo-700 hover:underline cursor-pointer"
                    >
                      + আরও উপ-প্রশ্ন
                    </button>
                  </div>
                  {subInputs.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={sub}
                        onChange={(e) => {
                          const next = [...subInputs];
                          next[idx] = e.target.value;
                          setSubInputs(next);
                        }}
                        placeholder={`উপ-প্রশ্ন ${formatNumberByLang(idx + 1, language)}`}
                        className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                      {subInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSubInputs((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {qType === 'matching' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">বাম-ডান মিলকরণ জোড়া</label>
                    <button
                      type="button"
                      onClick={() => setMatchingPairs((prev) => [...prev, { left: '', right: '' }])}
                      className="text-[11px] font-semibold text-indigo-700 hover:underline cursor-pointer"
                    >
                      + নতুন সারি
                    </button>
                  </div>
                  {matchingPairs.map((pair, idx) => (
                    <div key={idx} className="grid grid-cols-11 gap-1.5 items-center">
                      <input
                        type="text"
                        value={pair.left}
                        onChange={(e) => {
                          const next = [...matchingPairs];
                          next[idx] = { ...next[idx], left: e.target.value };
                          setMatchingPairs(next);
                        }}
                        placeholder="বাম পাশ"
                        className="col-span-5 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={pair.right}
                        onChange={(e) => {
                          const next = [...matchingPairs];
                          next[idx] = { ...next[idx], right: e.target.value };
                          setMatchingPairs(next);
                        }}
                        placeholder="ডান পাশ"
                        className="col-span-5 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setMatchingPairs((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="col-span-1 p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  সঠিক উত্তর / শিক্ষক সংকেত (উত্তরপত্রের জন্য)
                </label>
                <input
                  type="text"
                  value={qAnswerHint}
                  onChange={(e) => setQAnswerHint(e.target.value)}
                  placeholder="যেমন: খ) ২টি বা সংক্ষিপ্ত উত্তর"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {editingId ? 'পরিবর্তন সংরক্ষণ করুন' : 'প্রশ্নপত্রে যোগ করুন'}
              </button>
            </form>
          )}

          {/* TAB 2: BULK PASTE IMPORT */}
          {leftTab === 'bulk' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                একাধিক প্রশ্ন একসাথে পেস্ট করুন (বাল্ক যোগ)
              </h4>
              <p className="text-xs text-slate-500">
                প্রতিটি লাইনে একটি করে প্রশ্ন লিখুন বা কপি করে পেস্ট করুন।
              </p>

              {isCombinedMultiSubject && (
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1">বিষয় নির্বাচন</label>
                  <select
                    value={bulkSubjectTag}
                    onChange={(e) => setBulkSubjectTag(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-indigo-300 rounded-lg bg-white font-semibold"
                  >
                    {PARBIK_SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ধরন</label>
                  <select
                    value={bulkType}
                    onChange={(e) => {
                      const t = e.target.value as QuestionType;
                      setBulkType(t);
                      setBulkSection(DEFAULT_SECTION_BY_TYPE[t]);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="short">সংক্ষিপ্ত প্রশ্ন</option>
                    <option value="fill_blank">শূন্যস্থান পূরণ</option>
                    <option value="true_false">সত্য / মিথ্যা</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">বিভাগ</label>
                  <select
                    value={bulkSection}
                    onChange={(e) => setBulkSection(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {SECTION_OPTIONS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.labelBn.split(':')[0]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">প্রতি মান</label>
                  <input
                    type="text"
                    value={bulkMarks}
                    onChange={(e) => setBulkMarks(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <textarea
                rows={7}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={'উদাহরণ:\nবাংলাদেশের জাতীয় ফলের নাম কী?\nআমাদের মুক্তিযুদ্ধ কত সালে শুরু হয়?\nসবচেয়ে ক্ষুদ্র মৌলিক সংখ্যা কোনটি?'}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="button"
                onClick={handleBulkImport}
                disabled={!bulkText.trim()}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                একসাথে সব প্রশ্ন যুক্ত করুন
              </button>
            </div>
          )}

          {/* TAB 3: QUESTION BANK, STARTER TEMPLATES & SAVED PAPERS */}
          {leftTab === 'bank' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800">দ্রুত মডেল প্রশ্ন সেট লোড করুন</h4>
                <div className="flex flex-wrap gap-2">
                  {STARTER_PAPER_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleLoadStarterTemplate(tpl.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">
                    নিজস্ব প্রশ্ন ব্যাংক ({formatNumberByLang(questionBank.length, 'bn')})
                  </h4>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder="প্রশ্ন বা বিষয় খুঁজুন..."
                      className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <select
                    value={bankClassFilter}
                    onChange={(e) => setBankClassFilter(e.target.value)}
                    className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="সকল শ্রেণি">সকল শ্রেণি</option>
                    {SCHOOL_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredBank.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    প্রশ্নপত্রে থাকা যেকোনো প্রশ্নের পাশে বুকমার্ক আইকনে ক্লিক করে এখানে সংরক্ষণ করতে পারেন।
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {filteredBank.map((entry) => (
                      <div key={entry.id} className="py-2.5 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-800 line-clamp-2">
                              {entry.item.prompt}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {entry.className} · {entry.subject} · {QUESTION_TYPE_LABELS[entry.item.type]}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleInsertFromBank(entry.item, entry.subject)}
                              className="px-2 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded cursor-pointer"
                            >
                              + যোগ
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setQuestionBank((prev) => prev.filter((b) => b.id !== entry.id))
                              }
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {savedPapers.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    সংরক্ষিত পূর্ণাঙ্গ প্রশ্নপত্র ({formatNumberByLang(savedPapers.length, 'bn')})
                  </h4>
                  <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                    {savedPapers.map((paper) => (
                      <div key={paper.id} className="py-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadPaper(paper)}
                          className="text-left flex-1 min-w-0 cursor-pointer group"
                        >
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700 truncate">
                            {paper.examName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {paper.className} · {paper.subject} ·{' '}
                            {formatNumberByLang(paper.items.length, 'bn')}টি প্রশ্ন
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSavedPapers((prev) => prev.filter((p) => p.id !== paper.id))
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HEADER SETTINGS & SYLLABUS REFERENCE */}
          {leftTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  পরীক্ষার হেডার ও কাগজ বিন্যাস
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">পরীক্ষার নাম</label>
                    <input
                      type="text"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
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
                      list="tt-subject-list-v2"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <datalist id="tt-subject-list-v2">
                      {SUBJECT_PRESETS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">সময়</label>
                    <input
                      type="text"
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">পূর্ণমান</label>
                    <input
                      type="text"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">সেট কোড</label>
                    <input
                      type="text"
                      value={setCode}
                      onChange={(e) => setSetCode(e.target.value)}
                      placeholder="সেট - ক / ফাঁকা রাখুন"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">তারিখ</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">বিষয় শিক্ষক</label>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="শিক্ষকের নাম (ঐচ্ছিক)"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">সাধারণ নির্দেশনা</label>
                    <textarea
                      rows={2}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {examPaperMode === 'term_single_subject' && (
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={groupBySection}
                        onChange={(e) => setGroupBySection(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      বিভাগ অনুযায়ী (ক, খ, গ, ঘ বিভাগ) স্বয়ংক্রিয়ভাবে সাজান
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showStudentInfoBox}
                      onChange={(e) => setShowStudentInfoBox(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    উপরে শিক্ষার্থীর নাম / রোল / প্রাপ্ত নম্বর বক্স যুক্ত করুন
                  </label>
                </div>
              </div>

              {/* Section Instructions Editor (Term mode only) */}
              {examPaperMode === 'term_single_subject' &&
                groupBySection &&
                sectionedDisplayGroups.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800">
                      প্রতিটি বিভাগের আলাদা নির্দেশনা (ঐচ্ছিক)
                    </h4>
                    {sectionedDisplayGroups.map((grp) => (
                      <div key={grp.key} className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          {grp.title}
                        </label>
                        <input
                          type="text"
                          value={sectionInstructions[grp.key] || ''}
                          onChange={(e) =>
                            setSectionInstructions((prev) => ({
                              ...prev,
                              [grp.key]: e.target.value
                            }))
                          }
                          placeholder="যেমন: যেকোনো ৫টি প্রশ্নের উত্তর দাও (৫×২ = ১০)"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}

              {/* Live Syllabus Reference synced to Active Exam */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  {examPaperMode === 'model_test_scholarship'
                    ? `${className} — বৃত্তি ও মডেল টেস্ট সিলেবাস রেফারেন্স`
                    : `${className} — ${activeExamDef.shortLabel} সিলেবাস রেফারেন্স`}
                </h4>
                {examPaperMode === 'model_test_scholarship' ? (
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {activeClassSyllabus?.term3Syllabus
                      ? `পূর্ণাঙ্গ শ্রেণি সিলেবাস (${activeClassSyllabus.term3Syllabus}) এবং সাধারণ জ্ঞান, বাংলা-ইংরেজি ব্যাকরণ ও গাণিতিক IQ অনুশীলন।`
                      : 'বৃত্তি মডেল টেস্টে মূল পাঠ্যবইয়ের গুরুত্বপূর্ণ অধ্যায়ের পাশাপাশি বাংলা-ইংরেজি ব্যাকরণ, গাণিতিক দক্ষতা এবং সাধারণ জ্ঞান/IQ অন্তর্ভুক্ত থাকে।'}
                  </p>
                ) : activeClassSyllabus && activeClassSyllabus[activeExamDef.syllabusField] ? (
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {activeClassSyllabus[activeExamDef.syllabusField]}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    {className}-এর {activeExamDef.label} এর সিলেবাস এখনো সেভ করা হয়নি। "সিলেবাস মেকার" বা এডমিন হাব থেকে লিখলে এখানে সরাসরি দেখতে পাবেন।
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Zone: Live Printable A4 Question Paper Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div
            id="tt-printable-question-paper"
            className={`bg-white border border-slate-300 rounded-xl shadow-xs text-slate-900 ${
              isCombinedMultiSubject ? 'p-4 sm:p-6' : 'p-6 sm:p-10'
            }`}
          >
            {/* Institutional Header */}
            <div className="text-center border-b-2 border-slate-800 pb-2.5 mb-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500 min-w-[70px] text-left">
                  {examDate || ''}
                </span>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    {language === 'en' ? 'D-Licon Model Academy' : 'ডি-লিকন মডেল একাডেমী'}
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    {language === 'en'
                      ? 'Mir Market, Sonmania, Kapasia, Gazipur · Estd: 2018'
                      : 'মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর · স্থাপিত: ২০১৮ইং'}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-800 min-w-[70px] text-right">
                  {setCode}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 mt-1.5">
                {answerViewMode === 'answer_sheet_only'
                  ? `${examName} — ${language === 'en' ? 'Answer Key (Teacher Copy)' : 'উত্তরপত্র (শিক্ষক কপি)'}`
                  : examName}
              </h2>

              <p className="text-[11px] font-semibold text-slate-600">
                {examPaperMode === 'parbik_combined'
                  ? 'এক দিনের সমন্বিত পরীক্ষা (সকল বিষয় মিলিয়ে এক পাতার প্রশ্নপত্র)'
                  : examPaperMode === 'model_test_scholarship'
                  ? 'বৃত্তি ও বিশেষ প্রস্তুতি যাচাই মডেল টেস্ট (লক্ষ্যমাত্রা ৮৫%+)'
                  : 'বিষয়ভিত্তিক মেয়াদী পরীক্ষা'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-slate-800 mt-2 pt-2 border-t border-slate-200">
                <div className="text-left">
                  {language === 'en' ? `Class: ${className}` : `শ্রেণি: ${className}`}
                </div>
                <div className="text-center">
                  {language === 'en' ? `Subject: ${subject}` : `বিষয়: ${subject}`}
                </div>
                <div className="text-center">
                  {language === 'en' ? `Time: ${examTime}` : `সময়: ${examTime}`}
                </div>
                <div className="text-right tabular-nums">
                  {language === 'en' ? `Full Marks: ${totalMarks}` : `পূর্ণমান: ${totalMarks}`}
                </div>
              </div>
            </div>

            {showStudentInfoBox && answerViewMode !== 'answer_sheet_only' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs border border-slate-400 rounded-md p-2 mb-3">
                <div className="sm:col-span-2">
                  {language === 'en'
                    ? 'Student Name: ________________________'
                    : 'শিক্ষার্থীর নাম: _______________________'}
                </div>
                <div>{language === 'en' ? 'Roll: ________' : 'রোল: ________'}</div>
                <div>{language === 'en' ? 'Score: ____' : 'প্রাপ্ত নম্বর: ____'}</div>
              </div>
            )}

            {instructions && answerViewMode !== 'answer_sheet_only' && (
              <p className="text-[11px] italic text-slate-700 mb-3 pb-1.5 border-b border-dashed border-slate-300">
                [{language === 'en' ? 'Note' : 'বিশেষ দ্রষ্টব্য'}: {instructions}]
              </p>
            )}

            {/* ANSWER SHEET ONLY VIEW */}
            {answerViewMode === 'answer_sheet_only' ? (
              <div className="space-y-3 text-sm">
                {items.length === 0 ? (
                  <p className="py-12 text-center text-xs text-slate-400">
                    কোনো প্রশ্ন যুক্ত করা হয়নি।
                  </p>
                ) : (
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead className="bg-slate-100 font-bold text-slate-900">
                      <tr>
                        <th className="p-2 border border-slate-300 w-14">ক্রমিক</th>
                        {isCombinedMultiSubject && (
                          <th className="p-2 border border-slate-300 w-28">বিষয়</th>
                        )}
                        <th className="p-2 border border-slate-300">প্রশ্নের সংক্ষেপ</th>
                        <th className="p-2 border border-slate-300">সঠিক উত্তর / মূল্যায়ন সংকেত</th>
                        <th className="p-2 border border-slate-300 w-14 text-right">মান</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, i) => (
                        <tr key={it.id}>
                          <td className="p-2 border border-slate-300 font-bold tabular-nums">
                            {formatNumberByLang(i + 1, language)}
                          </td>
                          {isCombinedMultiSubject && (
                            <td className="p-2 border border-slate-300 font-semibold text-slate-800">
                              {it.subjectTag || '—'}
                            </td>
                          )}
                          <td className="p-2 border border-slate-300 text-slate-600">
                            {it.prompt.slice(0, 55)}
                            {it.prompt.length > 55 ? '...' : ''}
                          </td>
                          <td className="p-2 border border-slate-300 font-semibold text-emerald-800">
                            {it.answerHint || '—'}
                          </td>
                          <td className="p-2 border border-slate-300 text-right tabular-nums">
                            {formatNumberByLang(it.marks, language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                বাম পাশ থেকে নতুন প্রশ্ন যোগ করুন অথবা "প্রশ্ন ব্যাংক" ট্যাব থেকে মডেল সেট লোড করুন।
              </div>
            ) : isCombinedMultiSubject ? (
              /* PARBIK & MODEL TEST SUBJECT-GROUPED LAYOUT */
              <div
                className={
                  layoutColumns === 2
                    ? 'columns-1 md:columns-2 gap-4 [column-rule:1px_solid_#cbd5e1]'
                    : 'space-y-3'
                }
              >
                {parbikSubjectGroups.map((subjGrp) => (
                  <div
                    key={subjGrp.subject}
                    className="border border-slate-300 rounded-lg p-2.5 mb-3 break-inside-avoid-column"
                  >
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2 bg-slate-50 -mx-2.5 -mt-2.5 px-2.5 py-1 rounded-t-lg">
                      <h3 className="text-xs font-bold text-slate-950">বিষয়: {subjGrp.subject}</h3>
                      <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                        মান: {formatNumberByLang(subjGrp.marks, language)}
                      </span>
                    </div>

                    <div className={`space-y-2 leading-snug ${fontSizeClass}`}>
                      {subjGrp.questions.map((item, qIdx) => {
                        const isEditingThis = editingId === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`group relative pb-1.5 border-b border-slate-100 last:border-b-0 ${
                              isEditingThis ? 'bg-indigo-50/50 rounded p-1' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-bold text-slate-950 tabular-nums shrink-0">
                                    {formatNumberByLang(qIdx + 1, language)}।
                                  </span>
                                  <p className="text-slate-900 whitespace-pre-line">{item.prompt}</p>
                                </div>

                                {item.type === 'fill_blank' && item.wordBank && (
                                  <p className="mt-1 pl-4 text-[11px] text-slate-700">
                                    <strong>শব্দ সংকেত:</strong> {item.wordBank}
                                  </p>
                                )}

                                {item.type === 'mcq' && item.options && (
                                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1 pl-4 text-[11px] text-slate-800">
                                    <span>
                                      {mcqLabels[0]} {item.options[0]}
                                    </span>
                                    <span>
                                      {mcqLabels[1]} {item.options[1]}
                                    </span>
                                    <span>
                                      {mcqLabels[2]} {item.options[2]}
                                    </span>
                                    <span>
                                      {mcqLabels[3]} {item.options[3]}
                                    </span>
                                  </div>
                                )}

                                {(item.type === 'creative' || item.type === 'passage') &&
                                  item.subQuestions &&
                                  item.subQuestions.length > 0 && (
                                    <div className="space-y-0.5 mt-1 pl-4 text-[11px] text-slate-800">
                                      {item.subQuestions.map((sub, sIdx) => (
                                        <p key={sIdx}>{sub}</p>
                                      ))}
                                    </div>
                                  )}

                                {item.type === 'matching' &&
                                  item.matchingPairs &&
                                  item.matchingPairs.length > 0 && (
                                    <table className="w-full text-[11px] border-collapse border border-slate-300 mt-1">
                                      <tbody>
                                        {item.matchingPairs.map((pair, pIdx) => (
                                          <tr key={pIdx}>
                                            <td className="p-1 border border-slate-300 w-1/2">
                                              {pair.left}
                                            </td>
                                            <td className="p-1 border border-slate-300 w-1/2">
                                              {pair.right}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}

                                {answerViewMode === 'paper_with_answers' && item.answerHint && (
                                  <p className="mt-1 pl-4 text-[11px] font-medium text-emerald-700">
                                    উত্তর: {item.answerHint}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                                  [{formatNumberByLang(item.marks, language)}]
                                </span>
                                <div className="no-print flex items-center gap-0.5 bg-white border border-slate-200 rounded px-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditQuestion(item)}
                                    className="p-0.5 text-slate-500 hover:text-indigo-700 cursor-pointer"
                                    title="সম্পাদনা"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateQuestion(item)}
                                    className="p-0.5 text-slate-500 hover:text-teal-700 cursor-pointer"
                                    title="কপি করুন"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveToBank(item)}
                                    className="p-0.5 text-slate-500 hover:text-amber-700 cursor-pointer"
                                    title="ব্যাংকে সেভ"
                                  >
                                    <BookmarkPlus className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteQuestion(item.id)}
                                    className="p-0.5 text-slate-500 hover:text-rose-600 cursor-pointer"
                                    title="মুছুন"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* TERM / ANNUAL SINGLE-SUBJECT EXAM LAYOUT */
              <div
                className={
                  layoutColumns === 2
                    ? 'columns-1 md:columns-2 gap-8 [column-rule:1px_solid_#e2e8f0]'
                    : 'space-y-6'
                }
              >
                {sectionedDisplayGroups.map((group) => (
                  <section key={group.key} className="space-y-3.5 mb-5 break-inside-avoid-column">
                    {groupBySection && group.title && (
                      <div className="border-b border-slate-300 pb-1.5 mb-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-950">{group.title}</h3>
                          <span className="text-xs font-bold text-slate-700 tabular-nums">
                            {language === 'en'
                              ? `[Total: ${formatNumberByLang(group.sectionMarks, language)}]`
                              : `[মোট মান: ${formatNumberByLang(group.sectionMarks, language)}]`}
                          </span>
                        </div>
                        {group.instruction && (
                          <p className="text-xs text-slate-600 mt-0.5">{group.instruction}</p>
                        )}
                      </div>
                    )}

                    <div className={`space-y-4 leading-relaxed ${fontSizeClass}`}>
                      {group.questions.map((item) => {
                        runningQuestionNumber += 1;
                        const displayNum = formatNumberByLang(runningQuestionNumber, language);
                        const isEditingThis = editingId === item.id;

                        return (
                          <div
                            key={item.id}
                            className={`group relative pb-3 border-b border-slate-100 last:border-b-0 break-inside-avoid ${
                              isEditingThis ? 'bg-indigo-50/50 rounded-lg p-2 -mx-2' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-slate-950 tabular-nums shrink-0">
                                    {displayNum}
                                    {language === 'en' ? '.' : '।'}
                                  </span>
                                  <p className="font-medium text-slate-900 whitespace-pre-line">
                                    {item.prompt}
                                  </p>
                                </div>

                                {item.type === 'fill_blank' && item.wordBank && (
                                  <div className="mt-2 ml-6 inline-block px-3 py-1 border border-slate-300 rounded text-xs text-slate-800">
                                    <strong>{language === 'en' ? 'Word Bank:' : 'শব্দভান্ডার:'}</strong>{' '}
                                    {item.wordBank}
                                  </div>
                                )}

                                {item.type === 'mcq' && item.options && (
                                  <div className="grid grid-cols-2 gap-x-5 gap-y-1 mt-2 pl-6 text-xs text-slate-800">
                                    <span>
                                      {mcqLabels[0]} {item.options[0]}
                                    </span>
                                    <span>
                                      {mcqLabels[1]} {item.options[1]}
                                    </span>
                                    <span>
                                      {mcqLabels[2]} {item.options[2]}
                                    </span>
                                    <span>
                                      {mcqLabels[3]} {item.options[3]}
                                    </span>
                                  </div>
                                )}

                                {(item.type === 'creative' || item.type === 'passage') &&
                                  item.subQuestions &&
                                  item.subQuestions.length > 0 && (
                                    <div className="space-y-1 mt-2 pl-6 text-xs text-slate-800">
                                      {item.subQuestions.map((sub, sIdx) => (
                                        <p key={sIdx}>{sub}</p>
                                      ))}
                                    </div>
                                  )}

                                {item.type === 'matching' &&
                                  item.matchingPairs &&
                                  item.matchingPairs.length > 0 && (
                                    <div className="mt-2.5 pl-6">
                                      <table className="w-full text-xs border-collapse border border-slate-300">
                                        <thead>
                                          <tr className="bg-slate-50 font-semibold">
                                            <th className="p-1.5 border border-slate-300 w-1/2">
                                              {language === 'en' ? 'Column A' : 'বাম পাশ (ক)'}
                                            </th>
                                            <th className="p-1.5 border border-slate-300 w-1/2">
                                              {language === 'en' ? 'Column B' : 'ডান পাশ (খ)'}
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {item.matchingPairs.map((pair, pIdx) => (
                                            <tr key={pIdx}>
                                              <td className="p-1.5 border border-slate-300">
                                                {formatNumberByLang(pIdx + 1, language)}
                                                {language === 'en' ? '.' : '।'} {pair.left}
                                              </td>
                                              <td className="p-1.5 border border-slate-300">
                                                {pair.right}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                {answerViewMode === 'paper_with_answers' && item.answerHint && (
                                  <p className="mt-2 pl-6 text-xs font-medium text-emerald-700">
                                    {language === 'en' ? 'Answer Key:' : 'উত্তর সংকেত:'}{' '}
                                    {item.answerHint}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-xs font-bold text-slate-800 tabular-nums">
                                  [{formatNumberByLang(item.marks, language)}]
                                </span>
                                <div className="no-print flex items-center gap-0.5 ml-1 bg-white border border-slate-200 rounded-md px-1 py-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditQuestion(item)}
                                    className="p-1 text-slate-500 hover:text-indigo-700 cursor-pointer"
                                    title="সম্পাদনা করুন"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateQuestion(item)}
                                    className="p-1 text-slate-500 hover:text-teal-700 cursor-pointer"
                                    title="কপি করুন"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveToBank(item)}
                                    className="p-1 text-slate-500 hover:text-amber-700 cursor-pointer"
                                    title="প্রশ্ন ব্যাংকে সংরক্ষণ করুন"
                                  >
                                    <BookmarkPlus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveQuestion(item.id, -1)}
                                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                                    title="উপরে নিন"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveQuestion(item.id, 1)}
                                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                                    title="নিচে নিন"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteQuestion(item.id)}
                                    className="p-1 text-slate-500 hover:text-rose-600 cursor-pointer"
                                    title="মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>{teacherName ? `প্রস্তুতকারী: ${teacherName}` : ''}</span>
              <span>{language === 'en' ? '— End of Question Paper —' : '— প্রশ্নপত্র সমাপ্ত —'}</span>
              <span>{setCode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
