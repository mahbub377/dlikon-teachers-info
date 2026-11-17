import { SyllabusItem, ACADEMY_EXAMS_9 } from '../../types/adminTypes';

export type QuestionType =
  | 'mcq'
  | 'short'
  | 'creative'
  | 'fill_blank'
  | 'true_false'
  | 'matching'
  | 'passage';

export type ExamPaperMode = 'parbik_combined' | 'term_single_subject' | 'model_test_scholarship';
export type PaperLanguage = 'bn' | 'en';
export type PaperLayoutColumns = 1 | 2;
export type PaperFontSize = 'sm' | 'md' | 'lg';
export type AnswerViewMode = 'paper_only' | 'paper_with_answers' | 'answer_sheet_only';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface QuestionItem {
  id: string;
  type: QuestionType;
  sectionKey: string;
  subjectTag?: string; // Used when examPaperMode === 'parbik_combined' (সমন্বিত ১ পাতার প্রশ্ন)
  prompt: string;
  marks: string;
  options?: [string, string, string, string];
  subQuestions?: string[];
  matchingPairs?: MatchingPair[];
  wordBank?: string;
  answerHint?: string;
}

export interface SectionInstructionMap {
  [sectionKey: string]: string;
}

export interface SavedQuestionPaper {
  id: string;
  examPaperMode?: ExamPaperMode;
  selectedExamId?: string;
  examName: string;
  className: string;
  subject: string;
  examTime: string;
  totalMarks: string;
  examDate: string;
  teacherName: string;
  setCode: string;
  language: PaperLanguage;
  layoutColumns: PaperLayoutColumns;
  fontSize: PaperFontSize;
  showStudentInfoBox: boolean;
  groupBySection: boolean;
  sectionInstructions: SectionInstructionMap;
  instructions: string;
  items: QuestionItem[];
  updatedAt: string;
}

export interface QuestionBankEntry {
  id: string;
  className: string;
  subject: string;
  item: QuestionItem;
  savedAt: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'বহুনির্বাচনী (MCQ)',
  short: 'সংক্ষিপ্ত প্রশ্ন',
  creative: 'সৃজনশীল / রচনামূলক',
  fill_blank: 'শূন্যস্থান পূরণ',
  true_false: 'সত্য / মিথ্যা',
  matching: 'বাম-ডান মিলকরণ',
  passage: 'অনুচ্ছেদ ও প্রশ্নোত্তর'
};

export const QUESTION_TYPE_LABELS_EN: Record<QuestionType, string> = {
  mcq: 'Multiple Choice (MCQ)',
  short: 'Short Answer Question',
  creative: 'Creative / Essay',
  fill_blank: 'Fill in the Blanks',
  true_false: 'True / False',
  matching: 'Matching Columns',
  passage: 'Reading Passage / Comprehension'
};

export const SECTION_OPTIONS = [
  { key: 'sec_a', labelBn: 'ক-বিভাগ: বহুনির্বাচনী প্রশ্ন', labelEn: 'Section A: Multiple Choice Questions' },
  { key: 'sec_b', labelBn: 'খ-বিভাগ: শূন্যস্থান ও সত্য/মিথ্যা', labelEn: 'Section B: Fill in the Blanks & True/False' },
  { key: 'sec_c', labelBn: 'গ-বিভাগ: সংক্ষিপ্ত উত্তর প্রশ্ন', labelEn: 'Section C: Short Answer Questions' },
  { key: 'sec_d', labelBn: 'ঘ-বিভাগ: মিলকরণ ও অনুচ্ছেদ', labelEn: 'Section D: Matching & Comprehension' },
  { key: 'sec_e', labelBn: 'ঙ-বিভাগ: সৃজনশীল ও রচনামূলক প্রশ্ন', labelEn: 'Section E: Creative & Essay Questions' }
] as const;

export const DEFAULT_SECTION_BY_TYPE: Record<QuestionType, string> = {
  mcq: 'sec_a',
  fill_blank: 'sec_b',
  true_false: 'sec_b',
  short: 'sec_c',
  matching: 'sec_d',
  passage: 'sec_d',
  creative: 'sec_e'
};

