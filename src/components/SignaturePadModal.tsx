import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check, Upload, PenTool } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  title: string;
  initialSignature?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  initialSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 450;
    canvas.height = 180;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    // Clear background to transparent or pure white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasContent(true);
      };
      img.src = initialSignature;
    } else {
      setHasContent(false);
    }
  }, [isOpen, initialSignature, activeTab]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSave(dataUrl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) {
      onClose();
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div id="signature-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
              <p className="text-xs text-slate-500">ডিজিটাল সাইন আঁকুন অথবা ছবি আপলোড করুন</p>
            </div>
          </div>
          <button 
            id="close-sig-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-2">
          <button
            id="tab-sig-draw"
            onClick={() => setActiveTab('draw')}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'draw'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PenTool className="w-4 h-4" />
            সরাসরি আঁকুন
          </button>
          <button
            id="tab-sig-upload"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            স্বাক্ষরের ছবি আপলোড
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'draw' ? (
            <div className="flex flex-col items-center">
              <div className="w-full border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner relative touch-none">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[180px] cursor-crosshair block"
                />
                {!hasContent && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs select-none">
                    এখানে মাউস বা আঙুল দিয়ে আপনার স্বাক্ষর করুন
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between w-full mt-4">
                <button
                  id="btn-clear-sig"
                  onClick={clearCanvas}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Eraser className="w-4 h-4" />
                  মুছে ফেলুন
                </button>
                <div className="text-xs text-slate-400">
                  স্বচ্ছ পটভূমিতে সংরক্ষিত হবে
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
              <Upload className="w-10 h-10 text-teal-600 mb-2" />
              <p className="text-sm font-medium text-slate-700 mb-1">স্বাক্ষরের ছবি নির্বাচন করুন</p>
              <p className="text-xs text-slate-500 mb-4 text-center">সাদা কাগজে করা স্বাক্ষরের ছবি (JPG, PNG)</p>
              <label 
                id="upload-sig-file-label"
                className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                ফাইল নির্বাচন করুন
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            id="btn-cancel-sig"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            বাতিল
          </button>
          {activeTab === 'draw' && (
            <button
              id="btn-confirm-sig"
              disabled={!hasContent}
              onClick={handleSaveDrawn}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              স্বাক্ষর সংরক্ষণ করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
