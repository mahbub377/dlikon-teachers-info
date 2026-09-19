import React from 'react';
import { 
  FileText, 
  Printer, 
  Users, 
  IdCard, 
  Sparkles, 
  Save, 
  RotateCcw,
  CheckCircle2,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLoadSample: () => void;
  onReset: () => void;
  onSave: () => void;
  onPrint: () => void;
  savedCount: number;
  isSavedNotification?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLoadSample,
  onReset,
  onSave,
  onPrint,
  savedCount,
  isSavedNotification = false
}) => {
  const { currentUser, signInWithGoogle, signOut, loading } = useAuth();

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Academy Title */}
          <div className="flex items-center gap-3.5">
            <SchoolLogo size={46} className="shrink-0 drop-shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-teal-900 leading-tight">
                  ডি-লিকন মডেল একাডেমী
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                  শিক্ষক তথ্য ফরম
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                ডিজিটাল শিক্ষক তথ্য সংগ্রহ, ২-পাতা A4 প্রিন্ট ও ডাটাবেজ সিস্টেম
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-load-sample"
              onClick={onLoadSample}
              title="পরীক্ষা করার জন্য নমুনা তথ্য লোড করুন"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              নমুনা তথ্য
            </button>

            <button
              id="btn-reset-form"
              onClick={onReset}
              title="নতুন ফাঁকা ফরম চালু করুন"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              নতুন ফরম
            </button>

            <button
              id="btn-save-teacher"
              onClick={onSave}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer shadow-xs ${
                isSavedNotification
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              {isSavedNotification ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  সংরক্ষিত!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  সংরক্ষণ
                </>
              )}
            </button>

            <button
              id="btn-print-action"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              প্রিন্ট (A4)
            </button>

            {/* Google Sign In / User Status */}
            {!loading && (
              currentUser ? (
                <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="w-7 h-7 rounded-full border border-teal-600 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                      {currentUser.displayName ? currentUser.displayName.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  <button
                    id="btn-sign-out"
                    onClick={() => signOut()}
                    title="লগ আউট করুন"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-google-sign-in"
                  onClick={() => signInWithGoogle()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="গুগল দিয়ে সাইন ইন করুন"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-700" />
                  <span className="hidden sm:inline">সাইন ইন</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Navigation Bar Tabs */}
        <div className="flex items-center justify-between border-t border-slate-100 py-1 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              id="nav-tab-form"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              ১. তথ্য পূরণ ফরম
            </button>

            <button
              id="nav-tab-preview"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Printer className="w-4 h-4 text-teal-600" />
              ২. দুই পাতা A4 প্রিভিউ
            </button>

            <button
              id="nav-tab-idcard"
              onClick={() => setActiveTab('idcard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'idcard'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <IdCard className="w-4 h-4 text-teal-600" />
              ৩. শিক্ষক আইডি কার্ড
            </button>

            <button
              id="nav-tab-list"
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-teal-600" />
              ৪. সংরক্ষিত তালিকা
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-teal-200 text-teal-900">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          <div className="hidden sm:flex items-center text-xs text-slate-500 gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            ২ পাতা ফর্ম্যাট প্রস্তুত
          </div>
        </div>
      </div>
    </header>
  );
};
