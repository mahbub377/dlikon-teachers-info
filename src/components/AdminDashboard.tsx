import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Search, 
  Download, 
  FileText, 
  Filter, 
  GraduationCap, 
  Check,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { StudentRecord, SyllabusItem } from '../types/adminTypes';

const STORAGE_STUDENTS = 'dlma_admin_students_v1';
const STORAGE_SYLLABUS = 'dlma_admin_syllabus_v1';

export const AdminDashboard: React.FC = () => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'students' | 'syllabus'>('students');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Students State
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: '1', name: 'মোঃ তাহমিদ হাসান', roll: '০১', mobile: '01712-345678', className: '৫ম শ্রেণি', section: 'ক' },
      { id: '2', name: 'ফাতিমা তুয জোহরা', roll: '০২', mobile: '01819-876543', className: '৫ম শ্রেণি', section: 'ক' },
      { id: '3', name: 'সাদিয়া ইসলাম', roll: '০৩', mobile: '01911-223344', className: '৫ম শ্রেণি', section: 'খ' },
      { id: '4', name: 'মোঃ সাকিব আহমেদ', roll: '০১', mobile: '01622-334455', className: '৬ষ্ঠ শ্রেণি', section: 'ক' },
      { id: '5', name: 'নুসরাত জাহান', roll: '০২', mobile: '01733-445566', className: '৬ষ্ঠ শ্রেণি', section: 'ক' },
    ];
  });

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('সকল শ্রেণি');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // 2. Syllabus State (11 Steps)
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SYLLABUS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'syl_5',
        className: '৫ম শ্রেণি',
        term1Syllabus: 'বাংলা: পাঠ ১-৫; ইংরেজি: Unit 1-6; গণিত: অধ্যায় ১-৪ (গুণ, ভাগ ও চার প্রক্রিয়া); বিজ্ঞান: অধ্যায় ১ ও ২।',
        midterm1_1Syllabus: 'বাংলা: পাঠ ১-৩; ইংরেজি: Unit 1-3; গণিত: অধ্যায় ১ ও ২।',
        midterm1_2Syllabus: 'বাংলা: পাঠ ৪-৫; ইংরেজি: Unit 4-6; গণিত: অধ্যায় ৩ ও ৪।',
        term2Syllabus: 'বাংলা: পাঠ ৬-১০; ইংরেজি: Unit 7-12; গণিত: অধ্যায় ৫-৮ (ভগ্নাংশ ও দশমিক); বিজ্ঞান: অধ্যায় ৩-৫।',
        midterm2_1Syllabus: 'বাংলা: পাঠ ৬-৮; ইংরেজি: Unit 7-9; গণিত: অধ্যায় ৫ ও ৬।',
        midterm2_2Syllabus: 'বাংলা: পাঠ ৯-১০; ইংরেজি: Unit 10-12; গণিত: অধ্যায় ৭ ও ৮।',
        term3Syllabus: 'বাংলা: পাঠ ১১-১৫; ইংরেজি: Unit 13-18; গণিত: অধ্যায় ৯-১২ (শতকরা, জ্যামিতি); বিজ্ঞান: অধ্যায় ৬-৯।',
        midterm3_1Syllabus: 'বাংলা: পাঠ ১১-১৩; ইংরেজি: Unit 13-15; গণিত: অধ্যায় ৯ ও ১০।',
        midterm3_2Syllabus: 'বাংলা: পাঠ ১৪-১৫; ইংরেজি: Unit 16-18; গণিত: অধ্যায় ১১ ও ১২।',
        notes: 'সাপ্তাহিক মূল্যায়ন ও সৃজনশীল প্রশ্নোত্তর অনুশীলন বাধ্যতামূলক।',
        updatedAt: new Date().toLocaleDateString('bn-BD')
      },
      {
        id: 'syl_6',
        className: '৬ষ্ঠ শ্রেণি',
        term1Syllabus: 'বাংলা সাহিত্য: ১-৪ অধ্যায়; ইংরেজি ১ম ও ২য় পত্র: ১ম সাময়িক অংশ; গণিত: ১ম সাময়িক নির্ধারিত অনুশীলন।',
        midterm1_1Syllabus: 'বাংলা: অধ্যায় ১ ও ২; গণিত: অধ্যায় ১; ইংরেজি: ৩টি লেসন।',
        midterm1_2Syllabus: 'বাংলা: অধ্যায় ৩ ও ৪; গণিত: অধ্যায় ২ ও ৩; ইংরেজি: গ্রামার অংশ।',
        term2Syllabus: 'নতুন শিক্ষাক্রমের আলোকে ২য় সাময়িক মূল্যায়নের প্রজেক্ট ও পারদর্শিতা নির্দেশক।',
        midterm2_1Syllabus: 'মধ্যবর্তী প্রজেক্ট কাজ ও গ্রুপ প্রেজেন্টেশন।',
        midterm2_2Syllabus: 'ব্যবহারিক সেশন ও একক মূল্যায়ন।',
        term3Syllabus: 'চূড়ান্ত বার্ষিক পারদর্শিতা মূল্যায়ন ও বাৎসরিক উৎসব প্রস্তুতি।',
        midterm3_1Syllabus: 'চূড়ান্ত পর্বের প্রথম মূল্যায়ন অ্যাসাইনমেন্ট।',
        midterm3_2Syllabus: 'চূড়ান্ত পর্বের দ্বিতীয় মূল্যায়ন অ্যাসাইনমেন্ট।',
        notes: 'দলীয় কাজ ও উপস্থিতি মূল্যায়নে বিশেষ গুরুত্ব প্রদান।',
        updatedAt: new Date().toLocaleDateString('bn-BD')
      }
    ];
  });

  // Current editing syllabus in 11 steps
  const [selectedSyllabusClass, setSelectedSyllabusClass] = useState<string>('৫ম শ্রেণি');
  const [currentSyllabus, setCurrentSyllabus] = useState<SyllabusItem>(() => {
    return syllabusList[0] || {
      id: 'syl_new',
      className: '৫ম শ্রেণি',
      term1Syllabus: '',
      midterm1_1Syllabus: '',
      midterm1_2Syllabus: '',
      term2Syllabus: '',
      midterm2_1Syllabus: '',
      midterm2_2Syllabus: '',
      term3Syllabus: '',
      midterm3_1Syllabus: '',
      midterm3_2Syllabus: '',
      notes: '',
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };
  });

  const [syllabusSavedMsg, setSyllabusSavedMsg] = useState(false);

  // Sync Students to localStorage
  const saveStudents = (updated: StudentRecord[]) => {
    setStudents(updated);
    try {
      localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Sync Syllabus to localStorage
  const saveSyllabusList = (updated: SyllabusItem[]) => {
    setSyllabusList(updated);
    try {
      localStorage.setItem(STORAGE_SYLLABUS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Excel File Upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length < 2) {
          alert('এক্সেল ফাইলটিতে পর্যাপ্ত তথ্য পাওয়া যায়নি। অনুগ্রহ করে হেডারসহ ডাটা দিন।');
          return;
        }

        // Find header columns: name, roll, mobile, class
        const headers: string[] = data[0].map((h: any) => String(h || '').trim().toLowerCase());
        
        let nameIdx = headers.findIndex(h => h.includes('নাম') || h.includes('name') || h.includes('student'));
        let rollIdx = headers.findIndex(h => h.includes('রোল') || h.includes('roll'));
        let mobileIdx = headers.findIndex(h => h.includes('মোবাইল') || h.includes('ফোন') || h.includes('mobile') || h.includes('phone') || h.includes('contact'));
        let classIdx = headers.findIndex(h => h.includes('শ্রেণি') || h.includes('শ্রেণী') || h.includes('class'));
        let sectionIdx = headers.findIndex(h => h.includes('শাখা') || h.includes('সেকশন') || h.includes('section'));

        // Fallbacks if headers not detected
        if (nameIdx === -1) nameIdx = 0;
        if (rollIdx === -1) rollIdx = 1;
        if (mobileIdx === -1) mobileIdx = 2;
        if (classIdx === -1) classIdx = 3;

        const importedStudents: StudentRecord[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const name = row[nameIdx] ? String(row[nameIdx]).trim() : '';
          if (!name) continue;

          const roll = row[rollIdx] ? String(row[rollIdx]).trim() : '—';
          const mobile = row[mobileIdx] ? String(row[mobileIdx]).trim() : '—';
          const className = classIdx !== -1 && row[classIdx] ? String(row[classIdx]).trim() : (selectedClassFilter !== 'সকল শ্রেণি' ? selectedClassFilter : '৫ম শ্রেণি');
          const section = sectionIdx !== -1 && row[sectionIdx] ? String(row[sectionIdx]).trim() : 'ক';

          importedStudents.push({
            id: 'stu_' + Date.now() + '_' + i,
            name,
            roll,
            mobile,
            className,
            section
          });
        }

        if (importedStudents.length > 0) {
          const combined = [...importedStudents, ...students];
          saveStudents(combined);
          setUploadStatus(`সফলভাবে ${importedStudents.length} জন শিক্ষার্থীর তথ্য এক্সেল ফাইল থেকে আপলোড হয়েছে!`);
          setTimeout(() => setUploadStatus(null), 4000);
        } else {
          alert('এক্সেল ফাইল থেকে কোনো শিক্ষার্থী রেকর্ড পাওয়া যায়নি।');
        }
      } catch (error) {
        console.error('Error parsing excel:', error);
        alert('এক্সেল ফাইল পড়তে সমস্যা হয়েছে। দয়া করে সঠিক .xlsx বা .xls ফাইল দিন।');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download Sample Excel Template
  const downloadSampleExcel = () => {
    const wsData = [
      ['শিক্ষার্থীর নাম', 'রোল', 'মোবাইল নম্বর', 'শ্রেণি', 'শাখা'],
      ['মোঃ সাজিদ রহমান', '০১', '01711122233', '৫ম শ্রেণি', 'ক'],
      ['আনিসা তাবাসসুম', '০২', '01822233344', '৫ম শ্রেণি', 'ক'],
      ['তামিম ইকবাল', '০৩', '01933344455', '৫ম শ্রেণি', 'খ'],
      ['ফারহানা হক', '০১', '01644455566', '৬ষ্ঠ শ্রেণি', 'ক']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'শিক্ষার্থী_তালিকা');
    XLSX.writeFile(wb, 'ডি_লিকন_শিক্ষার্থী_নমুনা.xlsx');
  };

  // Switch Syllabus Class
  const handleSelectClassSyllabus = (cls: string) => {
    setSelectedSyllabusClass(cls);
    const found = syllabusList.find(s => s.className === cls);
    if (found) {
      setCurrentSyllabus(found);
    } else {
      setCurrentSyllabus({
        id: 'syl_' + Date.now(),
        className: cls,
        term1Syllabus: '',
        midterm1_1Syllabus: '',
        midterm1_2Syllabus: '',
        term2Syllabus: '',
        midterm2_1Syllabus: '',
        midterm2_2Syllabus: '',
        term3Syllabus: '',
        midterm3_1Syllabus: '',
        midterm3_2Syllabus: '',
        notes: '',
        updatedAt: new Date().toLocaleDateString('bn-BD')
      });
    }
  };

  // Save Current Syllabus
  const handleSaveSyllabus = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedItem: SyllabusItem = {
      ...currentSyllabus,
      className: selectedSyllabusClass,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };

    const idx = syllabusList.findIndex(s => s.className === selectedSyllabusClass);
    let updatedList: SyllabusItem[];
    if (idx >= 0) {
      updatedList = [...syllabusList];
      updatedList[idx] = updatedItem;
    } else {
      updatedList = [...syllabusList, updatedItem];
    }

    saveSyllabusList(updatedList);
    setSyllabusSavedMsg(true);
    setTimeout(() => setSyllabusSavedMsg(false), 2500);
  };

  // Filtered students
  const filteredStudents = students.filter(st => {
    const matchClass = selectedClassFilter === 'সকল শ্রেণি' || st.className === selectedClassFilter;
    const matchSearch = 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.roll.includes(searchQuery) ||
      st.mobile.includes(searchQuery);
    return matchClass && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            ডি-লিকন মডেল একাডেমী এডমিন ড্যাশবোর্ড
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-200">
            শিক্ষার্থী ডেটাবেজ ও সিলেবাস ম্যানেজমেন্ট
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            এক্সেল ফাইল থেকে এক ক্লিকে শিক্ষার্থীদের তথ্য আপলোড ও ১১ ধাপে সম্পূর্ণ বাৎসরিক সিলেবাস হালনাগাদ করুন।
          </p>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex items-center bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveAdminSubTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAdminSubTab === 'students'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            শিক্ষার্থী এক্সেল আপলোড ({students.length})
          </button>
          <button
            onClick={() => setActiveAdminSubTab('syllabus')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAdminSubTab === 'syllabus'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            সিলেবাস (১১ ধাপ)
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. STUDENTS EXCEL UPLOAD SECTION */}
      {/* ============================================================ */}
      {activeAdminSubTab === 'students' && (
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-600" />
                  ক্লাসওয়ারী শিক্ষার্থীদের এক্সেল ফাইল (.xlsx / .xls) আপলোড
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  এক্সেলে শিক্ষার্থীদের <strong>নাম, রোল, মোবাইল নম্বর, শ্রেণি ও শাখা</strong> কলাম আকারে রেখে আপলোড করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  title="নমুনা এক্সেল ফাইল ডাউনলোড করে ফরম্যাট দেখে নিন"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  নমুনা এক্সেল ফরম্যাট
                </button>

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95">
                  <FileSpreadsheet className="w-4 h-4 text-teal-200" />
                  এক্সেল ফাইল বেছে নিন
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Notification alert after upload */}
            {uploadStatus && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {uploadStatus}
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="নাম, রোল বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option value="সকল শ্রেণি">সকল শ্রেণি ({students.length})</option>
                  <option value="শিশু শ্রেণি">শিশু শ্রেণি</option>
                  <option value="১ম শ্রেণি">১ম শ্রেণি</option>
                  <option value="২য় শ্রেণি">২য় শ্রেণি</option>
                  <option value="৩য় শ্রেণি">৩য় শ্রেণি</option>
                  <option value="৪র্থ শ্রেণি">৪র্থ শ্রেণি</option>
                  <option value="৫ম শ্রেণি">৫ম শ্রেণি</option>
                  <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                  <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                  <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                  <option value="১০ম শ্রেণি">১০ম শ্রেণি</option>
                </select>
              </div>

              <div className="flex items-center justify-end text-xs text-slate-500">
                <span>মোট প্রদর্শিত শিক্ষার্থী: <strong className="text-teal-800">{filteredStudents.length} জন</strong></span>
                {students.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('আপনি কি সকল শিক্ষার্থীর তালিকা খালি করতে চান?')) {
                        saveStudents([]);
                      }
                    }}
                    className="ml-3 text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
                  >
                    তালিকা মুছুন
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="p-3.5">রোল</th>
                  <th className="p-3.5">শিক্ষার্থীর নাম</th>
                  <th className="p-3.5">শ্রেণি ও শাখা</th>
                  <th className="p-3.5">অভিভাবকের মোবাইল নম্বর</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {st.roll}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 text-sm">{st.name}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {st.className} {st.section ? `(${st.section})` : ''}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        <a href={`tel:${st.mobile}`} className="hover:text-teal-700 hover:underline">
                          {st.mobile}
                        </a>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => saveStudents(students.filter(s => s.id !== st.id))}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি। উপরের "এক্সেল ফাইল বেছে নিন" বাটনে ক্লিক করে ফাইল আপলোড করুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SYLLABUS SECTION (11 Steps) */}
      {/* ============================================================ */}
      {activeAdminSubTab === 'syllabus' && (
        <div className="space-y-6">
          {/* Class Navigation for Syllabus */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">শ্রেণি নির্বাচন করুন:</span>
              <div className="flex flex-wrap gap-1.5">
                {['শিশু শ্রেণি', '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => handleSelectClassSyllabus(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSyllabusClass === cls
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {syllabusSavedMsg && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 animate-bounce">
                <Check className="w-3.5 h-3.5" />
                সিলেবাস সফলভাবে আপডেট হয়েছে!
              </span>
            )}
          </div>

          {/* 11 Steps Syllabus Input Form */}
          <form onSubmit={handleSaveSyllabus} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  {selectedSyllabusClass} — ১১টি ধাপে পরীক্ষাভিত্তিক সম্পূর্ণ সিলেবাস হালনাগাদ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিটি পরীক্ষার জন্য নির্ধারিত অধ্যায় ও পাঠ্যক্রম বিস্তারিত টাইপ করুন।
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Save className="w-4 h-4" />
                সিলেবাস সেভ ও আপডেট করুন
              </button>
            </div>

            {/* Grid of the 11 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* ধাপ ১: শ্রেণি */}
              <div className="md:col-span-2 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                <label className="block font-bold text-amber-950 mb-1">
                  ১। শ্রেণি (Class)
                </label>
                <input
                  type="text"
                  value={selectedSyllabusClass}
                  readOnly
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-amber-900"
                />
              </div>

              {/* ধাপ ২: প্রথম সাময়িক পরীক্ষার সিলেবাস */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ২। প্রথম সাময়িক পরীক্ষার সিলেবাস
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.term1Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, term1Syllabus: e.target.value })}
                  placeholder="১ম সাময়িক পরীক্ষার বিষয় ও অধ্যায়সমূহ..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ৩: প্রথম মিডটার্ম পরীক্ষার সিলেবাস */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ৩। প্রথম মিডটার্ম পরীক্ষার সিলেবাস
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.midterm1_1Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, midterm1_1Syllabus: e.target.value })}
                  placeholder="১ম পর্বের প্রথম মিডটার্ম সিলেবাস..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ৪: দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ৪। দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.midterm1_2Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, midterm1_2Syllabus: e.target.value })}
                  placeholder="১ম পর্বের দ্বিতীয় মিডটার্ম সিলেবাস..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ৫: দ্বিতীয় সাময়িক পরীক্ষা সিলেবাস */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ৫। দ্বিতীয় সাময়িক পরীক্ষা সিলেবাস
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.term2Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, term2Syllabus: e.target.value })}
                  placeholder="২য় সাময়িক পরীক্ষার পূর্ণাঙ্গ সিলেবাস..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ৬: প্রথম মিডটার্ম পরীক্ষার সিলেবাস (২য় পর্ব) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ৬। প্রথম মিডটার্ম পরীক্ষার সিলেবাস (২য় পর্ব)
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.midterm2_1Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, midterm2_1Syllabus: e.target.value })}
                  placeholder="২য় পর্বের প্রথম মিডটার্ম সিলেবাস..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ৭: দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস (২য় পর্ব) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ৭। দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস (২য় পর্ব)
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.midterm2_2Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, midterm2_2Syllabus: e.target.value })}
                  placeholder="২য় পর্বের দ্বিতীয় মিডটার্ম সিলেবাস..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ৮: বার্ষিক / পরবর্তী সাময়িক পরীক্ষা সিলেবাস */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ৮। বার্ষিক / পরবর্তী সাময়িক পরীক্ষা সিলেবাস
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.term3Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, term3Syllabus: e.target.value })}
                  placeholder="বার্ষিক / চূড়ান্ত সাময়িক পরীক্ষার সিলেবাস..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ৯: প্রথম মিডটার্ম পরীক্ষার সিলেবাস (চূড়ান্ত পর্ব) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ৯। প্রথম মিডটার্ম পরীক্ষার সিলেবাস (চূড়ান্ত পর্ব)
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.midterm3_1Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, midterm3_1Syllabus: e.target.value })}
                  placeholder="চূড়ান্ত পর্বের প্রথম মিডটার্ম সিলেবাস..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ১০: দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস (চূড়ান্ত পর্ব) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block font-bold text-slate-800">
                  ১০। দ্বিতীয় মিডটার্ম পরীক্ষার সিলেবাস (চূড়ান্ত পর্ব)
                </label>
                <textarea
                  rows={3}
                  value={currentSyllabus.midterm3_2Syllabus}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, midterm3_2Syllabus: e.target.value })}
                  placeholder="চূড়ান্ত পর্বের দ্বিতীয় মিডটার্ম সিলেবাস..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* ধাপ ১১: বিশেষ নির্দেশনা ও শিক্ষণ নোট */}
              <div className="md:col-span-2 bg-teal-50/70 p-4 rounded-xl border border-teal-200 space-y-1.5">
                <label className="block font-bold text-teal-950">
                  ১১। বিশেষ নির্দেশনা, পরীক্ষার মানবন্টন ও শিক্ষণ নোট
                </label>
                <textarea
                  rows={2}
                  value={currentSyllabus.notes || ''}
                  onChange={(e) => setCurrentSyllabus({ ...currentSyllabus, notes: e.target.value })}
                  placeholder="শিক্ষকদের প্রতি বিশেষ পাঠদান নির্দেশনা ও পরীক্ষার মানবন্টন..."
                  className="w-full p-2.5 bg-white border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                সর্বশেষ আপডেট: {currentSyllabus.updatedAt}
              </span>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Save className="w-4 h-4" />
                সিলেবাস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
