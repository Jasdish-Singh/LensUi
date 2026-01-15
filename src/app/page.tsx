'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Code2, Loader2, RefreshCw, Send, Eye, Copy, Check } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [instruction, setInstruction] = useState(""); 
  const [view, setView] = useState<'preview' | 'code'>('preview'); 
  const [copied, setCopied] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const generateCode = async (base64Image: string, prompt?: string) => {
    setLoading(true);
    if (!prompt) setCode(""); 
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64Image,
          currentCode: code,
          instruction: prompt 
        }),
      });

      const data = await res.json();
      if (data.code) {
        setCode(data.code);
        setInstruction("");
        setView('preview'); 
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setImage(base64);
      generateCode(base64);
    }
  }, []);

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (image && instruction) {
      generateCode(image, instruction);
    }
  };

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetApp = () => {
    setImage(null);
    setCode("");
    setLoading(false);
    setInstruction("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: { 'image/*': [] },
    onDrop,
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col font-sans">
      <header className="h-16 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg">LensUI <span className="text-neutral-500 font-normal text-sm ml-2">v1.0</span></h1>
        </div>
        {image && (
          <button onClick={resetApp} className="text-sm flex items-center gap-2 text-neutral-400 hover:text-white transition">
            <RefreshCw className="w-4 h-4" /> New Screenshot
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        <div className="w-full md:w-1/2 bg-neutral-900/50 border-r border-neutral-800 flex flex-col">
          <div className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-800">Reference Image</div>
          <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-neutral-900">
            {image ? (
              <img src={image} alt="Reference" className="w-full h-auto object-contain rounded-lg shadow-lg" />
            ) : (
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center transition cursor-pointer w-full max-w-md ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-700 hover:border-neutral-500'}`}>
                <input {...getInputProps()} />
                <div className="bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">Upload Screenshot</h3>
                <p className="text-neutral-500 text-sm">Drag & drop or click to upload</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white flex flex-col relative">
          <div className="h-[49px] border-b border-neutral-200 bg-neutral-50 flex items-center justify-between px-4">
            <div className="flex bg-neutral-200 rounded-md p-1 gap-1">
              <button onClick={() => setView('preview')} className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-sm transition ${view === 'preview' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                <Eye className="w-3 h-3" /> Preview
              </button>
              <button onClick={() => setView('code')} className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-sm transition ${view === 'code' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                <Code2 className="w-3 h-3" /> Code
              </button>
            </div>
            <div className="flex items-center gap-3">
              {loading && <span className="text-xs text-blue-600 animate-pulse font-medium">Generating...</span>}
              {view === 'code' && code && (
                <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-black transition">
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 w-full h-full relative bg-neutral-100 overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-neutral-800 z-10 bg-white/80 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="font-medium text-neutral-600 animate-pulse">{instruction ? "Refining code..." : "Building LensUI..."}</p>
              </div>
            )}
            <div className={`w-full h-full ${view === 'preview' ? 'block' : 'hidden'}`}>
              {code ? <iframe className="w-full h-full border-none" srcDoc={code} title="Preview" sandbox="allow-scripts" /> : <div className="flex flex-col items-center justify-center h-full text-neutral-400"><p>Upload an image to see the magic.</p></div>}
            </div>
            <div className={`w-full h-full overflow-auto bg-neutral-900 text-neutral-300 p-6 ${view === 'code' ? 'block' : 'hidden'}`}>
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">{code || "// Code will appear here..."}</pre>
            </div>
          </div>

          {code && (
            <div className="p-4 bg-white border-t border-neutral-200">
              <form onSubmit={handleRefine} className="flex gap-2">
                <input type="text" value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Refine UI (e.g., 'Make buttons bigger')..." className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={loading || !instruction} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"><Send className="w-4 h-4" /> Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}