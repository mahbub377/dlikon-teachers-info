import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Award,
  Plus,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Printer,
  Download,
  Trash2,
  Search,
  Save,
  X,
  Target,
  ClipboardCheck
} from 'lucide-react';
import {
  ModelTestSession,
  ModelTestStudentResult,
  ModelTestSubjectConfig,
  ReadinessTier,
  SCHOOL_CLASSES,
  ScholarshipProgramType,
  StudentRecord
} from '../types/adminTypes';
import { SchoolLogo } from './SchoolLogo';
import { formatBanglaRoll, normalizeClassName, parseRollNumber } from './AdminDashboard';
import { downloadSingleElementAsPdf, printViaIsolatedIframe } from '../utils/pdfExport';

export const STORAGE_MODEL_TESTS = 'dlma_model_test_sessions_v1';

const SCHOLARSHIP_PROGRAMS: ScholarshipProgramType[] = [
  'সরকারি প্রাথমিক ও জুনিয়র বৃত্তি',
  'কিন্ডারগার্টেন অ্যাসোসিয়েশন বৃত্তি',
  'উপজেলা / জেলা মেধাবৃত্তি',
  'সাপ্তাহিক / বিশেষ মডেল টেস্ট',
  'বার্ষিক পূর্ণাঙ্গ মডেল টেস্ট'
];

const DEFAULT_SUBJECT_CONFIG: ModelTestSubjectConfig[] = [
  { name: 'বাংলা', fullMarks: 25 },
  { name: 'ইংরেজি', fullMarks: 25 },
  { name: 'গণিত', fullMarks: 30 },
  { name: 'বিজ্ঞান ও IQ', fullMarks: 20 }
];

const DEFAULT_MODEL_TEST_SESSIONS: ModelTestSession[] = [
  {
    id: 'mt_session_1',
    title: 'বৃত্তি মডেল টেস্ট - ০১ (বেসলাইন যাচাই)',
    scholarshipType: 'সরকারি প্রাথমিক ও জুনিয়র বৃত্তি',
    className: '৫ম শ্রেণি',
    date: '2026-10-18',
    targetReadinessPercent: 85,
    subjects: DEFAULT_SUBJECT_CONFIG,
    results: [
      {
        studentId: 'mt_stu_1',
        studentName: 'তাসনিম তাবাসসুম',
        roll: '০১',
        className: '৫ম শ্রেণি',
        marks: { বাংলা: 22, ইংরেজি: 21, গণিত: 27, 'বিজ্ঞান ও IQ': 18 },
        teacherRemark: 'গণিত ও বাংলায় শক্ত অবস্থানে আছে'
      },
      {
        studentId: 'mt_stu_2',
        studentName: 'আরিফুল ইসলাম জয়',
        roll: '০২',
        className: '৫ম শ্রেণি',
        marks: { বাংলা: 20, ইংরেজি: 17, গণিত: 26, 'বিজ্ঞান ও IQ': 16 },
        teacherRemark: 'ইংরেজি গ্রামারে বাড়তি অনুশীলন প্রয়োজন'
      },
      {
        studentId: 'mt_stu_3',
        studentName: 'নাবিলা সুলতানা মীম',
        roll: '০৩',
        className: '৫ম শ্রেণি',
        marks: { বাংলা: 21, ইংরেজি: 22, গণিত: 22, 'বিজ্ঞান ও IQ': 17 },
        teacherRemark: 'গণিতের জ্যামিতি অংশ রিভিশন দেওয়া হবে'
      },
      {
        studentId: 'mt_stu_4',
        studentName: 'রাফিউল করিম সিয়াম',
        roll: '০৪',
        className: '৫ম শ্রেণি',
        marks: { বাংলা: 17, ইংরেজি: 15, গণিত: 18, 'বিজ্ঞান ও IQ': 14 },
        teacherRemark: 'সব বিষয়ে নিবিড় মনিটরিং প্রয়োজন'
      }
    ],
    updatedAt: '১৮/১০/২০২৬'
  },
  {
    id: 'mt_session_2',
    title: 'বৃত্তি মডেল টেস্ট - ০২ (চূড়ান্ত প্রস্তুতি যাচাই)',
    scholarshipType: 'কিন্ডারগার্টেন অ্যাসোসিয়েশন বৃত্তি',
    className: '৫ম শ্রেণি',
    date: '2026-11-12',
    targetReadinessPercent: 85,
    subjects: DEFAULT_SUBJECT_CONFIG,
    results: [
      {
        studentId: 'mt_stu_1',
        studentName: 'তাসনিম তাবাসসুম',
        roll: '০১',
        className: '৫ম শ্রেণি',
        marks: { বাংলা: 23, ইংরেজি: 23, গণিত: 28, 'বিজ্ঞান ও IQ': 18 },
        teacherRemark: 'ট্যালেন্টপুল বৃত্তির জন্য সম্পূর্ণ প্রস্তুত'
      },
      {
        studentId: 'mt_stu_2',
        studentName: 'আরিফুল ইসলাম জয়',
        roll: '০২',
        className: '৫ম শ্রেণি',
        marks: { বাংলা: 22, ইংরেজি: 20, গণিত: 27, 'বিজ্ঞান ও IQ': 17 },
        teacherRemark: 'ইংরেজিতে ভালো উন্নতি করেছে; বৃত্তি-প্রস্তুত'
      },
      {
        studentId: 'mt_stu_3',
        studentName: 'নাবিলা সুলতানা মীম',
        roll: '০৩',
        className: '৫ম শ্রেণি',
        marks: { বাংলা: 22, ইংরেজি: 21, গণিত: 21, 'বিজ্ঞান ও IQ': 17 },
        teacherRemark: 'গণিতে আরও ৫ নম্বর বাড়লে নিশ্চিত বৃত্তি'
      },
      {
        studentId: 'mt_stu_4',
        studentName: 'রাফিউল করিম সিয়াম',
        roll: '০৪',
        className: '৫ম শ্রেণি',
        marks: { বাংলা: 18, ইংরেজি: 14, গণিত: 19, 'বিজ্ঞান ও IQ': 15 },
        teacherRemark: 'ইংরেজি স্পেশাল কেয়ার সেশন চালু করা হয়েছে'
      }
    ],
    updatedAt: '১২/১১/২০২৬'
  },
  {
    id: 'mt_session_class4',
    title: 'কিন্ডারগার্টেন বৃত্তি মডেল টেস্ট - ০১',
    scholarshipType: 'কিন্ডারগার্টেন অ্যাসোসিয়েশন বৃত্তি',
    className: '৪র্থ শ্রেণি',
    date: '2026-11-10',
    targetReadinessPercent: 85,
    subjects: DEFAULT_SUBJECT_CONFIG,
    results: [
      {
        studentId: 'mt4_stu_1',
        studentName: 'সুমাইয়া আক্তার',
        roll: '০১',
        className: '৪র্থ শ্রেণি',
        marks: { বাংলা: 22, ইংরেজি: 22, গণিত: 27, 'বিজ্ঞান ও IQ': 17 },
        teacherRemark: 'সব বিষয়ে বৃত্তি-প্রস্তুত'
      },
      {
        studentId: 'mt4_stu_2',
        studentName: 'তানজিমুল হক',
        roll: '০২',
        className: '৪র্থ শ্রেণি',
        marks: { বাংলা: 19, ইংরেজি: 18, গণিত: 24, 'বিজ্ঞান ও IQ': 15 },
        teacherRemark: 'ইংরেজি ও IQ রিভিশন জরুরি'
      },
      {
        studentId: 'mt4_stu_3',
        studentName: 'মায়িশা রহমান',
        roll: '০৩',
        className: '৪র্থ শ্রেণি',
        marks: { বাংলা: 21, ইংরেজি: 20, গণিত: 26, 'বিজ্ঞান ও IQ': 16 },
        teacherRemark: 'লক্ষ্যমাত্রার খুব কাছাকাছি'
      }
    ],
    updatedAt: '১০/১১/২০২৬'
  },
  {
    id: 'mt_session_class3',
    title: 'মেধাবৃত্তি প্রস্তুতি মডেল টেস্ট - ০১',
    scholarshipType: 'উপজেলা / জেলা মেধাবৃত্তি',
    className: '৩য় শ্রেণি',
    date: '2026-11-08',
    targetReadinessPercent: 82,
    subjects: DEFAULT_SUBJECT_CONFIG,
    results: [
      {
        studentId: 'mt3_stu_1',
        studentName: 'নাফিসা নূর',
        roll: '০১',
        className: '৩য় শ্রেণি',
        marks: { বাংলা: 22, ইংরেজি: 21, গণিত: 25, 'বিজ্ঞান ও IQ': 17 },
        teacherRemark: 'পাকাপোক্ত অবস্থান'
      },
      {
        studentId: 'mt3_stu_2',
        studentName: 'যুবায়ের আহমেদ',
        roll: '০২',
        className: '৩য় শ্রেণি',
        marks: { বাংলা: 18, ইংরেজি: 16, গণিত: 22, 'বিজ্ঞান ও IQ': 15 },
        teacherRemark: 'ইংরেজিতে অনুশীলন বাড়াতে হবে'
      }
    ],
    updatedAt: '০৮/১১/২০২৬'
  },
  {
    id: 'mt_session_class8',
    title: 'জুনিয়র বৃত্তি মডেল টেস্ট - ০১',
    scholarshipType: 'সরকারি প্রাথমিক ও জুনিয়র বৃত্তি',
    className: '৮ম শ্রেণি',
    date: '2026-11-14',
    targetReadinessPercent: 85,
    subjects: DEFAULT_SUBJECT_CONFIG,
    results: [
      {
        studentId: 'mt8_stu_1',
        studentName: 'সাবিকুন্নাহার স্বর্ণা',
        roll: '০১',
        className: '৮ম শ্রেণি',
        marks: { বাংলা: 23, ইংরেজি: 21, গণিত: 28, 'বিজ্ঞান ও IQ': 17 },
        teacherRemark: 'জুনিয়র বৃত্তির জন্য উচ্চ-সম্ভাবনাময়'
      },
      {
        studentId: 'mt8_stu_2',
        studentName: 'মেহেদী হাসান রাব্বি',
        roll: '০২',
        className: '৮ম শ্রেণি',
        marks: { বাংলা: 20, ইংরেজি: 19, গণিত: 25, 'বিজ্ঞান ও IQ': 16 },
        teacherRemark: 'ইংরেজিতে ৩-৪ নম্বর বাড়ালে পাকাপোক্ত হবে'
      }
    ],
    updatedAt: '১৪/১১/২০২৬'
  }
];

