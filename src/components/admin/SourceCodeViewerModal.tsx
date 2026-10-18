import React, { useState, useEffect } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  Folder,
  FileCode,
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Laptop,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

interface SourceCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCodeViewerModal: React.FC<SourceCodeViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('package.json');
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Load files list when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/source-files')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.files) {
            setFileList(data.files);
            if (!data.files.includes(selectedFile) && data.files.length > 0) {
              setSelectedFile(data.files[0]);
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to load file list:', err);
          // Fallback list
          setFileList([
            'package.json',
            'vite.config.ts',
            'server.ts',
            'index.html',
            'src/App.tsx',
            'src/main.tsx',
            'src/types.ts',
            'src/utils/syncService.ts',
            'src/utils/storage.ts',
            'public/manifest.json',
          ]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  // Load content whenever selected file changes
  useEffect(() => {
    if (isOpen && selectedFile) {
      setIsLoading(true);
      setCopied(false);
      fetch(`/api/source-file-content?path=${encodeURIComponent(selectedFile)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFileContent(data.content);
          } else {
            setFileContent('// Gagal memuat berkas: ' + (data.error || 'Unknown error'));
          }
        })
        .catch((err) => {
          setFileContent('// Terjadi kesalahan saat membaca file: ' + err.message);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, selectedFile]);

  if (!isOpen) return null;

  // Handle Copy to Clipboard
  const handleCopy = () => {
    if (navigator.clipboard && fileContent) {
      navigator.clipboard.writeText(fileContent).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = fileContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Handle Single File Download
  const handleDownloadSingleFile = () => {
    if (!fileContent) return;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = selectedFile.split('/').pop() || 'file.txt';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Download Complete ZIP via in-memory Blob
  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    setDownloadSuccess(null);
    try {
      const response = await fetch('/api/download-zip');
      if (!response.ok) {
        throw new Error('Gagal mengunduh berkas ZIP dari server');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'masjid-app-source.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setDownloadSuccess('Berkas ZIP berhasil diunduh ke memori perangkat!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      console.error('Download ZIP error:', err);
      // Fallback direct navigation
      window.location.href = '/api/download-zip';
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[95vh] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
                <span>Eksplorasi & Salin Kode Proyek (Acode)</span>
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Salin kode berkas apapun langsung ke papan klip atau unduh paket ZIP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingZip ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingZip ? 'Mengunduh...' : 'Unduh ZIP Lengkap'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Download ZIP Banner */}
        <div className="sm:hidden px-4 py-2 bg-emerald-950/60 border-b border-emerald-800/40 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-emerald-300 font-medium truncate">
            Ingin semua berkas sekaligus?
          </span>
          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm shrink-0"
          >
            <Download className="w-3 h-3" />
            <span>{isDownloadingZip ? 'Unduh...' : 'Unduh ZIP'}</span>
          </button>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="px-4 py-2 bg-emerald-900/90 text-emerald-200 text-xs font-semibold flex items-center gap-2 border-b border-emerald-700 shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Main Content Area (Sidebar File List + Code Preview) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/70 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0 max-h-48 md:max-h-full overflow-hidden">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pilih Berkas ({fileList.length})</span>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 no-scrollbar">
              {fileList.map((file) => {
                const isSelected = file === selectedFile;
                const fileName = file.split('/').pop() || file;
                const folderName = file.includes('/')
                  ? file.split('/').slice(0, -1).join('/')
                  : '';

                return (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 truncate">
                      <div className="truncate">{fileName}</div>
                      {folderName && (
                        <div className="text-[9px] text-slate-500 truncate">{folderName}/</div>
                      )}
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
            {/* Action Bar for Current File */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-200 truncate">
                  {selectedFile}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono hidden sm:inline">
                  {fileContent.split('\n').length} baris
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadSingleFile}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Unduh berkas ini saja"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh Berkas</span>
                </button>

                <button
                  onClick={handleCopy}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Content Container */}
            <div className="flex-1 p-3 sm:p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed selection:bg-emerald-500 selection:text-slate-950">
              {isLoading ? (
                <div className="flex items-center justify-center h-48 text-slate-500 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  <span>Memuat isi kode {selectedFile}...</span>
                </div>
              ) : (
                <pre className="whitespace-pre tab-4 select-text">
                  <code>{fileContent}</code>
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer info & Acode Instructions */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Petunjuk Acode:</strong> Buat berkas baru di Acode dengan nama yang sama, lalu klik <strong>Salin Kode</strong> di atas dan tempel (paste).
            </span>
          </div>

          <button
            onClick={onClose}
            className="self-end sm:self-auto px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
