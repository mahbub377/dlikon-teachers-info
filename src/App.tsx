import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { InspirationalHome } from './components/InspirationalHome';
import { AdminDashboard } from './components/AdminDashboard';
import { ModulePlaceholder } from './components/ModulePlaceholder';
import { TeacherFormEditor } from './components/TeacherFormEditor';
import { PrintableTwoPageForm } from './components/PrintableTwoPageForm';
import { TeacherIdCard } from './components/TeacherIdCard';
import { TeacherDirectory } from './components/TeacherDirectory';
import { TeacherFormData, ActiveTab } from './types';
import { sampleTeacherData, createEmptyTeacher } from './data/sampleData';
import { fetchTeachersFromDb, saveTeacherToDb, deleteTeacherFromDb } from './services/teacherApi';
import { useAuth } from './context/AuthContext';
import { printViaIsolatedIframe } from './utils/pdfExport';
import { StudentEvaluationSheet } from './components/StudentEvaluationSheet';
import { AdminAnalyticsDashboard } from './components/AdminAnalyticsDashboard';
import { DigitalLibrary } from './components/DigitalLibrary';
import { TeachersToolsHub } from './components/TeachersToolsHub';

const STORAGE_KEY_CURRENT = 'dlma_current_form_v1';
const STORAGE_KEY_LIST = 'dlma_teachers_directory_v1';

