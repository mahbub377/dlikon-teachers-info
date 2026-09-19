import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TeacherFormEditor } from './components/TeacherFormEditor';
import { PrintableTwoPageForm } from './components/PrintableTwoPageForm';
import { TeacherIdCard } from './components/TeacherIdCard';
import { TeacherDirectory } from './components/TeacherDirectory';
import { TeacherFormData, ActiveTab } from './types';
import { sampleTeacherData, createEmptyTeacher } from './data/sampleData';
import { fetchTeachersFromDb, saveTeacherToDb, deleteTeacherFromDb } from './services/teacherApi';
import { useAuth } from './context/AuthContext';

const STORAGE_KEY_CURRENT = 'dlma_current_form_v1';
const STORAGE_KEY_LIST = 'dlma_teachers_directory_v1';

export default function App() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  
  const [formData, setFormData] = useState<TeacherFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return sampleTeacherData;
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
      setActiveTab('form');
    }
  };

  // Direct print trigger
  const handlePrint = () => {
    if (activeTab !== 'preview' && activeTab !== 'idcard') {
      setActiveTab('preview');
      setTimeout(() => {
        window.print();
      }, 350);
    } else {
      window.print();
    }
  };

  // Select teacher from directory
  const handleSelectTeacher = (teacher: TeacherFormData) => {
    setFormData(teacher);
    setActiveTab('form');
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

    // Persist imported to Cloud SQL
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
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col selection:bg-teal-200 selection:text-teal-900">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadSample={handleLoadSample}
        onReset={handleResetForm}
        onSave={handleSaveTeacher}
        onPrint={handlePrint}
        savedCount={savedTeachers.length}
        isSavedNotification={isSavedNotification}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'form' && (
          <TeacherFormEditor
            formData={formData}
            setFormData={setFormData}
            onViewPreview={() => setActiveTab('preview')}
            onSave={handleSaveTeacher}
            onLoadSample={handleLoadSample}
          />
        )}

        {activeTab === 'preview' && (
          <PrintableTwoPageForm
            formData={formData}
            onEdit={() => setActiveTab('form')}
            onPrint={handlePrint}
            onLoadSample={handleLoadSample}
          />
        )}

        {activeTab === 'idcard' && (
          <TeacherIdCard
            formData={formData}
            onEdit={() => setActiveTab('form')}
            onPrint={handlePrint}
            onLoadSample={handleLoadSample}
          />
        )}

        {activeTab === 'list' && (
          <TeacherDirectory
            savedTeachers={savedTeachers}
            onSelectTeacher={handleSelectTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onAddNew={() => {
              setFormData(createEmptyTeacher());
              setActiveTab('form');
            }}
            onImportBackup={handleImportBackup}
            onLoadSample={handleLoadSample}
            onSwitchToPreview={handleSwitchToPreview}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} <strong>ডি-লিকন মডেল একাডেমী</strong> — সর্বস্বত্ব সংরক্ষিত।
          </span>
          <span className="text-slate-400">
            শিক্ষক তথ্য সংগ্রহ ও ডিজিটাল ফরম সংস্করণ ২.০
          </span>
        </div>
      </footer>
    </div>
  );
}