export const PARBIK_SUBJECT_OPTIONS = [
  'বাংলা',
  'ইংরেজি (English)',
  'গণিত',
  'প্রাথমিক বিজ্ঞান / বিজ্ঞান',
  'বাংলাদেশ ও বিশ্বপরিচয়',
  'ইসলাম ও নৈতিক শিক্ষা',
  'সাধারণ জ্ঞান / IQ'
];

export const SCHOLARSHIP_MODEL_EXAMS = [
  { id: 'mt_govt_scholarship', label: 'সরকারি প্রাথমিক ও জুনিয়র বৃত্তি প্রস্তুতি মডেল টেস্ট' },
  { id: 'mt_kg_scholarship', label: 'কিন্ডারগার্টেন অ্যাসোসিয়েশন বৃত্তি মডেল টেস্ট' },
  { id: 'mt_upazila_merit', label: 'উপজেলা / জেলা মেধাবৃত্তি মডেল টেস্ট' },
  { id: 'mt_weekly_revision', label: 'সাপ্তাহিক ও অধ্যায়ভিত্তিক মডেল টেস্ট' }
];

export const SUBJECT_PRESETS = [
  'সকল বিষয় (সমন্বিত ১০০ নম্বর)',
  'বাংলা',
  'ইংরেজি (English)',
  'প্রাথমিক গণিত',
  'গণিত',
  'প্রাথমিক বিজ্ঞান',
  'বিজ্ঞান',
  'বাংলাদেশ ও বিশ্বপরিচয়',
  'ইসলাম ও নৈতিক শিক্ষা',
  'তথ্য ও যোগাযোগ প্রযুক্তি'
];

export const toBanglaDigits = (val: number | string): string => {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => map[Number(d)]);
};

export const toEnglishDigits = (val: number | string): string => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[০-৯]/g, (d) => String(bn.indexOf(d)));
};

export const formatNumberByLang = (val: number | string, lang: PaperLanguage): string =>
  lang === 'en' ? toEnglishDigits(val) : toBanglaDigits(val);

export const parseNumericMarks = (val: string): number => {
  const en = toEnglishDigits(val || '0').replace(/[^\d.]/g, '');
  const n = parseFloat(en);
  return isNaN(n) ? 0 : n;
};

export const getMcqOptionLabels = (lang: PaperLanguage): [string, string, string, string] =>
  lang === 'en' ? ['a)', 'b)', 'c)', 'd)'] : ['ক)', 'খ)', 'গ)', 'ঘ)'];

