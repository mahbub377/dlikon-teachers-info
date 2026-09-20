import React from 'react';
import { 
  Menu,
  MoreVertical,
  Sparkles, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Printer,
  Home,
  UserPlus,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onToggleSidebar: () => void;
  onToggleRightSidebar: () => void;
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
  onToggleSidebar,
  onToggleRightSidebar,
  onLoadSample,
  onReset,
  onSave,
  onPrint,
  isSavedNotification = false
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: 3-Line Menu Button + School Brand */}
          <div className="flex items-center gap-3">
            {/* 3-line hamburger menu button */}
            <button
              id="btn-sidebar-toggle"
              onClick={onToggleSidebar}
              className="p-2 -ml-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all cursor-pointer focus:ring-2 focus:ring-amber-500"
              title="বামপাশের মেনু বার খুলুন"
              aria-label="Toggle Left Sidebar Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800" />
            </button>

            <div 
              onClick={() => setActiveTab('home')} 
              className="flex items-center gap-3 cursor-pointer select-none group"
              title="হোম পেজে যান"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-white border border-amber-300 shadow-xs flex items-center justify-center">
                <SchoolLogo size={40} className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-tight group-hover:text-amber-700 transition-colors">
                    ডি-লিকন মডেল একাডেমী
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    ডিজিটাল শিক্ষক পোর্টাল
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-500 font-normal">
                  সনমানিয়া, কাপাসিয়া, গাজীপুর • স্থাপিত: ২০১৮ইং
                </p>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="btn-home-nav"
              onClick={() => setActiveTab('home')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
              title="হোম পেজে যান"
            >
              <Home className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden md:inline">হোম</span>
            </button>

            {/* DIRECT ACCESS: এডমিন ড্যাশবোর্ড (সিলেবাস ও এক্সেল) */}
            <button
              id="btn-admin-dashboard"
              onClick={() => setActiveTab('admin_dashboard')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs border ${
                activeTab === 'admin_dashboard'
                  ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-400'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title="সিলেবাস আপডেট ও শিক্ষার্থী এক্সেল আপলোড ড্যাশবোর্ড"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>এডমিন ড্যাশবোর্ড (সিলেবাস)</span>
            </button>

            {activeTab === 'registration' && (
              <>
                <button
                  id="btn-load-sample"
                  onClick={onLoadSample}
                  title="নমুনা তথ্য লোড করুন"
                  className="hidden lg:inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  নমুনা
                </button>

                <button
                  id="btn-reset-form"
                  onClick={onReset}
                  title="নতুন ফাঁকা ফরম চালু করুন"
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  নতুন
                </button>

                <button
                  id="btn-save-teacher"
                  onClick={onSave}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer shadow-xs ${
                    isSavedNotification
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {isSavedNotification ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                      সংরক্ষিত!
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      সংরক্ষণ
                    </>
                  )}
                </button>
              </>
            )}

            {activeTab !== 'registration' && activeTab !== 'home' && (
              <button
                onClick={() => setActiveTab('registration')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-teal-200" />
                শিক্ষক নিবন্ধন
              </button>
            )}

            <button
              id="btn-print-action"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              title="প্রিন্ট প্রিভিউ দেখুন"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              প্রিন্ট
            </button>

            {/* Right 3-Dot Button for the Action Sidebar */}
            <button
              id="btn-right-sidebar-toggle"
              onClick={onToggleRightSidebar}
              className="p-2 ml-1 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1"
              title="ডানপাশের অপশন বার (অপাঠ্য পড়া, সেশন প্লান, প্রতিযোগিতা) খুলুন"
              aria-label="Toggle Right Action Sidebar"
            >
              <MoreVertical className="w-5 h-5 text-amber-900" />
              <span className="hidden xl:inline text-xs font-bold text-amber-950">অ্যাকশন হাব</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
