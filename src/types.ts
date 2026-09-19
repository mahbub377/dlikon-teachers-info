export interface EducationRecord {
  id: string;
  examName: string;
  boardUniversity: string;
  passingYear: string;
  result: string;
  subject: string;
}

export interface ExperienceRecord {
  id: string;
  instituteName: string;
  designation: string;
  duration: string;
  subject: string;
  reasonForLeaving: string;
}

export interface ReferenceRecord {
  name: string;
  designationInstitute: string;
  mobile: string;
  email: string;
  relation: string;
}

export interface TeacherFormData {
  id: string;
  // 1. Personal Details
  teacherId: string; // শিক্ষক আইডি / ইনডেক্স
  fullName: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  nidNumber: string;
  birthCertNumber: string;
  passportNumber: string;
  mobileNumber: string;
  emergencyMobile: string;
  email: string;
  presentAddress: string;
  permanentAddress: string;
  bloodGroup: string;
  religion: string;
  maritalStatus: string;
  gender: string;
  nationality: string;

  // 2. Employment Details
  designation: string;
  mainSubject: string;
  assignedClasses: string;
  appointmentDate: string;
  joiningDate: string;
  highestDegree: string;
  salaryScale: string;
  bankAccountNo: string;

  // 3. Education
  educationList: EducationRecord[];

  // 4. Experience
  experienceList: ExperienceRecord[];

  // 5. References
  references: [ReferenceRecord, ReferenceRecord];

  // 6. Extracurricular Skills
  extraCurricular: string[];
  extraCurricularDetails: string;

  // 7. Computer Skills
  computerSkills: string[];
  typingSpeedEnglish: string;
  typingSpeedBangla: string;

  // 8. Documents & Photos
  teacherPhoto: string; // Base64 data URL
  teacherSignature: string; // Base64 data URL
  principalSignature: string; // Base64 data URL
  hasNidCopy: boolean;
  hasBirthCertCopy: boolean;
  hasCertificateCopy: boolean;
  hasPassportCopy: boolean;

  // 9. Comments & Metadata
  specialNotes: string;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 'form' | 'preview' | 'list' | 'idcard';
