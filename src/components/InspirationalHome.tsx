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
  CalendarCheck
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { ActiveTab } from '../types';

interface InspirationalHomeProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const InspirationalHome: React.FC<InspirationalHomeProps> = ({ onNavigate }) => {
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
          <button
            id="home-btn-register"
            onClick={() => onNavigate('registration')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <GraduationCap className="w-4 h-4" />
            শিক্ষক নিবন্ধন ফরম
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="home-btn-session"
            onClick={() => onNavigate('session_plan')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-200 border border-amber-400/30 font-medium text-sm transition-all cursor-pointer hover:border-amber-400/60"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            সেশন প্ল্যান ও ক্লাস
          </button>

          <button
            id="home-btn-weak-students"
            onClick={() => onNavigate('weak_students')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-200 border border-amber-400/30 font-medium text-sm transition-all cursor-pointer hover:border-amber-400/60"
          >
            <Users className="w-4 h-4 text-amber-400" />
            আজকের দুর্বল শিক্ষার্থী
          </button>
        </div>
      </div>

      {/* Bottom Subtle Bar */}
      <div className="relative z-10 border-t border-slate-800/80 bg-slate-950/60 py-3 text-center text-xs text-slate-400">
        মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর • স্থাপিত: ২০১৮ইং
      </div>
    </div>
  );
};
