import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  Download, 
  Sparkles, 
  Edit3, 
  HelpCircle,
  Check,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { TeacherFormData } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { EXTRA_SKILLS_OPTIONS, COMPUTER_SKILLS_OPTIONS } from '../data/sampleData';

interface PrintableTwoPageFormProps {
  formData: TeacherFormData;
  onEdit: () => void;
  onPrint: () => void;
  onLoadSample: () => void;
}

export const PrintableTwoPageForm: React.FC<PrintableTwoPageFormProps> = ({
  formData,
  onEdit,
  onPrint,
  onLoadSample
}) => {
  const [isBlankMode, setIsBlankMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // If blank mode is on, we display empty underlines for handwriting
  const data = isBlankMode ? {
    ...formData,
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
    religion: '',
    maritalStatus: '',
    gender: '',
    nationality: '',
    designation: '',
    mainSubject: '',
    assignedClasses: '',
    appointmentDate: '',
    joiningDate: '',
    highestDegree: '',
    salaryScale: '',
    bankAccountNo: '',
    teacherPhoto: '',
    teacherSignature: '',
    principalSignature: '',
    extraCurricular: [],
    extraCurricularDetails: '',
    computerSkills: [],
    typingSpeedEnglish: '',
    typingSpeedBangla: '',
    specialNotes: '',
    educationList: [
      { id: '1', examName: '', boardUniversity: '', passingYear: '', result: '', subject: '' },
      { id: '2', examName: '', boardUniversity: '', passingYear: '', result: '', subject: '' },
      { id: '3', examName: '', boardUniversity: '', passingYear: '', result: '', subject: '' },
      { id: '4', examName: '', boardUniversity: '', passingYear: '', result: '', subject: '' }
    ],
    experienceList: [
      { id: '1', instituteName: '', designation: '', duration: '', subject: '', reasonForLeaving: '' },
      { id: '2', instituteName: '', designation: '', duration: '', subject: '', reasonForLeaving: '' },
      { id: '3', instituteName: '', designation: '', duration: '', subject: '', reasonForLeaving: '' }
    ],
    references: [
      { name: '', designationInstitute: '', mobile: '', email: '', relation: '' },
      { name: '', designationInstitute: '', mobile: '', email: '', relation: '' }
    ]
  } as TeacherFormData : formData;

  // Ensure education list has at least 4 rows for clean print table
  const educationRows = [...data.educationList];
  while (educationRows.length < 4) {
    educationRows.push({
      id: 'fill_' + educationRows.length,
      examName: '',
      boardUniversity: '',
      passingYear: '',
      result: '',
      subject: ''
    });
  }

  // Ensure experience list has at least 3 rows for clean print table
  const experienceRows = [...data.experienceList];
  while (experienceRows.length < 3) {
    experienceRows.push({
      id: 'fill_exp_' + experienceRows.length,
      instituteName: '',
      designation: '',
      duration: '',
      subject: '',
      reasonForLeaving: ''
    });
  }

  return (
    <div className="pb-16">
      {/* Top Preview Controls Toolbar */}
      <div className="no-print sticky top-20 z-30 bg-slate-900 text-white px-4 sm:px-6 py-3 shadow-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-teal-600/30 text-teal-300 rounded-lg border border-teal-500/30">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-100">A4 ২-পাতা অফিশিয়াল প্রিন্ট প্রিভিউ</span>
            <span className="hidden sm:inline text-xs text-slate-400 ml-2">
              (Ctrl+P অথবা নিচের বাটনে চাপুন)
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Blank Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              id="btn-toggle-filled"
              type="button"
              onClick={() => setIsBlankMode(false)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                !isBlankMode ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              পূরণকৃত ফরম
            </button>
            <button
              id="btn-toggle-blank"
              type="button"
              onClick={() => setIsBlankMode(true)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                isBlankMode ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              হাতে লেখার ফাঁকা ফরম
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
            <button
              id="btn-zoom-out"
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
              title="জুম কমান"
              className="p-1 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center font-mono text-[11px]">{zoomLevel}%</span>
            <button
              id="btn-zoom-in"
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              title="জুম বাড়ান"
              className="p-1 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="btn-edit-from-preview"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            এডিট করুন
          </button>

          <button
            id="btn-print-now"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            প্রিন্ট / PDF সংরক্ষণ
          </button>
        </div>
      </div>

      {/* Helper message banner */}
      <div className="no-print max-w-5xl mx-auto px-4 mt-4">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>প্রিন্ট টিপস:</strong> ব্রাউজারের প্রিন্ট ডায়ালগে পেপার সাইজ <strong>&quot;A4&quot;</strong>, ওরিয়েন্টেশন <strong>&quot;Portrait&quot;</strong> এবং মার্জিন <strong>&quot;Default&quot;</strong> অথবা <strong>&quot;None/Minimum&quot;</strong> নির্বাচন করুন। ব্যাকগ্রাউন্ড গ্রাফিক্স চেকবক্সে টিক দিন।
            </span>
          </div>
          {!data.fullName && !isBlankMode && (
            <button
              onClick={onLoadSample}
              className="shrink-0 text-xs underline font-semibold text-teal-800 hover:text-teal-950 ml-2 cursor-pointer"
            >
              নমুনা ডাটা দিয়ে দেখুন
            </button>
          )}
        </div>
      </div>

      {/* Form Container with Zoom wrapper */}
      <div 
        className="w-full flex flex-col items-center mt-6 transition-transform origin-top"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >

        {/* =========================================================
            📄 পৃষ্ঠা ১ (PAGE 1 of 2)
            ========================================================= */}
        <div 
          id="a4-page-1"
          className="print-page w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-9 shadow-xl border border-slate-300 rounded-sm mb-8 print:shadow-none print:border-none print:m-0 print:p-0"
        >
          {/* Page Top Meta */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 mb-1 border-b border-slate-200">
            <span className="font-semibold text-teal-900">ডি-লিকন মডেল একাডেমী • শিক্ষক তথ্য ডাটাবেজ</span>
            <span className="font-bold text-slate-700">পৃষ্ঠা ১ / ২</span>
          </div>

          {/* School Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <SchoolLogo size={58} className="shrink-0" />
              <div>
                <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-none mb-0.5">
                  ডি-লিকন মডেল একাডেমী
                </h1>
                <p className="text-[12px] font-bold text-teal-900 tracking-wide">
                  D-LIKON MODEL ACADEMY
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  একটি আদর্শ ও আধুনিক ডিজিটাল শিক্ষাপ্রতিষ্ঠান
                </p>
              </div>
            </div>

            {/* Passport Photo Box */}
            <div className="w-[100px] h-[115px] border-2 border-dashed border-slate-400 bg-slate-50 rounded-xs flex flex-col items-center justify-center p-0.5 shrink-0 overflow-hidden text-center shadow-xs">
              {data.teacherPhoto ? (
                <img 
                  src={data.teacherPhoto} 
                  alt="Teacher" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-1">
                  <span className="text-[10px] font-bold text-slate-600 block leading-tight">পাসপোর্ট সাইজ</span>
                  <span className="text-[9px] text-slate-500 block">রঙিন ছবি</span>
                  <span className="text-[8px] text-slate-400 block mt-1">(আঠা দিয়ে লাগান)</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Title Banner */}
          <div className="text-center mb-3">
            <div className="inline-block bg-slate-900 text-white px-5 py-1 rounded-sm text-sm font-bold tracking-wide uppercase">
              শিক্ষক তথ্য সংগ্রহ ফরম
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              বিদ্যালয়ের সকল শিক্ষকের তথ্য ডিজিটাল ডেটাবেজে সংরক্ষণের জন্য
            </div>
          </div>

          {/* ID & Index Bar */}
          <div className="flex items-center justify-between text-[11px] bg-slate-100 px-3 py-1.5 rounded-sm border border-slate-300 mb-3">
            <div>
              <span className="font-bold text-slate-800">শিক্ষক আইডি / ইনডেক্স নং: </span>
              <span className="font-mono font-bold text-teal-900 ml-1">
                {data.teacherId || '________________'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-800">ফরম পূরণের তারিখ: </span>
              <span className="font-medium text-slate-900 ml-1">
                {data.submissionDate || '____/____/২০___'}
              </span>
            </div>
          </div>

          {/* 🟢 ১. ব্যক্তিগত তথ্য (1. Personal Information) */}
          <div className="mb-3.5">
            <div className="text-[12px] font-bold text-white bg-teal-800 px-2.5 py-1 rounded-xs flex items-center justify-between mb-2">
              <span>১. ব্যক্তিগত তথ্য</span>
              <span className="text-[10px] font-normal text-teal-100">Personal Information</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
              <div className="flex items-end col-span-2">
                <span className="w-36 shrink-0 font-bold text-slate-800">শিক্ষকের পূর্ণ নাম:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-semibold text-slate-950 px-1 pb-0.5 min-h-[20px]">
                  {data.fullName}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">পিতার নাম:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.fatherName}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">মাতার নাম:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.motherName}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">জন্ম তারিখ:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.birthDate}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">রক্তের গ্রুপ:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-bold text-rose-700 px-1 pb-0.5 min-h-[20px]">
                  {data.bloodGroup}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">জাতীয় পরিচয়পত্র (NID):</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-mono text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.nidNumber}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">জন্ম নিবন্ধন নম্বর:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-mono text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.birthCertNumber}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">পাসপোর্ট নম্বর:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-mono text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.passportNumber}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">মোবাইল নম্বর:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-bold text-slate-950 px-1 pb-0.5 min-h-[20px]">
                  {data.mobileNumber}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">জরুরী যোগাযোগ নম্বর:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.emergencyMobile}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">ইমেইল ঠিকানা:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.email}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">ধর্ম:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.religion}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">বৈবাহিক অবস্থা:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.maritalStatus}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">লিঙ্গ (Gender):</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.gender}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">জাতীয়তা:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.nationality}
                </span>
              </div>

              <div className="flex items-start col-span-2 mt-0.5">
                <span className="w-36 shrink-0 font-bold text-slate-800 pt-0.5">বর্তমান ঠিকানা:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.presentAddress}
                </span>
              </div>

              <div className="flex items-start col-span-2">
                <span className="w-36 shrink-0 font-bold text-slate-800 pt-0.5">স্থায়ী ঠিকানা:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.permanentAddress}
                </span>
              </div>
            </div>
          </div>

          {/* 🟢 ২. চাকুরি সংক্রান্ত তথ্য (2. Employment Information) */}
          <div className="mb-3.5">
            <div className="text-[12px] font-bold text-white bg-teal-800 px-2.5 py-1 rounded-xs flex items-center justify-between mb-2">
              <span>২. চাকুরি সংক্রান্ত তথ্য</span>
              <span className="text-[10px] font-normal text-teal-100">Employment Details</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">পদবি:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-bold text-teal-950 px-1 pb-0.5 min-h-[20px]">
                  {data.designation}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">প্রধান বিষয়:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-semibold text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.mainSubject}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">পাঠদানের শ্রেণি:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.assignedClasses}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">নিয়োগের তারিখ:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.appointmentDate}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">যোগদানের তারিখ:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.joiningDate}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">সর্বোচ্চ ডিগ্রি:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.highestDegree}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">বেতন স্কেল / গ্রেড:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.salaryScale}
                </span>
              </div>

              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">ব্যাংক অ্যাকাউন্ট নং:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-mono text-slate-900 px-1 pb-0.5 min-h-[20px]">
                  {data.bankAccountNo}
                </span>
              </div>
            </div>
          </div>

          {/* 🟢 ৩. সর্বোচ্চ শিক্ষাগত যোগ্যতা (বিস্তারিত) (3. Academic Qualification) */}
          <div>
            <div className="text-[12px] font-bold text-white bg-teal-800 px-2.5 py-1 rounded-xs flex items-center justify-between mb-2">
              <span>৩. সর্বোচ্চ শিক্ষাগত যোগ্যতা (বিস্তারিত)</span>
              <span className="text-[10px] font-normal text-teal-100">Academic Qualifications</span>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px] mb-2">
              <thead>
                <tr className="bg-slate-200/90 text-slate-900 font-bold">
                  <th className="border border-slate-800 p-1.5 text-center w-32">পরীক্ষার নাম</th>
                  <th className="border border-slate-800 p-1.5 text-center">বোর্ড / বিশ্ববিদ্যালয়</th>
                  <th className="border border-slate-800 p-1.5 text-center w-20">পাসের সন</th>
                  <th className="border border-slate-800 p-1.5 text-center w-28">ফলাফল (GPA)</th>
                  <th className="border border-slate-800 p-1.5 text-center w-36">বিষয় / বিভাগ</th>
                </tr>
              </thead>
              <tbody>
                {educationRows.map((edu, i) => (
                  <tr key={i} className="h-7 text-center">
                    <td className="border border-slate-800 p-1 font-semibold text-slate-900 text-left pl-2">
                      {edu.examName}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800">
                      {edu.boardUniversity}
                    </td>
                    <td className="border border-slate-800 p-1 font-mono text-slate-800">
                      {edu.passingYear}
                    </td>
                    <td className="border border-slate-800 p-1 font-semibold text-slate-900">
                      {edu.result}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800 text-left pl-2">
                      {edu.subject}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Page 1 Footer Note */}
          <div className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
            <span>ডি-লিকন মডেল একাডেমী • প্রাতিষ্ঠানিক শিক্ষক নথিপত্র ফরম</span>
            <span className="font-bold text-slate-700">[ পরবর্তী পাতা দেখুন ➔ ]</span>
          </div>
        </div>


        {/* =========================================================
            📄 পৃষ্ঠা ২ (PAGE 2 of 2)
            ========================================================= */}
        <div 
          id="a4-page-2"
          className="print-page page-break w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-9 shadow-xl border border-slate-300 rounded-sm mb-8 print:shadow-none print:border-none print:m-0 print:p-0"
        >
          {/* Page Top Meta */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 mb-1 border-b border-slate-200">
            <span className="font-semibold text-teal-900">ডি-লিকন মডেল একাডেমী • শিক্ষক তথ্য ডাটাবেজ</span>
            <span className="font-bold text-slate-700">পৃষ্ঠা ২ / ২</span>
          </div>

          {/* Page 2 Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
            <div className="flex items-center gap-2.5">
              <SchoolLogo size={38} className="shrink-0" />
              <div>
                <h2 className="text-lg font-black text-slate-950 leading-tight">
                  ডি-লিকন মডেল একাডেমী
                </h2>
                <p className="text-[11px] text-slate-600">
                  শিক্ষক তথ্য সংগ্রহ ফরম (চলমান পাতা)
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-800">
                শিক্ষক: <span className="text-teal-900">{data.fullName || '________________'}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                আইডি: {data.teacherId || '________'}
              </div>
            </div>
          </div>

          {/* 🟢 ৪. পূর্ববর্তী চাকুরির অভিজ্ঞতা (4. Previous Experience) */}
          <div className="mb-3.5">
            <div className="text-[12px] font-bold text-white bg-teal-800 px-2.5 py-1 rounded-xs flex items-center justify-between mb-2">
              <span>৪. পূর্ববর্তী চাকুরির অভিজ্ঞতা</span>
              <span className="text-[10px] font-normal text-teal-100">Teaching & Professional Experience</span>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px] mb-1">
              <thead>
                <tr className="bg-slate-200/90 text-slate-900 font-bold">
                  <th className="border border-slate-800 p-1.5 text-center">প্রতিষ্ঠানের নাম</th>
                  <th className="border border-slate-800 p-1.5 text-center w-36">পদবি</th>
                  <th className="border border-slate-800 p-1.5 text-center w-36">কর্মকাল (থেকে - পর্যন্ত)</th>
                  <th className="border border-slate-800 p-1.5 text-center w-32">প্রধান বিষয়</th>
                  <th className="border border-slate-800 p-1.5 text-center">ছাড়পত্রের কারণ</th>
                </tr>
              </thead>
              <tbody>
                {experienceRows.map((exp, i) => (
                  <tr key={i} className="h-7 text-center">
                    <td className="border border-slate-800 p-1 font-semibold text-slate-900 text-left pl-2">
                      {exp.instituteName}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800">
                      {exp.designation}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800">
                      {exp.duration}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800">
                      {exp.subject}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800 text-left pl-2">
                      {exp.reasonForLeaving}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🟢 ৫. রেফারেন্স (5. References) */}
          <div className="mb-3.5">
            <div className="text-[12px] font-bold text-white bg-teal-800 px-2.5 py-1 rounded-xs flex items-center justify-between mb-2">
              <span>৫. রেফারেন্স (দুইজন সম্মানীয় ব্যক্তির তথ্য)</span>
              <span className="text-[10px] font-normal text-teal-100">References</span>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px] mb-1">
              <thead>
                <tr className="bg-slate-200/90 text-slate-900 font-bold">
                  <th className="border border-slate-800 p-1.5 text-center w-40">নাম</th>
                  <th className="border border-slate-800 p-1.5 text-center">পদবি ও প্রতিষ্ঠান</th>
                  <th className="border border-slate-800 p-1.5 text-center w-28">মোবাইল নম্বর</th>
                  <th className="border border-slate-800 p-1.5 text-center w-36">ইমেইল</th>
                  <th className="border border-slate-800 p-1.5 text-center w-24">সম্পর্ক</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1].map((idx) => {
                  const ref = data.references[idx as 0 | 1] || { name: '', designationInstitute: '', mobile: '', email: '', relation: '' };
                  return (
                    <tr key={idx} className="h-7 text-center">
                      <td className="border border-slate-800 p-1 font-semibold text-slate-900 text-left pl-2">
                        {ref.name}
                      </td>
                      <td className="border border-slate-800 p-1 text-slate-800 text-left pl-2">
                        {ref.designationInstitute}
                      </td>
                      <td className="border border-slate-800 p-1 font-mono text-slate-800">
                        {ref.mobile}
                      </td>
                      <td className="border border-slate-800 p-1 text-slate-700 text-xs">
                        {ref.email}
                      </td>
                      <td className="border border-slate-800 p-1 text-slate-800">
                        {ref.relation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 🟢 ৬. এক্সট্রা কারিকুলাম স্কিল (6. Extra Curricular) */}
          <div className="mb-3">
            <div className="text-[12px] font-bold text-white bg-teal-800 px-2.5 py-1 rounded-xs flex items-center justify-between mb-1.5">
              <span>৬. সহ-শিক্ষা ও সাংস্কৃতিক দক্ষতা (প্রযোজ্য ক্ষেত্রে টিক দিন)</span>
              <span className="text-[10px] font-normal text-teal-100">Co-curricular Skills</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[11px] mb-1.5 pl-1">
              {EXTRA_SKILLS_OPTIONS.map((skill) => {
                const isChecked = data.extraCurricular.includes(skill);
                return (
                  <div key={skill} className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 rounded-xs text-[9px] font-bold shrink-0">
                      {isChecked ? '✓' : ''}
                    </span>
                    <span className={isChecked ? 'font-bold text-slate-950' : 'text-slate-800'}>
                      {skill}
                    </span>
                  </div>
                );
              })}
            </div>

            {data.extraCurricularDetails && (
              <div className="flex items-start text-[11px] mt-1 pl-1">
                <span className="font-bold text-slate-800 shrink-0 w-32">অন্যান্য দক্ষতা বিবরণ:</span>
                <span className="flex-1 text-slate-900 border-b border-dotted border-slate-600">
                  {data.extraCurricularDetails}
                </span>
              </div>
            )}
          </div>

          {/* 🟢 ৭. কম্পিউটার স্কিল (7. Computer Skills) */}
          <div className="mb-3">
            <div className="text-[12px] font-bold text-white bg-teal-800 px-2.5 py-1 rounded-xs flex items-center justify-between mb-1.5">
              <span>৭. কম্পিউটার ও আইসিটি দক্ষতা (কতটুকু জানেন তা চিহ্নিত করুন)</span>
              <span className="text-[10px] font-normal text-teal-100">Computer Literacy</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[11px] mb-1.5 pl-1">
              {COMPUTER_SKILLS_OPTIONS.map((skill) => {
                const isChecked = data.computerSkills.includes(skill);
                return (
                  <div key={skill} className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 rounded-xs text-[9px] font-bold shrink-0">
                      {isChecked ? '✓' : ''}
                    </span>
                    <span className={isChecked ? 'font-bold text-slate-950' : 'text-slate-800'}>
                      {skill}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] mt-1 pl-1">
              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">টাইপিং স্পিড (ইংরেজি):</span>
                <span className="flex-1 border-b border-dotted border-slate-600 font-semibold text-slate-900 px-1">
                  {data.typingSpeedEnglish || '________________'}
                </span>
              </div>
              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">টাইপিং স্পিড (বাংলা):</span>
                <span className="flex-1 border-b border-dotted border-slate-600 font-semibold text-slate-900 px-1">
                  {data.typingSpeedBangla || '________________'}
                </span>
              </div>
            </div>
          </div>

          {/* 🟢 ৮. সংযুক্ত নথিপত্র ও ৯. অতিরিক্ত মন্তব্য (8. Docs & 9. Remarks) */}
          <div className="mb-3 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11.5px] font-bold text-slate-900 border-b border-slate-400 pb-1 mb-1.5">
                ৮. সংযুক্ত নথিপত্র চেকলিস্ট
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                    {data.hasNidCopy ? '✓' : ''}
                  </span>
                  <span>জাতীয় পরিচয়পত্র (NID) ফটোকপি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                    {data.hasBirthCertCopy ? '✓' : ''}
                  </span>
                  <span>জন্ম নিবন্ধন সনদের ফটোকপি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                    {data.hasCertificateCopy ? '✓' : ''}
                  </span>
                  <span>সকল শিক্ষাগত যোগ্যতার সনদ ও মার্কশিট</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 text-[9px] font-bold">
                    {data.hasPassportCopy ? '✓' : ''}
                  </span>
                  <span>পাসপোর্ট কপি ও পূর্ব অভিজ্ঞতা সনদ</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11.5px] font-bold text-slate-900 border-b border-slate-400 pb-1 mb-1.5">
                ৯. বিশেষ মন্তব্য / নোট
              </div>
              <div className="text-[11px] text-slate-800 min-h-[48px] border border-slate-300 p-1.5 bg-slate-50/50 rounded-xs">
                {data.specialNotes || 'কোনো বিশেষ মন্তব্য নেই।'}
              </div>
            </div>
          </div>

          {/* প্রার্থীর অঙ্গীকারনামা (Declaration) */}
          <div className="border border-slate-300 bg-slate-50/60 p-2 text-[10.5px] text-slate-700 leading-relaxed mb-6 rounded-xs">
            <span className="font-bold text-slate-900">অঙ্গীকারনামা: </span>
            আমি এই মর্মে অঙ্গীকার করছি যে, এই ফরমে উপরে প্রদত্ত যাবতীয় তথ্য আমার জানামতে সম্পূর্ণ সত্য ও নির্ভুল। বিদ্যালয়ের নিয়ম-শৃঙ্খলা ও আদর্শ মেনে সততা এবং নিষ্ঠার সাথে শিক্ষকতা কার্য সম্পাদন করতে আমি সদা সচেষ্ট থাকব। ভবিষ্যতে কোনো তথ্য ভুল বা অসত্য প্রমাণিত হলে কর্তৃপক্ষ কর্তৃক গৃহীত যেকোনো সিদ্ধান্ত মানতে বাধ্য থাকব।
          </div>

          {/* স্বাক্ষর সেকশন (Signatures Area) */}
          <div className="flex items-end justify-between px-4 pt-4 mt-8">
            {/* Teacher Signature */}
            <div className="text-center w-56">
              <div className="h-16 flex items-end justify-center pb-1">
                {data.teacherSignature ? (
                  <img 
                    src={data.teacherSignature} 
                    alt="Teacher Sign" 
                    className="max-h-14 max-w-44 object-contain"
                  />
                ) : (
                  <div className="text-[11px] text-slate-300">স্বাক্ষর</div>
                )}
              </div>
              <div className="border-t-2 border-dashed border-slate-700 pt-1">
                <p className="text-[12px] font-bold text-slate-900">শিক্ষকের স্বাক্ষর ও তারিখ</p>
                <p className="text-[10px] text-slate-600 font-mono">
                  {data.submissionDate ? `তারিখ: ${data.submissionDate}` : 'তারিখ: ____/____/২০___'}
                </p>
              </div>
            </div>

            {/* Institution Seal Stamp Placeholder */}
            <div className="w-20 h-20 border border-dashed border-slate-400 rounded-full flex flex-col items-center justify-center text-[9px] text-slate-400 select-none">
              <span>বিদ্যালয়ের</span>
              <span>গোল সিল</span>
            </div>

            {/* Principal Signature */}
            <div className="text-center w-56">
              <div className="h-16 flex items-end justify-center pb-1">
                {data.principalSignature ? (
                  <img 
                    src={data.principalSignature} 
                    alt="Principal Sign" 
                    className="max-h-14 max-w-44 object-contain"
                  />
                ) : (
                  <div className="text-[11px] text-slate-300">সিল ও সই</div>
                )}
              </div>
              <div className="border-t-2 border-dashed border-slate-700 pt-1">
                <p className="text-[12px] font-bold text-slate-900">প্রধান শিক্ষকের স্বাক্ষর ও সিল</p>
                <p className="text-[10px] text-slate-600">ডি-লিকন মডেল একাডেমী</p>
              </div>
            </div>
          </div>

          {/* Page 2 Footer Note */}
          <div className="mt-8 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
            <span>ডি-লিকন মডেল একাডেমী • সংরক্ষিত শিক্ষক প্রোফাইল</span>
            <span>পৃষ্ঠা ২ / ২ — সমাপ্ত</span>
          </div>
        </div>

      </div>
    </div>
  );
};
