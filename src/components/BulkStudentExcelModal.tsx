import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Layers
} from 'lucide-react';
import { StudentRecord, SCHOOL_CLASSES } from '../types/adminTypes';
import {
  parseStudentExcelFile,
  ParsedStudentExcelResult,
  normalizeClassName
} from '../utils/studentExcelParser';

interface BulkStudentExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStudents: StudentRecord[];
  normalizeStudents: (list: StudentRecord[]) => StudentRecord[];
  onImportCompleted: (mergedStudents: StudentRecord[], summaryMessage: string) => void;
}

interface QueuedExcelFile extends ParsedStudentExcelResult {
  id: string;
  assignedClass: string;
}

export const BulkStudentExcelModal: React.FC<BulkStudentExcelModalProps> = ({
  isOpen,
  onClose,
  existingStudents,
  normalizeStudents,
  onImportCompleted,
}) => {
  const [queuedFiles, setQueuedFiles] = useState<QueuedExcelFile[]>([]);
  const [importMode, setImportMode] = useState<'replace_class' | 'append'>('replace_class');
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const classCounts = useMemo(() => {
    const map: Record<string, number> = {};
    SCHOOL_CLASSES.forEach(cls => {
      map[cls] = existingStudents.filter(s => normalizeClassName(s.className) === cls).length;
    });
    return map;
  }, [existingStudents]);

  if (!isOpen) return null;

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);
    setIsParsing(true);

    try {
      const files = Array.from(fileList).filter(f => /\.(xlsx|xls|csv)$/i.test(f.name));
      if (files.length === 0) {
        setErrorMsg('অনুগ্রহ করে শুধুমাত্র Excel (.xlsx, .xls) বা CSV (.csv) ফাইল নির্বাচন করুন।');
        setIsParsing(false);
        return;
      }

      const parsedBatch: QueuedExcelFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await parseStudentExcelFile(files[i], '৫ম শ্রেণি');
        parsedBatch.push({
          ...res,
          id: `${files[i].name}_${Date.now()}_${i}`,
          assignedClass: SCHOOL_CLASSES.includes(res.detectedClass as any)
            ? res.detectedClass
            : normalizeClassName(res.detectedClass),
        });
      }

      setQueuedFiles(prev => [...prev, ...parsedBatch]);
    } catch (err) {
      console.error('Bulk Excel parse error:', err);
      setErrorMsg('এক্সেল ফাইলগুলো পড়তে সমস্যা হয়েছে। অনুগ্রহ করে ফাইলের ফরম্যাট যাচাই করুন।');
    } finally {
      setIsParsing(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  const updateAssignedClass = (queueId: string, newClass: string) => {
    setQueuedFiles(prev =>
      prev.map(item => (item.id === queueId ? { ...item, assignedClass: newClass } : item))
    );
  };

  const removeQueuedFile = (queueId: string) => {
    setQueuedFiles(prev => prev.filter(item => item.id !== queueId));
  };

  const handleConfirmImportAll = () => {
    const validBatches = queuedFiles.filter(q => q.students.length > 0);
    if (validBatches.length === 0) {
      setErrorMsg('ইমপোর্ট করার জন্য কোনো বৈধ শিক্ষার্থীর তথ্য পাওয়া যায়নি।');
      return;
    }

    const targetClassesInBatch = new Set(validBatches.map(b => b.assignedClass));

    // Re-tag each imported student's className to match the confirmed dropdown class
    const newlyImported: StudentRecord[] = [];
    for (const batch of validBatches) {
      batch.students.forEach((stu) => {
        newlyImported.push({
          ...stu,
          className: batch.assignedClass,
        });
      });
    }

    let baseList = existingStudents;
    if (importMode === 'replace_class') {
      baseList = existingStudents.filter(
        s => !targetClassesInBatch.has(normalizeClassName(s.className))
      );
    }

    const merged = normalizeStudents([...baseList, ...newlyImported]);
    const classListText = Array.from(targetClassesInBatch).join(', ');
    const summary = `বাল্ক আপলোড সফল: ${validBatches.length}টি ফাইল থেকে মোট ${newlyImported.length} জন শিক্ষার্থী [${classListText}] শ্রেণিতে নির্ভুলভাবে যুক্ত হয়েছে!`;

    setQueuedFiles([]);
    onImportCompleted(merged, summary);
    onClose();
  };

  const totalQueuedStudents = queuedFiles.reduce((acc, q) => acc + q.students.length, 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8 text-slate-900 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>বাল্ক এক্সেল আপলোড — সকল শ্রেণির ফাইল একসাথে</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              প্লে থেকে ১০ম শ্রেণি পর্যন্ত আলাদাভাবে তৈরি করা সবগুলো Excel ফাইল একবারেই নির্বাচন করে আপলোড করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live 12-Class Current Status Grid */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">
            বর্তমান শ্রেণিভিত্তিক শিক্ষার্থী আপলোড অবস্থা (প্লে – ১০ম):
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
            {SCHOOL_CLASSES.map(cls => {
              const cnt = classCounts[cls] || 0;
              return (
                <div
                  key={cls}
                  className={`p-2 rounded-lg border text-center ${
                    cnt > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="font-bold truncate">{cls}</div>
                  <div className="text-[11px] font-mono tabular-nums mt-0.5">
                    {cnt > 0 ? `${cnt} জন` : 'খালি (০)'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-lg text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drag & Drop Multi-File Picker */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => multiFileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-amber-600 bg-amber-50'
              : 'border-slate-300 bg-slate-50 hover:border-amber-500'
          }`}
        >
          <input
            ref={multiFileInputRef}
            type="file"
            multiple
            accept=".xlsx, .xls, .csv"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-900">
            {isParsing
              ? 'এক্সেল ফাইলগুলো প্রক্রিয়াকরণ হচ্ছে...'
              : 'এখানে ক্লিক করুন অথবা একসাথে সব শ্রেণির Excel ফাইল টেনে এনে ছাড়ুন'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ফাইলের নাম (যেমন: play.xlsx, class_5.xlsx, ৫ম.xlsx) বা ভেতরের শিরোনাম দেখে শ্রেণি স্বয়ংক্রিয়ভাবে শনাক্ত হবে
          </p>
        </div>

        {/* Queued Files Mapping Preview Table */}
        {queuedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="font-bold text-slate-800">
                নির্বাচিত ফাইল ({queuedFiles.length}টি) · মোট শিক্ষার্থী:{' '}
                <span className="font-mono tabular-nums text-teal-700">{totalQueuedStudents} জন</span>
              </div>

              {/* Replace vs Append Mode */}
              <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-lg">
                <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="bulkImportMode"
                    checked={importMode === 'replace_class'}
                    onChange={() => setImportMode('replace_class')}
                  />
                  <span>সংশ্লিষ্ট শ্রেণির আগের ডেটা বদলে নতুন সেট দিন</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="bulkImportMode"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                  />
                  <span>আগের তালিকায় যোগ করুন</span>
                </label>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">এক্সেল ফাইলের নাম</th>
                    <th className="p-2.5">টার্গেট শ্রেণি (যাচাই/পরিবর্তন করুন)</th>
                    <th className="p-2.5">শনাক্তকৃত শিক্ষার্থী</th>
                    <th className="p-2.5 text-right">অপসারণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queuedFiles.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="truncate max-w-[220px]" title={q.fileName}>
                          {q.fileName}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <select
                          value={q.assignedClass}
                          onChange={(e) => updateAssignedClass(q.id, e.target.value)}
                          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 cursor-pointer"
                        >
                          {SCHOOL_CLASSES.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5 font-mono tabular-nums">
                        {q.students.length > 0 ? (
                          <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {q.students.length} জন
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold">০ জন (তথ্য পাওয়া যায়নি)</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeQueuedFile(q.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="তালিকা থেকে সরান"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500">
            প্রতিটি শ্রেণির রোল স্বয়ংক্রিয়ভাবে ০১, ০২, ০৩... ক্রমানুসারে সাজানো হবে এবং হেডার সারি বাদ যাবে।
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              disabled={totalQueuedStudents === 0}
              onClick={handleConfirmImportAll}
              className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>সবগুলো শ্রেণি একসাথে ইমপোর্ট করুন ({totalQueuedStudents} জন)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
