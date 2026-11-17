export interface StudentRecord {
  id: string;
  studentId?: string;
  name: string;
  nameEnglish?: string;
  roll: string;
  className: string; // প্লে থেকে ১০ম শ্রেণি
  section?: string;
  mobile: string;
  guardianName?: string;
  motherName?: string;
  birthDate?: string;
  bloodGroup?: string;
  address?: string;
  photo?: string;
  signature?: string;
  addedAt?: string;
}

export interface StaffRecord {
  id: string;
  staffId: string;
  name: string;
  nameEnglish?: string;
  designation: string; // যেমন: অফিস সহকারী, নিরাপত্তা প্রহরী, আয়া, পিয়ন, ড্রাইভার, মালি
  mobile: string;
  nid?: string;
  joiningDate?: string;
  birthDate?: string;
  bloodGroup?: string;
  highestDegree?: string;
  address?: string;
  salaryScale?: string;
  photo?: string;
  signature?: string;
  addedAt?: string;
}

export interface EntrepreneurRecord {
  id: string;
  entrepreneurId: string;
  name: string;
  role: string; // যেমন: প্রতিষ্ঠাতা ও চেয়ারম্যান, সভাপতি, ট্রাস্টি সদস্য, শিক্ষা উদ্যোক্তা, উপদেষ্টা, পৃষ্ঠপোষক
  organization?: string;
  profession?: string;
  mobile: string;
  email?: string;
  contribution?: string;
  address?: string;
  photo?: string;
  signature?: string;
  addedAt?: string;
}

export interface SyllabusItem {
  id: string;
  className: string; // শ্রেণি
  term1Syllabus: string; // ৩। প্রথম সাময়িক পরীক্ষা
  midterm1_1Syllabus: string; // ১। প্রথম পার্বিক পরীক্ষা (১ম সাময়িক)
  midterm1_2Syllabus: string; // ২। দ্বিতীয় পার্বিক পরীক্ষা (১ম সাময়িক)
  term2Syllabus: string; // ৬। দ্বিতীয় সাময়িক পরীক্ষা
  midterm2_1Syllabus: string; // ৪। প্রথম পার্বিক পরীক্ষা (২য় সাময়িক)
  midterm2_2Syllabus: string; // ৫। দ্বিতীয় পার্বিক পরীক্ষা (২য় সাময়িক)
  term3Syllabus: string; // ৯। বার্ষিক পরীক্ষা
  midterm3_1Syllabus: string; // ৭। প্রথম পার্বিক পরীক্ষা (বার্ষিক)
  midterm3_2Syllabus: string; // ৮। দ্বিতীয় পার্বিক পরীক্ষা (বার্ষিক)
  notes?: string; // ১০। বিশেষ নির্দেশনা ও মানবণ্টন
  updatedAt: string;
}

export type ExamCategoryType = 'parbik' | 'term';

export interface AcademyExamDefinition {
  order: number;
  id: string;
  label: string;
  shortLabel: string;
  category: ExamCategoryType;
  termGroup: '১ম সাময়িক পর্ব' | '২য় সাময়িক পর্ব' | 'বার্ষিক পর্ব';
  syllabusField: keyof Pick<
    SyllabusItem,
    | 'midterm1_1Syllabus'
    | 'midterm1_2Syllabus'
    | 'term1Syllabus'
    | 'midterm2_1Syllabus'
    | 'midterm2_2Syllabus'
    | 'term2Syllabus'
    | 'midterm3_1Syllabus'
    | 'midterm3_2Syllabus'
    | 'term3Syllabus'
  >;
  description: string;
}

