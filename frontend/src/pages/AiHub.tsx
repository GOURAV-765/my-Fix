import React, { useState } from 'react';
import AnimatedPage from '../components/AnimatedPage.js';
import { useForm } from 'react-hook-form';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
 Cpu,
 Loader2,
 Bookmark,
 Zap,
} from 'lucide-react';

const AiHub: React.FC = () => {
 const { showToast } = useToast();
 const { user } = useAuth();
 const [generating, setGenerating] = useState(false);
 const [writeResult, setWriteResult] = useState('');

 const { register: writeReg, handleSubmit: writeSub } = useForm<{
 type: string;
 prompt: string;
 }>();

 const handleGenerateWriting = async (data: any) => {
 try {
 setGenerating(true);
 setWriteResult('');
 const res = await api.post('/ai/generate-writing', data);
 if (res.data?.success) {
 setWriteResult(res.data.result);
 showToast('AI copy generated!', 'success');
 }
 } catch (err: any) {
 showToast('Failed to generate text.', 'error');
 } finally {
 setGenerating(false);
 }
 };

 return (
 <AnimatedPage>
 <div className="p-6 max-w-7xl mx-auto space-y-8">
 {/* Header */}
 <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-850 pb-6 animate-fadeIn">
 <div className="space-y-1">
 <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-ieeeBlue via-techTeal to-pink-400">
 AI Productivity Suite
 </h1>
 <p className="text-sm text-textMuted">
 Powered by Google Gemini: generate announcements, draft social copy, review tech resumes.
 </p>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex border-b border-slate-850 gap-6 text-sm">
 <button
 className="pb-3 font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer text-ieeeBlue border-ieeeBlue"
 >
 <Zap className="h-4 w-4" />
 Content & Minutes Copywriters
 </button>
 </div>

 {/* Writer Tool */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
 {/* Input Panel */}
 <div className="lg:col-span-1 bg-cardBg shadow-sm p-6 rounded-xl border border-border space-y-4 self-start">
 <h3 className="font-extrabold text-textPrimary text-sm">Generation Parameters</h3>
 <form onSubmit={writeSub(handleGenerateWriting)} className="space-y-4 text-xs">
 <div>
 <label className="block text-textMuted mb-1">Content Type</label>
 <select
 {...writeReg('type')}
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-slate-250 focus:outline-none cursor-pointer"
 >
 <option value="caption">Social Media Poster Caption</option>
 <option value="minutes">Meeting Minutes & Actions Summarizer</option>
 <option value="announcement">Official Society Announcement</option>
 </select>
 </div>
 <div>
 <label className="block text-textMuted mb-1">Raw Context / Key points</label>
 <textarea
 required
 {...writeReg('prompt')}
 placeholder="Enter agenda points or poster keywords..."
 rows={6}
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none resize-none"
 />
 </div>
 <button
 type="submit"
 disabled={generating}
 className="w-full bg-ieeeBlue hover:bg-ieeeBlue text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
 >
 {generating ? (
 <Loader2 className="h-3.5 w-3.5 animate-spin" />
 ) : (
 <Cpu className="h-3.5 w-3.5" />
 )}
 Generate Content
 </button>
 </form>
 </div>

 {/* Output Display */}
 <div className="lg:col-span-2 space-y-4">
 <h3 className="font-extrabold text-textPrimary text-sm flex items-center gap-2">
 <Bookmark className="h-5 w-5 text-ieeeBlue" />
 Generated Document Summary
 </h3>
 <div className="bg-cardBg shadow-sm p-6 rounded-xl border border-border bg-appBg/30 min-h-[300px]">
 {writeResult ? (
 <div className="text-textBody text-xs whitespace-pre-wrap leading-relaxed">
 {writeResult}
 </div>
 ) : (
 <div className="flex h-[250px] items-center justify-center text-slate-500 text-xs">
 Awaiting generation inputs...
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </AnimatedPage>
 );
};


export default AiHub;
