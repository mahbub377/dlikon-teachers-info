export interface StudentRecord {
  id: string;
  name: string;
  roll: string;
  mobile: string;
  className: string;
  section?: string;
  guardianName?: string;
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