export const ACADEMY_EXAMS_9: AcademyExamDefinition[] = [
  {
    order: 1,
    id: 'parbik_1_1',
    label: 'প্রথম পার্বিক পরীক্ষা (১ম সাময়িক) ২০২৬',
    shortLabel: '১ম পার্বিক (১ম সাময়িক)',
    category: 'parbik',
    termGroup: '১ম সাময়িক পর্ব',
    syllabusField: 'midterm1_1Syllabus',
    description: 'সব বিষয় মিলিয়ে ১ পাতার ১০০ নম্বরের ১ দিনের প্রস্তুতিমূলক পরীক্ষা'
  },
  {
    order: 2,
    id: 'parbik_1_2',
    label: 'দ্বিতীয় পার্বিক পরীক্ষা (১ম সাময়িক) ২০২৬',
    shortLabel: '২য় পার্বিক (১ম সাময়িক)',
    category: 'parbik',
    termGroup: '১ম সাময়িক পর্ব',
    syllabusField: 'midterm1_2Syllabus',
    description: 'সব বিষয় মিলিয়ে ১ পাতার ১০০ নম্বরের ১ দিনের প্রস্তুতিমূলক পরীক্ষা'
  },
  {
    order: 3,
    id: 'term_1',
    label: 'প্রথম সাময়িক পরীক্ষা ২০২৬',
    shortLabel: '১ম সাময়িক পরীক্ষা',
    category: 'term',
    termGroup: '১ম সাময়িক পর্ব',
    syllabusField: 'term1Syllabus',
    description: 'বিষয়ভিত্তিক মেয়াদী পরীক্ষা — প্রতিদিন ১টি করে আলাদা বিষয়ের পরীক্ষা'
  },
  {
    order: 4,
    id: 'parbik_2_1',
    label: 'প্রথম পার্বিক পরীক্ষা (২য় সাময়িক) ২০২৬',
    shortLabel: '১ম পার্বিক (২য় সাময়িক)',
    category: 'parbik',
    termGroup: '২য় সাময়িক পর্ব',
    syllabusField: 'midterm2_1Syllabus',
    description: 'সব বিষয় মিলিয়ে ১ পাতার ১০০ নম্বরের ১ দিনের প্রস্তুতিমূলক পরীক্ষা'
  },
  {
    order: 5,
    id: 'parbik_2_2',
    label: 'দ্বিতীয় পার্বিক পরীক্ষা (২য় সাময়িক) ২০২৬',
    shortLabel: '২য় পার্বিক (২য় সাময়িক)',
    category: 'parbik',
    termGroup: '২য় সাময়িক পর্ব',
    syllabusField: 'midterm2_2Syllabus',
    description: 'সব বিষয় মিলিয়ে ১ পাতার ১০০ নম্বরের ১ দিনের প্রস্তুতিমূলক পরীক্ষা'
  },
  {
    order: 6,
    id: 'term_2',
    label: 'দ্বিতীয় সাময়িক পরীক্ষা ২০২৬',
    shortLabel: '২য় সাময়িক পরীক্ষা',
    category: 'term',
    termGroup: '২য় সাময়িক পর্ব',
    syllabusField: 'term2Syllabus',
    description: 'বিষয়ভিত্তিক মেয়াদী পরীক্ষা — প্রতিদিন ১টি করে আলাদা বিষয়ের পরীক্ষা'
  },
  {
    order: 7,
    id: 'parbik_3_1',
    label: 'প্রথম পার্বিক পরীক্ষা (বার্ষিক) ২০২৬',
    shortLabel: '১ম পার্বিক (বার্ষিক)',
    category: 'parbik',
    termGroup: 'বার্ষিক পর্ব',
    syllabusField: 'midterm3_1Syllabus',
    description: 'সব বিষয় মিলিয়ে ১ পাতার ১০০ নম্বরের ১ দিনের প্রস্তুতিমূলক পরীক্ষা'
  },
  {
    order: 8,
    id: 'parbik_3_2',
    label: 'দ্বিতীয় পার্বিক পরীক্ষা (বার্ষিক) ২০২৬',
    shortLabel: '২য় পার্বিক (বার্ষিক)',
    category: 'parbik',
    termGroup: 'বার্ষিক পর্ব',
    syllabusField: 'midterm3_2Syllabus',
    description: 'সব বিষয় মিলিয়ে ১ পাতার ১০০ নম্বরের ১ দিনের প্রস্তুতিমূলক পরীক্ষা'
  },
  {
    order: 9,
    id: 'term_3',
    label: 'বার্ষিক পরীক্ষা ২০২৬',
    shortLabel: 'বার্ষিক পরীক্ষা',
    category: 'term',
    termGroup: 'বার্ষিক পর্ব',
    syllabusField: 'term3Syllabus',
    description: 'বিষয়ভিত্তিক চূড়ান্ত মেয়াদী পরীক্ষা — প্রতিদিন ১টি করে আলাদা বিষয়ের পরীক্ষা'
  }
];

