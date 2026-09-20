import React from 'react';
import { 
  X,
  UserPlus, 
  Wrench, 
  CalendarDays, 
  UserX, 
  HelpCircle, 
  FileEdit, 
  BellRing, 
  Clock3,
  Home,
  FileCheck,
  IdCard,
  FolderOpen,
  ChevronRight,
  LogOut,
  LogIn
} from 'lucide-react';
import { ActiveTab } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  savedCount
}) => {
  const { currentUser, signInWithGoogle, signOut } = useAuth();

  const menuItems: {
    id: ActiveTab;
    label: string;
    subLabel: string;
    icon: React.ElementType;
    badge?: string | number;
    color: string;
  }[] = [
    {
      id: 'registration',
      label: '১। শিক্ষক নিবন্ধন',
      subLabel: 'ডিজিটাল শিক্ষক তথ্য ফরম ও বায়োডাটা',
      icon: UserPlus,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      id: 'teachers_tools',
      label: '২। টিচারস টুল',
      subLabel: 'দৈনিক শিক্ষক সহায়িকা ও ক্যালকুলেটর',
      icon: Wrench,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'session_plan',
      label: '৩। সেশন প্লান',
      subLabel: 'লেসন প্ল্যানার ও শিখনফল প্রস্তুতি',
      icon: CalendarDays,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'weak_students',
      label: '৪। আজকের দুর্বল শিক্ষার্থী',
      subLabel: 'পিছিয়ে পড়া শিক্ষার্থীদের বিশেষ যত্ন ও ট্র্যাকার',
      icon: UserX,
      color: 'text-rose-600 bg-rose-50',
      badge: 'অগ্রাধিকার',
    },
    {
      id: 'question_maker',
      label: '৫। প্রশ্ন মেকার',
      subLabel: 'সাময়িক ও চূড়ান্ত পরীক্ষার প্রশ্নপত্র তৈরি',
      icon: HelpCircle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'note_maker',
      label: '৬। নোট মেকার',
      subLabel: 'ক্লাস লেকচার ও বিশেষ শিক্ষক ডায়েরি',
      icon: FileEdit,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'notice_board',
      label: '৭। নোটিশ বোর্ড',
      subLabel: 'একাডেমির অভ্যন্তরীণ বিজ্ঞপ্তি ও নির্দেশনা',
      icon: BellRing,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'todays_class',
      label: '৮। আজকের ক্লাস',
      subLabel: 'দৈনিক রুটিন ও পিরিয়ডভিত্তিক পাঠ্যতালিকা',
      icon: Clock3,
      color: 'text-cyan-600 bg-cyan-50',
    },
  ];

  const secondaryItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'preview', label: 'ফরম প্রিন্ট ও প্রিভিউ (A4)', icon: FileCheck },
    { id: 'idcard', label: 'শিক্ষক আইডি কার্ড', icon: IdCard },
    { id: 'list', label: 'সংরক্ষিত শিক্ষক তালিকা', icon: FolderOpen, badge: savedCount },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        id="app-main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section with Emblem */}
        <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div 
            onClick={() => handleSelect('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="হোম পেজে যান"
          >
            <div className="w-11 h-11 rounded-full bg-white p-1 border-2 border-amber-400 flex items-center justify-center shadow-md">
              <SchoolLogo size={42} className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-wide text-amber-300 group-hover:text-amber-200 transition-colors">
                ডি-লিকন মডেল একাডেমী
              </h2>
              <p className="text-[10px] text-slate-400">ডিজিটাল শিক্ষক সহায়িকা ড্যাশবোর্ড</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Home Button */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => handleSelect('home')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-amber-600" />
              <span>হোম (অনুপ্রেরণামূলক সূচনা)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* 8 Primary Modules List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          <div className="px-3 py-1.5 text-[10.5px] font-bold tracking-wider uppercase text-slate-400">
            শিক্ষক কর্মসহায়ক মডিউলসমূহ
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 group ${
                  isCurrent
                    ? 'bg-teal-700 text-white shadow-md'
                    : 'hover:bg-slate-100/80 text-slate-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isCurrent ? 'bg-white/20 text-white' : item.color
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10.5px] truncate mt-0.5 ${isCurrent ? 'text-teal-100' : 'text-slate-500'}`}>
                    {item.subLabel}
                  </p>
                </div>
              </button>
            );
          })}

          <div className="pt-3 px-3 py-1.5 text-[10.5px] font-bold tracking-wider uppercase text-slate-400">
            প্রিন্ট ও শিক্ষক ডেটাবেজ
          </div>

          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-medium ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Account Status */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs">
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-7 h-7 rounded-full border border-teal-600 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center font-bold shrink-0">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="truncate">
                  <p className="font-semibold text-slate-800 text-[11px] truncate">
                    {currentUser.displayName || currentUser.email}
                  </p>
                  <p className="text-[10px] text-teal-700 font-medium">কানেক্টেড</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                title="লগ আউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-700" />
              গুগল দিয়ে সাইন ইন
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
