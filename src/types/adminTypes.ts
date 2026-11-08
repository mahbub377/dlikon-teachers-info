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
  className: string; // ১। শ্রেণি
  term1Syllabus: string; // ২। প্রথম সাময়িক পরীক্ষার সিলেবাস
  midterm1_1Syllabus: string; // ৩। প্রথম মিডটার্ম পরীক্ষার সিলেবাস
  midterm1_2Syllabus: string; // ৪। দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস
  term2Syllabus: string; // ৫। দ্বিতীয় সাময়িক পরীক্ষা সিলেবাস
  midterm2_1Syllabus: string; // ৬। প্রথম মিডটার্ম পরীক্ষার সিলেবাস (২য় পর্ব)
  midterm2_2Syllabus: string; // ৭। দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস (২য় পর্ব)
  term3Syllabus: string; // ৮। বার্ষিক / পরবর্তী সাময়িক পরীক্ষা সিলেবাস
  midterm3_1Syllabus: string; // ৯। প্রথম মিডটার্ম পরীক্ষার সিলেবাস (চূড়ান্ত পর্ব)
  midterm3_2Syllabus: string; // ১০। দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস (চূড়ান্ত পর্ব)
  notes?: string; // ১১। বিশেষ শিক্ষণ নোট ও সমন্বয়
  updatedAt: string;
}

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

