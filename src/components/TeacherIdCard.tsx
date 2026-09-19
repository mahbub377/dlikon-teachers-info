import React from 'react';
import { Printer, Edit3, User, Sparkles } from 'lucide-react';
import { TeacherFormData } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface TeacherIdCardProps {
  formData: TeacherFormData;
  onEdit: () => void;
  onPrint: () => void;
  onLoadSample: () => void;
}

export const TeacherIdCard: React.FC<TeacherIdCardProps> = ({
  formData,
  onEdit,
  onPrint,
  onLoadSample
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="no-print bg-white p-5 rounded-2xl shadow-xs border border-slate-200 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-100 text-teal-800 rounded-md">
              স্মার্ট ফিচার
            </span>
            <h2 className="text-lg font-bold text-slate-900">শিক্ষক পরিচয়পত্র (Teacher Identity Card)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ফরমের তথ্যের ভিত্তিতে স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত অফিশিয়াল আইডি কার্ড (সামনের ও পেছনের পাশ)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!formData.fullName && (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              নমুনা তথ্য
            </button>
          )}

          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            তথ্য পরিবর্তন
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            আইডি কার্ড প্রিন্ট
          </button>
        </div>
      </div>

      {/* ID Cards Layout (Front and Back) */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        
        {/* FRONT SIDE (সামনের পাশ) */}
        <div className="w-[300px] h-[460px] bg-white rounded-2xl shadow-xl border-2 border-teal-800 overflow-hidden flex flex-col relative text-slate-900 select-none">
          {/* Top Header Banner */}
          <div className="bg-gradient-to-b from-teal-900 via-teal-800 to-teal-900 text-white p-3 text-center relative border-b-2 border-amber-400">
            <SchoolLogo size={36} className="mx-auto mb-1 drop-shadow-xs" />
            <h3 className="text-sm font-black tracking-tight leading-tight">
              ডি-লিকন মডেল একাডেমী
            </h3>
            <p className="text-[9px] text-teal-200 tracking-wider font-semibold">
              D-LIKON MODEL ACADEMY
            </p>
          </div>

          {/* Teacher Photo */}
          <div className="flex flex-col items-center pt-3 px-4">
            <div className="w-24 h-28 rounded-xl border-2 border-teal-700 bg-slate-100 shadow-md overflow-hidden flex items-center justify-center relative">
              {formData.teacherPhoto ? (
                <img 
                  src={formData.teacherPhoto} 
                  alt="Teacher ID" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>

            {/* Teacher Name & Title */}
            <h4 className="font-bold text-slate-950 text-sm mt-2.5 text-center leading-snug">
              {formData.fullName || 'শিক্ষকের পূর্ণ নাম'}
            </h4>
            <div className="inline-block px-2.5 py-0.5 bg-teal-50 text-teal-800 font-bold text-[11px] rounded-full border border-teal-200 mt-1">
              {formData.designation || 'পদবি নির্বাচন করুন'}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              বিষয়: <span className="font-semibold text-slate-800">{formData.mainSubject || 'সব বিষয়'}</span>
            </p>
          </div>

          {/* Key Details */}
          <div className="px-5 py-2 mt-auto text-[11px] space-y-1 bg-slate-50/80 border-t border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">আইডি নং:</span>
              <span className="font-mono font-bold text-teal-950">{formData.teacherId || 'DLMA-0000'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">রক্তের গ্রুপ:</span>
              <span className="font-bold text-rose-700">{formData.bloodGroup || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">মোবাইল:</span>
              <span className="font-mono font-semibold text-slate-800">{formData.mobileNumber || '০১XXXXXXXXX'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">যোগদান:</span>
              <span className="text-slate-800">{formData.joiningDate || '২০২৪'}</span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-teal-900 text-teal-200 text-[9px] text-center py-1 font-medium">
            শিক্ষক পরিচিতিপত্র • TEACHER IDENTITY CARD
          </div>
        </div>


        {/* BACK SIDE (পেছনের পাশ) */}
        <div className="w-[300px] h-[460px] bg-white rounded-2xl shadow-xl border-2 border-slate-700 overflow-hidden flex flex-col justify-between text-slate-900 select-none p-4">
          <div>
            <div className="text-center border-b border-slate-200 pb-2 mb-3">
              <h5 className="text-xs font-bold text-slate-900">জরুরী নির্দেশনাবলী ও যোগাযোগ</h5>
              <p className="text-[9px] text-slate-500">কার্ডটি হারিয়ে গেলে অবিলম্বে বিদ্যালয়ে যোগাযোগ করুন</p>
            </div>

            <div className="space-y-2 text-[10.5px]">
              <div>
                <span className="text-slate-500 block text-[9.5px]">জাতীয় পরিচয়পত্র (NID):</span>
                <span className="font-mono font-semibold text-slate-800">{formData.nidNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px]">জরুরী যোগাযোগের ব্যক্তি:</span>
                <span className="font-mono font-semibold text-slate-800">{formData.emergencyMobile || formData.mobileNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px]">বর্তমান ঠিকানা:</span>
                <span className="text-slate-800 line-clamp-2 leading-tight">
                  {formData.presentAddress || 'বিদ্যালয় ক্যাম্পাস'}
                </span>
              </div>
            </div>

            {/* Barcode Simulation */}
            <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center">
              <div className="flex gap-1 h-8 items-center justify-center">
                <div className="w-1 h-full bg-slate-900"></div>
                <div className="w-0.5 h-full bg-slate-900"></div>
                <div className="w-1.5 h-full bg-slate-900"></div>
                <div className="w-0.5 h-full bg-slate-900"></div>
                <div className="w-2 h-full bg-slate-900"></div>
                <div className="w-1 h-full bg-slate-900"></div>
                <div className="w-0.5 h-full bg-slate-900"></div>
                <div className="w-1.5 h-full bg-slate-900"></div>
                <div className="w-2 h-full bg-slate-900"></div>
                <div className="w-0.5 h-full bg-slate-900"></div>
                <div className="w-1 h-full bg-slate-900"></div>
                <div className="w-2 h-full bg-slate-900"></div>
              </div>
              <span className="font-mono text-[9px] text-slate-500 mt-1">{formData.teacherId || 'DLMA-2024'}</span>
            </div>
          </div>

          {/* Principal Signature & Disclaimer */}
          <div className="border-t border-slate-200 pt-2 text-center">
            <div className="h-10 flex items-end justify-center pb-0.5">
              {formData.principalSignature ? (
                <img 
                  src={formData.principalSignature} 
                  alt="Principal" 
                  className="max-h-8 max-w-28 object-contain" 
                />
              ) : (
                <div className="text-[10px] text-slate-300">স্বাক্ষর</div>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-900 border-t border-dotted border-slate-400 pt-0.5">
              অধ্যক্ষ / প্রধান শিক্ষকের স্বাক্ষর
            </p>
            <p className="text-[8.5px] text-slate-500 mt-1">
              ডি-লিকন মডেল একাডেমী • সর্বস্বত্ব সংরক্ষিত
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