// Starter Question Templates for BOTH Exam Formats
export const STARTER_PAPER_TEMPLATES: {
  id: string;
  label: string;
  examPaperMode: ExamPaperMode;
  selectedExamId: string;
  className: string;
  subject: string;
  language: PaperLanguage;
  examTime: string;
  totalMarks: string;
  items: QuestionItem[];
}[] = [
  {
    id: 'tpl_parbik_100',
    label: '১ম পার্বিক পরীক্ষা (১ পাতা · সব বিষয় · ১০০ নম্বর)',
    examPaperMode: 'parbik_combined',
    selectedExamId: ACADEMY_EXAMS_9[0].id,
    className: '৫ম শ্রেণি',
    subject: 'সকল বিষয় (সমন্বিত)',
    language: 'bn',
    examTime: '২ ঘণ্টা ৩০ মিনিট',
    totalMarks: '১০০',
    items: [
      {
        id: 'pb_bn_1',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'বাংলা',
        prompt: 'শব্দার্থ ও বাক্য রচনা কর: সংকল্প, বরণীয়, অসীম, দুর্বার, প্রান্তর।',
        marks: '১০',
        answerHint: 'প্রতিটি শব্দার্থ ১ ও বাক্য ১ করে ২×৫ = ১০'
      },
      {
        id: 'pb_bn_2',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'বাংলা',
        prompt: 'কবিতার প্রথম ৬ লাইন লিখ (সংকল্প) এবং বীরের রক্তে স্বাধীন এ দেশ সম্পর্কে ৩টি বাক্য লিখ।',
        marks: '১০',
        answerHint: 'কবিতা ৬ + অনুচ্ছেদ ৪ = ১০'
      },
      {
        id: 'pb_en_1',
        type: 'fill_blank',
        sectionKey: 'sec_b',
        subjectTag: 'ইংরেজি (English)',
        prompt: 'Make sentences (any 5): Respect, Honest, Morning, Flag, Country, Clean.',
        marks: '১০',
        answerHint: '২×৫ = ১০'
      },
      {
        id: 'pb_en_2',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'ইংরেজি (English)',
        prompt: 'Write 5 sentences about "Your School" and translate into English: আমি প্রতিদিন স্কুলে যাই।',
        marks: '১০',
        answerHint: 'Paragraph 8 + Translation 2 = 10'
      },
      {
        id: 'pb_math_1',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'গণিত',
        prompt: '১) সরল কর: {২৪ - (১২ ÷ ৩)} × ৫   ২) একটি কলমের দাম ১৫ টাকা হলে ২ ডজন কলমের দাম কত?',
        marks: '১০',
        answerHint: '১) ১০০, ২) ৩৬০ টাকা'
      },
      {
        id: 'pb_math_2',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'গণিত',
        prompt: 'ল.সা.গু নির্ণয় কর: ১২, ১৮, ২৪ এবং মৌলিক সংখ্যা কাকে বলে উদাহরণসহ লিখ।',
        marks: '১০',
        answerHint: 'ল.সা.গু = ৭২'
      },
      {
        id: 'pb_sci_1',
        type: 'fill_blank',
        sectionKey: 'sec_b',
        subjectTag: 'প্রাথমিক বিজ্ঞান / বিজ্ঞান',
        prompt: 'শূন্যস্থান পূরণ ও সংক্ষিপ্ত উত্তর: ১) উদ্ভিদ খাদ্য তৈরিতে ______ ব্যবহার করে। ২) পরিবেশ দূষণ রোধের ৩টি উপায় লিখ।',
        marks: '২০',
        answerHint: 'সূর্যালোক ও কার্বন ডাইঅক্সাইড'
      },
      {
        id: 'pb_rel_1',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'ইসলাম ও নৈতিক শিক্ষা',
        prompt: 'ঈমান অর্থ কী? ইসলামের পাঁচটি রুকনের নাম ধারাবাহিকভাবে লিখ এবং সত্যবাদিতার ২টি সুফল লিখ।',
        marks: '১০',
        answerHint: 'কালেমা, নামাজ, রোজা, হজ, জাকাত'
      },
      {
        id: 'pb_bgs_1',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'বাংলাদেশ ও বিশ্বপরিচয়',
        prompt: 'আমাদের মুক্তিযুদ্ধ কত সালে হয়েছিল? ৭ জন বীরশ্রেষ্ঠের মধ্যে যেকোনো ৪ জনের নাম লিখ।',
        marks: '১০',
        answerHint: '১৯৭১ সালে'
      }
    ]
  },
  {
    id: 'tpl_math_5',
    label: '১ম সাময়িক গণিত (একক বিষয় মেয়াদী)',
    examPaperMode: 'term_single_subject',
    selectedExamId: ACADEMY_EXAMS_9[2].id,
    className: '৫ম শ্রেণি',
    subject: 'প্রাথমিক গণিত',
    language: 'bn',
    examTime: '২ ঘণ্টা ৩০ মিনিট',
    totalMarks: '১০০',
    items: [
      {
        id: 't1_1',
        type: 'mcq',
        sectionKey: 'sec_a',
        prompt: 'মৌলিক সংখ্যার ন্যূনতম কয়টি গুণনীয়ক থাকে?',
        marks: '১',
        options: ['১টি', '২টি', '৩টি', '৪টি'],
        answerHint: 'খ) ২টি'
      },
      {
        id: 't1_2',
        type: 'mcq',
        sectionKey: 'sec_a',
        prompt: '১ ডজন কলার দাম ১২০ টাকা হলে ১টি কলার দাম কত?',
        marks: '১',
        options: ['৮ টাকা', '১০ টাকা', '১২ টাকা', '১৫ টাকা'],
        answerHint: 'খ) ১০ টাকা'
      },
      {
        id: 't1_3',
        type: 'fill_blank',
        sectionKey: 'sec_b',
        prompt: 'কোনো ভগ্নাংশের উপরের সংখ্যাকে ______ এবং নিচের সংখ্যাকে ______ বলে।',
        marks: '২',
        wordBank: 'লব · হর · গুণনীয়ক',
        answerHint: 'লব, হর'
      },
      {
        id: 't1_4',
        type: 'short',
        sectionKey: 'sec_c',
        prompt: 'ল.সা.গু এবং গ.সা.গু এর পূর্ণরূপ লেখ।',
        marks: '২',
        answerHint: 'লঘিষ্ঠ সাধারণ গুণিতক এবং গরিষ্ঠ সাধারণ গুণনীয়ক'
      },
      {
        id: 't1_5',
        type: 'creative',
        sectionKey: 'sec_e',
        prompt: 'একটি বিদ্যালয়ে ৫০০ জন শিক্ষার্থী আছে। তাদের মধ্যে ৪০% ছাত্রী এবং অবশিষ্ট ছাত্র।',
        marks: '১০',
        subQuestions: [
          'ক) ছাত্রী সংখ্যা কত জন?',
          'খ) ছাত্রের শতকরা হার ও মোট ছাত্র সংখ্যা নির্ণয় কর।',
          'গ) যদি ৫০ জন নতুন ছাত্রী ভর্তি হয় তবে মোট শিক্ষার্থী কত হবে?'
        ],
        answerHint: 'ক) ২০০ জন, খ) ৬০% ও ৩০০ জন, গ) ৫৫০ জন'
      }
    ]
  },
  {
    id: 'tpl_eng_6',
    label: 'Term Exam: Class 6 English (একক বিষয়)',
    examPaperMode: 'term_single_subject',
    selectedExamId: ACADEMY_EXAMS_9[2].id,
    className: '৬ষ্ঠ শ্রেণি',
    subject: 'English',
    language: 'en',
    examTime: '2 Hours',
    totalMarks: '50',
    items: [
      {
        id: 't2_1',
        type: 'passage',
        sectionKey: 'sec_d',
        prompt:
          'Read the passage carefully and answer the questions below:\nTrees are our best friends. They give us oxygen, fruits, shade, and wood. Without trees, life on earth would be impossible. We should plant more trees around our school and home.',
        marks: '10',
        subQuestions: [
          'a) What do trees give us?',
          'b) Why should we plant more trees?'
        ],
        answerHint: 'a) Oxygen, fruits, shade, and wood. b) To protect our environment and keep life possible.'
      },
      {
        id: 't2_2',
        type: 'fill_blank',
        sectionKey: 'sec_b',
        prompt: 'She ______ (go) to school every morning with her brother.',
        marks: '2',
        wordBank: 'goes · went · going',
        answerHint: 'goes'
      },
      {
        id: 't2_3',
        type: 'matching',
        sectionKey: 'sec_d',
        prompt: 'Match the words in Column A with their meanings in Column B:',
        marks: '4',
        matchingPairs: [
          { left: 'Brave', right: 'Courageous' },
          { left: 'Ancient', right: 'Very old' },
          { left: 'Protect', right: 'Keep safe' },
          { left: 'Joyful', right: 'Very happy' }
        ],
        answerHint: 'Brave-Courageous, Ancient-Very old, Protect-Keep safe, Joyful-Very happy'
      }
    ]
  },
  {
    id: 'tpl_scholarship_model_5',
    label: 'বৃত্তি মডেল টেস্ট (৫ম শ্রেণি · সমন্বিত ১০০ নম্বর)',
    examPaperMode: 'model_test_scholarship',
    selectedExamId: 'mt_govt_scholarship',
    className: '৫ম শ্রেণি',
    subject: 'সকল বিষয় (বৃত্তি প্রস্তুতি)',
    language: 'bn',
    examTime: '২ ঘণ্টা ৩০ মিনিট',
    totalMarks: '১০০',
    items: [
      {
        id: 'mt5_bn_1',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'বাংলা',
        prompt: 'এককথায় প্রকাশ কর (যেকোনো ৫টি): যে উপকারীর উপকার স্বীকার করে, যা জলে চরে, আকাশে চরে যে, অহংকার নেই যার, বিদেশে থাকে যে।',
        marks: '১০',
        answerHint: 'কৃতজ্ঞ, জলচর, খেচর, নিরহংকার, প্রবাসী'
      },
      {
        id: 'mt5_bn_2',
        type: 'creative',
        sectionKey: 'sec_e',
        subjectTag: 'বাংলা',
        prompt: 'অনুচ্ছেদ রচনা লিখ (১০ বাক্যে): "শীতের সকাল" অথবা "আমাদের বিদ্যালয়ের গ্রন্থাগার"।',
        marks: '১৫',
        subQuestions: ['বিপরীত শব্দ লিখ: আসল, সার্থক, আনন্দ, প্রাচীন, স্বাধীনতা।'],
        answerHint: 'নকল, ব্যর্থ, বেদনা, আধুনিক/নবীন, পরাধীনতা'
      },
      {
        id: 'mt5_en_1',
        type: 'fill_blank',
        sectionKey: 'sec_b',
        subjectTag: 'ইংরেজি (English)',
        prompt: 'Fill in the blanks with correct prepositions & WH-words: 1) She lives ___ Kapasia. 2) ___ is your favorite subject?',
        marks: '১০',
        wordBank: 'in · at · What · Who',
        answerHint: '1) in, 2) What'
      },
      {
        id: 'mt5_en_2',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'ইংরেজি (English)',
        prompt: 'Write an application to the Head Teacher for a leave of absence for two days due to fever.',
        marks: '১৫',
        answerHint: 'Proper format + body + signature'
      },
      {
        id: 'mt5_math_1',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'গণিত',
        prompt: 'বার্ষিক ৫% মুনাফায় ২০০০ টাকার ৩ বছরের সরল মুনাফা ও মুনাফা-আসল কত হবে?',
        marks: '১৫',
        answerHint: 'মুনাফা ৩০০ টাকা, মুনাফা-আসল ২৩০০ টাকা'
      },
      {
        id: 'mt5_math_2',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'গণিত',
        prompt: 'একটি আয়তাকার বাগানের দৈর্ঘ্য ৪৫ মিটার এবং প্রস্থ ৩০ মিটার। বাগানটির ক্ষেত্রফল ও পরিসীমা নির্ণয় কর।',
        marks: '১৫',
        answerHint: 'ক্ষেত্রফল ১৩৫০ বর্গমিটার, পরিসীমা ১৫০ মিটার'
      },
      {
        id: 'mt5_iq_1',
        type: 'mcq',
        sectionKey: 'sec_a',
        subjectTag: 'সাধারণ জ্ঞান / IQ',
        prompt: 'বাংলাদেশের জাতীয় স্মৃতিসৌধ কোথায় অবস্থিত এবং এর স্থপতি কে?',
        marks: '১০',
        options: ['সাভার · সৈয়দ মাইনুল হোসেন', 'ঢাকা · হামিদুর রহমান', 'রাজশাহী · কামরুল হাসান', 'খুলনা · জয়নুল আবেদিন'],
        answerHint: 'ক) সাভার · সৈয়দ মাইনুল হোসেন'
      },
      {
        id: 'mt5_sci_1',
        type: 'short',
        sectionKey: 'sec_c',
        subjectTag: 'প্রাথমিক বিজ্ঞান / বিজ্ঞান',
        prompt: 'নবায়নযোগ্য ও অনবায়নযোগ্য প্রাকৃতিক সম্পদের মধ্যে ৩টি পার্থক্য ও উদাহরণ লিখ।',
        marks: '১০',
        answerHint: 'সৌরশক্তি/বায়ু vs কয়লা/তেল/গ্যাস'
      }
    ]
  }
];

export function loadClassSyllabusFromStorage(className: string): SyllabusItem | null {
  try {
    const raw = localStorage.getItem('dlma_admin_syllabus_v1');
    if (!raw) return null;
    const list = JSON.parse(raw) as SyllabusItem[];
    if (!Array.isArray(list)) return null;
    return list.find((s) => s.className === className) || null;
  } catch {
    return null;
  }
}

/**
 * Exports any rendered question paper DOM element into a clean MS Word (.doc) file
 * so teachers can customize formatting in Word if needed.
 */
export function exportElementToWordDoc(elementId: string, filename: string): boolean {
  const el = document.getElementById(elementId);
  if (!el) return false;

  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-print').forEach((node) => node.remove());

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <title>${filename}</title>
      <style>
        body { font-family: 'Kalpurush', Arial, sans-serif; color: #111; line-height: 1.5; }
        table { border-collapse: collapse; width: 100%; margin: 8px 0; }
        th, td { border: 1px solid #444; padding: 5px 8px; text-align: left; }
        h1, h2, h3 { margin: 4px 0; }
      </style>
    </head>
    <body>${clone.innerHTML}</body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1500);
  return true;
}
