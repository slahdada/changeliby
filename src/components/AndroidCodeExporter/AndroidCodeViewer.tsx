import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ANDROID_KOTLIN_FILES, KotlinFile } from '../../data/androidKotlinCode';
import { Smartphone, Code2, Copy, Check, Folder, FileCode, Cpu, Layers } from 'lucide-react';

export const AndroidCodeViewer: React.FC = () => {
  const { t } = useApp();
  const [selectedFile, setSelectedFile] = useState<KotlinFile>(ANDROID_KOTLIN_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b-4 border-yellow-500 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-yellow-400" />
            <span>كود مشروع Android الأصلي (Kotlin & Jetpack Compose)</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {t.androidArchitectureIntro}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-slate-900" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? t.copied : t.copyCode}</span>
        </button>
      </div>

      {/* MVVM Architecture Specs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {[
          { title: 'النمط المعماري', value: 'MVVM + Repository', icon: Layers },
          { title: 'مكتبة قاعدة البيانات', value: 'Room Database Flow', icon: Folder },
          { title: 'واجهة المستخدم', value: 'Jetpack Compose Material3', icon: Smartphone },
          { title: 'حالة الاتصال', value: 'Offline-First Local Storage', icon: Cpu },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-2 bg-yellow-100 text-slate-900 rounded-lg">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold">{item.title}</div>
                <div className="font-black text-slate-900 mt-0.5">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main File Explorer & Code View Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Left Column: File Explorer Tree */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Folder className="w-4 h-4 text-yellow-600" />
            <span>ملفات مشروع Android Studio</span>
          </div>

          <div className="space-y-1.5">
            {ANDROID_KOTLIN_FILES.map((file) => {
              const isSelected = selectedFile.filename === file.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-right p-3 rounded-xl border text-xs transition-colors flex flex-col ${
                    isSelected
                      ? 'bg-yellow-50 border-yellow-500 text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <FileCode className={`w-4 h-4 ${isSelected ? 'text-yellow-600' : 'text-slate-400'}`} />
                    <span>{file.filename}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{file.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Code Viewer */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col">
          
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="font-mono font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-yellow-600" />
                <span>{selectedFile.filename}</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedFile.path}</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-[550px] overflow-y-auto">
            <pre><code>{selectedFile.code}</code></pre>
          </div>

        </div>

      </div>

    </div>
  );
};
