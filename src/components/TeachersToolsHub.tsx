import React, { useState, useEffect } from 'react';
import { HelpCircle, FileText, MonitorPlay, BookOpen } from 'lucide-react';
import { QuestionMakerPanel } from './teachers-tools/QuestionMakerPanel';
import { NoteCreatorPanel } from './teachers-tools/NoteCreatorPanel';
import { PresentationCreatorPanel } from './teachers-tools/PresentationCreatorPanel';
import { SyllabusMakerPanel } from './teachers-tools/SyllabusMakerPanel';

export type TeacherToolTab = 'question' | 'notes' | 'presentation' | 'syllabus';

interface TeachersToolsHubProps {
  initialTool?: TeacherToolTab;
}

const TOOL_TABS: {
  id: TeacherToolTab;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'question',
    label: 'প্রশ্ন মেকার',
    description: 'বহুনির্বাচনী, সংক্ষিপ্ত, সৃজনশীল ও শূন্যস্থান প্রশ্নপত্র তৈরি ও প্রিন্ট',
    icon: HelpCircle
  },
  {
    id: 'notes',
    label: 'নোট ক্রিয়েটর',
    description: 'পাঠের সারসংক্ষেপ, মূল পয়েন্ট, উদাহরণ ও বাড়ির কাজের নোট',
    icon: FileText
  },
  {
    id: 'presentation',
    label: 'ক্লাস প্রেজেন্টেশন ক্রিয়েটর',
    description: 'শ্রেণিকক্ষ স্লাইড ডেক, ফুলস্ক্রিন প্রজেক্টর ও হ্যান্ডআউট',
    icon: MonitorPlay
  },
  {
    id: 'syllabus',
    label: 'সিলেবাস মেকার',
    description: 'বিষয়ভিত্তিক অধ্যায় বণ্টন ও সাময়িক পরীক্ষার সিলেবাস তৈরি',
    icon: BookOpen
  }
];

export const TeachersToolsHub: React.FC<TeachersToolsHubProps> = ({ initialTool = 'question' }) => {
  const [activeTool, setActiveTool] = useState<TeacherToolTab>(initialTool);

  useEffect(() => {
    setActiveTool(initialTool);
  }, [initialTool]);

  const currentMeta = TOOL_TABS.find((t) => t.id === activeTool) || TOOL_TABS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Studio Header + Segmented Navigation */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              টিচারস টুল ও শ্রেণিকক্ষ প্রস্তুতি স্টুডিও
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ডি-লিকন মডেল একাডেমী · {currentMeta.description}
            </p>
          </div>

          {/* 4-Tool Segmented Bar */}
          <nav
            aria-label="টিচারস টুল নির্বাচন"
            className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit"
          >
            {TOOL_TABS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  id={`btn-tt-tab-${tool.id}`}
                  type="button"
                  onClick={() => setActiveTool(tool.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Active Tool Workspace */}
      {activeTool === 'question' && <QuestionMakerPanel />}
      {activeTool === 'notes' && <NoteCreatorPanel />}
      {activeTool === 'presentation' && <PresentationCreatorPanel />}
      {activeTool === 'syllabus' && <SyllabusMakerPanel />}
    </div>
  );
};
