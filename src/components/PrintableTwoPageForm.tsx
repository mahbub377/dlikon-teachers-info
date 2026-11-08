import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  FileText, 
  Download, 
  Sparkles, 
  Edit3, 
  HelpCircle,
  Check,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { TeacherFormData } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { EXTRA_SKILLS_OPTIONS, COMPUTER_SKILLS_OPTIONS } from '../data/sampleData';
import { downloadTwoPagePdf, triggerSafePrint, printViaIsolatedIframe } from '../utils/pdfExport';

interface PrintableTwoPageFormProps {
  formData: TeacherFormData;
  onEdit: () => void;
  onPrint?: () => void;
  onLoadSample: () => void;
  isBlankMode?: boolean;
  setIsBlankMode?: (isBlank: boolean) => void;
  autoDownloadBlank?: boolean;
  onResetAutoDownload?: () => void;
}

export const PrintableTwoPageForm: React.FC<PrintableTwoPageFormProps> = ({
  formData,
  onEdit,
  onPrint,
  onLoadSample,
  isBlankMode: propIsBlankMode,
  setIsBlankMode: propSetIsBlankMode,
  autoDownloadBlank,
  onResetAutoDownload
}) => {
  const [internalBlankMode, setInternalBlankMode] = useState(false);
  const isBlankMode = propIsBlankMode !== undefined ? propIsBlankMode : internalBlankMode;
  const setIsBlankMode = (val: boolean) => {
    if (propSetIsBlankMode) {
      propSetIsBlankMode(val);
    } else {
      setInternalBlankMode(val);
    }
  };

  const [zoomLevel, setZoomLevel] = useState(100);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ status: string; percentage: number } | null>(null);
  const [lastDownloadedBlobUrl, setLastDownloadedBlobUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);


  // If blank mode is on, we display empty underlines for handwriting
  const data = isBlankMode ? {
    ...formData,
    teacherId: '',
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
    nationality: 'বাংলাদেশী',
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
    submissionDate: '',
    hasNidCopy: false,
    hasBirthCertCopy: false,
    hasCertificateCopy: false,
    hasPassportCopy: false,
    educationList: [
      { id: '1', examName: 'এস.এস.সি / দাখিল / সমমান', boardUniversity: '', passingYear: '', result: '', subject: '' },
      { id: '2', examName: 'এইচ.এস.সি / আলিম / সমমান', boardUniversity: '', passingYear: '', result: '', subject: '' },
      { id: '3', examName: 'স্নাতক / ফাজিল / ডিগ্রি', boardUniversity: '', passingYear: '', result: '', subject: '' },
      { id: '4', examName: 'স্নাতকোত্তর / কামিল / মাস্টার্স', boardUniversity: '', passingYear: '', result: '', subject: '' }
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

  // Handle automatic download trigger when navigating from header or external button
  useEffect(() => {
    if (autoDownloadBlank) {
      const timer = setTimeout(() => {
        handleDownloadPdf();
      }, 400);
      if (onResetAutoDownload) {
        onResetAutoDownload();
      }
      return () => clearTimeout(timer);
    }
  }, [autoDownloadBlank]);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfProgress({ status: 'A4 পাতা ১ প্রস্তুত হচ্ছে...', percentage: 15 });

    const filename = isBlankMode
      ? 'ডি-লিকন_মডেল_একাডেমী_শিক্ষক_তথ্য_ফরম_ব্ল্যাঙ্ক.pdf'
      : `ডি-লিকন_শিক্ষক_${(data.fullName || 'তথ্য').trim().replace(/\s+/g, '_')}_ফরম.pdf`;

    try {
      const res = await downloadTwoPagePdf({
        page1Id: 'a4-page-1',
        page2Id: 'a4-page-2',
        filename,
        onProgress: (status, percentage) => {
          setPdfProgress({ status, percentage });
        }
      });
      if (res.blobUrl) {
        setLastDownloadedBlobUrl(res.blobUrl);
      }
      setNotification({
        type: 'success',
        message: 'সফলভাবে ২-পাতার A4 PDF ফাইল ডাউনলোড হয়েছে! আপনার ব্রাউজারের Downloads ফোল্ডার চেক করুন।'
      });
      setTimeout(() => setNotification(null), 8000);
    } catch (err: unknown) {
      console.error('PDF generation error:', err);
      const errorMsg = err instanceof Error ? err.message : 'অজানা সমস্যা';
      setNotification({
        type: 'error',
        message: `PDF ডাউনলোডে সমস্যা হয়েছে (${errorMsg})। সরাসরি ব্রাউজারের "প্রিন্ট করুন" বোতাম ব্যবহার করুন।`
      });
      setTimeout(() => setNotification(null), 8000);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  const handleSafePrint = async () => {
    try {
      if (onPrint) {
        onPrint();
      } else {
        printViaIsolatedIframe('printable-two-page-area');
      }
    } catch (e) {
      console.warn('Native print caught error:', e);
      triggerSafePrint();
    }
  };

  return (
    <div className="pb-16 relative">
      {/* PDF Generation Progress Modal Overlay */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-amber-300 mb-1">
              ২-পাতা A4 PDF তৈরি ও ডাউনলোড হচ্ছে...
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              {pdfProgress?.status || 'উচ্চমানের রেজুলেশনে বাংলা ফন্ট ও টেবিল প্রস্তুত হচ্ছে...'}
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700 mb-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${pdfProgress?.percentage || 30}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-amber-200">
              {pdfProgress?.percentage || 30}% সম্পন্ন
            </span>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div className="no-print fixed bottom-6 right-6 z-50 max-w-md transition-all duration-300">
          <div className={`p-4 rounded-xl shadow-2xl border text-xs font-medium flex items-start gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-100 border-emerald-400 shadow-emerald-950/50'
              : notification.type === 'error'
              ? 'bg-slate-900/95 text-rose-100 border-rose-500 shadow-rose-950/50'
              : 'bg-amber-950/95 text-amber-100 border-amber-400 shadow-amber-950/50'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Download className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold text-sm mb-0.5">
                {notification.type === 'success' ? 'সফল হয়েছে!' : notification.type === 'error' ? 'দৃষ্টি আকর্ষণ' : 'তথ্য'}
              </p>
              <p className="leading-relaxed">{notification.message}</p>
              
              {notification.type === 'error' && (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={handleSafePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    এখনই প্রিন্ট করুন
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs border border-slate-600 transition-all cursor-pointer"
                  >
                    পুনরায় চেষ্টা
                  </button>
                </div>
              )}

              {lastDownloadedBlobUrl && notification.type === 'success' && (
                <div className="mt-2.5">
                  <a
                    href={lastDownloadedBlobUrl}
                    download={isBlankMode ? 'ডি-লিকন_মডেল_একাডেমী_শিক্ষক_তথ্য_ফরম_ব্ল্যাঙ্ক.pdf' : 'ডি-লিকন_শিক্ষক_তথ্য_ফরম.pdf'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ডাউনলোড করা PDF ফাইলটি খুলুন
                  </a>
                </div>
              )}
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Preview Controls Toolbar */}
      <div className="no-print sticky top-20 z-30 bg-slate-900 text-white px-4 sm:px-6 py-3 shadow-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-100">
              A4 ২-পাতা অফিশিয়াল প্রিন্ট ও PDF সেন্টার
            </span>
            <span className="hidden sm:inline text-xs text-amber-300 ml-2">
              (সরাসরি PDF ডাউনলোড অথবা প্রিন্ট করুন)
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Blank Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs shadow-inner">
            <button
              id="btn-toggle-filled"
              type="button"
              onClick={() => setIsBlankMode(false)}
              className={`px-3 py-1.5 rounded-md transition-all font-medium ${
                !isBlankMode ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              পূরণকৃত ডিজিটাল ফরম
            </button>
            <button
              id="btn-toggle-blank"
              type="button"
              onClick={() => setIsBlankMode(true)}
              className={`px-3 py-1.5 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                isBlankMode ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-amber-300/80 hover:text-amber-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              হাতে লেখার ব্ল্যাঙ্ক ফরম
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
            <button
              id="btn-zoom-out"
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
              title="জুম কমান"
              className="p-1 hover:text-white cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center font-mono text-[11px]">{zoomLevel}%</span>
            <button
              id="btn-zoom-in"
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              title="জুম বাড়ান"
              className="p-1 hover:text-white cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="btn-edit-from-preview"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            ডাটা এন্ট্রি / এডিট
          </button>

          {/* PRIMARY ACTION 1: সরাসরি PDF ডাউনলোড (100% Reliable in iframe & any browser) */}
          <button
            id="btn-download-pdf-preview"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-300 ring-2 ring-amber-300/40"
            title="A4 সাইজে সরাসরি PDF ফাইল ডাউনলোড করুন (সবচেয়ে নিরাপদ ও নির্ভরযোগ্য)"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>PDF হচ্ছে...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>সরাসরি PDF ডাউনলোড (A4)</span>
              </>
            )}
          </button>

          {/* PRIMARY ACTION 2: প্রিন্ট করুন */}
          <button
            id="btn-print-now"
            onClick={handleSafePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600"
            title="ব্রাউজার প্রিন্টার ডায়ালগ খুলুন"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Helper message banner */}
      <div className="no-print max-w-5xl mx-auto px-4 mt-4">
        {isBlankMode ? (
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-950 text-xs shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-200 text-amber-950 rounded-xl shrink-0">
                <FileText className="w-5 h-5 text-amber-900" />
              </div>
              <div>
                <strong className="block text-amber-950 font-bold text-sm">
                  ব্ল্যাঙ্ক প্রিন্ট মোড সক্রিয়: শিক্ষকদের হাতে লেখার জন্য ২ পাতার ফাঁকা ফরম
                </strong>
                <span className="text-amber-900 text-xs mt-0.5 block leading-relaxed">
                  নিচের <strong>&quot;সরাসরি PDF ডাউনলোড&quot;</strong> বাটনে চাপ দিলে আপনার ডিভাইসে সরাসরি A4 PDF সেভ হবে। অথবা <strong>&quot;প্রিন্ট করুন&quot;</strong> দিয়ে সরাসরি প্রিন্ট দিতে পারেন।
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {lastDownloadedBlobUrl && (
                <a
                  href={lastDownloadedBlobUrl}
                  download="ডি-লিকন_মডেল_একাডেমী_শিক্ষক_তথ্য_ফরম_ব্ল্যাঙ্ক.pdf"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5 border border-emerald-700"
                  title="ডাউনলোড করা PDF ফাইলটি দেখতে চাপুন"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF খুলুন
                </a>
              )}
              <button
                id="btn-banner-download-blank-pdf"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5 border border-amber-600"
              >
                <Download className="w-4 h-4" />
                PDF ডাউনলোড
              </button>
              <button
                id="btn-banner-print-blank"
                onClick={handleSafePrint}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                প্রিন্ট
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>প্রিন্ট টিপস:</strong> ব্রাউজারের প্রিন্ট ডায়ালগে পেপার সাইজ <strong>&quot;A4&quot;</strong>, ওরিয়েন্টেশন <strong>&quot;Portrait&quot;</strong> এবং মার্জিন <strong>&quot;Default&quot;</strong> অথবা <strong>&quot;None/Minimum&quot;</strong> নির্বাচন করুন। ব্যাকগ্রাউন্ড গ্রাফিক্স চেকবক্সে টিক দিন।
              </span>
            </div>
            {!data.fullName && (
              <button
                onClick={onLoadSample}
                className="shrink-0 text-xs underline font-semibold text-teal-800 hover:text-teal-950 ml-2 cursor-pointer"
              >
                নমুনা ডাটা দিয়ে দেখুন
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Container with Zoom wrapper and Print Isolation ID */}
      <div 
        id="printable-two-page-area"
        className="w-full flex flex-col items-center mt-6 transition-transform origin-top print:mt-0 print:transform-none"
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
              <SchoolLogo size={58} className="shrink-0" preferVector={true} />
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

            {/* Passport Photo Box (Pure white background, crisp dashed border, ink-saving) */}
            <div className="w-[100px] h-[115px] border-2 border-dashed border-slate-700 bg-white rounded-xs flex flex-col items-center justify-center p-1 shrink-0 overflow-hidden text-center select-none shadow-2xs">
              {data.teacherPhoto ? (
                <img 
                  src={data.teacherPhoto} 
                  alt="Teacher" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-0.5">
                  <span className="text-[10px] font-bold text-slate-800 block leading-tight">পাসপোর্ট সাইজ</span>
                  <span className="text-[9px] text-slate-700 block mt-0.5">রঙিন ছবি</span>
                  <span className="text-[8px] text-slate-500 block mt-1">(আঠা দিয়ে লাগান)</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Title Banner (Centered with clean 2px border, pure white background, zero ink waste) */}
          <div className="text-center mb-2.5 flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center border-2 border-slate-900 bg-white text-slate-950 px-6 py-1.5 rounded-xs text-[13px] font-black tracking-wide uppercase shadow-2xs text-center">
              শিক্ষক তথ্য সংগ্রহ ফরম {isBlankMode && '(ব্ল্যাঙ্ক কপি - স্বহস্তে পূরণযোগ্য)'}
            </div>
            <div className="text-[10.5px] text-slate-700 font-medium mt-1 text-center">
              বিদ্যালয়ের সকল শিক্ষকের তথ্য প্রাতিষ্ঠানিক ডেটাবেজে সংরক্ষণের জন্য অফিশিয়াল ফরম
            </div>
          </div>

          {/* Teacher and Office Instruction Banner (in Blank Mode) */}
          {isBlankMode && (
            <div className="border border-slate-700 bg-white rounded-xs px-3 py-1 mb-2.5 text-[10.5px] text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold border border-slate-800 bg-white text-slate-950 px-1.5 py-0.2 rounded-2xs text-[9.5px]">নির্দেশনা:</span>
                <span>ফরমটির সকল তথ্য স্পষ্টাক্ষরে স্বহস্তে পূরণ করে পাসপোর্ট সাইজ ছবি ও প্রয়োজনীয় কাগজপত্রসহ একাডেমি অফিসে জমা দিন।</span>
              </div>
              <span className="text-[9.5px] font-bold text-slate-800 hidden sm:inline">অফিস জমা কপি</span>
            </div>
          )}

          {/* ID & Index Bar (Clean white background, crisp border) */}
          <div className="flex items-center justify-between text-[11px] bg-white px-3 py-1.5 rounded-xs border border-slate-800 mb-3">
            <div>
              <span className="font-bold text-slate-900">শিক্ষক আইডি / ইনডেক্স নং: </span>
              <span className="font-mono font-bold text-slate-950 ml-1">
                {data.teacherId || (isBlankMode ? 'DLMA-________________ (অফিস পূরণ করবে)' : '________________')}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900">ফরম পূরণের তারিখ: </span>
              <span className="font-medium text-slate-950 ml-1">
                {data.submissionDate || '____/____/২০___'}
              </span>
            </div>
          </div>

          {/* 🟢 ১. ব্যক্তিগত তথ্য (1. Personal Information) - Clean white background, no ink fill */}
          <div className="mb-3.5">
            <div className="text-[12px] font-bold text-slate-950 bg-white border border-slate-800 border-l-4 border-l-slate-950 px-2.5 py-1 rounded-2xs flex items-center justify-between mb-2 shadow-2xs">
              <span className="font-black">১. ব্যক্তিগত তথ্য</span>
              <span className="text-[10px] font-semibold text-slate-600">Personal Information</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
              <div className="flex items-end col-span-2">
                <span className="w-36 shrink-0 font-bold text-slate-800">শিক্ষকের নাম (বাংলা):</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-semibold text-slate-950 px-1 pb-0.5 min-h-[20px]">
                  {data.fullName}
                </span>
              </div>

              {isBlankMode && (
                <div className="flex items-end col-span-2">
                  <span className="w-36 shrink-0 font-bold text-slate-800">Full Name (English):</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 font-mono text-slate-900 px-1 pb-0.5 min-h-[20px]"></span>
                </div>
              )}

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

          {/* 🟢 ২. চাকুরি সংক্রান্ত তথ্য (2. Employment Information) - Clean white background, no ink fill */}
          <div className="mb-3.5">
            <div className="text-[12px] font-bold text-slate-950 bg-white border border-slate-800 border-l-4 border-l-slate-950 px-2.5 py-1 rounded-2xs flex items-center justify-between mb-2 shadow-2xs">
              <span className="font-black">২. চাকুরি সংক্রান্ত তথ্য</span>
              <span className="text-[10px] font-semibold text-slate-600">Employment Details</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">পদবি:</span>
                <span className="flex-1 border-b border-dotted border-slate-700 font-bold text-slate-950 px-1 pb-0.5 min-h-[20px]">
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

          {/* 🟢 ৩. সর্বোচ্চ শিক্ষাগত যোগ্যতা (বিস্তারিত) (3. Academic Qualification) - Clean white background */}
          <div>
            <div className="text-[12px] font-bold text-slate-950 bg-white border border-slate-800 border-l-4 border-l-slate-950 px-2.5 py-1 rounded-2xs flex items-center justify-between mb-2 shadow-2xs">
              <span className="font-black">৩. সর্বোচ্চ শিক্ষাগত যোগ্যতা (বিস্তারিত)</span>
              <span className="text-[10px] font-semibold text-slate-600">Academic Qualifications</span>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px] mb-2">
              <thead>
                <tr className="bg-white text-slate-950 font-bold border-b border-slate-800">
                  <th className="border border-slate-800 p-1.5 text-center w-32 bg-white">পরীক্ষার নাম</th>
                  <th className="border border-slate-800 p-1.5 text-center bg-white">বোর্ড / বিশ্ববিদ্যালয়</th>
                  <th className="border border-slate-800 p-1.5 text-center w-20 bg-white">পাসের সন</th>
                  <th className="border border-slate-800 p-1.5 text-center w-28 bg-white">ফলাফল (GPA)</th>
                  <th className="border border-slate-800 p-1.5 text-center w-36 bg-white">বিষয় / বিভাগ</th>
                </tr>
              </thead>
              <tbody>
                {educationRows.map((edu, i) => (
                  <tr key={i} className="h-7 text-center">
                    <td className="border border-slate-800 p-1 font-semibold text-slate-900 text-left pl-2 bg-white">
                      {edu.examName}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800 bg-white">
                      {edu.boardUniversity}
                    </td>
                    <td className="border border-slate-800 p-1 font-mono text-slate-800 bg-white">
                      {edu.passingYear}
                    </td>
                    <td className="border border-slate-800 p-1 font-semibold text-slate-900 bg-white">
                      {edu.result}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800 text-left pl-2 bg-white">
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
              <SchoolLogo size={38} className="shrink-0" preferVector={true} />
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
                শিক্ষক: <span className="text-slate-950">{data.fullName || '________________'}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                আইডি: {data.teacherId || '________'}
              </div>
            </div>
          </div>

          {/* 🟢 ৪. পূর্ববর্তী চাকুরির অভিজ্ঞতা (4. Previous Experience) - Clean white background */}
          <div className="mb-3.5">
            <div className="text-[12px] font-bold text-slate-950 bg-white border border-slate-800 border-l-4 border-l-slate-950 px-2.5 py-1 rounded-2xs flex items-center justify-between mb-2 shadow-2xs">
              <span className="font-black">৪. পূর্ববর্তী চাকুরির অভিজ্ঞতা</span>
              <span className="text-[10px] font-semibold text-slate-600">Teaching & Professional Experience</span>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px] mb-1">
              <thead>
                <tr className="bg-white text-slate-950 font-bold border-b border-slate-800">
                  <th className="border border-slate-800 p-1.5 text-center bg-white">প্রতিষ্ঠানের নাম</th>
                  <th className="border border-slate-800 p-1.5 text-center w-36 bg-white">পদবি</th>
                  <th className="border border-slate-800 p-1.5 text-center w-36 bg-white">কর্মকাল (থেকে - পর্যন্ত)</th>
                  <th className="border border-slate-800 p-1.5 text-center w-32 bg-white">প্রধান বিষয়</th>
                  <th className="border border-slate-800 p-1.5 text-center bg-white">ছাড়পত্রের কারণ</th>
                </tr>
              </thead>
              <tbody>
                {experienceRows.map((exp, i) => (
                  <tr key={i} className="h-7 text-center">
                    <td className="border border-slate-800 p-1 font-semibold text-slate-900 text-left pl-2 bg-white">
                      {exp.instituteName}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800 bg-white">
                      {exp.designation}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800 bg-white">
                      {exp.duration}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800 bg-white">
                      {exp.subject}
                    </td>
                    <td className="border border-slate-800 p-1 text-slate-800 text-left pl-2 bg-white">
                      {exp.reasonForLeaving}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🟢 ৫. রেফারেন্স (5. References) - Clean white background */}
          <div className="mb-3.5">
            <div className="text-[12px] font-bold text-slate-950 bg-white border border-slate-800 border-l-4 border-l-slate-950 px-2.5 py-1 rounded-2xs flex items-center justify-between mb-2 shadow-2xs">
              <span className="font-black">৫. রেফারেন্স (দুইজন সম্মানীয় ব্যক্তির তথ্য)</span>
              <span className="text-[10px] font-semibold text-slate-600">References</span>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[11px] mb-1">
              <thead>
                <tr className="bg-white text-slate-950 font-bold border-b border-slate-800">
                  <th className="border border-slate-800 p-1.5 text-center w-40 bg-white">নাম</th>
                  <th className="border border-slate-800 p-1.5 text-center bg-white">পদবি ও প্রতিষ্ঠান</th>
                  <th className="border border-slate-800 p-1.5 text-center w-28 bg-white">মোবাইল নম্বর</th>
                  <th className="border border-slate-800 p-1.5 text-center w-36 bg-white">ইমেইল</th>
                  <th className="border border-slate-800 p-1.5 text-center w-24 bg-white">সম্পর্ক</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1].map((idx) => {
                  const ref = data.references[idx as 0 | 1] || { name: '', designationInstitute: '', mobile: '', email: '', relation: '' };
                  return (
                    <tr key={idx} className="h-7 text-center">
                      <td className="border border-slate-800 p-1 font-semibold text-slate-900 text-left pl-2 bg-white">
                        {ref.name}
                      </td>
                      <td className="border border-slate-800 p-1 text-slate-800 text-left pl-2 bg-white">
                        {ref.designationInstitute}
                      </td>
                      <td className="border border-slate-800 p-1 font-mono text-slate-800 bg-white">
                        {ref.mobile}
                      </td>
                      <td className="border border-slate-800 p-1 text-slate-700 text-xs bg-white">
                        {ref.email}
                      </td>
                      <td className="border border-slate-800 p-1 text-slate-800 bg-white">
                        {ref.relation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 🟢 ৬. এক্সট্রা কারিকুলাম স্কিল (6. Extra Curricular) - Clean white background */}
          <div className="mb-3">
            <div className="text-[12px] font-bold text-slate-950 bg-white border border-slate-800 border-l-4 border-l-slate-950 px-2.5 py-1 rounded-2xs flex items-center justify-between mb-1.5 shadow-2xs">
              <span className="font-black">৬. সহ-শিক্ষা ও সাংস্কৃতিক দক্ষতা (প্রযোজ্য ক্ষেত্রে টিক দিন)</span>
              <span className="text-[10px] font-semibold text-slate-600">Co-curricular Skills</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[11px] mb-1.5 pl-1">
              {EXTRA_SKILLS_OPTIONS.map((skill) => {
                const isChecked = data.extraCurricular.includes(skill);
                return (
                  <div key={skill} className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 bg-white rounded-xs text-[9px] font-bold shrink-0">
                      {isChecked ? '✓' : ''}
                    </span>
                    <span className={isChecked ? 'font-bold text-slate-950' : 'text-slate-800'}>
                      {skill}
                    </span>
                  </div>
                );
              })}
            </div>

            {(data.extraCurricularDetails || isBlankMode) && (
              <div className="flex items-start text-[11px] mt-1 pl-1">
                <span className="font-bold text-slate-800 shrink-0 w-36">অন্যান্য দক্ষতা (যদি থাকে):</span>
                <span className="flex-1 text-slate-900 border-b border-dotted border-slate-600 min-h-[18px]">
                  {data.extraCurricularDetails || ''}
                </span>
              </div>
            )}
          </div>

          {/* 🟢 ৭. কম্পিউটার স্কিল (7. Computer Skills) - Clean white background */}
          <div className="mb-3">
            <div className="text-[12px] font-bold text-slate-950 bg-white border border-slate-800 border-l-4 border-l-slate-950 px-2.5 py-1 rounded-2xs flex items-center justify-between mb-1.5 shadow-2xs">
              <span className="font-black">৭. কম্পিউটার ও আইসিটি দক্ষতা (কতটুকু জানেন তা চিহ্নিত করুন)</span>
              <span className="text-[10px] font-semibold text-slate-600">Computer Literacy</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[11px] mb-1.5 pl-1">
              {COMPUTER_SKILLS_OPTIONS.map((skill) => {
                const isChecked = data.computerSkills.includes(skill);
                return (
                  <div key={skill} className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 bg-white rounded-xs text-[9px] font-bold shrink-0">
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
                <span className="flex-1 border-b border-dotted border-slate-600 font-semibold text-slate-900 px-1 min-h-[18px]">
                  {data.typingSpeedEnglish || (isBlankMode ? '........................ WPM' : '________________')}
                </span>
              </div>
              <div className="flex items-end">
                <span className="w-36 shrink-0 font-bold text-slate-800">টাইপিং স্পিড (বাংলা):</span>
                <span className="flex-1 border-b border-dotted border-slate-600 font-semibold text-slate-900 px-1 min-h-[18px]">
                  {data.typingSpeedBangla || (isBlankMode ? '........................ WPM' : '________________')}
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
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 bg-white text-[9px] font-bold">
                    {data.hasNidCopy ? '✓' : ''}
                  </span>
                  <span>জাতীয় পরিচয়পত্র (NID) ফটোকপি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 bg-white text-[9px] font-bold">
                    {data.hasBirthCertCopy ? '✓' : ''}
                  </span>
                  <span>জন্ম নিবন্ধন সনদের ফটোকপি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 bg-white text-[9px] font-bold">
                    {data.hasCertificateCopy ? '✓' : ''}
                  </span>
                  <span>সকল শিক্ষাগত যোগ্যতার সনদ ও মার্কশিট</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-slate-700 bg-white text-[9px] font-bold">
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
              {isBlankMode ? (
                <div className="space-y-2 py-1 text-[11px] min-h-[48px]">
                  <div className="border-b border-dotted border-slate-600 w-full h-4"></div>
                  <div className="border-b border-dotted border-slate-600 w-full h-4"></div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-800 min-h-[48px] border border-slate-300 p-1.5 bg-white rounded-xs">
                  {data.specialNotes || 'কোনো বিশেষ মন্তব্য নেই।'}
                </div>
              )}
            </div>
          </div>

          {/* প্রার্থীর অঙ্গীকারনামা (Declaration) - Clean white background, crisp border, zero ink waste */}
          <div className="border-2 border-slate-800 bg-white p-2.5 text-[10.5px] text-slate-900 leading-relaxed mb-4 rounded-xs">
            <span className="font-black text-slate-950">অঙ্গীকারনামা: </span>
            আমি এই মর্মে অঙ্গীকার করছি যে, এই ফরমে উপরে প্রদত্ত যাবতীয় তথ্য আমার জানামতে সম্পূর্ণ সত্য ও নির্ভুল। বিদ্যালয়ের নিয়ম-শৃঙ্খলা ও আদর্শ মেনে সততা এবং নিষ্ঠার সাথে শিক্ষকতা কার্য সম্পাদন করতে আমি সদা সচেষ্ট থাকব। ভবিষ্যতে কোনো তথ্য ভুল বা অসত্য প্রমাণিত হলে কর্তৃপক্ষ কর্তৃক গৃহীত যেকোনো সিদ্ধান্ত মানতে বাধ্য থাকব।
          </div>

          {/* স্বাক্ষর সেকশন (Signatures Area) */}
          <div className="flex items-end justify-between px-4 pt-3 mt-4">
            {/* Teacher Signature */}
            <div className="text-center w-56">
              <div className="h-14 flex items-end justify-center pb-1">
                {data.teacherSignature ? (
                  <img 
                    src={data.teacherSignature} 
                    alt="Teacher Sign" 
                    className="max-h-12 max-w-44 object-contain"
                  />
                ) : (
                  <div className="text-[11px] text-slate-400">স্বাক্ষর</div>
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
            <div className="w-20 h-20 border border-dashed border-slate-400 rounded-full flex flex-col items-center justify-center text-[9px] text-slate-400 select-none bg-white">
              <span>বিদ্যালয়ের</span>
              <span>গোল সিল</span>
            </div>

            {/* Principal Signature */}
            <div className="text-center w-56">
              <div className="h-14 flex items-end justify-center pb-1">
                {data.principalSignature ? (
                  <img 
                    src={data.principalSignature} 
                    alt="Principal Sign" 
                    className="max-h-12 max-w-44 object-contain"
                  />
                ) : (
                  <div className="text-[11px] text-slate-400">সিল ও সই</div>
                )}
              </div>
              <div className="border-t-2 border-dashed border-slate-700 pt-1">
                <p className="text-[12px] font-bold text-slate-900">প্রধান শিক্ষকের স্বাক্ষর ও সিল</p>
                <p className="text-[10px] text-slate-600">ডি-লিকন মডেল একাডেমী</p>
              </div>
            </div>
          </div>

          {/* Data Entry Operator & Office Acknowledgement Section - Clean white background, black border */}
          <div className="mt-4 pt-2 border-2 border-slate-800 bg-white p-2.5 rounded-xs text-[10.5px] text-slate-900">
            <div className="font-black text-slate-950 mb-1.5 flex items-center justify-between border-b border-slate-400 pb-1">
              <span>★ একাডেমি অফিস ও ডাটা এন্ট্রি অপারেটরের ব্যবহারের জন্য:</span>
              <span className="font-normal text-[9.5px] text-slate-600">ফরম গ্রহণের পর অনলাইনে এন্ট্রি দিন</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-bold text-slate-800">ফরম গ্রহণের তারিখ:</span> __________________
              </div>
              <div>
                <span className="font-bold text-slate-800">ডাটা এন্ট্রি অপারেটরের সই:</span> __________________
              </div>
              <div>
                <span className="font-bold text-slate-800">নির্ধারিত শিক্ষক আইডি:</span> DLMA-_____________
              </div>
            </div>
          </div>

          {/* Page 2 Footer Note */}
          <div className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
            <span>ডি-লিকন মডেল একাডেমী • সংরক্ষিত শিক্ষক প্রোফাইল</span>
            <span>পৃষ্ঠা ২ / ২ — সমাপ্ত</span>
          </div>
        </div>

      </div>
    </div>
  );
};