const toBanglaDigits = (val: number | string): string => {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => map[Number(d)]);
};

export const loadModelTestSessions = (): ModelTestSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_MODEL_TESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_MODEL_TEST_SESSIONS;
};

export interface StudentReadinessEvaluation {
  totalObtained: number;
  totalFullMarks: number;
  percentage: number;
  tier: ReadinessTier;
  tierLabel: string;
  tierColorClass: string;
  weakSubjects: string[];
  isScholarshipReady: boolean;
}

export const evaluateStudentModelTest = (
  result: ModelTestStudentResult,
  subjects: ModelTestSubjectConfig[],
  targetReadinessPercent: number
): StudentReadinessEvaluation => {
  const totalFullMarks = subjects.reduce((acc, s) => acc + (s.fullMarks || 0), 0) || 100;
  let totalObtained = 0;
  const weakSubjects: string[] = [];

  subjects.forEach((subj) => {
    const score = Number(result.marks?.[subj.name] ?? 0);
    const bounded = Math.max(0, Math.min(subj.fullMarks, isNaN(score) ? 0 : score));
    totalObtained += bounded;
    const subjPct = subj.fullMarks > 0 ? (bounded / subj.fullMarks) * 100 : 0;
    if (subjPct < 70) {
      weakSubjects.push(`${subj.name} (${toBanglaDigits(Math.round(subjPct))}%)`);
    }
  });

  const percentage = Math.round((totalObtained / totalFullMarks) * 100);
  const promisingThreshold = Math.max(55, targetReadinessPercent - 15);

  let tier: ReadinessTier = 'intensive_care';
  let tierLabel = 'দুর্বল · নিবিড় তত্ত্বাবধান';
  let tierColorClass = 'bg-rose-50 border-rose-300 text-rose-900';

  if (percentage >= targetReadinessPercent) {
    tier = 'solid';
    tierLabel = 'পাকাপোক্ত (বৃত্তি-প্রস্তুত)';
    tierColorClass = 'bg-emerald-50 border-emerald-300 text-emerald-900';
  } else if (percentage >= promisingThreshold) {
    tier = 'promising';
    tierLabel = 'সম্ভাবনাময় · রিভিশন জরুরি';
    tierColorClass = 'bg-teal-50 border-teal-300 text-teal-900';
  } else if (percentage >= 55) {
    tier = 'needs_practice';
    tierLabel = 'মাঝারি · অনুশীলন প্রয়োজন';
    tierColorClass = 'bg-amber-50 border-amber-300 text-amber-900';
  }

  return {
    totalObtained,
    totalFullMarks,
    percentage,
    tier,
    tierLabel,
    tierColorClass,
    weakSubjects,
    isScholarshipReady: percentage >= targetReadinessPercent
  };
};