export const SCHOOL_CLASSES = [
  'প্লে',
  'নার্সারী',
  '১ম শ্রেণি',
  '২য় শ্রেণি',
  '৩য় শ্রেণি',
  '৪র্থ শ্রেণি',
  '৫ম শ্রেণি',
  '৬ষ্ঠ শ্রেণি',
  '৭ম শ্রেণি',
  '৮ম শ্রেণি',
  '৯ম শ্রেণি',
  '১০ম শ্রেণি'
] as const;

export type SchoolClassName = typeof SCHOOL_CLASSES[number];

// ==========================================
// STUDENT DAILY EVALUATION TYPES (শিক্ষার্থী মূল্যায়ন সীট)
// ==========================================
export type HandwritingQuality = 'খুব ভালো' | 'ভালো' | 'মোটামুটি' | 'ভালো নয়' | 'খুবই খারাপ';
export type LessonPreparation = 'সম্পূর্ণ মুখস্ত' | 'আংশিক প্রস্তুত' | 'মুখস্ত করেনি';
export type AttendanceStatus = 'উপস্থিত' | 'অনুপস্থিত' | 'দেরিতে আসা';
export type BehaviorStatus = 'উত্তম / স্বাভাবিক' | 'শিষ্টাচার লঙ্ঘন করেছে';
export type HandwritingBrought = 'এনেছে' | 'আনেনি';

export interface StudentDailyEvaluation {
  id: string;
  studentId: string; // references student id / code
  studentName: string;
  roll: string;
  className: string;
  section: string;
  date: string; // YYYY-MM-DD
  subject: string; // বাংলা, ইংরেজি, গণিত, সাধারণ ইত্যাদি
  evaluatorTeacher?: string; // মূল্যায়নকারী শিক্ষক
  
  // Indicators requested by user:
  attendance: AttendanceStatus; // এবসেন্ড / প্রেজেন্ট
  handwritingBrought: HandwritingBrought; // হাতের লেখা আনেনি / এনেছে
  handwritingQuality: HandwritingQuality; // ভাল - মোটামুটি - ভাল নয় - খুবই খারাপ
  lessonPreparation: LessonPreparation; // পড়া মুখস্ত করে আসেনি / এসেছে
  behavior: BehaviorStatus; // শিষ্টাচার লঙ্ঘন করেছে
  uniformCleanliness?: 'পরিপাটি' | 'অপরিচ্ছন্ন বা ড্রেস ছাড়া';
  remarks?: string; // বিশেষ নোট বা মন্তব্য
  guardianNoticeSent?: boolean; // অভিভাবককে অবহিতকরণ প্রয়োজন
  createdAt: string;
}

// ==========================================
// ACADEMIC EXAM CALENDAR (৯ পরীক্ষা + মডেল টেস্ট)
// ==========================================
export type CalendarEventCategory = 'parbik' | 'term' | 'model_test';

export interface ExamCalendarEvent {
  id: string;
  examId?: string; // links to ACADEMY_EXAMS_9.id if part of the 9 core exams
  order?: number;
  title: string;
  shortTitle: string;
  category: CalendarEventCategory;
  termGroup?: '১ম সাময়িক পর্ব' | '২য় সাময়িক পর্ব' | 'বার্ষিক পর্ব' | 'বৃত্তি ও মডেল টেস্ট';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  classScope: string;
  totalMarks: string;
  notes?: string;
  completed?: boolean;
}

