import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  History, 
  Users, 
  Sparkles, 
  Laptop, 
  Upload, 
  PenTool, 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  FileCheck,
  CheckSquare
} from 'lucide-react';
import { TeacherFormData, EducationRecord, ExperienceRecord } from '../types';
import { 
  EXTRA_SKILLS_OPTIONS, 
  COMPUTER_SKILLS_OPTIONS, 
  DESIGNATION_OPTIONS, 
  BLOOD_GROUPS, 
  MARITAL_STATUS, 
  RELIGIONS, 
  GENDERS 
} from '../data/sampleData';
import { SignaturePadModal } from './SignaturePadModal';

interface TeacherFormEditorProps {
  formData: TeacherFormData;
  setFormData: React.Dispatch<React.SetStateAction<TeacherFormData>>;
  onViewPreview: () => void;
  onSave: () => void;
  onLoadSample: () => void;
}

export const TeacherFormEditor: React.FC<TeacherFormEditorProps> = ({
  formData,
  setFormData,
  onViewPreview,
  onSave,
  onLoadSample
}) => {
  const [sigModalType, setSigModalType] = useState<'teacher' | 'principal' | null>(null);

  // Field change helper
  const handleChange = (field: keyof TeacherFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  // Education list handlers
  const handleAddEducation = () => {
    const newEdu: EducationRecord = {
      id: Date.now().toString(),
      examName: '',
      boardUniversity: '',
      passingYear: '',
      result: '',
      subject: ''
    };
    setFormData(prev => ({
      ...prev,
      educationList: [...prev.educationList, newEdu]
    }));
  };

  const handleUpdateEducation = (index: number, field: keyof EducationRecord, val: string) => {
    setFormData(prev => {
      const updated = [...prev.educationList];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, educationList: updated };
    });
  };

  const handleRemoveEducation = (index: number) => {
    if (formData.educationList.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      educationList: prev.educationList.filter((_, i) => i !== index)
    }));
  };

  // Experience list handlers
  const handleAddExperience = () => {
    const newExp: ExperienceRecord = {
      id: Date.now().toString(),
      instituteName: '',
      designation: '',
      duration: '',
      subject: '',
      reasonForLeaving: ''
    };
    setFormData(prev => ({
      ...prev,
      experienceList: [...prev.experienceList, newExp]
    }));
  };

  const handleUpdateExperience = (index: number, field: keyof ExperienceRecord, val: string) => {
    setFormData(prev => {
      const updated = [...prev.experienceList];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, experienceList: updated };
    });
  };

  const handleRemoveExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experienceList: prev.experienceList.filter((_, i) => i !== index)
    }));
  };

  // Reference updater
  const handleUpdateReference = (refIndex: 0 | 1, field: string, val: string) => {
    setFormData(prev => {
      const refs = [...prev.references] as [any, any];
      refs[refIndex] = { ...refs[refIndex], [field]: val };
      return { ...prev, references: refs };
    });
  };

  // Skill checkbox toggles
  const handleToggleExtraSkill = (skill: string) => {
    setFormData(prev => {
      const exists = prev.extraCurricular.includes(skill);
      return {
        ...prev,
        extraCurricular: exists 
          ? prev.extraCurricular.filter(s => s !== skill)
          : [...prev.extraCurricular, skill]
      };
    });
  };

  const handleToggleComputerSkill = (skill: string) => {
    setFormData(prev => {
      const exists = prev.computerSkills.includes(skill);
      return {
        ...prev,
        computerSkills: exists 
          ? prev.computerSkills.filter(s => s !== skill)
          : [...prev.computerSkills, skill]
      };
    });
  };

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        handleChange('teacherPhoto', res);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="teacher-form-editor" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner / Instructions */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-teal-500/30 text-teal-200 rounded-md border border-teal-400/30">
              ডি-লিকন মডেল একাডেমী
            </span>
            <span className="text-xs text-slate-300">শিক্ষক তথ্য ফরম সংস্করণ ২.০</span>
          </div>
          <h2 className="text-xl font-bold mt-1">শিক্ষকের তথ্য সংগ্রহ ও এডিটিং ফরম</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            নিচের ফিল্ডগুলো সঠিকভাবে পূরণ করুন। তথ্য শেষ হলে &quot;২ পাতা A4 প্রিভিউ&quot; বাটনে ক্লিক করে অফিশিয়াল ফরম প্রিন্ট করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-sample-inline"
            type="button"
            onClick={onLoadSample}
            className="px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            নমুনা তথ্য বসান
          </button>
          <button
            id="btn-view-preview-inline"
            type="button"
            onClick={onViewPreview}
            className="px-3.5 py-2 text-xs font-medium bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            প্রিন্ট প্রিভিউ
          </button>
        </div>
      </div>

      {/* 1. ব্যক্তিগত তথ্য (Personal Details) */}
      <div id="section-personal-info" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">১. ব্যক্তিগত তথ্য</h3>
              <p className="text-xs text-slate-500">শিক্ষকের নাম, ঠিকানা, জন্ম ও যোগাযোগের তথ্য</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">আইডি/ইনডেক্স নম্বর:</label>
            <input
              id="input-teacher-id"
              type="text"
              value={formData.teacherId}
              onChange={(e) => handleChange('teacherId', e.target.value)}
              placeholder="DLMA-XXXX"
              className="w-32 px-2.5 py-1 text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded-md focus:outline-teal-500"
            />
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              শিক্ষকের পূর্ণ নাম <span className="text-rose-600">*</span>
            </label>
            <input
              id="input-full-name"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="যেমন: মো: রফিকুল ইসলাম"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মোবাইল নম্বর <span className="text-rose-600">*</span>
            </label>
            <input
              id="input-mobile-number"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value)}
              placeholder="০১XXXXXXXXX"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">পিতার নাম</label>
            <input
              id="input-father-name"
              type="text"
              value={formData.fatherName}
              onChange={(e) => handleChange('fatherName', e.target.value)}
              placeholder="পিতার নাম লিখুন"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">মাতার নাম</label>
            <input
              id="input-mother-name"
              type="text"
              value={formData.motherName}
              onChange={(e) => handleChange('motherName', e.target.value)}
              placeholder="মাতার নাম লিখুন"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">জন্ম তারিখ</label>
            <input
              id="input-birth-date"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর</label>
            <input
              id="input-nid-number"
              type="text"
              value={formData.nidNumber}
              onChange={(e) => handleChange('nidNumber', e.target.value)}
              placeholder="NID নম্বর লিখুন"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">জন্ম নিবন্ধন নম্বর</label>
            <input
              id="input-birth-cert-number"
              type="text"
              value={formData.birthCertNumber}
              onChange={(e) => handleChange('birthCertNumber', e.target.value)}
              placeholder="জন্ম নিবন্ধন নম্বর লিখুন"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">পাসপোর্ট নম্বর (যদি থাকে)</label>
            <input
              id="input-passport-number"
              type="text"
              value={formData.passportNumber}
              onChange={(e) => handleChange('passportNumber', e.target.value)}
              placeholder="পাসপোর্ট নম্বর"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">জরুরী যোগাযোগের নম্বর</label>
            <input
              id="input-emergency-mobile"
              type="tel"
              value={formData.emergencyMobile}
              onChange={(e) => handleChange('emergencyMobile', e.target.value)}
              placeholder="জরুরী মোবাইল নম্বর"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ইমেইল ঠিকানা</label>
            <input
              id="input-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="example@email.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">রক্তের গ্রুপ</label>
            <select
              id="select-blood-group"
              value={formData.bloodGroup}
              onChange={(e) => handleChange('bloodGroup', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="">-- নির্বাচন করুন --</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ধর্ম</label>
            <select
              id="select-religion"
              value={formData.religion}
              onChange={(e) => handleChange('religion', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              {RELIGIONS.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">বৈবাহিক অবস্থা</label>
            <select
              id="select-marital-status"
              value={formData.maritalStatus}
              onChange={(e) => handleChange('maritalStatus', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="">-- নির্বাচন করুন --</option>
              {MARITAL_STATUS.map(ms => (
                <option key={ms} value={ms}>{ms}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">লিঙ্গ (Gender)</label>
            <select
              id="select-gender"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              {GENDERS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">জাতীয়তা</label>
            <input
              id="input-nationality"
              type="text"
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="যেমন: বাংলাদেশী"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">বর্তমান ঠিকানা</label>
              <textarea
                id="input-present-address"
                rows={2}
                value={formData.presentAddress}
                onChange={(e) => handleChange('presentAddress', e.target.value)}
                placeholder="গ্রাম/বাসা নং, ডাকঘর, উপজেলা, জেলা"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">স্থায়ী ঠিকানা</label>
              <textarea
                id="input-permanent-address"
                rows={2}
                value={formData.permanentAddress}
                onChange={(e) => handleChange('permanentAddress', e.target.value)}
                placeholder="গ্রাম/বাসা নং, ডাকঘর, উপজেলা, জেলা"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. চাকুরি সংক্রান্ত তথ্য (Employment Details) */}
      <div id="section-employment-info" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">২. চাকুরি সংক্রান্ত তথ্য</h3>
            <p className="text-xs text-slate-500">পদবি, বিষয়, নিয়োগ ও যোগদানের বিবরণ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পদবি <span className="text-rose-600">*</span>
            </label>
            <select
              id="select-designation"
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="">-- পদবি নির্বাচন করুন --</option>
              {DESIGNATION_OPTIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">প্রধান বিষয় / শাখা</label>
            <input
              id="input-main-subject"
              type="text"
              value={formData.mainSubject}
              onChange={(e) => handleChange('mainSubject', e.target.value)}
              placeholder="যেমন: গণিত, বাংলা, ইংরেজি, বিজ্ঞান"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">পাঠদানের শ্রেণি</label>
            <input
              id="input-assigned-classes"
              type="text"
              value={formData.assignedClasses}
              onChange={(e) => handleChange('assignedClasses', e.target.value)}
              placeholder="যেমন: ষষ্ঠ - দশম শ্রেণি"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">নিয়োগের তারিখ</label>
            <input
              id="input-appointment-date"
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => handleChange('appointmentDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">বর্তমান কর্মস্থলে যোগদানের তারিখ</label>
            <input
              id="input-joining-date"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => handleChange('joiningDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">সর্বোচ্চ শিক্ষাগত ডিগ্রি</label>
            <input
              id="input-highest-degree"
              type="text"
              value={formData.highestDegree}
              onChange={(e) => handleChange('highestDegree', e.target.value)}
              placeholder="যেমন: এম.এ, এম.এসসি, বি.এড"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">বেতন স্কেল / গ্রেড</label>
            <input
              id="input-salary-scale"
              type="text"
              value={formData.salaryScale}
              onChange={(e) => handleChange('salaryScale', e.target.value)}
              placeholder="যেমন: ১৬,০০০ - ৩৮,৬৪০/-"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ব্যাংক অ্যাকাউন্ট নম্বর</label>
            <input
              id="input-bank-account"
              type="text"
              value={formData.bankAccountNo}
              onChange={(e) => handleChange('bankAccountNo', e.target.value)}
              placeholder="হিসাব নম্বর ও ব্যাংকের নাম"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* 3. সর্বোচ্চ শিক্ষাগত যোগ্যতা (বিস্তারিত) (Dynamic Table) */}
      <div id="section-education-info" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">৩. সর্বোচ্চ শিক্ষাগত যোগ্যতা (বিস্তারিত)</h3>
              <p className="text-xs text-slate-500">এসএসসি, এইচএসসি, ডিগ্রি, অনার্স, মাস্টার্স ইত্যাদি তথ্য</p>
            </div>
          </div>

          <button
            id="btn-add-education-row"
            type="button"
            onClick={handleAddEducation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            নতুন রো যোগ করুন
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-300">
                <th className="p-2.5 text-left w-36">পরীক্ষার নাম</th>
                <th className="p-2.5 text-left">বোর্ড / বিশ্ববিদ্যালয়</th>
                <th className="p-2.5 text-left w-24">পাসের সন</th>
                <th className="p-2.5 text-left w-28">ফলাফল (GPA)</th>
                <th className="p-2.5 text-left">বিষয় / গ্রুপ</th>
                <th className="p-2.5 text-center w-12">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {formData.educationList.map((edu, idx) => (
                <tr key={edu.id || idx} className="hover:bg-slate-50/70">
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={edu.examName}
                      onChange={(e) => handleUpdateEducation(idx, 'examName', e.target.value)}
                      placeholder="যেমন: এস.এস.সি"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={edu.boardUniversity}
                      onChange={(e) => handleUpdateEducation(idx, 'boardUniversity', e.target.value)}
                      placeholder="যেমন: ঢাকা বোর্ড / ঢাবি"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={edu.passingYear}
                      onChange={(e) => handleUpdateEducation(idx, 'passingYear', e.target.value)}
                      placeholder="২০১২"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 text-center"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={edu.result}
                      onChange={(e) => handleUpdateEducation(idx, 'result', e.target.value)}
                      placeholder="GPA ৫.০০"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={edu.subject}
                      onChange={(e) => handleUpdateEducation(idx, 'subject', e.target.value)}
                      placeholder="যেমন: বিজ্ঞান / গণিত"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                    />
                  </td>
                  <td className="p-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      disabled={formData.educationList.length <= 1}
                      title="রো মুছুন"
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. পূর্ববর্তী চাকুরির অভিজ্ঞতা (Experience) */}
      <div id="section-experience-info" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">৪. পূর্ববর্তী চাকুরির অভিজ্ঞতা</h3>
              <p className="text-xs text-slate-500">অন্য কোনো বিদ্যালয়ে শিক্ষকতার অভিজ্ঞতা থাকলে যোগ করুন</p>
            </div>
          </div>

          <button
            id="btn-add-experience-row"
            type="button"
            onClick={handleAddExperience}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            নতুন অভিজ্ঞতা যোগ করুন
          </button>
        </div>

        {formData.experienceList.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-300">
            কোনো পূর্ববর্তী অভিজ্ঞতা যোগ করা হয়নি। প্রয়োজন হলে উপরের বাটনে ক্লিক করে যোগ করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-300">
                  <th className="p-2.5 text-left">প্রতিষ্ঠানের নাম</th>
                  <th className="p-2.5 text-left w-36">পদবি</th>
                  <th className="p-2.5 text-left w-36">কর্মকাল (থেকে-পর্যন্ত)</th>
                  <th className="p-2.5 text-left w-32">প্রধান বিষয়</th>
                  <th className="p-2.5 text-left">ছাড়পত্রের কারণ</th>
                  <th className="p-2.5 text-center w-12">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {formData.experienceList.map((exp, idx) => (
                  <tr key={exp.id || idx} className="hover:bg-slate-50/70">
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={exp.instituteName}
                        onChange={(e) => handleUpdateExperience(idx, 'instituteName', e.target.value)}
                        placeholder="প্রতিষ্ঠানের নাম"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={exp.designation}
                        onChange={(e) => handleUpdateExperience(idx, 'designation', e.target.value)}
                        placeholder="সহকারী শিক্ষক"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                        placeholder="২০২০ - ২০২৩"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={exp.subject}
                        onChange={(e) => handleUpdateExperience(idx, 'subject', e.target.value)}
                        placeholder="বিষয়"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={exp.reasonForLeaving}
                        onChange={(e) => handleUpdateExperience(idx, 'reasonForLeaving', e.target.value)}
                        placeholder="উন্নত সুযোগ / অন্যান্য"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. রেফারেন্স (Two References) */}
      <div id="section-reference-info" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">৫. রেফারেন্স (দুইজন গণ্যমান্য / সাবেক কর্মকর্তার তথ্য)</h3>
            <p className="text-xs text-slate-500">প্রার্থীর সততা ও কর্মনিষ্ঠার সাক্ষ্য প্রদানে সক্ষম দুইজন ব্যক্তির বিবরণ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((refIdx) => {
            const ref = formData.references[refIdx as 0 | 1] || {
              name: '',
              designationInstitute: '',
              mobile: '',
              email: '',
              relation: ''
            };
            return (
              <div key={refIdx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-teal-900">
                    রেফারেন্স {refIdx === 0 ? '১ (প্রথম ব্যক্তি)' : '২ (দ্বিতীয় ব্যক্তি)'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">নাম</label>
                  <input
                    type="text"
                    value={ref.name}
                    onChange={(e) => handleUpdateReference(refIdx as 0 | 1, 'name', e.target.value)}
                    placeholder="রেফারেন্সকারীর নাম"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">পদবি ও প্রতিষ্ঠান</label>
                  <input
                    type="text"
                    value={ref.designationInstitute}
                    onChange={(e) => handleUpdateReference(refIdx as 0 | 1, 'designationInstitute', e.target.value)}
                    placeholder="যেমন: প্রধান শিক্ষক, এক্স হাই স্কুল"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      value={ref.mobile}
                      onChange={(e) => handleUpdateReference(refIdx as 0 | 1, 'mobile', e.target.value)}
                      placeholder="০১XXXXXXXXX"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">সম্পর্ক</label>
                    <input
                      type="text"
                      value={ref.relation}
                      onChange={(e) => handleUpdateReference(refIdx as 0 | 1, 'relation', e.target.value)}
                      placeholder="যেমন: শিক্ষক / সাবেক বস"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">ইমেইল (যদি থাকে)</label>
                  <input
                    type="email"
                    value={ref.email}
                    onChange={(e) => handleUpdateReference(refIdx as 0 | 1, 'email', e.target.value)}
                    placeholder="ref@example.com"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. এক্সট্রা কারিকুলাম ও 7. কম্পিউটার স্কিল */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extra Curricular */}
        <div id="section-extracurricular" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">৬. এক্সট্রা কারিকুলাম স্কিল</h3>
              <p className="text-xs text-slate-500">যা যা জানা আছে সেগুলোতে টিক দিন</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {EXTRA_SKILLS_OPTIONS.map((skill) => {
              const checked = formData.extraCurricular.includes(skill);
              return (
                <label 
                  key={skill}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    checked
                      ? 'bg-teal-50/80 border-teal-300 text-teal-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleExtraSkill(skill)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span>{skill}</span>
                </label>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">অন্যান্য বিশেষ দক্ষতা বা বিস্তারিত বিবরণ</label>
            <textarea
              rows={3}
              value={formData.extraCurricularDetails}
              onChange={(e) => handleChange('extraCurricularDetails', e.target.value)}
              placeholder="যেমন: আবৃত্তি দল পরিচালনা, সাংস্কৃতিক অনুষ্ঠানে উপস্থাপনা বা ক্রীড়া প্রশিক্ষণ অভিজ্ঞতা..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Computer Skills */}
        <div id="section-computer-skills" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">৭. কম্পিউটার ও আইসিটি স্কিল</h3>
              <p className="text-xs text-slate-500">ডিজিটাল শিক্ষাদানের প্রয়োজনীয় দক্ষতা</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {COMPUTER_SKILLS_OPTIONS.map((skill) => {
              const checked = formData.computerSkills.includes(skill);
              return (
                <label 
                  key={skill}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    checked
                      ? 'bg-teal-50/80 border-teal-300 text-teal-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleComputerSkill(skill)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="truncate">{skill}</span>
                </label>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">টাইপিং স্পিড (ইংরেজি)</label>
              <input
                type="text"
                value={formData.typingSpeedEnglish}
                onChange={(e) => handleChange('typingSpeedEnglish', e.target.value)}
                placeholder="যেমন: ৪০ WPM"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">টাইপিং স্পিড (বাংলা)</label>
              <input
                type="text"
                value={formData.typingSpeedBangla}
                onChange={(e) => handleChange('typingSpeedBangla', e.target.value)}
                placeholder="যেমন: ৩০ WPM"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 8. শিক্ষক ছবি ও ডিজিটাল স্বাক্ষর (Photo & Signature) */}
      <div id="section-photo-signature" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">৮. শিক্ষকের ছবি ও ডিজিটাল স্বাক্ষর</h3>
            <p className="text-xs text-slate-500">পাসপোর্ট সাইজ ছবি ও অফিসিয়াল সই সংযুক্তি</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Teacher Photo */}
          <div className="flex flex-col items-center p-4 border border-slate-200 rounded-xl bg-slate-50">
            <span className="text-xs font-bold text-slate-700 mb-2">শিক্ষকের ছবি (পাসপোর্ট সাইজ)</span>
            <div className="w-32 h-36 border-2 border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center overflow-hidden mb-3 shadow-inner relative">
              {formData.teacherPhoto ? (
                <img 
                  src={formData.teacherPhoto} 
                  alt="Teacher" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <User className="w-10 h-10 mx-auto mb-1 opacity-50" />
                  <span className="text-[10px] block">পাসপোর্ট সাইজ ছবি</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <label 
                id="label-upload-photo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                ছবি আপলোড
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload} 
                />
              </label>

              {formData.teacherPhoto && (
                <button
                  type="button"
                  onClick={() => handleChange('teacherPhoto', '')}
                  className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="ছবি মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Teacher Signature */}
          <div className="flex flex-col items-center p-4 border border-slate-200 rounded-xl bg-slate-50">
            <span className="text-xs font-bold text-slate-700 mb-2">শিক্ষকের স্বাক্ষর</span>
            <div className="w-48 h-24 border-2 border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center overflow-hidden mb-3 shadow-inner relative">
              {formData.teacherSignature ? (
                <img 
                  src={formData.teacherSignature} 
                  alt="Teacher Signature" 
                  className="max-h-full max-w-full object-contain p-1"
                />
              ) : (
                <span className="text-[11px] text-slate-400">স্বাক্ষর যুক্ত হয়নি</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                id="btn-teacher-signature"
                type="button"
                onClick={() => setSigModalType('teacher')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                স্বাক্ষর দিন / আপলোড
              </button>

              {formData.teacherSignature && (
                <button
                  type="button"
                  onClick={() => handleChange('teacherSignature', '')}
                  className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="স্বাক্ষর মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Principal Signature */}
          <div className="flex flex-col items-center p-4 border border-slate-200 rounded-xl bg-slate-50">
            <span className="text-xs font-bold text-slate-700 mb-2">প্রধান শিক্ষকের স্বাক্ষর ও সিল</span>
            <div className="w-48 h-24 border-2 border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center overflow-hidden mb-3 shadow-inner relative">
              {formData.principalSignature ? (
                <img 
                  src={formData.principalSignature} 
                  alt="Principal Signature" 
                  className="max-h-full max-w-full object-contain p-1"
                />
              ) : (
                <span className="text-[11px] text-slate-400">প্রধান শিক্ষকের সিল/সই</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                id="btn-principal-signature"
                type="button"
                onClick={() => setSigModalType('principal')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                স্বাক্ষর দিন / আপলোড
              </button>

              {formData.principalSignature && (
                <button
                  type="button"
                  onClick={() => handleChange('principalSignature', '')}
                  className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="স্বাক্ষর মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 9. সংযুক্ত ডকুমেন্টস চেকলিস্ট ও মন্তব্য (Documents & Remarks) */}
      <div id="section-documents-remarks" className="bg-white rounded-xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">৯. সংযুক্ত নথিপত্র ও অতিরিক্ত মন্তব্য</h3>
            <p className="text-xs text-slate-500">ফরমের সাথে কোন কোন কাগজ জমা দেওয়া হয়েছে তা টিক দিন</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-teal-50">
            <input
              type="checkbox"
              checked={formData.hasNidCopy}
              onChange={(e) => handleChange('hasNidCopy', e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span>NID ফটোকপি</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-teal-50">
            <input
              type="checkbox"
              checked={formData.hasBirthCertCopy}
              onChange={(e) => handleChange('hasBirthCertCopy', e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span>জন্ম নিবন্ধন ফটোকপি</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-teal-50">
            <input
              type="checkbox"
              checked={formData.hasCertificateCopy}
              onChange={(e) => handleChange('hasCertificateCopy', e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span>শিক্ষাগত সনদের কপি</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-teal-50">
            <input
              type="checkbox"
              checked={formData.hasPassportCopy}
              onChange={(e) => handleChange('hasPassportCopy', e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span>পাসপোর্ট কপি (যদি থাকে)</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">বিশেষ মন্তব্য / নোট</label>
          <textarea
            id="input-special-notes"
            rows={2}
            value={formData.specialNotes}
            onChange={(e) => handleChange('specialNotes', e.target.value)}
            placeholder="প্রার্থীর বিশেষ কোনো গুণাবলী বা প্রাতিষ্ঠানিক মন্তব্য..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-4 z-30 bg-slate-900/90 backdrop-blur-md text-white p-3.5 rounded-xl shadow-lg flex items-center justify-between">
        <div className="text-xs text-slate-300 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-teal-400" />
          <span>ফরম পরিবর্তন স্বয়ংক্রিয়ভাবে সিংক হচ্ছে</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="sticky-save-btn"
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            ডাটাবেজে সেভ
          </button>
          <button
            id="sticky-preview-btn"
            type="button"
            onClick={onViewPreview}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4 text-teal-700" />
            ২-পাতা প্রিন্ট প্রিভিউ দেখুন
          </button>
        </div>
      </div>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={sigModalType !== null}
        onClose={() => setSigModalType(null)}
        title={sigModalType === 'teacher' ? 'শিক্ষকের স্বাক্ষর প্রদান' : 'প্রধান শিক্ষকের স্বাক্ষর প্রদান'}
        initialSignature={sigModalType === 'teacher' ? formData.teacherSignature : formData.principalSignature}
        onSave={(dataUrl) => {
          if (sigModalType === 'teacher') {
            handleChange('teacherSignature', dataUrl);
          } else if (sigModalType === 'principal') {
            handleChange('principalSignature', dataUrl);
          }
        }}
      />
    </div>
  );
};