interface ScholarshipModelTestPanelProps {
  students: StudentRecord[];
}

export const ScholarshipModelTestPanel: React.FC<ScholarshipModelTestPanelProps> = ({
  students = []
}) => {
  const [sessions, setSessions] = useState<ModelTestSession[]>(loadModelTestSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => loadModelTestSessions()[loadModelTestSessions().length - 1]?.id || ''
  );
  const [tierFilter, setTierFilter] = useState<'all' | ReadinessTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Create New Session Drawer
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProgram, setNewProgram] = useState<ScholarshipProgramType>(SCHOLARSHIP_PROGRAMS[0]);
  const [newClass, setNewClass] = useState<string>('৫ম শ্রেণি');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTargetPercent, setNewTargetPercent] = useState(85);
  const [newSubjectsText, setNewSubjectsText] = useState(
    'বাংলা:25, ইংরেজি:25, গণিত:30, বিজ্ঞান ও IQ:20'
  );

  // Quick Manual Candidate Add
  const [manualName, setManualName] = useState('');
  const [manualRoll, setManualRoll] = useState('');

  // Quick Result Logger State (লগ করুন যেকোনো শ্রেণির বৃত্তি ফলাফল)
  const [isLoggingResult, setIsLoggingResult] = useState(false);
  const [logClassName, setLogClassName] = useState<string>('৫ম শ্রেণি');
  const [logSessionId, setLogSessionId] = useState<string>('auto');
  const [logStudentId, setLogStudentId] = useState<string>('');
  const [logManualName, setLogManualName] = useState<string>('');
  const [logManualRoll, setLogManualRoll] = useState<string>('');
  const [logMarks, setLogMarks] = useState<Record<string, number>>({
    বাংলা: 20,
    ইংরেজি: 20,
    গণিত: 24,
    'বিজ্ঞান ও IQ': 16
  });
  const [logRemark, setLogRemark] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MODEL_TESTS, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0] || null,
    [sessions, activeSessionId]
  );

  // Compare student performance against previous model tests for the same class
  const previousPercentageByStudent = useMemo(() => {
    if (!activeSession) return {} as Record<string, number>;
    const earlierSessions = sessions.filter(
      (s) =>
        s.id !== activeSession.id &&
        s.className === activeSession.className &&
        s.date <= activeSession.date
    );
    if (earlierSessions.length === 0) return {} as Record<string, number>;

    const prevSession = earlierSessions.sort((a, b) => b.date.localeCompare(a.date))[0];
    const map: Record<string, number> = {};
    prevSession.results.forEach((r) => {
      const ev = evaluateStudentModelTest(r, prevSession.subjects, prevSession.targetReadinessPercent);
      map[`${r.studentName}__${formatBanglaRoll(r.roll)}`] = ev.percentage;
    });
    return map;
  }, [sessions, activeSession]);

  // Evaluated rows for active session
  const evaluatedRows = useMemo(() => {
    if (!activeSession) return [];
    return activeSession.results
      .map((res) => {
        const evalData = evaluateStudentModelTest(
          res,
          activeSession.subjects,
          activeSession.targetReadinessPercent
        );
        const prevKey = `${res.studentName}__${formatBanglaRoll(res.roll)}`;
        const prevPct = previousPercentageByStudent[prevKey];
        const delta = prevPct !== undefined ? evalData.percentage - prevPct : null;
        return {
          result: res,
          evalData,
          delta
        };
      })
      .sort((a, b) => b.evalData.percentage - a.evalData.percentage);
  }, [activeSession, previousPercentageByStudent]);

  const filteredRows = useMemo(() => {
    return evaluatedRows.filter(({ result, evalData }) => {
      const matchesTier = tierFilter === 'all' || evalData.tier === tierFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        result.studentName.toLowerCase().includes(q) ||
        result.roll.includes(q) ||
        formatBanglaRoll(result.roll).includes(q);
      return matchesTier && matchesSearch;
    });
  }, [evaluatedRows, tierFilter, searchQuery]);

  // Session Aggregate KPIs
  const sessionMetrics = useMemo(() => {
    const total = evaluatedRows.length;
    if (total === 0) {
      return { total: 0, solid: 0, promising: 0, needsAttention: 0, avgPct: 0 };
    }
    const solid = evaluatedRows.filter((r) => r.evalData.tier === 'solid').length;
    const promising = evaluatedRows.filter((r) => r.evalData.tier === 'promising').length;
    const needsAttention = total - solid - promising;
    const avgPct = Math.round(
      evaluatedRows.reduce((sum, r) => sum + r.evalData.percentage, 0) / total
    );
    return { total, solid, promising, needsAttention, avgPct };
  }, [evaluatedRows]);

  // Chart 1: Subject-wise Average % vs Target Benchmark
  const subjectChartData = useMemo(() => {
    if (!activeSession || activeSession.results.length === 0) return [];
    return activeSession.subjects.map((subj) => {
      const sum = activeSession.results.reduce(
        (acc, r) => acc + (Number(r.marks?.[subj.name]) || 0),
        0
      );
      const avgRaw = sum / activeSession.results.length;
      const avgPct = subj.fullMarks > 0 ? Math.round((avgRaw / subj.fullMarks) * 100) : 0;
      return {
        subject: subj.name,
        গড়_দক্ষতা: avgPct,
        বৃত্তি_লক্ষ্য: activeSession.targetReadinessPercent
      };
    });
  }, [activeSession]);

  // Chart 2: Progression across all Model Tests for active class
  const progressionChartData = useMemo(() => {
    if (!activeSession) return [];
    return [...sessions]
      .filter((s) => s.className === activeSession.className)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((sess, idx) => {
        if (sess.results.length === 0) {
          return {
            test: `মডেল ${toBanglaDigits(idx + 1)}`,
            গড়_নম্বর: 0,
            পাকাপোক্ত_হার: 0
          };
        }
        const evals = sess.results.map((r) =>
          evaluateStudentModelTest(r, sess.subjects, sess.targetReadinessPercent)
        );
        const avg = Math.round(evals.reduce((a, b) => a + b.percentage, 0) / evals.length);
        const solidCount = evals.filter((e) => e.isScholarshipReady).length;
        const solidRate = Math.round((solidCount / evals.length) * 100);
        return {
          test: `মডেল ${toBanglaDigits(idx + 1)}`,
          গড়_নম্বর: avg,
          পাকাপোক্ত_হার: solidRate,
          লক্ষ্যমাত্রা: sess.targetReadinessPercent
        };
      });
  }, [sessions, activeSession]);

  // Per-Class Aggregate Performance & Progress Toward Target Scores
  const classAverageMetrics = useMemo(() => {
    const classOrder = Array.from(SCHOOL_CLASSES);
    const classMap = new Map<
      string,
      {
        className: string;
        sessionIds: string[];
        scores: number[];
        targets: number[];
        readyCount: number;
      }
    >();

    sessions.forEach((sess) => {
      const cls = normalizeClassName(sess.className);
      if (!classMap.has(cls)) {
        classMap.set(cls, {
          className: cls,
          sessionIds: [],
          scores: [],
          targets: [],
          readyCount: 0
        });
      }
      const bucket = classMap.get(cls)!;
      bucket.sessionIds.push(sess.id);
      bucket.targets.push(sess.targetReadinessPercent);

      sess.results.forEach((res) => {
        const ev = evaluateStudentModelTest(res, sess.subjects, sess.targetReadinessPercent);
        bucket.scores.push(ev.percentage);
        if (ev.isScholarshipReady) bucket.readyCount += 1;
      });
    });

    return Array.from(classMap.values())
      .map((item) => {
        const count = item.scores.length;
        const avgScore = count > 0 ? Math.round(item.scores.reduce((a, b) => a + b, 0) / count) : 0;
        const avgTarget =
          item.targets.length > 0
            ? Math.round(item.targets.reduce((a, b) => a + b, 0) / item.targets.length)
            : 85;
        const highest = count > 0 ? Math.max(...item.scores) : 0;
        const lowest = count > 0 ? Math.min(...item.scores) : 0;
        const readyRate = count > 0 ? Math.round((item.readyCount / count) * 100) : 0;
        const progressPct = avgTarget > 0 ? Math.min(100, Math.round((avgScore / avgTarget) * 100)) : 0;
        const gapToTarget = avgScore - avgTarget;

        return {
          className: item.className,
          latestSessionId: item.sessionIds[item.sessionIds.length - 1],
          sessionCount: item.sessionIds.length,
          candidateCount: count,
          avgScore,
          avgTarget,
          highest,
          lowest,
          readyRate,
          progressPct,
          gapToTarget
        };
      })
      .sort((a, b) => {
        const ia = classOrder.indexOf(a.className as any);
        const ib = classOrder.indexOf(b.className as any);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.className.localeCompare(b.className);
      });
  }, [sessions]);

  const classEnrolledForLogger = useMemo(() => {
    return students
      .filter((s) => normalizeClassName(s.className) === normalizeClassName(logClassName))
      .sort((a, b) => parseRollNumber(a.roll) - parseRollNumber(b.roll));
  }, [students, logClassName]);

  const sessionsForLogClass = useMemo(
    () => sessions.filter((s) => normalizeClassName(s.className) === normalizeClassName(logClassName)),
    [sessions, logClassName]
  );

  const handleLogQuickResult = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenStudent = classEnrolledForLogger.find((s) => s.id === logStudentId);
    const studentName = chosenStudent ? chosenStudent.name : logManualName.trim();
    if (!studentName) {
      notify('অনুগ্রহ করে শিক্ষার্থীর নাম নির্বাচন করুন বা লিখুন।');
      return;
    }

    const roll = formatBanglaRoll(
      chosenStudent ? chosenStudent.roll : logManualRoll.trim() || '০১'
    );
    const targetSession =
      logSessionId !== 'auto'
        ? sessions.find((s) => s.id === logSessionId)
        : sessionsForLogClass[sessionsForLogClass.length - 1];

    const subjectsToUse = targetSession ? targetSession.subjects : DEFAULT_SUBJECT_CONFIG;
    const sanitizedMarks: Record<string, number> = {};
    subjectsToUse.forEach((subj) => {
      const val = Number(logMarks[subj.name] ?? 0);
      sanitizedMarks[subj.name] = Math.max(0, Math.min(subj.fullMarks, isNaN(val) ? 0 : val));
    });

    const newEntry: ModelTestStudentResult = {
      studentId: chosenStudent ? chosenStudent.id : `mt_log_${Date.now()}`,
      studentName,
      roll,
      className: logClassName,
      marks: sanitizedMarks,
      teacherRemark: logRemark.trim()
    };

    if (targetSession) {
      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id !== targetSession.id) return sess;
          const existingIdx = sess.results.findIndex(
            (r) =>
              r.studentId === newEntry.studentId ||
              (r.studentName === newEntry.studentName && formatBanglaRoll(r.roll) === roll)
          );
          const nextResults =
            existingIdx >= 0
              ? sess.results.map((r, idx) => (idx === existingIdx ? newEntry : r))
              : [...sess.results, newEntry];
          return {
            ...sess,
            updatedAt: new Date().toLocaleDateString('bn-BD'),
            results: nextResults
          };
        })
      );
      setActiveSessionId(targetSession.id);
      notify(`"${studentName}" (${logClassName}) এর মডেল টেস্ট ফলাফল সফলভাবে লগ হয়েছে।`);
    } else {
      const createdSession: ModelTestSession = {
        id: `mt_${Date.now()}`,
        title: `${logClassName} বৃত্তি মডেল টেস্ট - ০১`,
        scholarshipType: SCHOLARSHIP_PROGRAMS[0],
        className: logClassName,
        date: new Date().toISOString().split('T')[0],
        targetReadinessPercent: 85,
        subjects: DEFAULT_SUBJECT_CONFIG,
        results: [newEntry],
        updatedAt: new Date().toLocaleDateString('bn-BD')
      };
      setSessions((prev) => [...prev, createdSession]);
      setActiveSessionId(createdSession.id);
      notify(`${logClassName}-এর নতুন সেশন তৈরি করে "${studentName}" এর ফলাফল লগ করা হয়েছে।`);
    }

    setLogManualName('');
    setLogManualRoll('');
    setLogRemark('');
    setIsLoggingResult(false);
  };

  const handleMarkChange = (studentId: string, subjectName: string, rawVal: string, maxMarks: number) => {
    if (!activeSession) return;
    const numeric = rawVal === '' ? 0 : Math.max(0, Math.min(maxMarks, Number(rawVal) || 0));
    setSessions((prev) =>
      prev.map((sess) =>
        sess.id !== activeSession.id
          ? sess
          : {
              ...sess,
              updatedAt: new Date().toLocaleDateString('bn-BD'),
              results: sess.results.map((r) =>
                r.studentId !== studentId
                  ? r
                  : { ...r, marks: { ...r.marks, [subjectName]: numeric } }
              )
            }
      )
    );
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((sess) =>
        sess.id !== activeSession.id
          ? sess
          : {
              ...sess,
              results: sess.results.map((r) =>
                r.studentId !== studentId ? r : { ...r, teacherRemark: remark }
              )
            }
      )
    );
  };

  const handleLoadClassStudents = () => {
    if (!activeSession) return;
    const enrolled = students
      .filter((s) => normalizeClassName(s.className) === normalizeClassName(activeSession.className))
      .sort((a, b) => parseRollNumber(a.roll) - parseRollNumber(b.roll));

    if (enrolled.length === 0) {
      notify(`${activeSession.className}-এ নিবন্ধিত শিক্ষার্থী পাওয়া যায়নি। প্রথমে শিক্ষার্থী এক্সেল আপলোড করুন বা নিচ থেকে ম্যানুয়ালি যোগ করুন।`);
      return;
    }

    const existingMap = new Map(activeSession.results.map((r) => [r.studentId, r]));
    const merged: ModelTestStudentResult[] = enrolled.map((stu) => {
      const existing = existingMap.get(stu.id);
      if (existing) return existing;
      const blankMarks: Record<string, number> = {};
      activeSession.subjects.forEach((subj) => {
        blankMarks[subj.name] = 0;
      });
      return {
        studentId: stu.id,
        studentName: stu.name,
        roll: formatBanglaRoll(stu.roll),
        className: activeSession.className,
        marks: blankMarks,
        teacherRemark: ''
      };
    });

    setSessions((prev) =>
      prev.map((sess) =>
        sess.id === activeSession.id ? { ...sess, results: merged } : sess
      )
    );
    notify(`${activeSession.className}-এর ${toBanglaDigits(merged.length)} জন শিক্ষার্থী মডেল টেস্ট শীটে লোড হয়েছে।`);
  };

  const handleAddManualCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !manualName.trim()) return;
    const blankMarks: Record<string, number> = {};
    activeSession.subjects.forEach((subj) => {
      blankMarks[subj.name] = 0;
    });
    const newCandidate: ModelTestStudentResult = {
      studentId: `mt_cand_${Date.now()}`,
      studentName: manualName.trim(),
      roll: formatBanglaRoll(manualRoll.trim() || activeSession.results.length + 1),
      className: activeSession.className,
      marks: blankMarks,
      teacherRemark: ''
    };
    setSessions((prev) =>
      prev.map((sess) =>
        sess.id === activeSession.id
          ? { ...sess, results: [...sess.results, newCandidate] }
          : sess
      )
    );
    setManualName('');
    setManualRoll('');
    notify(`"${newCandidate.studentName}" মডেল টেস্ট পরীক্ষার্থী তালিকায় যুক্ত হয়েছে।`);
  };

  const handleRemoveCandidate = (studentId: string) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((sess) =>
        sess.id === activeSession.id
          ? { ...sess, results: sess.results.filter((r) => r.studentId !== studentId) }
          : sess
      )
    );
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedSubjects: ModelTestSubjectConfig[] = newSubjectsText
      .split(',')
      .map((pair) => {
        const [rawName, rawMarks] = pair.split(':').map((s) => s.trim());
        const num = parseInt(rawMarks || '25', 10);
        return {
          name: rawName || 'বিষয়',
          fullMarks: isNaN(num) || num <= 0 ? 25 : num
        };
      })
      .filter((s) => s.name);

    const subjectsToUse = parsedSubjects.length > 0 ? parsedSubjects : DEFAULT_SUBJECT_CONFIG;

    // Auto-populate enrolled class students if available
    const enrolled = students
      .filter((s) => normalizeClassName(s.className) === normalizeClassName(newClass))
      .sort((a, b) => parseRollNumber(a.roll) - parseRollNumber(b.roll));

    const initialResults: ModelTestStudentResult[] = enrolled.map((stu) => {
      const blankMarks: Record<string, number> = {};
      subjectsToUse.forEach((subj) => {
        blankMarks[subj.name] = 0;
      });
      return {
        studentId: stu.id,
        studentName: stu.name,
        roll: formatBanglaRoll(stu.roll),
        className: newClass,
        marks: blankMarks
      };
    });

    const created: ModelTestSession = {
      id: `mt_${Date.now()}`,
      title: newTitle.trim(),
      scholarshipType: newProgram,
      className: newClass,
      date: newDate,
      targetReadinessPercent: Math.max(60, Math.min(98, newTargetPercent)),
      subjects: subjectsToUse,
      results: initialResults,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };

    setSessions((prev) => [...prev, created]);
    setActiveSessionId(created.id);
    setIsCreatingSession(false);
    setNewTitle('');
    notify(`নতুন মডেল টেস্ট সেশন "${created.title}" তৈরি হয়েছে।`);
  };

  const handleDownloadPdf = async () => {
    if (!activeSession) return;
    setIsExportingPdf(true);
    try {
      await downloadSingleElementAsPdf(
        'scholarship-readiness-print-area',
        `বৃত্তি_মডেল_টেস্ট_${activeSession.className}.pdf`
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>বৃত্তি ও বিশেষ প্রস্তুতি</span>
              <span aria-hidden="true">·</span>
              <span>সরকারি প্রাথমিক / কিন্ডারগার্টেন / উপজেলা মেধাবৃত্তি</span>
              <span aria-hidden="true">·</span>
              <span>ধারাবাহিক মডেল টেস্ট মূল্যায়ন</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              মডেল টেস্ট ও বৃত্তি প্রস্তুতি যাচাই সিস্টেম
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              বৃত্তি পরীক্ষার আগে শিক্ষার্থীর প্রস্তুতি কতটা পাকাপোক্ত হয়েছে তা বিষয়ভিত্তিক নম্বর, দুর্বলতা শনাক্তকরণ ও আগের মডেল টেস্টের উন্নতি দেখে যাচাই করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (activeSession) setLogClassName(activeSession.className);
                setIsLoggingResult((v) => !v);
                setIsCreatingSession(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>ফলাফল লগ করুন</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCreatingSession((v) => !v);
                setIsLoggingResult(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সেশন</span>
            </button>

            <button
              type="button"
              onClick={() => printViaIsolatedIframe('scholarship-readiness-print-area')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF'}</span>
            </button>
          </div>
        </div>

        {/* Session Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-700 mr-1">মডেল টেস্ট সেশন:</span>
          {sessions.map((sess) => (
            <button
              key={sess.id}
              type="button"
              onClick={() => setActiveSessionId(sess.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeSession?.id === sess.id
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {sess.title} · {sess.className}
            </button>
          ))}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Scholarship Exam Result Logger */}
      {isLoggingResult && (
        <form
          onSubmit={handleLogQuickResult}
          className="bg-white border border-emerald-300 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              বৃত্তি ও মডেল টেস্ট ফলাফল লগ করুন (যেকোনো শ্রেণি)
            </h3>
            <button
              type="button"
              onClick={() => setIsLoggingResult(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">শ্রেণি নির্বাচন</label>
              <select
                value={logClassName}
                onChange={(e) => {
                  setLogClassName(e.target.value);
                  setLogSessionId('auto');
                  setLogStudentId('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">টার্গেট মডেল টেস্ট</label>
              <select
                value={logSessionId}
                onChange={(e) => setLogSessionId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="auto">
                  {sessionsForLogClass.length > 0
                    ? `সর্বশেষ: ${sessionsForLogClass[sessionsForLogClass.length - 1].title}`
                    : `স্বয়ংক্রিয় (${logClassName} সেশন তৈরি)`}
                </option>
                {sessionsForLogClass.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {classEnrolledForLogger.length > 0 ? (
              <div className="lg:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  নিবন্ধিত শিক্ষার্থী (শ্রেণি ও রোল)
                </label>
                <select
                  value={logStudentId}
                  onChange={(e) => setLogStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="">-- অথবা নিচে ম্যানুয়ালি নাম লিখুন --</option>
                  {classEnrolledForLogger.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      রোল {formatBanglaRoll(stu.roll)} · {stu.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {!logStudentId && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">রোল নং</label>
                  <input
                    type="text"
                    value={logManualRoll}
                    onChange={(e) => setLogManualRoll(e.target.value)}
                    placeholder="যেমন: ০১"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">শিক্ষার্থীর নাম *</label>
                  <input
                    type="text"
                    value={logManualName}
                    onChange={(e) => setLogManualName(e.target.value)}
                    placeholder="শিক্ষার্থীর পুরো নাম..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </>
            )}

            {(
              (logSessionId !== 'auto'
                ? sessions.find((s) => s.id === logSessionId)?.subjects
                : sessionsForLogClass[sessionsForLogClass.length - 1]?.subjects) ||
              DEFAULT_SUBJECT_CONFIG
            ).map((subj) => (
              <div key={subj.name}>
                <label className="block font-semibold text-slate-700 mb-1 tabular-nums">
                  {subj.name} (পূর্ণমান {toBanglaDigits(subj.fullMarks)})
                </label>
                <input
                  type="number"
                  min={0}
                  max={subj.fullMarks}
                  value={logMarks[subj.name] ?? 0}
                  onChange={(e) =>
                    setLogMarks((prev) => ({
                      ...prev,
                      [subj.name]: Math.max(0, Math.min(subj.fullMarks, Number(e.target.value) || 0))
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums font-semibold"
                />
              </div>
            ))}

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block font-semibold text-slate-700 mb-1">প্রস্তুতি পর্যবেক্ষণ মন্তব্য</label>
              <input
                type="text"
                value={logRemark}
                onChange={(e) => setLogRemark(e.target.value)}
                placeholder="যেমন: গণিতে ভালো করছে, ইংরেজিতে রিভিশন জরুরি"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLoggingResult(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ফলাফল সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* Create New Model Test Session Form */}
      {isCreatingSession && (
        <form
          onSubmit={handleCreateSession}
          className="bg-white border border-amber-300 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              নতুন বৃত্তি / মডেল টেস্ট সেশন তৈরি করুন
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingSession(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="lg:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">সেশন শিরোনাম *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="যেমন: মডেল টেস্ট - ০৩ (ট্যালেন্টপুল চূড়ান্ত যাচাই)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">বৃত্তি / পরীক্ষার ধরন</label>
              <select
                value={newProgram}
                onChange={(e) => setNewProgram(e.target.value as ScholarshipProgramType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {SCHOLARSHIP_PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">শ্রেণি</label>
              <select
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">তারিখ</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                পাকাপোক্ত প্রস্তুতি লক্ষ্যমাত্রা (%)
              </label>
              <input
                type="number"
                min={60}
                max={98}
                value={newTargetPercent}
                onChange={(e) => setNewTargetPercent(Number(e.target.value) || 85)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                বিষয় ও পূর্ণমান (কমা দিয়ে লিখুন)
              </label>
              <input
                type="text"
                value={newSubjectsText}
                onChange={(e) => setNewSubjectsText(e.target.value)}
                placeholder="বাংলা:25, ইংরেজি:25, গণিত:30, বিজ্ঞান ও IQ:20"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingSession(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>সেশন তৈরি করুন</span>
            </button>
          </div>
        </form>
      )}

      {activeSession && (
        <>
          {/* 4 Readiness Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-medium text-slate-500">মোট পরীক্ষার্থী ({activeSession.className})</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {toBanglaDigits(sessionMetrics.total)} জন
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {activeSession.scholarshipType}
              </div>
            </div>

            <div className="bg-white border border-emerald-200 rounded-xl p-4">
              <div className="text-xs font-medium text-emerald-800">পাকাপোক্ত (বৃত্তি-প্রস্তুত)</div>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {toBanglaDigits(sessionMetrics.solid)} জন
              </div>
              <div className="text-[11px] text-slate-600 tabular-nums mt-1">
                লক্ষ্যমাত্রা ≥ {toBanglaDigits(activeSession.targetReadinessPercent)}% অর্জনকারী
              </div>
            </div>

            <div className="bg-white border border-teal-200 rounded-xl p-4">
              <div className="text-xs font-medium text-teal-800">সম্ভাবনাময় (রিভিশন প্রয়োজন)</div>
              <div className="text-2xl font-bold text-teal-700 tabular-nums mt-1">
                {toBanglaDigits(sessionMetrics.promising)} জন
              </div>
              <div className="text-[11px] text-slate-600 tabular-nums mt-1">
                লক্ষ্যমাত্রার কাছাকাছি অবস্থান · দুর্বল বিষয় ফোকাসযোগ্য
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-4">
              <div className="text-xs font-medium text-amber-800">সেশন গড় নম্বর ও বিশেষ যত্ন</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {toBanglaDigits(sessionMetrics.avgPct)}%
              </div>
              <div className="text-[11px] text-rose-700 tabular-nums mt-1 font-semibold">
                নিবিড় যত্ন প্রয়োজন: {toBanglaDigits(sessionMetrics.needsAttention)} জন
              </div>
            </div>
          </div>

          {/* Visual Readiness Charts (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  বিষয়ভিত্তিক গড় দক্ষতা (%) বনাম বৃত্তি লক্ষ্যমাত্রা
                </h3>
                <p className="text-xs text-slate-500">
                  কোন বিষয়ে বৃত্তি ব্যাচের প্রস্তুতি দুর্বল বা পাকাপোক্ত তা সহজে শনাক্ত করুন।
                </p>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#334155' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="গড়_দক্ষতা" name="প্রাপ্ত গড় (%)" fill="#0f766e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="বৃত্তি_লক্ষ্য" name="পাকাপোক্ত লক্ষ্য (%)" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  ধারাবাহিক মডেল টেস্ট প্রস্তুতি উন্নতি ({activeSession.className})
                </h3>
                <p className="text-xs text-slate-500">
                  লক্ষ্যমাত্রা ({toBanglaDigits(activeSession.targetReadinessPercent)}%) রেখার বিপরীতে ব্যাচের গড় স্কোর পরিবর্তন।
                </p>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionChartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="test" tick={{ fontSize: 11, fill: '#334155' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <ReferenceLine
                      y={activeSession.targetReadinessPercent}
                      stroke="#d97706"
                      strokeDasharray="4 4"
                      label={{ value: `টার্গেট ${toBanglaDigits(activeSession.targetReadinessPercent)}%`, position: 'insideTopRight', fill: '#b45309', fontSize: 11 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="গড়_নম্বর"
                      name="ব্যাচের গড় নম্বর (%)"
                      stroke="#1e293b"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="পাকাপোক্ত_হার"
                      name="বৃত্তি-প্রস্তুত শিক্ষার্থী (%)"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Per-Class Average Performance & Target Progress Comparison */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>শ্রেণিভিত্তিক গড় নম্বর ও লক্ষ্যমাত্রা অর্জন বিশ্লেষণ (সকল শ্রেণি)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিটি শ্রেণির বৃত্তি পরীক্ষার্থীদের গড় পারফরম্যান্স বনাম নির্ধারিত লক্ষ্যমাত্রার তুলনামূলক চিত্র।
                </p>
              </div>
              <span className="text-xs text-slate-600 tabular-nums">
                মূল্যায়িত শ্রেণি: {toBanglaDigits(classAverageMetrics.length)}টি
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-5 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classAverageMetrics} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="className" tick={{ fontSize: 11, fill: '#334155' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="avgScore" name="শ্রেণি গড় (%)" fill="#0f766e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgTarget" name="টার্গেট (%)" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-7 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold">
                      <th className="p-2">শ্রেণি</th>
                      <th className="p-2 text-center">সেশন / পরীক্ষার্থী</th>
                      <th className="p-2 text-center">গড় স্কোর</th>
                      <th className="p-2 text-center">সর্বোচ্চ / সর্বনিম্ন</th>
                      <th className="p-2 text-center">টার্গেট</th>
                      <th className="p-2 min-w-[150px]">লক্ষ্যমাত্রার অগ্রগতি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classAverageMetrics.map((clsRow) => {
                      const isCurrent = normalizeClassName(activeSession.className) === clsRow.className;
                      return (
                        <tr
                          key={clsRow.className}
                          onClick={() => setActiveSessionId(clsRow.latestSessionId)}
                          className={`cursor-pointer transition-colors ${
                            isCurrent ? 'bg-amber-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-2 font-bold text-slate-900">{clsRow.className}</td>
                          <td className="p-2 text-center tabular-nums text-slate-700">
                            {toBanglaDigits(clsRow.sessionCount)} সেশন · {toBanglaDigits(clsRow.candidateCount)} জন
                          </td>
                          <td className="p-2 text-center font-bold tabular-nums text-slate-900">
                            {toBanglaDigits(clsRow.avgScore)}%
                          </td>
                          <td className="p-2 text-center tabular-nums text-slate-600">
                            {toBanglaDigits(clsRow.highest)}% / {toBanglaDigits(clsRow.lowest)}%
                          </td>
                          <td className="p-2 text-center tabular-nums text-amber-800 font-semibold">
                            {toBanglaDigits(clsRow.avgTarget)}%
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    clsRow.gapToTarget >= 0
                                      ? 'bg-emerald-600'
                                      : clsRow.progressPct >= 90
                                      ? 'bg-teal-600'
                                      : 'bg-amber-600'
                                  }`}
                                  style={{ width: `${clsRow.progressPct}%` }}
                                />
                              </div>
                              <span
                                className={`text-[11px] font-bold tabular-nums whitespace-nowrap ${
                                  clsRow.gapToTarget >= 0 ? 'text-emerald-700' : 'text-amber-800'
                                }`}
                              >
                                {clsRow.gapToTarget >= 0
                                  ? `+${toBanglaDigits(clsRow.gapToTarget)}%`
                                  : `${toBanglaDigits(clsRow.gapToTarget)}%`}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Interactive Score Entry & Candidate Judgement Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম বা রোল খুঁজুন..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(
                  [
                    { id: 'all', label: 'সবাই' },
                    { id: 'solid', label: 'পাকাপোক্ত' },
                    { id: 'promising', label: 'সম্ভাবনাময়' },
                    { id: 'needs_practice', label: 'অনুশীলন' },
                    { id: 'intensive_care', label: 'দুর্বল' }
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTierFilter(f.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap ${
                      tierFilter === f.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLoadClassStudents}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{activeSession.className}-এর নিবন্ধিত শিক্ষার্থী লোড করুন</span>
              </button>
            </div>
          </div>

          {/* Printable Readiness Judgement Sheet */}
          <div
            id="scholarship-readiness-print-area"
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 overflow-x-auto"
          >
            {/* Institutional Header inside printable area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <SchoolLogo size={40} className="w-10 h-10 shrink-0" preferVector={true} />
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    ডি-লিকন মডেল একাডেমী — বৃত্তি ও মডেল টেস্ট প্রস্তুতি মূল্যায়ন পত্র
                  </h3>
                  <div className="text-xs text-slate-600">
                    {activeSession.title} · {activeSession.scholarshipType} · শ্রেণি: {activeSession.className}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-700 tabular-nums text-left sm:text-right">
                <div>তারিখ: {activeSession.date}</div>
                <div className="font-bold text-emerald-800">
                  পাকাপোক্ত মান: ≥ {toBanglaDigits(activeSession.targetReadinessPercent)}%
                </div>
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                এই ফিল্টারে কোনো পরীক্ষার্থী পাওয়া যায়নি। উপরে থেকে নিবন্ধিত শিক্ষার্থী লোড করুন অথবা নিচে নতুন পরীক্ষার্থী যোগ করুন।
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="p-2.5 w-14">রোল</th>
                    <th className="p-2.5 min-w-[140px]">শিক্ষার্থীর নাম</th>
                    {activeSession.subjects.map((subj) => (
                      <th key={subj.name} className="p-2.5 text-center whitespace-nowrap tabular-nums">
                        {subj.name}
                        <span className="block text-[10px] font-normal text-slate-500">
                          (পূর্ণমান {toBanglaDigits(subj.fullMarks)})
                        </span>
                      </th>
                    ))}
                    <th className="p-2.5 text-center whitespace-nowrap">মোট (%)</th>
                    <th className="p-2.5 text-center whitespace-nowrap">পূর্ববর্তী তুলনা</th>
                    <th className="p-2.5 min-w-[140px]">দুর্বল বিষয় চিহ্নিতকরণ</th>
                    <th className="p-2.5 min-w-[160px]">প্রস্তুতির জাজমেন্ট</th>
                    <th className="p-2.5 min-w-[150px]">শিক্ষকের পরামর্শ</th>
                    <th className="p-2.5 w-10 text-center no-print">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map(({ result, evalData, delta }) => (
                    <tr key={result.studentId} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-mono font-bold text-slate-900 tabular-nums">
                        {formatBanglaRoll(result.roll)}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">{result.studentName}</td>

                      {activeSession.subjects.map((subj) => (
                        <td key={subj.name} className="p-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={subj.fullMarks}
                            value={result.marks?.[subj.name] ?? 0}
                            onChange={(e) =>
                              handleMarkChange(
                                result.studentId,
                                subj.name,
                                e.target.value,
                                subj.fullMarks
                              )
                            }
                            className="w-14 px-1.5 py-1 text-center font-mono font-semibold border border-slate-300 rounded bg-white text-slate-900 tabular-nums focus:ring-1 focus:ring-teal-600"
                          />
                        </td>
                      ))}

                      <td className="p-2.5 text-center font-bold tabular-nums whitespace-nowrap">
                        <span className="text-slate-900">
                          {toBanglaDigits(evalData.totalObtained)}/{toBanglaDigits(evalData.totalFullMarks)}
                        </span>
                        <span className="block text-[11px] text-teal-800">
                          {toBanglaDigits(evalData.percentage)}%
                        </span>
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto mt-1">
                          <div
                            className={`h-full ${
                              evalData.percentage >= activeSession.targetReadinessPercent
                                ? 'bg-emerald-600'
                                : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  (evalData.percentage / activeSession.targetReadinessPercent) * 100
                                )
                              )}%`
                            }}
                          />
                        </div>
                      </td>

                      <td className="p-2.5 text-center tabular-nums whitespace-nowrap">
                        {delta === null ? (
                          <span className="text-slate-400">১ম পরীক্ষা</span>
                        ) : delta > 0 ? (
                          <span className="inline-flex items-center gap-0.5 font-bold text-emerald-700">
                            <TrendingUp className="w-3 h-3" />+{toBanglaDigits(delta)}%
                          </span>
                        ) : delta < 0 ? (
                          <span className="font-bold text-rose-700">
                            {toBanglaDigits(delta)}%
                          </span>
                        ) : (
                          <span className="text-slate-600">অপরিবর্তিত</span>
                        )}
                      </td>

                      <td className="p-2.5">
                        {evalData.weakSubjects.length === 0 ? (
                          <span className="text-emerald-700 font-medium">সব বিষয়ে সন্তোষজনক</span>
                        ) : (
                          <span className="inline-flex items-start gap-1 text-rose-700 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{evalData.weakSubjects.join(', ')}</span>
                          </span>
                        )}
                      </td>

                      <td className="p-2.5">
                        <span
                          className={`inline-block px-2 py-1 rounded border text-[11px] font-bold ${evalData.tierColorClass}`}
                        >
                          {evalData.tierLabel}
                        </span>
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          value={result.teacherRemark || ''}
                          onChange={(e) => handleRemarkChange(result.studentId, e.target.value)}
                          placeholder="প্রস্তুতি মন্তব্য..."
                          className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] bg-white"
                        />
                      </td>

                      <td className="p-2 text-center no-print">
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidate(result.studentId)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="তালিকা থেকে সরান"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Quick Add Manual Scholarship Candidate (hidden during print) */}
            <form
              onSubmit={handleAddManualCandidate}
              className="no-print pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs"
            >
              <span className="font-semibold text-slate-700">অতিরিক্ত বৃত্তি পরীক্ষার্থী যুক্ত করুন:</span>
              <input
                type="text"
                value={manualRoll}
                onChange={(e) => setManualRoll(e.target.value)}
                placeholder="রোল (যেমন: ০৫)"
                className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="শিক্ষার্থীর নাম লিখুন..."
                className="w-56 px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>পরীক্ষার্থী যোগ</span>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
