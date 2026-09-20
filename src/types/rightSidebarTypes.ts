import { EducationRecord, ExperienceRecord, ReferenceRecord, TeacherFormData, ActiveTab } from '../types';

export * from '../types';

// Right sidebar tracking items
export interface RightSidebarStudentIssue {
  id: string;
  className: string;
  subject: string;
  studentName: string;
  roll: string;
  unlearnedTopic: string; // আজকের যে পড়াটা পারেনি (সেশন প্লান থেকে ড্রপডাউনে সিলেক্ট করা)
  date: string;
  status: 'pending' | 'resolved';
}

export interface SessionPlanTopic {
  id: string;
  className: string;
  subject: string;
  topicTitle: string; // পাঠ শিরোনাম (গতকাল শিক্ষকদের দেওয়া আপডেট)
  updatedDate: string;
}

export interface ActivitySessionPlanItem {
  id: string;
  title: string;
  className: string;
  subject: string;
  activityType: 'দলীয় কাজ' | 'ব্যবহারিক প্রজেক্ট' | 'কুইজ ও বিতর্ক' | 'রোল প্লে' | 'উপকরণ প্রদর্শনী';
  duration: string;
  materials: string;
  objective: string;
}

export interface InnovativeStudentPlanItem {
  id: string;
  studentName: string;
  className: string;
  roll: string;
  talentDomain: 'বিজ্ঞান ও উদ্ভাবন' | 'গণিত অলিম্পিয়াড' | 'সাহিত্য ও বিতর্ক' | 'আর্ট ও ক্রাফট' | 'ডিজিটাল কোডিং';
  projectGoal: string;
  mentorTeacher: string;
  currentMilestone: string;
}

export interface UpcomingCompetitionItem {
  id: string;
  competitionTitle: string;
  level: 'উপজেলা পর্যায়' | 'জেলা পর্যায়' | 'জাতীয় পর্যায়' | 'একাডেমি অভ্যন্তরীণ';
  eventDate: string;
  venue: string;
  targetClasses: string;
  responsibleTeacher: string;
  preparedStudentsCount: number;
}
