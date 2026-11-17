export type LibraryCategory =
  | 'textbook'      // পাঠ্যবই (PDF)
  | 'syllabus'      // শ্রেণিভিত্তিক সিলেবাস
  | 'question_bank' // প্রশ্ন ব্যাংক
  | 'note_book'     // নোট বই
  | 'guide_book'    // গাইড বই
  | 'reference_link'; // রেফারেন্স লিংক

export type LibrarySourceType = 'pdf_upload' | 'external_url';

export interface LibraryResource {
  id: string;
  title: string;
  className: string; // প্লে থেকে ১০ম শ্রেণি অথবা 'সকল শ্রেণি'
  subject: string; // বাংলা, ইংরেজি, গণিত, বিজ্ঞান ইত্যাদি
  category: LibraryCategory;
  sourceType: LibrarySourceType;
  
  // File metadata (when sourceType === 'pdf_upload')
  fileName?: string;
  fileSize?: number; // bytes
  mimeType?: string;
  hasLocalBlob?: boolean; // stored in IndexedDB 'pdf_files' store
  hasCloudFile?: boolean; // stored in Cloud SQL 'library_files' table

  // External link / Reference URL (when sourceType === 'external_url' or category === 'reference_link')
  url?: string;

  // Academic details
  academicYear?: string; // e.g., ২০২৬
  termOrChapter?: string; // যেমন: ১ম সাময়িক / অধ্যায় ১-৫ / সম্পূর্ণ বই
  authorOrPublisher?: string; // শিক্ষক / প্রকাশনী
  description?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const LIBRARY_CATEGORIES: {
  id: LibraryCategory;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: 'textbook',
    label: 'পাঠ্যবই (PDF)',
    shortLabel: 'পাঠ্যবই',
    description: 'প্রতিটি শ্রেণির মূল বোর্ড ও একাডেমি পাঠ্যবইয়ের পিডিএফ'
  },
  {
    id: 'syllabus',
    label: 'শ্রেণিভিত্তিক সিলেবাস',
    shortLabel: 'সিলেবাস',
    description: '৯ পরীক্ষার (পার্বিক, সাময়িক ও বার্ষিক) সিলেবাস ও আপলোডকৃত পিডিএফ'
  },
  {
    id: 'question_bank',
    label: 'প্রশ্ন ব্যাংক',
    shortLabel: 'প্রশ্ন ব্যাংক',
    description: 'পার্বিক (১ পাতা ১০০ নম্বর), সাময়িক, বার্ষিক ও মডেল টেস্ট প্রশ্নপত্র সংগ্রহ'
  },
  {
    id: 'note_book',
    label: 'নোট বই',
    shortLabel: 'নোট বই',
    description: 'শিক্ষকদের প্রণীত হ্যান্ডনোট, লেকচার শিট ও অধ্যায়ভিত্তিক নোট'
  },
  {
    id: 'guide_book',
    label: 'গাইড বই',
    shortLabel: 'গাইড বই',
    description: 'সৃজনশীল ও বহুনির্বাচনি সহায়ক গাইড ও অনুশীলনী সমাধান'
  },
  {
    id: 'reference_link',
    label: 'রেফারেন্স লিংক',
    shortLabel: 'রেফারেন্স লিংক',
    description: 'অনলাইন ক্লাস, এনসিটিবি পোর্টাল ও সহায়ক ওয়েব রিসোর্স লিংক'
  }
];

export const LIBRARY_SUBJECTS = [
  'বাংলা',
  'ইংরেজি',
  'গণিত',
  'প্রাথমিক বিজ্ঞান / বিজ্ঞান',
  'বাংলাদেশ ও বিশ্বপরিচয়',
  'ইসলাম ও নৈতিক শিক্ষা',
  'হিন্দু ধর্ম ও নৈতিক শিক্ষা',
  'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
  'কৃষিশিক্ষা / গার্হস্থ্য বিজ্ঞান',
  'চারু ও কারুকলা',
  'আরবি / কুরআন শিক্ষা',
  'হাতের লেখা / অঙ্কন',
  'সকল বিষয় / সাধারণ'
] as const;