export const DEFAULT_EXAM_CALENDAR_2026: ExamCalendarEvent[] = [
  {
    id: 'cal_parbik_1_1',
    examId: 'parbik_1_1',
    order: 1,
    title: 'প্রথম পার্বিক পরীক্ষা (১ম সাময়িক) ২০২৬',
    shortTitle: '১ম পার্বিক (১ম সাম.)',
    category: 'parbik',
    termGroup: '১ম সাময়িক পর্ব',
    startDate: '2026-02-10',
    endDate: '2026-02-10',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ (১ পাতা · সব বিষয়)',
    notes: 'এক দিনের সমন্বিত পরীক্ষা। সব বিষয় মিলিয়ে ১ পাতার ১০০ নম্বরের প্রশ্নপত্র।',
    completed: true
  },
  {
    id: 'cal_parbik_1_2',
    examId: 'parbik_1_2',
    order: 2,
    title: 'দ্বিতীয় পার্বিক পরীক্ষা (১ম সাময়িক) ২০২৬',
    shortTitle: '২য় পার্বিক (১ম সাম.)',
    category: 'parbik',
    termGroup: '১ম সাময়িক পর্ব',
    startDate: '2026-03-14',
    endDate: '2026-03-14',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ (১ পাতা · সব বিষয়)',
    notes: '১ম সাময়িকের চূড়ান্ত প্রস্তুতি যাচাইয়ের ১ দিনের সমন্বিত পার্বিক পরীক্ষা।',
    completed: true
  },
  {
    id: 'cal_term_1',
    examId: 'term_1',
    order: 3,
    title: 'প্রথম সাময়িক পরীক্ষা ২০২৬',
    shortTitle: '১ম সাময়িক (মেয়াদী)',
    category: 'term',
    termGroup: '১ম সাময়িক পর্ব',
    startDate: '2026-04-12',
    endDate: '2026-04-21',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ প্রতি বিষয়',
    notes: 'বিষয়ভিত্তিক মেয়াদী পরীক্ষা — প্রতিদিন ১টি করে আলাদা বিষয়ের পরীক্ষা।',
    completed: true
  },
  {
    id: 'cal_mt_1',
    title: 'মডেল টেস্ট ০১ — প্রাথমিক ও কিন্ডারগার্টেন বৃত্তি প্রস্তুতি',
    shortTitle: 'বৃত্তি মডেল টেস্ট ০১',
    category: 'model_test',
    termGroup: 'বৃত্তি ও মডেল টেস্ট',
    startDate: '2026-05-20',
    endDate: '2026-05-20',
    classScope: '৩য়, ৪র্থ, ৫ম ও ৮ম শ্রেণি',
    totalMarks: '১০০ (পাকাপোক্ত মান: ৮৫%)',
    notes: 'বৃত্তি পরীক্ষার্থীদের প্রাথমিক দক্ষতা ও গতি যাচাইয়ের মডেল টেস্ট।',
    completed: true
  },
  {
    id: 'cal_parbik_2_1',
    examId: 'parbik_2_1',
    order: 4,
    title: 'প্রথম পার্বিক পরীক্ষা (২য় সাময়িক) ২০২৬',
    shortTitle: '১ম পার্বিক (২য় সাম.)',
    category: 'parbik',
    termGroup: '২য় সাময়িক পর্ব',
    startDate: '2026-06-15',
    endDate: '2026-06-15',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ (১ পাতা · সব বিষয়)',
    notes: '২য় সাময়িক পর্বের ১ম সমন্বিত পার্বিক পরীক্ষা।',
    completed: true
  },
  {
    id: 'cal_parbik_2_2',
    examId: 'parbik_2_2',
    order: 5,
    title: 'দ্বিতীয় পার্বিক পরীক্ষা (২য় সাময়িক) ২০২৬',
    shortTitle: '২য় পার্বিক (২য় সাম.)',
    category: 'parbik',
    termGroup: '২য় সাময়িক পর্ব',
    startDate: '2026-07-18',
    endDate: '2026-07-18',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ (১ পাতা · সব বিষয়)',
    notes: '২য় সাময়িকের আগে চূড়ান্ত পার্বিক প্রস্তুতি পরীক্ষা।',
    completed: true
  },
  {
    id: 'cal_term_2',
    examId: 'term_2',
    order: 6,
    title: 'দ্বিতীয় সাময়িক পরীক্ষা ২০২৬',
    shortTitle: '২য় সাময়িক (মেয়াদী)',
    category: 'term',
    termGroup: '২য় সাময়িক পর্ব',
    startDate: '2026-08-16',
    endDate: '2026-08-25',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ প্রতি বিষয়',
    notes: 'বিষয়ভিত্তিক মেয়াদী পরীক্ষা — প্রতিদিন একটি বিষয়ের পরীক্ষা।',
    completed: true
  },
  {
    id: 'cal_parbik_3_1',
    examId: 'parbik_3_1',
    order: 7,
    title: 'প্রথম পার্বিক পরীক্ষা (বার্ষিক) ২০২৬',
    shortTitle: '১ম পার্বিক (বার্ষিক)',
    category: 'parbik',
    termGroup: 'বার্ষিক পর্ব',
    startDate: '2026-09-22',
    endDate: '2026-09-22',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ (১ পাতা · সব বিষয়)',
    notes: 'বার্ষিক পরীক্ষার পূর্বে ১ম পার্বিক সমন্বিত পরীক্ষা।',
    completed: true
  },
  {
    id: 'cal_parbik_3_2',
    examId: 'parbik_3_2',
    order: 8,
    title: 'দ্বিতীয় পার্বিক পরীক্ষা (বার্ষিক) ২০২৬',
    shortTitle: '২য় পার্বিক (বার্ষিক)',
    category: 'parbik',
    termGroup: 'বার্ষিক পর্ব',
    startDate: '2026-10-27',
    endDate: '2026-10-27',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ (১ পাতা · সব বিষয়)',
    notes: 'বার্ষিক পরীক্ষার পূর্বে ২য় পার্বিক প্রস্তুতি পরীক্ষা।',
    completed: true
  },
  {
    id: 'cal_mt_2',
    title: 'মডেল টেস্ট ০২ — কিন্ডারগার্টেন ও সরকারি বৃত্তি চূড়ান্ত যাচাই',
    shortTitle: 'বৃত্তি মডেল টেস্ট ০২',
    category: 'model_test',
    termGroup: 'বৃত্তি ও মডেল টেস্ট',
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    classScope: '৩য়, ৪র্থ, ৫ম ও ৮ম শ্রেণি',
    totalMarks: '১০০ (পাকাপোক্ত মান: ৮৫%)',
    notes: 'বৃত্তি পরীক্ষার আগে প্রস্তুতি কতটা পাকাপোক্ত হয়েছে তা জাজ করার বিশেষ মডেল টেস্ট।',
    completed: false
  },
  {
    id: 'cal_mt_3',
    title: 'স্পেশাল গ্র্যান্ড মডেল টেস্ট ০৩ — ট্যালেন্টপুল নিশ্চিতকরণ',
    shortTitle: 'গ্র্যান্ড মডেল টেস্ট ০৩',
    category: 'model_test',
    termGroup: 'বৃত্তি ও মডেল টেস্ট',
    startDate: '2026-11-28',
    endDate: '2026-11-28',
    classScope: 'বৃত্তি ব্যাচ (২য়–৮ম শ্রেণি)',
    totalMarks: '১০০ (পাকাপোক্ত মান: ৮৮%)',
    notes: 'বৃত্তির চূড়ান্ত সিলেবাস ও সময় ব্যবস্থাপনা যাচাই।',
    completed: false
  },
  {
    id: 'cal_term_3',
    examId: 'term_3',
    order: 9,
    title: 'বার্ষিক পরীক্ষা ২০২৬ (চূড়ান্ত মেয়াদী)',
    shortTitle: 'বার্ষিক পরীক্ষা',
    category: 'term',
    termGroup: 'বার্ষিক পর্ব',
    startDate: '2026-12-06',
    endDate: '2026-12-17',
    classScope: 'প্লে – ১০ম শ্রেণি',
    totalMarks: '১০০ প্রতি বিষয়',
    notes: 'বার্ষিক চূড়ান্ত মেয়াদী পরীক্ষা — প্রতিদিন ১টি করে আলাদা বিষয়ের পরীক্ষা ও ফলাফল প্রকাশ।',
    completed: false
  }
];

