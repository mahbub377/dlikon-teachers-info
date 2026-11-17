import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Lightbulb, 
  Compass, 
  ArrowRight,
  Target,
  Award,
  Users,
  CalendarCheck,
  ShieldAlert,
  Printer,
  FileText,
  Download
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { ActiveTab } from '../types';

interface InspirationalHomeProps {
  onNavigate: (tab: ActiveTab) => void;
  onPrintBlank?: () => void;
}

export const InspirationalHome: React.FC<InspirationalHomeProps> = ({ onNavigate, onPrintBlank }) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white overflow-hidden flex flex-col justify-between">
      {/* Background Radiating Aura & Light Beams from Logo */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-amber-400/20 via-yellow-300/30 to-orange-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[950px] bg-radial from-amber-500/10 via-yellow-400/5 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-amber-300 rounded-full animate-ping opacity-75" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-60" />
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-orange-300 rounded-full animate-pulse opacity-80" />
        <div className="absolute top-1/2 right-1/6 w-2 h-2 bg-amber-200 rounded-full animate-ping opacity-60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
        {/* Emblem with radiating pulsing yellow rays */}
        <div className="relative mb-6 sm:mb-8 group">
          {/* Animated concentric glowing rings */}
          <div className="absolute -inset-6 rounded-full border-2 border-amber-400/30 animate-[spin_24s_linear_infinite]" />
          <div className="absolute -inset-10 rounded-full border border-yellow-300/20 animate-[spin_36s_linear_infinite_reverse]" />
          <div className="absolute -inset-14 rounded-full border border-dashed border-amber-500/20 animate-[spin_48s_linear_infinite]" />

          <div className="relative bg-white p-3 sm:p-4 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.55)] border-4 border-amber-300 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
            <SchoolLogo size={160} glow={true} className="w-36 h-36 sm:w-44 sm:h-44" />
          </div>
        </div>

        {/* Institution Title */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-medium tracking-wide mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          ডি-লিকন মডেল একাডেমী • ডিজিটাল শিক্ষক পোর্টাল
        </div>

        {/* Main Inspirational Quote */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-400 tracking-tight leading-snug sm:leading-tight mb-4 max-w-3xl">
          “জ্ঞানের আলোয় উদ্ভাসিত হোক প্রতিটি শ্রেণিকক্ষ, আপনিই আগামী দিনের রূপকার।”
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mb-8">
          ডি-লিকন মডেল একাডেমীর প্রতিটি শিক্ষার্থীকে সুনাগরিক, আদর্শবান ও ভবিষ্যৎ প্রজন্মের যোগ্য নেতা হিসেবে গড়ে তুলতে একজন ডিজিটাল শিক্ষকের প্রজ্ঞা, নিষ্ঠা ও আধুনিক দিকনির্দেশনা এক সোনালী আলোর দিশারী।
        </p>

        {/* Motivational Pillars (3 cards illuminated by golden glow) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-10 text-left">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-amber-500/20 backdrop-blur-md hover:border-amber-400/50 transition-all hover:-translate-y-1">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base mb-1">স্মার্ট পাঠদান কৌশল</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              সৃজনশীল পদ্ধতিতে পাঠদান পরিচালনা ও দুর্বল শিক্ষার্থীদের বিশেষ যত্নে এগিয়ে নেওয়ার ডিজিটাল সংকল্প।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-amber-500/20 backdrop-blur-md hover:border-amber-400/50 transition-all hover:-translate-y-1">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/20 text-yellow-300 flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base mb-1">পরিকল্পিত সেশন ও প্রশ্ন</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              দৈনন্দিন লেসন প্ল্যান ও স্বয়ংক্রিয় প্রশ্নপত্র তৈরির মাধ্যমে শিক্ষাদানের মান সর্বোচ্চ পর্যায়ে বজায় রাখা।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-amber-500/20 backdrop-blur-md hover:border-amber-400/50 transition-all hover:-translate-y-1">
            <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-300 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base mb-1">নৈতিক ও আধুনিক শিক্ষা</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              শুধু পাঠ্যবই নয়, নৈতিক মূল্যবোধ ও ডিজিটাল উৎকর্ষতার সমন্বয়ে আদর্শ শিক্ষক হয়ে ওঠা।
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {onPrintBlank && (
            <button
              id="home-btn-print-blank"
              onClick={onPrintBlank}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 border-amber-300"
              title="শিক্ষকদের জন্য ২ পাতার ব্ল্যাঙ্ক ফরম সরাসরি PDF ডাউনলোড ও প্রিন্ট করুন"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>ব্ল্যাঙ্ক শিক্ষক ফরম (PDF ডাউনলোড ও প্রিন্ট)</span>
            </button>
          )}

          <button
            id="home-btn-admin-dashboard"
            onClick={() => onNavigate('admin_dashboard')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 border border-amber-300"
          >
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            এডমিন ড্যাশবোর্ড (সিলেবাস)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="home-btn-register"
            onClick={() => onNavigate('registration')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold text-sm transition-all cursor-pointer shadow-md"
          >
            <GraduationCap className="w-4 h-4" />
            শিক্ষক নিবন্ধন ও ডাটা এন্ট্রি
          </button>

          <button
            id="home-btn-session"
            onClick={() => onNavigate('session_plan')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-200 border border-amber-400/30 font-medium text-sm transition-all cursor-pointer hover:border-amber-400/60"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            সেশন প্ল্যান
          </button>

          <button
            id="home-btn-library"
            onClick={() => onNavigate('library')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white border border-indigo-400/40 font-semibold text-sm transition-all cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            ডিজিটাল লাইব্রেরী (বই ও প্রশ্ন ব্যাংক)
          </button>

          <button
            id="home-btn-weak-students"
            onClick={() => onNavigate('weak_students')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-200 border border-amber-400/30 font-medium text-sm transition-all cursor-pointer hover:border-amber-400/60"
          >
            <Users className="w-4 h-4 text-amber-400" />
            দুর্বল শিক্ষার্থী
          </button>
        </div>

        {/* 3-Step Teacher Info Collection Workflow */}
        <div className="w-full max-w-4xl mt-8 p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md text-left shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">শিক্ষক তথ্য সংগ্রহের ৩-ধাপের সহজ অফিশিয়াল পদ্ধতি:</span>
            </div>
            <span className="text-[11px] text-slate-400">অফিস ও ডাটা এন্ট্রি সহায়িকা</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[11px] font-mono">১</span>
                ব্ল্যাঙ্ক ফরম প্রিন্ট
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                &quot;ব্ল্যাঙ্ক শিক্ষক ফরম প্রিন্ট&quot; বাটনে চাপ দিয়ে ২ পাতার ফাঁকা ফরম প্রিন্ট করে শিক্ষকদের মাঝে বিতরণ করুন।
              </p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <div className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[11px] font-mono">২</span>
                শিক্ষক কর্তৃক পূরণ ও জমা
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                শিক্ষকগণ স্বহস্তে তথ্য পূরণ করে পাসপোর্ট সাইজ ছবি ও প্রয়োজনীয় সনদসহ একাডেমি অফিসে জমা দেবেন।
              </p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px] font-mono">৩</span>
                ডাটা এন্ট্রি ও স্থায়ী সংরক্ষণ
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                জমাকৃত ফরম দেখে ডাটা এন্ট্রি অপারেটর &quot;শিক্ষক নিবন্ধন&quot; পোর্টালে টাইপ করে &quot;সংরক্ষণ&quot; বাটনে ক্লিক করবেন।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Subtle Bar */}
      <div className="relative z-10 border-t border-slate-800/80 bg-slate-950/60 py-3 text-center text-xs text-slate-400">
        মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর • স্থাপিত: ২০১৮ইং
      </div>
    </div>
  );
};
