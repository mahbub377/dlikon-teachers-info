import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  UserX, 
  BookOpenCheck, 
  BookOpen,
  Flame, 
  Lightbulb, 
  Trophy, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  RightSidebarStudentIssue, 
  SessionPlanTopic, 
  ActivitySessionPlanItem, 
  InnovativeStudentPlanItem, 
  UpcomingCompetitionItem 
} from '../types/rightSidebarTypes';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAdmin?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose, onNavigateToAdmin }) => {
  // Navigation inside the Right Sidebar (5 modules)
  const [activeMenu, setActiveMenu] = useState<1 | 2 | 3 | 4 | 5>(1);

  // 2. সেশন প্লানের গতকালের আপডেটকৃত পাঠ শিরোনাম তালিকা (Source of topics for Module 1 dropdown)
  const [yesterdaySessionTopics, setYesterdaySessionTopics] = useState<SessionPlanTopic[]>([
    { id: 't1', className: '৫ম শ্রেণি', subject: 'গণিত', topicTitle: 'ভগ্নাংশের গুণ ও ভাগ (পৃষ্ঠা ৩৮-৪০)', updatedDate: 'গতকাল' },
    { id: 't2', className: '৫ম শ্রেণি', subject: 'ইংরেজি', topicTitle: 'Tense: Past Continuous Tense ব্যবহার', updatedDate: 'গতকাল' },
    { id: 't3', className: '৫ম শ্রেণি', subject: 'বিজ্ঞান', topicTitle: 'পদার্থের অবস্থা ও পরমাণুর গঠন', updatedDate: 'গতকাল' },
    { id: 't4', className: '৬ষ্ঠ শ্রেণি', subject: 'গণিত', topicTitle: 'বীজগণিতীয় রাশি ও সদৃশ পদ', updatedDate: 'গতকাল' },
    { id: 't5', className: '৬ষ্ঠ শ্রেণি', subject: 'ইংরেজি', topicTitle: 'Preposition of Time (at, on, in)', updatedDate: 'গতকাল' },
    { id: 't6', className: '৭ম শ্রেণি', subject: 'বিজ্ঞান', topicTitle: 'উদ্ভিদের সংবহন তন্ত্র ও সালোকসংশ্লেষণ', updatedDate: 'গতকাল' },
    { id: 't7', className: '৪র্থ শ্রেণি', subject: 'বাংলা', topicTitle: 'বীরপুরুষ কবিতা আবৃত্তি ও মূলভাব', updatedDate: 'গতকাল' },
  ]);

  // 1. শ্রেণি ও বিষয় ভিত্তিক শিক্ষার্থীর নাম ও যে পড়াটা পারেনি (Student Issues)
  const [studentIssues, setStudentIssues] = useState<RightSidebarStudentIssue[]>([
    {
      id: 'i1',
      className: '৫ম শ্রেণি',
      subject: 'গণিত',
      studentName: 'মোঃ তাসফিকুর রহমান',
      roll: '০৩',
      unlearnedTopic: 'ভগ্নাংশের গুণ ও ভাগ (পৃষ্ঠা ৩৮-৪০)',
      date: 'আজ',
      status: 'pending'
    },
    {
      id: 'i2',
      className: '৬ষ্ঠ শ্রেণি',
      subject: 'ইংরেজি',
      studentName: 'আরিফা আক্তার',
      roll: '০৮',
      unlearnedTopic: 'Preposition of Time (at, on, in)',
      date: 'আজ',
      status: 'pending'
    },
    {
      id: 'i3',
      className: '৫ম শ্রেণি',
      subject: 'বিজ্ঞান',
      studentName: 'মাহমুদুল হাসান',
      roll: '১২',
      unlearnedTopic: 'পদার্থের অবস্থা ও পরমাণুর গঠন',
      date: 'গতকাল',
      status: 'resolved'
    }
  ]);

  // Form State for Module 1 (Adding student issue)
  const [inputClass, setInputClass] = useState('৫ম শ্রেণি');
  const [inputSubject, setInputSubject] = useState('গণিত');
  const [inputStudentName, setInputStudentName] = useState('');
  const [inputRoll, setInputRoll] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // 3. একটিভিটি সেশন প্লান (Activity Session Plans)
  const [activityPlans, setActivityPlans] = useState<ActivitySessionPlanItem[]>([
    {
      id: 'a1',
      title: 'হাতের তৈরি সৌরজগত মডেল',
      className: '৫ম শ্রেণি',
      subject: 'বিজ্ঞান',
      activityType: 'ব্যবহারিক প্রজেক্ট',
      duration: '৩৫ মিনিট',
      materials: 'রং, ফোম বল, সুতা ও চার্ট পেপার',
      objective: 'গ্রহসমূহের দূরত্ব ও আবর্তন গতি শিক্ষার্থীদের প্রত্যক্ষভাবে শেখানো।'
    },
    {
      id: 'a2',
      title: 'মক মার্কেট ও কারেন্সি গণিত',
      className: '৪র্থ শ্রেণি',
      subject: 'গণিত',
      activityType: 'দলীয় কাজ',
      duration: '৪০ মিনিট',
      materials: 'নকল কাগজের টাকা, পণ্যমূল্য ট্যাগ',
      objective: 'দৈনন্দিন কেনাকাটায় যোগ, বিয়োগ ও লাভের বাস্তব হিসাব হাতে-কলমে শেখা।'
    },
    {
      id: 'a3',
      title: 'স্পোকেন ইংলিশ রোল-প্লে: ডাক্তারের কাছে রোগী',
      className: '৬ষ্ঠ শ্রেণি',
      subject: 'ইংরেজি',
      activityType: 'রোল প্লে',
      duration: '৩০ মিনিট',
      materials: 'ডায়ালগ স্ক্রিপ্ট শিট',
      objective: 'বাস্তব পরিস্থিতিতে সাবলীল ইংরেজি কথোপকথনের জড়তা কাটানো।'
    }
  ]);

  // 4. ইনোভেটিভ শিক্ষার্থী প্লান (Innovative Student Plans)
  const [innovativeStudents, setInnovativeStudents] = useState<InnovativeStudentPlanItem[]>([
    {
      id: 'inv1',
      studentName: 'সাদিয়া তাসনিম',
      className: '৭ম শ্রেণি',
      roll: '০১',
      talentDomain: 'বিজ্ঞান ও উদ্ভাবন',
      projectGoal: 'স্মার্ট সেচ প্রকল্প (অটোমেটিক মাটির আর্দ্রতা সেন্সর)',
      mentorTeacher: 'বিজ্ঞান শিক্ষক (জনাব আরিফ)',
      currentMilestone: 'সার্কিট ডিজাইন সমাপ্ত, মডেল তৈরির কাজ চলছে'
    },
    {
      id: 'inv2',
      studentName: 'নাঈম ইকবাল',
      className: '৬ষ্ঠ শ্রেণি',
      roll: '০৪',
      talentDomain: 'গণিত অলিম্পিয়াড',
      projectGoal: 'বাংলাদেশ ম্যাথ অলিম্পিয়াড (BDMO) প্রস্তুতি',
      mentorTeacher: 'গণিত শিক্ষক (জনাব মাহবুবুর রহমান)',
      currentMilestone: 'জ্যামিতির থিউরেম ও নম্বর থিওরির ৩০টি সমস্যা সমাধান'
    },
    {
      id: 'inv3',
      studentName: 'মাহিয়া রহমান',
      className: '৫ম শ্রেণি',
      roll: '০২',
      talentDomain: 'সাহিত্য ও বিতর্ক',
      projectGoal: 'উপজেলা ভিত্তিক সৃজনশীল গল্প লিখন ও উপস্থিত বক্তৃতা',
      mentorTeacher: 'বাংলা শিক্ষক (মিসেস সুরাইয়া)',
      currentMilestone: '৫টি গল্প রচনা ও সাপ্তাহিক বিতর্ক অনুশীলন'
    }
  ]);

  // 5. আগত প্রতিযোগীতার তথ্য (Upcoming Competitions)
  const [competitions, setCompetitions] = useState<UpcomingCompetitionItem[]>([
    {
      id: 'c1',
      competitionTitle: 'উপজেলা আন্তঃস্কুল বিজ্ঞান ও প্রযুক্তি মেলা ২০২৬',
      level: 'উপজেলা পর্যায়',
      eventDate: '১৫ অক্টোবর ২০২৬',
      venue: 'কাপাসিয়া সরকারি পাইলট উচ্চ বিদ্যালয় অডিটোরিয়াম',
      targetClasses: '৬ষ্ঠ - ৮ম শ্রেণি',
      responsibleTeacher: 'মোস্তাফিজুর রহমান (সিনিয়র সহকারী শিক্ষক)',
      preparedStudentsCount: 5
    },
    {
      id: 'c2',
      competitionTitle: 'জাতীয় শিক্ষা সপ্তাহ - হামদ, নাত ও কিরাত প্রতিযোগিতা',
      level: 'উপজেলা পর্যায়',
      eventDate: '২২ অক্টোবর ২০২৬',
      venue: 'উপজেলা পরিষদ মিলনায়তন, কাপাসিয়া',
      targetClasses: '৪র্থ - ৮ম শ্রেণি',
      responsibleTeacher: 'মাওলানা আব্দুল হাকিম',
      preparedStudentsCount: 4
    },
    {
      id: 'c3',
      competitionTitle: 'ডি-লিকন বার্ষিক বিতর্ক ও উপস্থিত বক্তৃতা উৎসব',
      level: 'একাডেমি অভ্যন্তরীণ',
      eventDate: '০৫ নভেম্বর ২০২৬',
      venue: 'ডি-লিকন মডেল একাডেমী ক্যাম্পাস মিলনায়তন',
      targetClasses: 'সকল শ্রেণি',
      responsibleTeacher: 'সাংস্কৃতিক সমন্বয়ক কমিটি',
      preparedStudentsCount: 18
    }
  ]);

  // Filter topics for Module 1 based on selected Class & Subject
  const availableTopics = yesterdaySessionTopics.filter(
    t => t.className === inputClass && t.subject === inputSubject
  );

  // Add new student issue
  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStudentName.trim() || !selectedTopic) {
      alert('অনুগ্রহ করে শিক্ষার্থীর নাম ও গতকালের সেশন প্লান থেকে পড়া নির্বাচন করুন।');
      return;
    }

    const newIssue: RightSidebarStudentIssue = {
      id: Date.now().toString(),
      className: inputClass,
      subject: inputSubject,
      studentName: inputStudentName.trim(),
      roll: inputRoll.trim() || '—',
      unlearnedTopic: selectedTopic,
      date: 'আজ',
      status: 'pending'
    };

    setStudentIssues([newIssue, ...studentIssues]);
    setInputStudentName('');
    setInputRoll('');
  };

  // Add new topic to yesterday's session plan
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicClass, setNewTopicClass] = useState('৫ম শ্রেণি');
  const [newTopicSub, setNewTopicSub] = useState('গণিত');

  const handleAddSessionTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    setYesterdaySessionTopics([
      ...yesterdaySessionTopics,
      {
        id: Date.now().toString(),
        className: newTopicClass,
        subject: newTopicSub,
        topicTitle: newTopicTitle.trim(),
        updatedDate: 'গতকাল'
      }
    ]);
    setNewTopicTitle('');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Right Drawer Panel */}
      <aside
        id="app-right-sidebar-panel"
        className={`fixed top-0 right-0 bottom-0 z-50 w-96 max-w-[92vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white flex items-center justify-between border-b border-amber-800/60 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">শিক্ষক ও শিক্ষার্থী অ্যাকশন হাব</h2>
              <p className="text-[11px] text-amber-100">দৈনিক পড়া ট্র্যাকার ও বিশেষ প্ল্যানার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Link to Admin Dashboard */}
        {onNavigateToAdmin && (
          <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              সিলেবাস বা এক্সেল শিক্ষার্থী আপলোড করতে চান?
            </span>
            <button
              onClick={() => {
                onClose();
                onNavigateToAdmin();
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              এডমিন ড্যাশবোর্ড খুলুন
            </button>
          </div>
        )}

        {/* 5 Tab Selector Buttons */}
        <div className="bg-amber-50/70 border-b border-amber-200/80 p-1.5 flex gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 1, label: '১. অপাঠ্য পড়া', icon: UserX, badge: studentIssues.filter(i => i.status === 'pending').length },
            { id: 2, label: '২. সেশন টপিক', icon: BookOpenCheck, badge: yesterdaySessionTopics.length },
            { id: 3, label: '৩. একটিভিটি', icon: Flame },
            { id: 4, label: '৪. ইনোভেটিভ', icon: Lightbulb },
            { id: 5, label: '৫. প্রতিযোগিতা', icon: Trophy, badge: competitions.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeMenu === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMenu(tab.id as 1 | 2 | 3 | 4 | 5)}
                className={`flex-1 shrink-0 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSel
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[9.5px] px-1 py-0.2 rounded-full font-bold ml-0.5 ${
                    isSel ? 'bg-amber-900 text-amber-100' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* ============================================================ */}
          {/* ১। শ্রেণি ও বিষয় ভিত্তিক শিক্ষার্থীর নাম ও কোন পড়াটা পারেনি */}
          {/* ============================================================ */}
          {activeMenu === 1 && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <UserX className="w-4 h-4 text-rose-700" />
                  আজকের অপারগ শিক্ষার্থীর পড়া ট্র্যাকার
                </div>
                গতকাল শিক্ষকদের দেওয়া সেশন প্লানের পাঠ শিরোনাম নির্বাচন করে শিক্ষার্থীর নাম ও রোল যুক্ত করুন।
              </div>

              {/* Form to log student who couldn't learn */}
              <form onSubmit={handleAddIssue} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="font-bold text-slate-800 text-[11.5px] flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  নতুন এন্ট্রি যুক্ত করুন
                </div>

                {/* Class & Subject Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-1">শ্রেণি</label>
                    <select
                      value={inputClass}
                      onChange={(e) => {
                        setInputClass(e.target.value);
                        setSelectedTopic('');
                      }}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="৪র্থ শ্রেণি">৪র্থ শ্রেণি</option>
                      <option value="৫ম শ্রেণি">৫ম শ্রেণি</option>
                      <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                      <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                      <option value="৮ম শ্রেণি">৮ম শ্রেণি</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-1">বিষয়</label>
                    <select
                      value={inputSubject}
                      onChange={(e) => {
                        setInputSubject(e.target.value);
                        setSelectedTopic('');
                      }}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="বাংলা">বাংলা</option>
                      <option value="গণিত">গণিত</option>
                      <option value="ইংরেজি">ইংরেজি</option>
                      <option value="বিজ্ঞান">বিজ্ঞান</option>
                      <option value="বাংলাদেশ ও বিশ্বপরিচয়">বাংলাদেশ ও বিশ্বপরিচয়</option>
                      <option value="ইসলাম ও নৈতিক শিক্ষা">ইসলাম শিক্ষা</option>
                    </select>
                  </div>
                </div>

                {/* Student Name & Roll */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-1">শিক্ষার্থীর নাম</label>
                    <input
                      type="text"
                      placeholder="নাম লিখুন"
                      value={inputStudentName}
                      onChange={(e) => setInputStudentName(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-1">রোল নং</label>
                    <input
                      type="text"
                      placeholder="রোল"
                      value={inputRoll}
                      onChange={(e) => setInputRoll(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* ২ নং ক্রমিক অনুযায়ী ড্রপডাউন: গতকাল শিক্ষকদের আপডেট দেওয়া সেশন প্লান থেকে */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10.5px] font-semibold text-slate-700">
                      কোন পড়াটা পারেনি? <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <span className="text-[9.5px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-medium">
                      গতকালকের সেশন প্লান
                    </span>
                  </div>

                  {availableTopics.length > 0 ? (
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
                      required
                    >
                      <option value="">-- পাঠ শিরোনাম নির্বাচন করুন --</option>
                      {availableTopics.map(t => (
                        <option key={t.id} value={t.topicTitle}>
                          {t.topicTitle}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 border border-dashed border-amber-300 bg-amber-50 rounded-lg text-[11px] text-amber-900 space-y-1">
                      <p>এই শ্রেণি ও বিষয়ের জন্য গতকালের কোনো সেশন প্লান পাওয়া যায়নি।</p>
                      <button
                        type="button"
                        onClick={() => setActiveMenu(2)}
                        className="text-amber-800 font-bold underline hover:text-amber-950 inline-flex items-center gap-1 cursor-pointer"
                      >
                        ২ নং ট্যাবে সেশন টপিক যুক্ত করুন <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!selectedTopic}
                  className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    selectedTopic
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  অপারগ তালিকায় সেভ করুন
                </button>
              </form>

              {/* List of tracked unlearned topics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-semibold">
                  <span>তালিকাকৃত শিক্ষার্থী ({studentIssues.length})</span>
                  <span className="text-[10px] text-amber-700">ক্লিক করে সমাধান সম্পন্ন করুন</span>
                </div>

                {studentIssues.map((issue) => {
                  const isDone = issue.status === 'resolved';
                  return (
                    <div
                      key={issue.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200 opacity-75'
                          : 'bg-white border-slate-200 shadow-2xs hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{issue.studentName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {issue.className} (রোল {issue.roll})
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-rose-700 mt-1 flex items-center gap-1">
                            <span className="text-slate-500">{issue.subject}:</span> {issue.unlearnedTopic}
                          </p>
                        </div>
                        <button
                          onClick={() => setStudentIssues(studentIssues.filter(i => i.id !== issue.id))}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
                        <span className="text-slate-400">{issue.date}</span>
                        <button
                          onClick={() => {
                            setStudentIssues(studentIssues.map(i => 
                              i.id === issue.id 
                                ? { ...i, status: i.status === 'resolved' ? 'pending' : 'resolved' } 
                                : i
                            ));
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors ${
                            isDone 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              পড়া সমাধান হয়েছে
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              আজকের ক্লাসে পুনরাবৃত্তি দরকার
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ২। আজকের পাঠ শিরোনাম (গতকাল শিক্ষকদের আপডেট দেয়া সেশন প্লান) */}
          {/* ============================================================ */}
          {activeMenu === 2 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <BookOpenCheck className="w-4 h-4 text-amber-700" />
                  গতকালকের আপডেটকৃত সেশন প্লানের পাঠ শিরোনাম
                </div>
                এখানে শিক্ষকদের প্রণীত গতকালের পাঠ শিরোনাম সংরক্ষিত থাকে, যা স্বয়ংক্রিয়ভাবে ১নং মডিউলের অপারগ পড়া নির্ধারণ ড্রপডাউনে যুক্ত হয়।
              </div>

              {/* Add New Session Topic Form */}
              <form onSubmit={handleAddSessionTopic} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800 text-[11.5px]">নতুন পাঠ শিরোনাম যুক্ত করুন</div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTopicClass}
                    onChange={(e) => setNewTopicClass(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="৪র্থ শ্রেণি">৪র্থ শ্রেণি</option>
                    <option value="৫ম শ্রেণি">৫ম শ্রেণি</option>
                    <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                  </select>
                  <select
                    value={newTopicSub}
                    onChange={(e) => setNewTopicSub(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="বাংলা">বাংলা</option>
                    <option value="গণিত">গণিত</option>
                    <option value="ইংরেজি">ইংরেজি</option>
                    <option value="বিজ্ঞান">বিজ্ঞান</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="পাঠ শিরোনাম লিখুন (যেমন: ল.সা.গু সমাধান)"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                >
                  পাঠ শিরোনাম সেভ করুন
                </button>
              </form>

              {/* List of Yesterday's Topics */}
              <div className="space-y-2">
                {yesterdaySessionTopics.map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-amber-400">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          {item.className}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          {item.subject}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.updatedDate}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{item.topicTitle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ৩। একটিভিটি সেশন প্লান */}
          {/* ============================================================ */}
          {activeMenu === 3 && (
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-xs text-indigo-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Flame className="w-4 h-4 text-indigo-700" />
                  ইন্টারেক্টিভ একটিভিটি সেশন প্লান
                </div>
                পাঠদানকে আনন্দদায়ক ও শিক্ষার্থীদের সক্রিয় রাখতে ব্যবহারিক ও রোল-প্লে পরিকল্পনা।
              </div>

              {activityPlans.map((act) => (
                <div key={act.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {act.activityType}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">সময়: {act.duration}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{act.title}</h4>
                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-700">উপকরণ:</strong> {act.materials}
                  </p>
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    🎯 {act.objective}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ============================================================ */}
          {/* ৪। ইনোভেটিভ শিক্ষার্থী প্লান */}
          {/* ============================================================ */}
          {activeMenu === 4 && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                  উদ্ভাবনী শিক্ষার্থী গ্রুমিং প্লান
                </div>
                বিজ্ঞান, গণিত অলিম্পিয়াড ও সাহিত্যে প্রতিভাবান শিক্ষার্থীদের জন্য বিশেষ মেন্টরিং ট্র্যাক।
              </div>

              {innovativeStudents.map((inv) => (
                <div key={inv.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{inv.studentName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {inv.talentDomain}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <p className="font-medium text-slate-800">{inv.projectGoal}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">মেন্টর: {inv.mentorTeacher}</p>
                  </div>
                  <div className="bg-emerald-50/70 p-2 rounded-lg text-[10.5px] text-emerald-900 flex items-start gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>অগ্রগতি:</strong> {inv.currentMilestone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============================================================ */}
          {/* ৫। আগত প্রতিযোগীতার তথ্য */}
          {/* ============================================================ */}
          {activeMenu === 5 && (
            <div className="space-y-3">
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-xs text-purple-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Trophy className="w-4 h-4 text-purple-700" />
                  আগত আন্তঃবিদ্যালয় ও জাতীয় প্রতিযোগিতা
                </div>
                আসন্ন প্রতিযোগিতা সমূহের প্রস্তুতি, ভেন্যু ও দায়িত্বপ্রাপ্ত শিক্ষক তালিকা।
              </div>

              {competitions.map((comp) => (
                <div key={comp.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {comp.level}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {comp.eventDate}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{comp.competitionTitle}</h4>
                  <p className="text-[11px] text-slate-600">
                    📍 <strong>ভেন্যু:</strong> {comp.venue}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10.5px] text-slate-500 border-t border-slate-100">
                    <span>প্রস্তুত শিক্ষার্থী: <strong className="text-purple-700">{comp.preparedStudentsCount} জন</strong></span>
                    <span className="truncate max-w-[130px] text-right" title={comp.responsibleTeacher}>
                      দায়িত্বে: {comp.responsibleTeacher.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10.5px] text-slate-500 text-center">
          ডি-লিকন মডেল একাডেমী • ডিজিটাল একাডেমি মনিটরিং
        </div>
      </aside>
    </>
  );
};