export default function App() {
  const { getToken } = useAuth();
  const [initialLibraryClass] = useState<string>(() => {
    if (typeof window === 'undefined') return 'সকল শ্রেণি';
    const params = new URLSearchParams(window.location.search);
    return params.get('class') || 'সকল শ্রেণি';
  });
  // Default view is Home unless deep-linked via QR (?tab=library)
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window === 'undefined') return 'home';
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'library') return 'library';
    return 'home';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  
  // Initialize registration form as empty (খালি ফরম) by user request
  const [formData, setFormData] = useState<TeacherFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return createEmptyTeacher();
  });

  const [savedTeachers, setSavedTeachers] = useState<TeacherFormData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [sampleTeacherData];
  });

  const [isSavedNotification, setIsSavedNotification] = useState(false);
  const [isBlankPrintMode, setIsBlankPrintMode] = useState<boolean>(false);
  const [autoDownloadBlank, setAutoDownloadBlank] = useState<boolean>(false);

  // Sync teachers from database
  const loadTeachers = useCallback(async () => {
    try {
      const token = await getToken();
      const dbTeachers = await fetchTeachersFromDb(token);
      if (dbTeachers && dbTeachers.length > 0) {
        setSavedTeachers(dbTeachers);
        localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(dbTeachers));
      } else {
        // If DB is brand new, seed the sample teacher to DB
        await saveTeacherToDb(sampleTeacherData, token).catch(() => {});
      }
    } catch (err) {
      console.warn('Using local cached teacher list:', err);
    }
  }, [getToken]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // Sync current form state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(formData));
    } catch (e) {
      console.error(e);
    }
  }, [formData]);

  // Save current form into database and directory
  const handleSaveTeacher = async () => {
    const updatedForm: TeacherFormData = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local update
    const existingIndex = savedTeachers.findIndex(t => t.id === updatedForm.id);
    let newSavedList: TeacherFormData[];
    if (existingIndex >= 0) {
      newSavedList = [...savedTeachers];
      newSavedList[existingIndex] = updatedForm;
    } else {
      newSavedList = [updatedForm, ...savedTeachers];
    }
    setSavedTeachers(newSavedList);
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(newSavedList));

    // Persist to Cloud SQL database
    try {
      const token = await getToken();
      await saveTeacherToDb(updatedForm, token);
    } catch (err) {
      console.error('Error persisting to database:', err);
    }

    setIsSavedNotification(true);
    setTimeout(() => {
      setIsSavedNotification(false);
    }, 2500);
  };

  // Load sample teacher data
  const handleLoadSample = () => {
    setFormData({
      ...sampleTeacherData,
      id: 'tch_' + Date.now(),
      teacherId: 'DLMA-' + Math.floor(1000 + Math.random() * 9000),
    });
  };

  // Reset form to blank
  const handleResetForm = () => {
    if (confirm('আপনি কি নিশ্চিত যে নতুন একটি খালি ফরম চালু করতে চান? বর্তমান অসংরক্ষিত তথ্য মুছে যাবে।')) {
      setFormData(createEmptyTeacher());
      setActiveTab('registration');
    }
  };

  // Direct print trigger for current filled form
  const handlePrint = () => {
    setIsBlankPrintMode(false);
    if (activeTab !== 'preview' && activeTab !== 'idcard') {
      setActiveTab('preview');
      setTimeout(() => {
        printViaIsolatedIframe('printable-two-page-area');
      }, 500);
    } else {
      printViaIsolatedIframe('printable-two-page-area');
    }
  };

  // Direct print trigger for blank form (হাতে লেখার অফিশিয়াল কপি)
  const handlePrintBlankForm = () => {
    setIsBlankPrintMode(true);
    setActiveTab('preview');
    setAutoDownloadBlank(true);
  };

  // Select teacher from directory
  const handleSelectTeacher = (teacher: TeacherFormData) => {
    setFormData(teacher);
    setActiveTab('registration');
  };

  // Switch to preview with specific teacher
  const handleSwitchToPreview = (teacher: TeacherFormData) => {
    setFormData(teacher);
    setActiveTab('preview');
  };

  // Delete teacher
  const handleDeleteTeacher = async (id: string) => {
    const updated = savedTeachers.filter(t => t.id !== id);
    setSavedTeachers(updated);
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(updated));

    try {
      const token = await getToken();
      await deleteTeacherFromDb(id, token);
    } catch (err) {
      console.error('Error deleting teacher from database:', err);
    }
  };

  // Import backup
  const handleImportBackup = async (imported: TeacherFormData[]) => {
    setSavedTeachers(imported);
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(imported));
    if (imported.length > 0) {
      setFormData(imported[0]);
    }

    try {
      const token = await getToken();
      for (const t of imported) {
        await saveTeacherToDb(t, token).catch(() => {});
      }
    } catch (err) {
      console.error('Error importing teachers to database:', err);
    }

    alert(`সফলভাবে ${imported.length} জন শিক্ষকের তথ্য রিস্টোর ও ডেটাবেজে সংরক্ষিত হয়েছে!`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col selection:bg-amber-200 selection:text-amber-950">
      {/* 3-line collapsible Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedTeachers.length}
        onPrintBlank={handlePrintBlankForm}
      />

      {/* 3-dot collapsible Right Sidebar */}
      <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        onNavigateToAdmin={() => setActiveTab('admin_dashboard')}
      />

      {/* Top Header & Navigation with hamburger menu and three-dot buttons */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onToggleRightSidebar={() => setIsRightSidebarOpen(true)}
        onLoadSample={handleLoadSample}
        onReset={handleResetForm}
        onSave={handleSaveTeacher}
        onPrint={handlePrint}
        onPrintBlank={handlePrintBlankForm}
        onDownloadBlankPdf={handlePrintBlankForm}
        savedCount={savedTeachers.length}
        isSavedNotification={isSavedNotification}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <InspirationalHome
            onNavigate={(tab) => {
              setActiveTab(tab);
            }}
            onPrintBlank={handlePrintBlankForm}
          />
        )}

        {/* ১। শিক্ষক নিবন্ধন (খালি ফরম) */}
        {activeTab === 'registration' && (
          <TeacherFormEditor
            formData={formData}
            setFormData={setFormData}
            onViewPreview={() => {
              setIsBlankPrintMode(false);
              setActiveTab('preview');
            }}
            onSave={handleSaveTeacher}
            onLoadSample={handleLoadSample}
            onPrintBlank={handlePrintBlankForm}
            onReset={handleResetForm}
          />
        )}

        {/* এডমিন ড্যাশবোর্ড: এক্সেল শিক্ষার্থী (প্লে-১০ম), শিক্ষক, কর্মচারী ও উদ্যোক্তা আপলোড ও সিলেবাস */}
        {activeTab === 'admin_dashboard' && (
          <AdminDashboard
            teachers={savedTeachers}
            onSelectTeacherForPrint={(tch) => {
              setFormData(tch);
              setIsBlankPrintMode(false);
              setActiveTab('preview');
            }}
            onUpdateTeachers={(updated) => {
              setSavedTeachers(updated);
              localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(updated));
            }}
          />
        )}

        {/* ২। টিচারস টুল (প্রশ্ন মেকার, নোট ক্রিয়েটর, ক্লাস প্রেজেন্টেশন, সিলেবাস মেকার) */}
        {activeTab === 'teachers_tools' && (
          <TeachersToolsHub initialTool="question" />
        )}

        {/* ৩। সেশন প্লান */}
        {activeTab === 'session_plan' && (
          <ModulePlaceholder module="session_plan" title="৩। সেশন ও লেসন প্লান" />
        )}

        {/* ৪। আজকের দুর্বল শিক্ষার্থী */}
        {activeTab === 'weak_students' && (
          <ModulePlaceholder
            module="weak_students"
            title="৪। আজকের দুর্বল শিক্ষার্থী ট্র্যাকার"
            onNavigateToAdmin={() => setActiveTab('admin_dashboard')}
          />
        )}

        {/* ৫। প্রশ্ন মেকার */}
        {activeTab === 'question_maker' && (
          <TeachersToolsHub initialTool="question" />
        )}

        {/* ৬। নোট মেকার */}
        {activeTab === 'note_maker' && (
          <TeachersToolsHub initialTool="notes" />
        )}

        {/* ৭। নোটিশ বোর্ড */}
        {activeTab === 'notice_board' && (
          <ModulePlaceholder module="notice_board" title="৭। অভ্যন্তরীণ নোটিশ বোর্ড" />
        )}

        {/* ৮। আজকের ক্লাস */}
        {activeTab === 'todays_class' && (
          <ModulePlaceholder module="todays_class" title="৮। আজকের ক্লাস ও সময়সূচী" />
        )}

        {/* ৯। শিক্ষার্থী মূল্যায়ন সীট (লাইভ শ্রেণিকক্ষ মূল্যায়ন) */}
        {activeTab === 'student_evaluation' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
            <StudentEvaluationSheet
              students={(() => {
                try {
                  const s = localStorage.getItem('dlma_admin_students_v2');
                  return s ? JSON.parse(s) : [];
                } catch { return []; }
              })()}
              teachers={savedTeachers}
              onClose={() => setActiveTab('admin_dashboard')}
            />
          </div>
        )}

        {/* ১০। এডমিন এনালিটিক্স ও চার্ট (Recharts) */}
        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
            <AdminAnalyticsDashboard
              students={(() => {
                try {
                  const s = localStorage.getItem('dlma_admin_students_v2');
                  return s ? JSON.parse(s) : [];
                } catch { return []; }
              })()}
              teachers={savedTeachers}
              onOpenEvaluationSheet={() => setActiveTab('student_evaluation')}
              onOpenPeriodicReportModal={() => setActiveTab('student_evaluation')}
            />
          </div>
        )}

        {/* ১১। ডিজিটাল লাইব্রেরী (পাঠ্যবই PDF, সিলেবাস, প্রশ্ন ব্যাংক, নোট, গাইড ও রেফারেন্স লিংক) */}
        {activeTab === 'library' && (
          <DigitalLibrary
            defaultClass={initialLibraryClass}
            onOpenAdminSyllabus={() => setActiveTab('admin_dashboard')}
          />
        )}

        {/* প্রিভিউ ও ২ পাতা A4 প্রিন্ট */}
        {activeTab === 'preview' && (
          <PrintableTwoPageForm
            formData={formData}
            onEdit={() => setActiveTab('registration')}
            onPrint={handlePrint}
            onLoadSample={handleLoadSample}
            isBlankMode={isBlankPrintMode}
            setIsBlankMode={setIsBlankPrintMode}
            autoDownloadBlank={autoDownloadBlank}
            onResetAutoDownload={() => setAutoDownloadBlank(false)}
          />
        )}

        {/* আইডি কার্ড */}
        {activeTab === 'idcard' && (
          <TeacherIdCard
            formData={formData}
            onEdit={() => setActiveTab('registration')}
            onPrint={handlePrint}
            onLoadSample={handleLoadSample}
          />
        )}

        {/* সংরক্ষিত শিক্ষক তালিকা */}
        {activeTab === 'list' && (
          <TeacherDirectory
            savedTeachers={savedTeachers}
            onSelectTeacher={handleSelectTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onAddNew={() => {
              setFormData(createEmptyTeacher());
              setActiveTab('registration');
            }}
            onImportBackup={handleImportBackup}
            onLoadSample={handleLoadSample}
            onSwitchToPreview={handleSwitchToPreview}
            onPrintBlank={handlePrintBlankForm}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-3.5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} <strong>ডি-লিকন মডেল একাডেমী</strong> — মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর।
          </span>
          <span className="text-slate-400">
            ডিজিটাল শিক্ষক সহায়িকা ও তথ্য সংস্করণ ৩.০
          </span>
        </div>
      </footer>
    </div>
  );
}
