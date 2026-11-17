import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  HelpCircle,
  BookMarked,
  NotebookPen,
  Link2,
  Upload,
  Search,
  Download,
  Eye,
  Trash2,
  Plus,
  X,
  ExternalLink,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Layers,
  GraduationCap,
  QrCode,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Cloud
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  LibraryCategory,
  LibraryResource,
  LibrarySourceType,
  LIBRARY_CATEGORIES,
  LIBRARY_SUBJECTS
} from '../types/libraryTypes';
import { SCHOOL_CLASSES, SyllabusItem } from '../types/adminTypes';
import {
  getAllLibraryResources,
  saveLibraryResource,
  getLibraryPdfBlob,
  deleteLibraryResource,
  formatFileSizeBn
} from '../utils/libraryStorage';
import {
  parseExternalLibraryUrl,
  getLibraryResourceShareUrl,
  resolveLibraryCardActionLabel
} from '../utils/libraryUrlHelper';
import { printViaIsolatedIframe } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';
import { SchoolLogo } from './SchoolLogo';

const STORAGE_SYLLABUS = 'dlma_admin_syllabus_v1';

interface DigitalLibraryProps {
  onOpenAdminSyllabus?: () => void;
  defaultClass?: string;
}

export const DigitalLibrary: React.FC<DigitalLibraryProps> = ({
  onOpenAdminSyllabus,
  defaultClass = 'সকল শ্রেণি'
}) => {
  const { getToken } = useAuth();

  // Core Data State
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGuidelineBar, setShowGuidelineBar] = useState<boolean>(false);

  // Navigation & Filters
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('সকল বিষয়');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inline Delete Confirmation (no window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Class QR Code Share Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState<boolean>(false);

  // Upload / Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formCategory, setFormCategory] = useState<LibraryCategory>('textbook');
  const [formClass, setFormClass] = useState<string>('৫ম শ্রেণি');
  const [formSubject, setFormSubject] = useState<string>('বাংলা');
  const [formSourceType, setFormSourceType] = useState<LibrarySourceType>('pdf_upload');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formAcademicYear, setFormAcademicYear] = useState<string>('২০২৬');
  const [formTermOrChapter, setFormTermOrChapter] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF / Drive In-App Reader Modal State
  const [viewingResource, setViewingResource] = useState<{
    resource: LibraryResource;
    blobUrl: string | null;
    embedUrl: string | null;
    downloadUrl: string | null;
    isGoogleDrive: boolean;
  } | null>(null);

  useEffect(() => {
    if (defaultClass && defaultClass !== selectedClass) {
      setSelectedClass(defaultClass);
    }
  }, [defaultClass]);

  // Load resources from Cloud SQL (with IndexedDB offline fallback)
  const loadLibrary = async () => {
    setIsLoading(true);
    try {
      const data = await getAllLibraryResources();
      setResources(data);
    } catch (err) {
      console.error('Error loading library:', err);
      showBanner('error', 'লাইব্রেরির তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  // Cleanup object URL when viewer closes
  useEffect(() => {
    return () => {
      if (viewingResource?.blobUrl) {
        URL.revokeObjectURL(viewingResource.blobUrl);
      }
    };
  }, [viewingResource]);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => {
      setStatusBanner(prev => (prev?.text === text ? null : prev));
    }, 5500);
  };

  // Load 11-step syllabus from Admin Dashboard localStorage
  const syllabusList = useMemo<SyllabusItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SYLLABUS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }, []);

  const visibleSyllabuses = useMemo(() => {
    if (selectedClass === 'সকল শ্রেণি') return syllabusList;
    return syllabusList.filter(s => s.className === selectedClass);
  }, [syllabusList, selectedClass]);

  // Class Counts for Left Shelf Rail
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = { 'সকল শ্রেণি': resources.length };
    SCHOOL_CLASSES.forEach(cls => {
      counts[cls] = resources.filter(r => r.className === cls).length;
    });
    return counts;
  }, [resources]);

  // Category Counts within Selected Class
  const categoryCounts = useMemo(() => {
    const classFiltered = resources.filter(
      r => selectedClass === 'সকল শ্রেণি' || r.className === selectedClass || r.className === 'সকল শ্রেণি'
    );
    const counts: Record<string, number> = { all: classFiltered.length };
    LIBRARY_CATEGORIES.forEach(cat => {
      counts[cat.id] = classFiltered.filter(r => r.category === cat.id).length;
    });
    return counts;
  }, [resources, selectedClass]);

  // Filtered Resources for Display
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesClass =
        selectedClass === 'সকল শ্রেণি' ||
        r.className === selectedClass ||
        r.className === 'সকল শ্রেণি';

      const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
      const matchesSubject = selectedSubject === 'সকল বিষয়' || r.subject === selectedSubject;

      if (!matchesClass || !matchesCategory || !matchesSubject) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        (r.termOrChapter && r.termOrChapter.toLowerCase().includes(q)) ||
        (r.authorOrPublisher && r.authorOrPublisher.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    });
  }, [resources, selectedClass, activeCategory, selectedSubject, searchQuery]);

  // Live Google Drive link detection preview inside Add Modal
  const parsedFormUrl = useMemo(() => {
    if (!formUrl.trim()) return null;
    return parseExternalLibraryUrl(formUrl.trim());
  }, [formUrl]);

  // Shareable URL for current class QR Code
  const classShareUrl = useMemo(() => {
    return getLibraryResourceShareUrl(selectedClass);
  }, [selectedClass]);

  // Open Upload Modal pre-populated with current context
  const openUploadModal = (presetCategory?: LibraryCategory) => {
    const targetCategory = presetCategory || (activeCategory !== 'all' ? activeCategory : 'textbook');
    setFormCategory(targetCategory);
    setFormClass(selectedClass !== 'সকল শ্রেণি' ? selectedClass : '৫ম শ্রেণি');
    setFormSourceType(targetCategory === 'reference_link' ? 'external_url' : 'pdf_upload');
    setFormTitle('');
    setFormUrl('');
    setFormTermOrChapter('');
    setFormAuthor('');
    setFormDescription('');
    setSelectedFiles([]);
    setIsAddModalOpen(true);
  };

  // Handle File Selection (Single or Multiple PDFs)
  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const pdfs = Array.from(files).filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfs.length === 0) {
      showBanner('error', 'অনুগ্রহ করে শুধুমাত্র PDF (.pdf) ফাইল নির্বাচন করুন।');
      return;
    }

    setSelectedFiles(pdfs);
    if (pdfs.length === 1 && !formTitle.trim()) {
      const cleanName = pdfs[0].name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
      setFormTitle(cleanName);
    }
  };

  // Save Resource(s) to Cloud SQL + IndexedDB
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken().catch(() => null);

    if (formSourceType === 'external_url') {
      if (!formTitle.trim() || !formUrl.trim()) {
        showBanner('error', 'অনুগ্রহ করে শিরোনাম ও সঠিক ওয়েব/গুগল ড্রাইভ/পিডিএফ লিংক প্রদান করুন।');
        return;
      }

      let normalizedUrl = formUrl.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      setIsSaving(true);
      try {
        const now = new Date().toISOString();
        const newItem: LibraryResource = {
          id: `lib_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: formTitle.trim(),
          className: formClass,
          subject: formSubject,
          category: formCategory,
          sourceType: 'external_url',
          url: normalizedUrl,
          academicYear: formAcademicYear.trim() || '২০২৬',
          termOrChapter: formTermOrChapter.trim() || undefined,
          authorOrPublisher: formAuthor.trim() || undefined,
          description: formDescription.trim() || undefined,
          uploadedBy: 'শিক্ষক / এডমিন',
          hasCloudFile: false,
          createdAt: now,
          updatedAt: now
        };
        const { cloudSynced } = await saveLibraryResource(newItem, undefined, token);
        await loadLibrary();
        setIsAddModalOpen(false);
        showBanner(
          'success',
          cloudSynced
            ? `"${newItem.title}" কেন্দ্রীয় সার্ভারে সংরক্ষিত হয়েছে — এখন সব ডিভাইস থেকে দেখা যাবে।`
            : `"${newItem.title}" স্থানীয়ভাবে সংরক্ষিত হয়েছে।`
        );
      } catch {
        showBanner('error', 'লিংক সংরক্ষণ করতে সমস্যা হয়েছে।');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // PDF Upload Mode (supports 1 or batch multiple PDFs)
    if (selectedFiles.length === 0) {
      showBanner('error', 'অনুগ্রহ করে অন্তত একটি PDF ফাইল নির্বাচন করুন।');
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      let anyOversized = false;
      let syncedCount = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fallbackTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
        const finalTitle =
          selectedFiles.length === 1 && formTitle.trim()
            ? formTitle.trim()
            : selectedFiles.length > 1 && formTitle.trim()
              ? `${formTitle.trim()} - ${fallbackTitle}`
              : fallbackTitle;

        const newItem: LibraryResource = {
          id: `lib_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          title: finalTitle,
          className: formClass,
          subject: formSubject,
          category: formCategory,
          sourceType: 'pdf_upload',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/pdf',
          hasLocalBlob: true,
          hasCloudFile: file.size <= 25 * 1024 * 1024,
          academicYear: formAcademicYear.trim() || '২০২৬',
          termOrChapter: formTermOrChapter.trim() || undefined,
          authorOrPublisher: formAuthor.trim() || undefined,
          description: formDescription.trim() || undefined,
          uploadedBy: 'শিক্ষক / এডমিন',
          createdAt: now,
          updatedAt: now
        };
        const { cloudSynced, oversizedWarning } = await saveLibraryResource(newItem, file, token);
        if (cloudSynced) syncedCount++;
        if (oversizedWarning) anyOversized = true;
      }

      await loadLibrary();
      setIsAddModalOpen(false);
      if (anyOversized) {
        showBanner(
          'success',
          `${selectedFiles.length}টি ফাইল সংরক্ষিত হয়েছে (২৫ MB-এর বড় ফাইলটি কেবল এই ডিভাইসে সংরক্ষিত; সব ডিভাইসে শেয়ার করতে Google Drive লিংক ব্যবহার করুন)।`
        );
      } else if (syncedCount > 0) {
        showBanner(
          'success',
          `সফলভাবে ${selectedFiles.length}টি পিডিএফ ফাইল [${formClass}] কেন্দ্রীয় লাইব্রেরিতে আপলোড হয়েছে — এখন সকল শিক্ষক ও শিক্ষার্থী সব ডিভাইস থেকে পড়তে পারবেন।`
        );
      } else {
        showBanner(
          'success',
          `সফলভাবে ${selectedFiles.length}টি পিডিএফ ফাইল [${formClass}] লাইব্রেরিতে আপলোড হয়েছে।`
        );
      }
    } catch (err) {
      console.error('Upload error:', err);
      showBanner('error', 'পিডিএফ সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  // Open In-App PDF / Google Drive Reader
  const handleViewResource = async (res: LibraryResource) => {
    if (res.sourceType === 'pdf_upload') {
      const blob = await getLibraryPdfBlob(res.id);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        setViewingResource({
          resource: res,
          blobUrl,
          embedUrl: null,
          downloadUrl: `/api/library/${encodeURIComponent(res.id)}/pdf?download=1`,
          isGoogleDrive: false
        });
        return;
      }

      if (res.hasCloudFile) {
        setViewingResource({
          resource: res,
          blobUrl: null,
          embedUrl: `/api/library/${encodeURIComponent(res.id)}/pdf`,
          downloadUrl: `/api/library/${encodeURIComponent(res.id)}/pdf?download=1`,
          isGoogleDrive: false
        });
        return;
      }

      showBanner('error', 'দুঃখিত, এই পিডিএফ ফাইলটি এখনও সার্ভারে সিঙ্ক করা হয়নি বা ব্রাউজারে নেই।');
      return;
    }

    if (res.url) {
      const parsed = parseExternalLibraryUrl(res.url);
      setViewingResource({
        resource: res,
        blobUrl: null,
        embedUrl: parsed.embedUrl,
        downloadUrl: parsed.downloadUrl,
        isGoogleDrive: parsed.isGoogleDrive
      });
    }
  };

  // Download PDF directly
  const handleDownloadResource = async (res: LibraryResource) => {
    if (res.sourceType === 'pdf_upload') {
      const blob = await getLibraryPdfBlob(res.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.fileName || `${res.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (a.parentNode) a.parentNode.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
        return;
      }

      if (res.hasCloudFile) {
        const a = document.createElement('a');
        a.href = `/api/library/${encodeURIComponent(res.id)}/pdf?download=1`;
        a.download = res.fileName || `${res.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (a.parentNode) a.parentNode.removeChild(a);
        }, 500);
        return;
      }

      showBanner('error', 'ডাউনলোডের জন্য পিডিএফ ফাইলটি পাওয়া যায়নি।');
    }
  };

  // Delete Resource
  const handleDeleteResource = async (id: string) => {
    try {
      const token = await getToken().catch(() => null);
      await deleteLibraryResource(id, token);
      setConfirmDeleteId(null);
      await loadLibrary();
      showBanner('success', 'রিসোর্সটি লাইব্রেরি থেকে মুছে ফেলা হয়েছে।');
    } catch {
      showBanner('error', 'মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(classShareUrl);
      setCopiedQrUrl(true);
      setTimeout(() => setCopiedQrUrl(false), 2500);
    } catch {
      showBanner('error', 'লিংক কপি করা সম্ভব হয়নি।');
    }
  };

  // Category Icon Helper
  const getCategoryIcon = (cat: LibraryCategory) => {
    switch (cat) {
      case 'textbook':
        return <BookOpen className="w-4 h-4 text-teal-700" />;
      case 'syllabus':
        return <Layers className="w-4 h-4 text-indigo-700" />;
      case 'question_bank':
        return <HelpCircle className="w-4 h-4 text-amber-700" />;
      case 'note_book':
        return <NotebookPen className="w-4 h-4 text-emerald-700" />;
      case 'guide_book':
        return <BookMarked className="w-4 h-4 text-blue-700" />;
      case 'reference_link':
        return <Link2 className="w-4 h-4 text-slate-700" />;
    }
  };

  const getCategoryLabel = (cat: LibraryCategory) => {
    return LIBRARY_CATEGORIES.find(c => c.id === cat)?.label || cat;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Institutional Library Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <SchoolLogo size={40} preferVector={true} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-balance">
              ডি-লিকন ডিজিটাল লাইব্রেরী ও রিসোর্স ভান্ডার
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              প্লে থেকে ১০ম শ্রেণি পর্যন্ত পাঠ্যবইয়ের পিডিএফ, সিলেবাস, প্রশ্ন ব্যাংক, নোট বই, গাইড বই ও রেফারেন্স লিংক
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বই, বিষয় বা অধ্যায় খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
            />
          </div>

          <button
            id="btn-library-guideline-toggle"
            onClick={() => setShowGuidelineBar(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              showGuidelineBar
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="কপিরাইট ও এনসিটিবি নিরাপদ ব্যবহার নির্দেশিকা"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>কপিরাইট নীতি</span>
          </button>

          <button
            id="btn-library-qr-share"
            onClick={() => setIsQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="শ্রেণিকক্ষে টানানোর জন্য QR কোড তৈরি ও প্রিন্ট করুন"
          >
            <QrCode className="w-4 h-4 text-indigo-700" />
            <span>QR কোড</span>
          </button>

          <button
            id="btn-library-add-resource"
            onClick={() => openUploadModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন বই / রিসোর্স আপলোড</span>
          </button>
        </div>
      </div>

      {/* Expandable Copyright & Open Access Guideline Panel */}
      {showGuidelineBar && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs text-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>নিরাপদ এনসিটিবি বই ব্যবহার ও কপিরাইট নির্দেশিকা</span>
            </h2>
            <button
              onClick={() => setShowGuidelineBar(false)}
              className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
              <div className="font-bold text-slate-900">১. এনসিটিবি (NCTB) পাঠ্যবই</div>
              <p className="leading-relaxed">
                সবচেয়ে ঝুঁকিমুক্ত উপায় হলো <span className="font-semibold">nctb.portal.gov.bd</span>-এর অফিশিয়াল লিংক অথবা স্কুলের Google Drive লিংক যুক্ত করা। সরাসরি PDF আপলোড করলে তা কেবল শ্রেণিকক্ষ পাঠদানের অবাণিজ্যিক কাজে ব্যবহার করুন।
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
              <div className="font-bold text-slate-900">২. নোট বই ও প্রশ্ন ব্যাংক</div>
              <p className="leading-relaxed">
                বাণিজ্যিক প্রকাশনীর গাইড বই স্ক্যান করে আপলোড না করে একাডেমির শিক্ষকদের নিজস্ব প্রণীত নোট, লেকচার শিট ও প্রশ্ন ব্যাংক আপলোড করুন—এতে কোনো কপিরাইট ঝুঁকি থাকে না।
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
              <div className="font-bold text-slate-900">৩. সকল ডিভাইসে অবাধ একসেস</div>
              <p className="leading-relaxed">
                আপলোডকৃত সকল বই, লিংক ও প্রশ্ন ব্যাংক কেন্দ্রীয় ক্লাউড ডেটাবেজে সংরক্ষিত হয়। শ্রেণির <span className="font-semibold">QR কোড</span> প্রিন্ট করে শ্রেণিকক্ষে দিলে শিক্ষার্থী ও অভিভাবক সরাসরি পড়তে পারবেন।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Toast / Notification */}
      {statusBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Two-Zone Library Workspace */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* LEFT ZONE: Class Shelf Navigator (প্লে - ১০ম শ্রেণি) */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-teal-700" />
              <span>শ্রেণি অনুযায়ী তাক (প্লে - ১০ম)</span>
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {resources.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1">
            <button
              onClick={() => setSelectedClass('সকল শ্রেণি')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedClass === 'সকল শ্রেণি'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">সকল শ্রেণি</span>
              <span className="font-mono tabular-nums text-[11px] opacity-80">
                {classCounts['সকল শ্রেণি'] || 0}
              </span>
            </button>

            {SCHOOL_CLASSES.map((cls) => {
              const isSelected = selectedClass === cls;
              const count = classCounts[cls] || 0;
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-700 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{cls}</span>
                  <span className="font-mono tabular-nums text-[11px] opacity-80">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT ZONE: Category Filter Bar, Syllabus Viewer & Resources Grid */}
        <section className="flex-1 min-w-0 w-full space-y-5">
          {/* Segmented Category Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              সকল ({categoryCounts.all || 0})
            </button>

            {LIBRARY_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.shortLabel}</span>
                  <span className="font-mono tabular-nums text-[11px] opacity-80">
                    ({categoryCounts[cat.id] || 0})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subject Filter & Context Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-bold text-slate-900">{selectedClass}</span>
              <span aria-hidden="true">·</span>
              <span>
                {activeCategory === 'all'
                  ? 'সকল ক্যাটাগরি'
                  : getCategoryLabel(activeCategory)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{filteredResources.length}টি ফাইল/লিংক</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Cloud className="w-3.5 h-3.5 text-teal-700" />
                ক্লাউড সিঙ্ক সক্রিয়
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 cursor-pointer"
                aria-label="বিষয় নির্বাচন"
              >
                <option value="সকল বিষয়">সকল বিষয়</option>
                {LIBRARY_SUBJECTS.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              {activeCategory !== 'all' && (
                <button
                  onClick={() => openUploadModal(activeCategory)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-700" />
                  <span>{LIBRARY_CATEGORIES.find(c => c.id === activeCategory)?.shortLabel} যোগ করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* =========================================================
              INTEGRATED CLASS-WISE SYLLABUS PANEL (Visible in 'syllabus' tab)
              ========================================================= */}
          {activeCategory === 'syllabus' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    একাডেমিক ৯-পরীক্ষার শ্রেণিভিত্তিক সিলেবাস ({selectedClass})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    এডমিন হাব থেকে সিঙ্ককৃত বাৎসরিক ৬টি পার্বিক ও ৩টি সাময়িক/বার্ষিক পরীক্ষার সিলেবাস
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenAdminSyllabus && (
                    <button
                      onClick={onOpenAdminSyllabus}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      সিলেবাস সম্পাদনা করুন
                    </button>
                  )}
                  <button
                    onClick={() => openUploadModal('syllabus')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>সিলেবাস PDF আপলোড</span>
                  </button>
                </div>
              </div>

              {visibleSyllabuses.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  {selectedClass} এর জন্য এডমিন হাবে এখনও ডিজিটাল সিলেবাস সংরক্ষিত হয়নি। আপনি নিচে সিলেবাস PDF আপলোড করতে পারেন অথবা এডমিন হাব থেকে যুক্ত করতে পারেন।
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleSyllabuses.map(syl => (
                    <div key={syl.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{syl.className}</span>
                        <span className="text-xs text-slate-500">সর্বশেষ আপডেট: {syl.updatedAt}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                          <div className="font-bold text-slate-900">১ম সাময়িক পর্ব</div>
                          <p className="text-slate-600"><strong>১. ১ম পার্বিক (১ম সাময়িক):</strong> {syl.midterm1_1Syllabus || '—'}</p>
                          <p className="text-slate-600"><strong>২. ২য় পার্বিক (১ম সাময়িক):</strong> {syl.midterm1_2Syllabus || '—'}</p>
                          <p className="text-slate-800"><strong>৩. প্রথম সাময়িক (মেয়াদী):</strong> {syl.term1Syllabus || '—'}</p>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                          <div className="font-bold text-slate-900">২য় সাময়িক পর্ব</div>
                          <p className="text-slate-600"><strong>৪. ১ম পার্বিক (২য় সাময়িক):</strong> {syl.midterm2_1Syllabus || '—'}</p>
                          <p className="text-slate-600"><strong>৫. ২য় পার্বিক (২য় সাময়িক):</strong> {syl.midterm2_2Syllabus || '—'}</p>
                          <p className="text-slate-800"><strong>৬. দ্বিতীয় সাময়িক (মেয়াদী):</strong> {syl.term2Syllabus || '—'}</p>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                          <div className="font-bold text-slate-900">বার্ষিক পর্ব</div>
                          <p className="text-slate-600"><strong>৭. ১ম পার্বিক (বার্ষিক):</strong> {syl.midterm3_1Syllabus || '—'}</p>
                          <p className="text-slate-600"><strong>৮. ২য় পার্বিক (বার্ষিক):</strong> {syl.midterm3_2Syllabus || '—'}</p>
                          <p className="text-slate-800"><strong>৯. বার্ষিক পরীক্ষা (মেয়াদী):</strong> {syl.term3Syllabus || '—'}</p>
                        </div>
                      </div>

                      {syl.notes && (
                        <p className="text-xs text-slate-600 border-t border-slate-200 pt-2">
                          <strong>নির্দেশনা:</strong> {syl.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              RESOURCES LIST / EMPTY / LOADING STATES
              ========================================================= */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded w-full mt-2" />
                </div>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-900">
                  [{selectedClass}] — এই বিভাগে এখনও কোনো রিসোর্স আপলোড করা হয়নি
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  পাঠ্যবইয়ের পিডিএফ, Google Drive বইয়ের লিংক, সিলেবাস, প্রশ্ন ব্যাংক বা শিক্ষকদের হ্যান্ডনোট আপলোড করে লাইব্রেরি সমৃদ্ধ করুন।
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => openUploadModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>প্রথম বই / পিডিএফ আপলোড করুন</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((res) => {
                const isPdf = res.sourceType === 'pdf_upload';
                const parsedExternal = res.url ? parseExternalLibraryUrl(res.url) : null;
                const canPreviewExternal = Boolean(parsedExternal?.canEmbed);
                const isConfirming = confirmDeleteId === res.id;

                return (
                  <article
                    key={res.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-2">
                      {/* Title Row */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                          {getCategoryIcon(res.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {res.title}
                          </h3>
                          {/* Unboxed Typographic Metadata (Zero-Pill Discipline) */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <span className="font-medium text-slate-700">{getCategoryLabel(res.category)}</span>
                            <span aria-hidden="true">·</span>
                            <span>{res.className}</span>
                            <span aria-hidden="true">·</span>
                            <span>{res.subject}</span>
                            {res.termOrChapter && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{res.termOrChapter}</span>
                              </>
                            )}
                            {isPdf && res.fileSize && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">{formatFileSizeBn(res.fileSize)}</span>
                              </>
                            )}
                            {parsedExternal?.isGoogleDrive && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-teal-700 font-medium">Google Drive PDF</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {res.description && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pl-12">
                          {res.description}
                        </p>
                      )}

                      {res.authorOrPublisher && (
                        <p className="text-[11px] text-slate-500 pl-12">
                          সংগ্রহ / প্রকাশনা: {res.authorOrPublisher}
                          {res.academicYear ? ` · শিক্ষাবর্ষ ${res.academicYear}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isPdf ? (
                          <>
                            <button
                              onClick={() => handleViewResource(res)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{resolveLibraryCardActionLabel(res)}</span>
                            </button>

                            <button
                              onClick={() => handleDownloadResource(res)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>ডাউনলোড</span>
                            </button>
                          </>
                        ) : canPreviewExternal ? (
                          <>
                            <button
                              onClick={() => handleViewResource(res)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{resolveLibraryCardActionLabel(res)}</span>
                            </button>
                            {parsedExternal?.downloadUrl && (
                              <a
                                href={parsedExternal.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>ডাউনলোড</span>
                              </a>
                            )}
                          </>
                        ) : (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>লিংক খুলুন</span>
                          </a>
                        )}
                      </div>

                      {/* Two-step Inline Delete */}
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md cursor-pointer"
                          >
                            মুছুন
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(res.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="রিসোর্স মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =========================================================================
          MODAL 1: UPLOAD PDF OR ADD REFERENCE / GOOGLE DRIVE LINK
          ========================================================================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 text-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  লাইব্রেরিতে নতুন বই, নোট, প্রশ্ন ব্যাংক বা লিংক যোগ করুন
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  আপলোডকৃত বই বা লিংক কেন্দ্রীয় ডেটাবেজে সংরক্ষিত হবে এবং সকল ডিভাইস থেকে দেখা যাবে
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Copyright & Safe Sharing Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>নিরাপদ ব্যবহার নির্দেশিকা:</strong> এনসিটিবি (NCTB) বইয়ের জন্য অফিশিয়াল লিংক বা Google Drive শেয়ার লিংক ব্যবহার করা কপিরাইট-নিরাপদ। বাণিজ্যিক গাইড বই স্ক্যান না করে নিজস্ব শিক্ষকদের নোট ও প্রশ্ন ব্যাংক সংরক্ষণ করুন।
              </div>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 text-xs">
              {/* Row 1: Category & Source Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি নির্বাচন</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as LibraryCategory;
                      setFormCategory(cat);
                      if (cat === 'reference_link') {
                        setFormSourceType('external_url');
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-900 cursor-pointer"
                  >
                    {LIBRARY_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">সংযুক্তির মাধ্যম</label>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormSourceType('pdf_upload')}
                      className={`flex-1 py-1.5 px-2 rounded-md font-semibold transition-colors cursor-pointer ${
                        formSourceType === 'pdf_upload'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      PDF ফাইল আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormSourceType('external_url')}
                      className={`flex-1 py-1.5 px-2 rounded-md font-semibold transition-colors cursor-pointer ${
                        formSourceType === 'external_url'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Google Drive / লিংক
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">শ্রেণি</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-900 cursor-pointer"
                  >
                    <option value="সকল শ্রেণি">সকল শ্রেণি</option>
                    {SCHOOL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">বিষয়</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-900 cursor-pointer"
                  >
                    {LIBRARY_SUBJECTS.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source Input: Drag & Drop PDF or URL */}
              {formSourceType === 'pdf_upload' ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesChosen(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-teal-600 bg-teal-50/70'
                      : 'border-slate-300 bg-slate-50 hover:border-teal-500'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    multiple
                    onChange={(e) => handleFilesChosen(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="w-7 h-7 text-teal-700 mx-auto mb-2" />
                  {selectedFiles.length === 0 ? (
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">
                        এখানে ক্লিক করুন অথবা PDF ফাইল টেনে এনে ছাড়ুন
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ২৫ MB পর্যন্ত PDF সরাসরি ক্লাউড ডেটাবেজে সিঙ্ক হবে (বড় বইয়ের জন্য Google Drive লিংক দিন)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="font-bold text-emerald-800">
                        {selectedFiles.length}টি PDF ফাইল নির্বাচিত হয়েছে:
                      </p>
                      <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-slate-700">
                        {selectedFiles.map((f, idx) => (
                          <div key={idx} className="font-mono">
                            {f.name} ({formatFileSizeBn(f.size)})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    Google Drive PDF লিংক বা ওয়েব লিংক (URL) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view অথবা https://nctb.portal.gov.bd/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                    required
                  />
                  {parsedFormUrl?.isGoogleDrive && (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Google Drive ফাইল শনাক্ত হয়েছে — সরাসরি অ্যাপের ভেতরের PDF রিডারে প্রিভিউ ও ডাউনলোড করা যাবে।</span>
                    </p>
                  )}
                </div>
              )}

              {/* Row 3: Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  বই / রিসোর্সের শিরোনাম {selectedFiles.length <= 1 && <span className="text-rose-600">*</span>}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    selectedFiles.length > 1
                      ? 'ঐচ্ছিক প্রিফিক্স (ফাঁকা রাখলে ফাইলের নামই শিরোনাম হবে)'
                      : 'যেমন: আমার বাংলা বই - ৫ম শ্রেণি অথবা ১ম সাময়িক গণিত প্রশ্ন ব্যাংক'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-600 outline-none"
                  required={formSourceType === 'external_url' || selectedFiles.length <= 1}
                />
              </div>

              {/* Row 4: Chapter / Term, Year, Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পর্ব / অধ্যায়</label>
                  <input
                    type="text"
                    value={formTermOrChapter}
                    onChange={(e) => setFormTermOrChapter(e.target.value)}
                    placeholder="যেমন: সম্পূর্ণ বই / ১ম সাময়িক"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">শিক্ষাবর্ষ</label>
                  <input
                    type="text"
                    value={formAcademicYear}
                    onChange={(e) => setFormAcademicYear(e.target.value)}
                    placeholder="২০২৬"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">লেখক / প্রকাশনী / শিক্ষক</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="যেমন: NCTB / শ্রেণি শিক্ষক"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ / নির্দেশনা</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="শিক্ষার্থী বা শিক্ষকদের জন্য সংক্ষিপ্ত নোট..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg cursor-pointer disabled:opacity-60"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'লাইব্রেরিতে সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: BUILT-IN IN-APP PDF & GOOGLE DRIVE READER
          ========================================================================= */}
      {viewingResource && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
            {/* Reader Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-white">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {viewingResource.resource.title}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span>{viewingResource.resource.className}</span>
                  <span aria-hidden="true">·</span>
                  <span>{viewingResource.resource.subject}</span>
                  {viewingResource.resource.fileSize && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatFileSizeBn(viewingResource.resource.fileSize)}
                      </span>
                    </>
                  )}
                  {viewingResource.isGoogleDrive && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-teal-700 font-medium">Google Drive Reader</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(viewingResource.blobUrl || viewingResource.downloadUrl) && (
                  <a
                    href={viewingResource.blobUrl || viewingResource.downloadUrl || '#'}
                    download={viewingResource.resource.fileName || `${viewingResource.resource.title}.pdf`}
                    target={viewingResource.blobUrl ? undefined : '_blank'}
                    rel={viewingResource.blobUrl ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড PDF</span>
                  </a>
                )}

                {viewingResource.resource.url && (
                  <a
                    href={viewingResource.resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>নতুন ট্যাবে</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    if (viewingResource.blobUrl) {
                      URL.revokeObjectURL(viewingResource.blobUrl);
                    }
                    setViewingResource(null);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  aria-label="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Viewport */}
            <div className="flex-1 bg-slate-100 relative">
              {viewingResource.blobUrl || viewingResource.embedUrl ? (
                <iframe
                  src={viewingResource.blobUrl || viewingResource.embedUrl || ''}
                  title={viewingResource.resource.title}
                  className="w-full h-full border-0"
                  allow="autoplay"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Link2 className="w-10 h-10 text-teal-700" />
                  <p className="text-sm font-bold text-slate-900">বাহ্যিক ওয়েব লিংক</p>
                  <a
                    href={viewingResource.resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>নতুন ট্যাবে খুলুন</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CLASS-WISE QR CODE SHARE & NOTICE BOARD PRINT CARD
          ========================================================================= */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  শ্রেণিভিত্তিক ডিজিটাল লাইব্রেরী QR কোড
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  শ্রেণিকক্ষ বা নোটিশ বোর্ডে প্রিন্ট করে টানিয়ে দিন
                </p>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable QR Poster Card */}
            <div
              id="printable-library-qr-card"
              className="border-2 border-slate-900 rounded-xl p-6 text-center bg-white space-y-4"
            >
              <div className="flex flex-col items-center gap-1.5 border-b border-slate-200 pb-3">
                <SchoolLogo size={48} preferVector={true} />
                <div className="text-base font-bold text-slate-900">ডি-লিকন মডেল একাডেমী</div>
                <div className="text-[11px] text-slate-500">
                  মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
                  ডিজিটাল লাইব্রেরী ও পাঠ্যবই কর্নার
                </div>
                <div className="text-lg font-bold text-slate-900">
                  শ্রেণি: {selectedClass}
                </div>
              </div>

              <div className="flex justify-center py-2">
                <div className="p-3 bg-white border border-slate-300 rounded-xl inline-block">
                  <QRCodeSVG
                    value={classShareUrl}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                মোবাইল ক্যামেরা দিয়ে QR কোডটি স্ক্যান করে সরাসরি <strong>{selectedClass}</strong>-এর পাঠ্যবই PDF, সিলেবাস, প্রশ্ন ব্যাংক ও নোট বই পড়ুন এবং ডাউনলোড করুন।
              </p>
            </div>

            {/* Copyable Direct Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">সরাসরি শেয়ারযোগ্য লিংক</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={classShareUrl}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-700"
                />
                <button
                  onClick={handleCopyShareUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                >
                  {copiedQrUrl ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQrUrl ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => printViaIsolatedIframe('printable-library-qr-card')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                <span>QR কার্ড প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