// ==========================================
// MODEL TEST & SCHOLARSHIP READINESS TYPES (বৃত্তি ও মডেল টেস্ট প্রস্তুতি)
// ==========================================
export type ScholarshipProgramType =
  | 'সরকারি প্রাথমিক ও জুনিয়র বৃত্তি'
  | 'কিন্ডারগার্টেন অ্যাসোসিয়েশন বৃত্তি'
  | 'উপজেলা / জেলা মেধাবৃত্তি'
  | 'সাপ্তাহিক / বিশেষ মডেল টেস্ট'
  | 'বার্ষিক পূর্ণাঙ্গ মডেল টেস্ট';

export type ReadinessTier = 'solid' | 'promising' | 'needs_practice' | 'intensive_care';

export interface ModelTestSubjectConfig {
  name: string;
  fullMarks: number;
}

export interface ModelTestStudentResult {
  studentId: string;
  studentName: string;
  roll: string;
  className: string;
  marks: Record<string, number>; // subjectName -> obtained marks
  teacherRemark?: string;
}

export interface ModelTestSession {
  id: string;
  title: string;
  scholarshipType: ScholarshipProgramType;
  className: string;
  date: string; // YYYY-MM-DD
  targetReadinessPercent: number; // e.g., 85 for পাকাপোক্ত বৃত্তি প্রস্তুতি
  subjects: ModelTestSubjectConfig[];
  results: ModelTestStudentResult[];
  updatedAt: string;
}


