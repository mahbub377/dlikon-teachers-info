import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Printer, 
  IdCard, 
  Plus, 
  Sparkles,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { TeacherFormData } from '../types';

interface TeacherDirectoryProps {
  savedTeachers: TeacherFormData[];
  onSelectTeacher: (teacher: TeacherFormData) => void;
  onDeleteTeacher: (id: string) => void;
  onAddNew: () => void;
  onImportBackup: (imported: TeacherFormData[]) => void;
  onLoadSample: () => void;
  onSwitchToPreview: (teacher: TeacherFormData) => void;
}

export const TeacherDirectory: React.FC<TeacherDirectoryProps> = ({
  savedTeachers,
  onSelectTeacher,
  onDeleteTeacher,
  onAddNew,
  onImportBackup,
  onLoadSample,
  onSwitchToPreview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');

  // Filter list
  const filtered = savedTeachers.filter(t => {
    const matchesSearch = 
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.mobileNumber.includes(searchTerm) ||
      t.mainSubject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDesig = designationFilter === 'ALL' || t.designation === designationFilter;
    return matchesSearch && matchesDesig;
  });

  // Unique designations for filter dropdown
  const designations = Array.from(new Set(savedTeachers.map(t => t.designation).filter(Boolean)));

  // Export as CSV with UTF-8 BOM for Microsoft Excel
  const handleExportCSV = () => {
    if (savedTeachers.length === 0) return;

    const headers = [
      'শিক্ষক আইডি',
      'পূর্ণ নাম',
      'পদবি',
      'প্রধান বিষয়',
      'মোবাইল নম্বর',
      'ইমেইল',
      'রক্তের গ্রুপ',
      'সর্বোচ্চ ডিগ্রি',
      'যোগদানের তারিখ',
      'বর্তমান ঠিকানা',
      'NID নম্বর'
    ];

    const rows = savedTeachers.map(t => [
      `"${t.teacherId || ''}"`,
      `"${t.fullName || ''}"`,
      `"${t.designation || ''}"`,
      `"${t.mainSubject || ''}"`,
      `"${t.mobileNumber || ''}"`,
      `"${t.email || ''}"`,
      `"${t.bloodGroup || ''}"`,
      `"${t.highestDegree || ''}"`,
      `"${t.joiningDate || ''}"`,
      `"${(t.presentAddress || '').replace(/"/g, '""')}"`,
      `"${t.nidNumber || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ডি-লিকন_মডেল_একাডেমী_শিক্ষক_তালিকা_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(savedTeachers, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DLMA_Teachers_Backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
        } else {
          alert('ত্রুটি: ফাইলের ফরম্যাট সঠিক নয়। এটি একটি বৈধ শিক্ষক ডেটাবেজ ব্যাকআপ ফাইল হতে হবে।');
        }
      } catch (err) {
        alert('ত্রুটি: ফাইলটি পড়া সম্ভব হয়নি।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">সংরক্ষিত শিক্ষক ডেটাবেজ</h2>
              <p className="text-xs text-slate-500">
                ডি-লিকন মডেল একাডেমীর শিক্ষকদের তথ্য ব্রাউজার স্টোরেজে সংরক্ষিত
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            id="btn-add-teacher-dir"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            নতুন শিক্ষক এন্ট্রি
          </button>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            disabled={savedTeachers.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            title="এক্সেল বা সিএসভি শিট ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Excel/CSV
          </button>

          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            disabled={savedTeachers.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            title="সব ডেটার JSON ব্যাকআপ নিন"
          >
            <Download className="w-4 h-4 text-teal-600" />
            ব্যাকআপ
          </button>

          <label 
            id="label-import-json"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="আগের ব্যাকআপ ফাইল রিস্টোর করুন"
          >
            <Upload className="w-4 h-4 text-teal-600" />
            রিস্টোর
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleImportFile} 
            />
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-teachers"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, আইডি, মোবাইল বা বিষয় লিখে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 shrink-0">পদবি ফিল্টার:</span>
          <select
            id="select-filter-designation"
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">সকল পদবি ({savedTeachers.length})</option>
            {designations.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">কোনো শিক্ষক পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {savedTeachers.length === 0 
              ? 'এখনো কোনো শিক্ষকের তথ্য সংরক্ষণ করা হয়নি। নতুন ফরম পূরণ করুন বা নমুনা তথ্য লোড করুন।' 
              : 'অনুসন্ধানের সাথে মেলে এমন কোনো তথ্য পাওয়া যায়নি।'}
          </p>
          {savedTeachers.length === 0 && (
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={onLoadSample}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-100 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                নমুনা শিক্ষক তথ্য লোড করুন
              </button>
              <button
                onClick={onAddNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-700 text-white rounded-lg hover:bg-teal-800 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                নতুন ফরম খুলুন
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div 
              key={t.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with Photo & Badge */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-14 rounded-lg bg-teal-50 border border-teal-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {t.teacherPhoto ? (
                      <img src={t.teacherPhoto} alt={t.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-teal-800">{t.fullName ? t.fullName.charAt(0) : 'T'}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                        {t.teacherId || 'DLMA'}
                      </span>
                      {t.bloodGroup && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                          {t.bloodGroup}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm truncate mt-1">
                      {t.fullName || 'নামবিহীন'}
                    </h4>
                    <p className="text-xs text-teal-900 font-medium truncate">
                      {t.designation || 'পদবি নেই'} {t.mainSubject ? `• ${t.mainSubject}` : ''}
                    </p>
                  </div>
                </div>

                {/* Details snippet */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2 mb-3">
                  {t.mobileNumber && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{t.mobileNumber}</span>
                    </div>
                  )}
                  {t.highestDegree && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{t.highestDegree}</span>
                    </div>
                  )}
                  {t.joiningDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>যোগদান: {t.joiningDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTeacher(t)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors cursor-pointer"
                  title="এই শিক্ষকের তথ্য এডিট করুন"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  এডিট
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchToPreview(t)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                  title="২-পাতা ফরম প্রিন্ট করুন"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-700" />
                  প্রিন্ট
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`আপনি কি "${t.fullName || t.teacherId}" এর তথ্য মুছে ফেলতে চান?`)) {
                      onDeleteTeacher(t.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer ml-auto"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
