import { TeacherFormData } from '../types';

export const EXTRA_SKILLS_OPTIONS = [
  'গান গাইতে পারা',
  'নৃত্য',
  'কোরআন তিলাওয়াত',
  'অভিনয়',
  'আবৃত্তি',
  'চিত্রাঙ্কন',
  'ক্রীড়া কোচিং',
  'বক্তৃতা / উপস্থাপনা',
  'স্কাউটিং / গাইড',
  'সাংবাদিকতা / দেয়াল পত্রিকা',
  'অন্যান্য'
];

export const COMPUTER_SKILLS_OPTIONS = [
  'উইন্ডোজ অপারেটিং সিস্টেম',
  'এম এস ওয়ার্ড (MS Word)',
  'এম এস এক্সেল (MS Excel)',
  'পাওয়ার পয়েন্ট (PowerPoint)',
  'ফটোশপ / গ্রাফিক্স',
  'স্কেনিং ও ডিজিটাল ডকুমেন্ট',
  'প্রিন্টিং ও লেমিনেটিং',
  'ইন্টারনেট ব্রাউজিং ও ইমেইল'
];

export const DESIGNATION_OPTIONS = [
  'প্রধান শিক্ষক',
  'সহকারী প্রধান শিক্ষক',
  'সিনিয়র শিক্ষক',
  'সহকারী শিক্ষক',
  'সহকারী শিক্ষিকা',
  'জুনিয়র শিক্ষক',
  'ধর্মীয় শিক্ষক',
  'আইসিটি শিক্ষক',
  'শারীরিক শিক্ষা শিক্ষক',
  'চারু ও কারুকলা শিক্ষক',
  'অফিস সহকারী কাম কম্পিউটার অপারেটর',
  'অন্যান্য'
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MARITAL_STATUS = ['অবিবাহিত', 'বিবাহিত', 'অন্যান্য'];

export const RELIGIONS = ['ইসলাম', 'হিন্দু', 'বৌদ্ধ', 'খ্রিস্টান', 'অন্যান্য'];

export const GENDERS = ['পুরুষ', 'মহিলা', 'অন্যান্য'];

export const DEFAULT_EDUCATION_ROWS = [
  { id: '1', examName: 'এস.এস.সি / সমমান', boardUniversity: '', passingYear: '', result: '', subject: '' },
  { id: '2', examName: 'এইচ.এস.সি / সমমান', boardUniversity: '', passingYear: '', result: '', subject: '' },
  { id: '3', examName: 'স্নাতক (পাস/সম্মান)', boardUniversity: '', passingYear: '', result: '', subject: '' },
  { id: '4', examName: 'স্নাতকোত্তর / বি.এড', boardUniversity: '', passingYear: '', result: '', subject: '' }
];

export const DEFAULT_EXPERIENCE_ROWS = [
  { id: '1', instituteName: '', designation: '', duration: '', subject: '', reasonForLeaving: '' },
  { id: '2', instituteName: '', designation: '', duration: '', subject: '', reasonForLeaving: '' }
];

export const createEmptyTeacher = (): TeacherFormData => ({
  id: 'tch_' + Date.now(),
  teacherId: 'DLMA-' + Math.floor(1000 + Math.random() * 9000),
  fullName: '',
  fatherName: '',
  motherName: '',
  birthDate: '',
  nidNumber: '',
  birthCertNumber: '',
  passportNumber: '',
  mobileNumber: '',
  emergencyMobile: '',
  email: '',
  presentAddress: '',
  permanentAddress: '',
  bloodGroup: '',
  religion: 'ইসলাম',
  maritalStatus: '',
  gender: 'পুরুষ',
  nationality: 'বাংলাদেশী',

  designation: '',
  mainSubject: '',
  assignedClasses: '',
  appointmentDate: '',
  joiningDate: '',
  highestDegree: '',
  salaryScale: '',
  bankAccountNo: '',

  educationList: [
    { id: '1', examName: 'এস.এস.সি', boardUniversity: '', passingYear: '', result: '', subject: '' },
    { id: '2', examName: 'এইচ.এস.সি', boardUniversity: '', passingYear: '', result: '', subject: '' },
    { id: '3', examName: 'স্নাতক (সম্মান)', boardUniversity: '', passingYear: '', result: '', subject: '' },
    { id: '4', examName: 'স্নাতকোত্তর', boardUniversity: '', passingYear: '', result: '', subject: '' }
  ],

  experienceList: [
    { id: '1', instituteName: '', designation: '', duration: '', subject: '', reasonForLeaving: '' }
  ],

  references: [
    { name: '', designationInstitute: '', mobile: '', email: '', relation: '' },
    { name: '', designationInstitute: '', mobile: '', email: '', relation: '' }
  ],

  extraCurricular: [],
  extraCurricularDetails: '',

  computerSkills: [],
  typingSpeedEnglish: '',
  typingSpeedBangla: '',

  teacherPhoto: '',
  teacherSignature: '',
  principalSignature: '',
  hasNidCopy: false,
  hasBirthCertCopy: false,
  hasCertificateCopy: false,
  hasPassportCopy: false,

  specialNotes: '',
  submissionDate: new Date().toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const sampleTeacherData: TeacherFormData = {
  id: 'tch_sample_01',
  teacherId: 'DLMA-2024-007',
  fullName: 'মো: রফিকুল ইসলাম',
  fatherName: 'মো: আব্দুর রশিদ',
  motherName: 'মোসাম্মৎ সুফিয়া বেগম',
  birthDate: '1992-04-15',
  nidNumber: '19922692015000124',
  birthCertNumber: '19922692015123456',
  passportNumber: 'EE0987654',
  mobileNumber: '01712-345678',
  emergencyMobile: '01911-987654',
  email: 'rafiqul.dlma@gmail.com',
  presentAddress: 'বাড়ি নং ৪২, রোড নং ০৩, ব্লক বি, মিরপুর, ঢাকা-১২১৬',
  permanentAddress: 'গ্রাম: সোনাকান্দা, ডাকঘর: রায়পুরা, উপজেলা: রায়পুরা, জেলা: নরসিংদী',
  bloodGroup: 'B+',
  religion: 'ইসলাম',
  maritalStatus: 'বিবাহিত',
  gender: 'পুরুষ',
  nationality: 'বাংলাদেশী',

  designation: 'সহকারী শিক্ষক',
  mainSubject: 'গণিত ও সাধারণ বিজ্ঞান',
  assignedClasses: 'ষষ্ঠ থেকে দশম শ্রেণি',
  appointmentDate: '2023-01-10',
  joiningDate: '2023-02-01',
  highestDegree: 'এম.এসসি (গণিত), বি.এড',
  salaryScale: '১৬,০০০ - ৩৮,৬৪০/-',
  bankAccountNo: '২০৫.১০১.৬৭৮৯০',

  educationList: [
    { id: '1', examName: 'এস.এস.সি (বিজ্ঞান)', boardUniversity: 'ঢাকা বোর্ড', passingYear: '2008', result: 'GPA 5.00', subject: 'বিজ্ঞান' },
    { id: '2', examName: 'এইচ.এস.সি (বিজ্ঞান)', boardUniversity: 'ঢাকা বোর্ড', passingYear: '2010', result: 'GPA 4.80', subject: 'বিজ্ঞান' },
    { id: '3', examName: 'বি.এসসি (সম্মান)', boardUniversity: 'ঢাকা বিশ্ববিদ্যালয়', passingYear: '2014', result: '১ম শ্রেণি (৩.৫৮)', subject: 'ফলিত গণিত' },
    { id: '4', examName: 'এম.এসসি ও বি.এড', boardUniversity: 'ঢাকা বিশ্ববিদ্যালয় / টিটিসি', passingYear: '2016', result: '১ম শ্রেণি (৩.৬৫)', subject: 'গণিত ও শিক্ষা' }
  ],

  experienceList: [
    { id: '1', instituteName: 'আইডিয়াল মডেল হাই স্কুল', designation: 'সহকারী শিক্ষক (গণিত)', duration: '২০১৮ - ২০২১ (৩ বছর)', subject: 'উচ্চতর গণিত', reasonForLeaving: 'বাসস্থান পরিবর্তন ও উন্নত সুযোগ' },
    { id: '2', instituteName: 'অগ্রণী ক্যাডেট একাডেমি', designation: 'জুনিয়র শিক্ষক', duration: '২০১৬ - ২০১৭ (১ বছর ৬ মাস)', subject: 'সাধারণ বিজ্ঞান', reasonForLeaving: 'উচ্চশিক্ষা সমাপ্তি' }
  ],

  references: [
    {
      name: 'অধ্যাপক ড. মুহাম্মদ আনোয়ার হোসেন',
      designationInstitute: 'প্রাক্তন বিভাগীয় প্রধান, গণিত বিভাগ, ঢাকা বিশ্ববিদ্যালয়',
      mobile: '01819-234567',
      email: 'anwar.math@du.ac.bd',
      relation: 'বিশ্ববিদ্যালয় শিক্ষক'
    },
    {
      name: 'জনাব খায়রুল বশার',
      designationInstitute: 'প্রধান শিক্ষক, সোনাকান্দা পাইলট উচ্চ বিদ্যালয়',
      mobile: '01711-876543',
      email: 'bashar.headmaster@yahoo.com',
      relation: 'পূর্ববর্তী প্রধান শিক্ষক'
    }
  ],

  extraCurricular: [
    'কোরআন তিলাওয়াত',
    'আবৃত্তি',
    'বক্তৃতা / উপস্থাপনা',
    'ক্রীড়া কোচিং',
    'স্কাউটিং / গাইড'
  ],
  extraCurricularDetails: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ও বিতর্ক দল পরিচালনার বাস্তব অভিজ্ঞতা রয়েছে। শিক্ষার্থীদের বিজ্ঞান মেলায় প্রজেক্ট প্রদর্শনীতে মেন্টর হিসেবে কাজ করেছেন।',

  computerSkills: [
    'উইন্ডোজ অপারেটিং সিস্টেম',
    'এম এস ওয়ার্ড (MS Word)',
    'এম এস এক্সেল (MS Excel)',
    'পাওয়ার পয়েন্ট (PowerPoint)',
    'স্কেনিং ও ডিজিটাল ডকুমেন্ট',
    'প্রিন্টিং ও লেমিনেটিং',
    'ইন্টারনেট ব্রাউজিং ও ইমেইল'
  ],
  typingSpeedEnglish: '৪৫ WPM',
  typingSpeedBangla: '৩৫ WPM (বিজয় ও অভ্র)',

  // A clean placeholder avatar SVG data URL
  teacherPhoto: '',
  teacherSignature: '',
  principalSignature: '',
  hasNidCopy: true,
  hasBirthCertCopy: true,
  hasCertificateCopy: true,
  hasPassportCopy: false,

  specialNotes: 'অত্যন্ত দায়িত্বশীল ও সময়নিষ্ঠ। ডিজিটাল মাল্টিমিডিয়া ক্লাসরুমে পাঠদানে দক্ষ।',
  submissionDate: '2024-03-15',
  createdAt: '2024-03-15T10:00:00.000Z',
  updatedAt: '2024-03-15T10:00:00.000Z'
};
