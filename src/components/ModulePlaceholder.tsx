import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  HelpCircle,
  FileText,
  Bell,
  Clock,
  Wrench,
  Sparkles,
  Printer
} from 'lucide-react';
import { ActiveTab } from '../types';
import { WeakStudentsTracker } from './WeakStudentsTracker';

interface ModulePlaceholderProps {
  module: ActiveTab;
  title: string;
  onNavigateToAdmin?: () => void;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  module,
  title,
  onNavigateToAdmin
}) => {
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  // 2. Question Maker state
  const [examName, setExamName] = useState('১ম সাময়িক মূল্যায়ন পরীক্ষা - ২০২৬');
  const [examClass, setExamClass] = useState('৫ম শ্রেণি');
  const [examSubject, setExamSubject] = useState('প্রাথমিক গণিত');
  const [totalMarks, setTotalMarks] = useState('৫০');
  const [examTime, setExamTime] = useState('১ ঘণ্টা ৩০ মিনিট');
  const [questions, setQuestions] = useState<string[]>([
    '১। সংক্ষেপে উত্তর দাও: (ক) মৌলিক সংখ্যা কাকে বলে? (খ) ল.সা.গু ও গ.সা.গু এর পূর্ণরূপ লিখ।',
    '২। একটি বিদ্যালয়ে ৫০০ জন শিক্ষার্থী আছে। তাদের মধ্যে ৪০% ছাত্রী। ছাত্রের সংখ্যা কত?',
    '৩। একটি আয়তাকার বাগানের দৈর্ঘ্য ২৫ মিটার ও প্রস্থ ১৫ মিটার। বাগানটির ক্ষেত্রফল নির্ণয় কর।',
  ]);
  const [newQText, setNewQText] = useState('');

  // 3. Notice Board state
  const [notices] = useState([
    { id: '1', title: 'আসন্ন সাময়িক পরীক্ষার লেসন প্ল্যান জমার নির্দেশ', date: '২০ সেপ্টেম্বর ২০২৬', priority: 'জরুরী', text: 'সকল সম্মানিত শিক্ষক-শিক্ষিকাকে আগামী মঙ্গলবারের মধ্যে নিজ নিজ শ্রেণির সাপ্তাহিক লেসন প্ল্যান প্রধান শিক্ষকের নিকট জমা দেওয়ার অনুরোধ করা হলো।' },
    { id: '2', title: 'ডিজিটাল হাজিরা ও বায়োমেট্রিক আপডেট', date: '১৮ সেপ্টেম্বর ২০২৬', priority: 'সাধারণ', text: 'প্রতিদিন সকাল ৮:৪৫ মিনিটের মধ্যে সকল শিক্ষককে ডিজিটাল ডিভাইসে উপস্থিতি নিশ্চিত করতে বলা হলো।' },
  ]);

  // 4. Session Plan state
  const [plans] = useState([
    { id: '1', period: '১ম পিরিয়ড (৯:০০-৯:৪৫)', subject: 'বাংলা', className: '৬ষ্ঠ শ্রেণি', topic: 'কবিতা: মানুষ জাতি', method: 'দলীয় আলোচনা ও আবৃত্তি', aids: 'চার্ট পেপার ও প্রজেক্টর' },
    { id: '2', period: '২য় পিরিয়ড (৯:৪৫-১০:৩০)', subject: 'ইংরেজি', className: '৭ম শ্রেণি', topic: 'Grammar: Parts of Speech', method: 'বোর্ড ওয়ার্ক ও কুইজ', aids: 'ফ্ল্যাশ কার্ড' },
    { id: '3', period: '৩য় পিরিয়ড (১০:৩০-১১:১৫)', subject: 'গণিত', className: '৫ম শ্রেণি', topic: 'অধ্যায় ৫: গুণনীয়ক ও গুণিতক', method: 'বাস্তব উপকরণ দিয়ে অনুশীলন', aids: 'মার্বেল ও ব্লক' },
  ]);

  // Render content according to module
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header bar of module */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {module === 'weak_students' && <Users className="w-6 h-6 text-rose-600" />}
            {module === 'session_plan' && <CalendarCheck className="w-6 h-6 text-teal-600" />}
            {module === 'question_maker' && <HelpCircle className="w-6 h-6 text-indigo-600" />}
            {module === 'note_maker' && <FileText className="w-6 h-6 text-amber-600" />}
            {module === 'notice_board' && <Bell className="w-6 h-6 text-purple-600" />}
            {module === 'todays_class' && <Clock className="w-6 h-6 text-emerald-600" />}
            {module === 'teachers_tools' && <Wrench className="w-6 h-6 text-blue-600" />}
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">ডি-লিকন মডেল একাডেমী • ডিজিটাল শিক্ষক কর্মসহায়ক মডিউল</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          প্রিন্ট করুন
        </button>
      </div>

      {/* 1. আজকের দুর্বল শিক্ষার্থী (Smart Class + Roll Dropdown Weak Students Tracker) */}
      {module === 'weak_students' && (
        <div className="space-y-5">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800">
            <strong>বিশেষ নির্দেশিকা:</strong> শ্রেণি ও রোল নির্বাচন করে পড়া বুঝতে পিছিয়ে পড়া শিক্ষার্থীদের দ্রুত তালিকাভুক্ত করুন এবং পরবর্তী ক্লাসে অতিরিক্ত ৫-১০ মিনিট ব্যক্তিগত যত্ন প্রদান করুন।
          </div>
          <WeakStudentsTracker onOpenBulkUpload={onNavigateToAdmin} />
        </div>
      )}

      {/* 2. প্রশ্ন মেকার (Question Maker Module) */}
      {module === 'question_maker' && (
        <div className="space-y-6">
          <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-slate-800">পরীক্ষার তথ্য ও হেডার নির্ধারণ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="পরীক্ষার নাম"
                className="text-xs px-3 py-2 border border-slate-300 rounded-lg sm:col-span-2"
              />
              <input
                type="text"
                value={examClass}
                onChange={(e) => setExamClass(e.target.value)}
                placeholder="শ্রেণি"
                className="text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={examSubject}
                onChange={(e) => setExamSubject(e.target.value)}
                placeholder="বিষয়"
                className="text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                placeholder="সময়"
                className="text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="পূর্ণমান"
                className="text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="নতুন প্রশ্ন লিখুন (যেমন: ৪। সংক্ষিপ্ত উত্তর দাও...)"
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  if (newQText.trim()) {
                    setQuestions([...questions, newQText.trim()]);
                    setNewQText('');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg cursor-pointer"
              >
                প্রশ্ন যোগ করুন
              </button>
            </div>
          </div>

          {/* Printable Question Paper Format */}
          <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-md max-w-3xl mx-auto font-serif">
            <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
              <h1 className="text-xl font-black tracking-wide text-slate-900">ডি-লিকন মডেল একাডেমী</h1>
              <p className="text-xs font-sans text-slate-600">মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর • স্থাপিত: ২০১৮ইং</p>
              <h2 className="text-base font-bold text-slate-800 mt-1">{examName}</h2>
              <div className="flex justify-between items-center text-xs font-sans font-semibold text-slate-700 mt-2 px-2">
                <span>শ্রেণি: {examClass}</span>
                <span>বিষয়: {examSubject}</span>
                <span>সময়: {examTime}</span>
                <span>পূর্ণমান: {totalMarks}</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-900 leading-relaxed min-h-[300px]">
              {questions.map((q, idx) => (
                <div key={idx} className="flex justify-between items-start group">
                  <span className="flex-1">{q}</span>
                  <button
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    className="no-print opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 ml-2 cursor-pointer text-xs"
                  >
                    মুছুন
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center text-xs text-slate-400 font-sans border-t border-slate-200 pt-2">
              (প্রশ্নপত্র সমাপ্ত)
            </div>
          </div>
        </div>
      )}

      {/* 3. সেশন প্লান (Session Plan Module) */}
      {module === 'session_plan' && (
        <div className="space-y-6">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-teal-800">
            <strong>শিক্ষক লেসন ও সেশন প্ল্যানার:</strong> প্রতিদিনের ক্লাস শুরু করার পূর্বে শিখনফল, ব্যবহৃত পদ্ধতি এবং শিখন উপকরণের পূর্ব প্রস্তুতি নিশ্চিত করুন।
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-teal-800 text-white font-semibold">
                <tr>
                  <th className="p-3">পিরিয়ড ও সময়</th>
                  <th className="p-3">শ্রেণি ও বিষয়</th>
                  <th className="p-3">পাঠের শিরোনাম ও শিখনফল</th>
                  <th className="p-3">পাঠদান কৌশল ও পদ্ধতি</th>
                  <th className="p-3">সহায়ক উপকরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{p.period}</td>
                    <td className="p-3">{p.className} - <span className="font-medium text-teal-700">{p.subject}</span></td>
                    <td className="p-3 font-medium text-slate-800">{p.topic}</td>
                    <td className="p-3 text-slate-600">{p.method}</td>
                    <td className="p-3 text-slate-600">{p.aids}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. নোটিশ বোর্ড (Notice Board Module) */}
      {module === 'notice_board' && (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className="bg-white p-5 rounded-xl border-l-4 border-l-purple-600 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${n.priority === 'জরুরী' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'}`}>
                    {n.priority}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">{n.title}</h3>
                </div>
                <span className="text-xs text-slate-400">{n.date}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{n.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* 5. টিচারস টুল / নোট মেকার / আজকের ক্লাস (General Tools) */}
      {(module === 'teachers_tools' || module === 'note_maker' || module === 'todays_class') && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">ডিজিটাল শিক্ষক সহায়িকা</h3>
              <p className="text-xs text-slate-500">আপনার প্রয়োজনীয় দৈনিক ক্লাস রুটিন, গুরুত্বপূর্ণ নোট ও শিক্ষক ডায়েরি সংরক্ষণ করুন।</p>
            </div>
          </div>
          <textarea
            rows={8}
            placeholder="আজকের ক্লাসের বিশেষ নোট, নির্দেশনা অথবা পাঠ্যক্রম এখানে টাইপ করে রাখুন..."
            className="w-full text-xs p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
            defaultValue="১। ৫ম শ্রেণির গণিত ক্লাসে ল.সা.গু সমাধান করানো হয়েছে।&#10;২। ৬ষ্ঠ শ্রেণির ইংরেজি ক্লাসে আগামীকাল ৩টি ভোকাবুলারি কুইজ নেওয়া হবে।&#10;৩। দুর্বল শিক্ষার্থীদের জন্য আগামী বৃহস্পতিবার বিশেষ রিভিশন ক্লাস অনুষ্ঠিত হবে।"
          />
          <div className="flex items-center justify-end gap-3">
            {noteSavedToast && (
              <span className="text-xs font-semibold text-emerald-700">
                নোটটি সফলভাবে সংরক্ষিত হয়েছে!
              </span>
            )}
            <button
              onClick={() => {
                setNoteSavedToast(true);
                setTimeout(() => setNoteSavedToast(false), 3000);
              }}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              নোট সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
