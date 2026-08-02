import React, { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage.js';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
 User,
 FileText,
 Globe,
 Settings,
 Trophy,
 Code2,
 FolderGit2,
 Calendar,
 Plus,
 Loader2,
 CheckCircle2,
 TrendingUp,
 XCircle,
} from 'lucide-react';

interface PortfolioData {
 id: string;
 firstName: string;
 lastName: string;
 avatarUrl: string | null;
 unitNumber: string;
 phone: string | null;
 bio: string | null;
 skills: string | null;
 githubUrl: string | null;
 linkedinUrl: string | null;
 resumeUrl: string | null;
 portfolioUrl: string | null;
 techStack: string | null;
 totalScore: number;
 contributions: Array<{
 id: string;
 activityType: string;
 description: string;
 scorePoints: number;
 date: string;
 }>;
 projectMembers: Array<{
 id: string;
 role: string;
 project: {
 id: string;
 title: string;
 status: string;
 };
 }>;
 awardNominations: Array<{
 id: string;
 period: string;
 awardRule: {
 name: string;
 };
 }>;
}

const Portfolio: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const { showToast } = useToast();
 const { user } = useAuth();
 
 // Default to logged-in user member ID if no ID in URL parameters
 const memberId = id || user?.member?.id;

 const [data, setData] = useState<PortfolioData | null>(null);
 const [loading, setLoading] = useState(true);
 const [editModalOpen, setEditModalOpen] = useState(false);

 const { register, handleSubmit, reset } = useForm<{
 bio: string;
 skills: string;
 techStack: string;
 githubUrl: string;
 linkedinUrl: string;
 resumeUrl: string;
 portfolioUrl: string;
 }>();

const defaultPortfolioData: PortfolioData = {
 id: 'mem_admin',
 firstName: 'Gourav',
 lastName: 'Admin',
 avatarUrl: null,
 unitNumber: 'Admin-1',
 phone: '9876543210',
 bio: 'Core Lead & Software Engineer for IEEE Student Chapter. Passionate about embedded systems, full-stack web applications, and AI innovation.',
 skills: 'React, Node.js, TypeScript, Python, C++, PCB Design, Git, Docker',
 techStack: 'React 19, Express, Prisma, SQLite, Tailwind CSS',
 githubUrl: 'https://github.com',
 linkedinUrl: 'https://linkedin.com',
 resumeUrl: '',
 portfolioUrl: 'https://ieee.org',
 totalScore: 183.5,
 contributions: [
 {
 id: 'contrib_1',
 activityType: 'TECHNICAL',
 description: 'Built the IEEE Portal frontend with React & GSAP animations.',
 scorePoints: 50,
 date: '2026-07-10T00:00:00Z'
 },
 {
 id: 'contrib_2',
 activityType: 'WORKSHOP',
 description: 'Organized the PCB Soldering Bootcamp for 30 members.',
 scorePoints: 35,
 date: '2026-06-22T00:00:00Z'
 },
 {
 id: 'contrib_3',
 activityType: 'VOLUNTEER',
 description: 'Volunteer coordinator for Annual IEEE Tech Symposium.',
 scorePoints: 25,
 date: '2026-05-15T00:00:00Z'
 }
 ],
 projectMembers: [
 {
 id: 'pm_1',
 role: 'LEAD',
 project: { id: 'proj_1', title: 'IEEE Portal Mobile App', status: 'DEVELOPMENT' }
 }
 ],
 awardNominations: [
 { id: 'nom_1', period: '2026-07', awardRule: { name: 'Best Developer Award' } }
 ]
};

 const getFormValues = (p: PortfolioData) => ({
 bio: p.bio || '',
 skills: p.skills || '',
 techStack: p.techStack || '',
 githubUrl: p.githubUrl || '',
 linkedinUrl: p.linkedinUrl || '',
 resumeUrl: p.resumeUrl || '',
 portfolioUrl: p.portfolioUrl || '',
 });

 const fetchPortfolio = async () => {
 setLoading(true);
 try {
 if (memberId) {
 const res = await api.get(`/portfolio/${memberId}`);
 if (res.data?.success && res.data.portfolio) {
 setData(res.data.portfolio);
 reset(getFormValues(res.data.portfolio));
 setLoading(false);
 return;
 }
 }
 setData(defaultPortfolioData);
 reset(getFormValues(defaultPortfolioData));
 } catch {
 setData(defaultPortfolioData);
 reset(getFormValues(defaultPortfolioData));
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchPortfolio();
 }, [memberId]);

 const handleUpdatePortfolio = async (formData: any) => {
 try {
 const res = await api.put('/portfolio', formData);
 if (res.data?.success) {
 showToast('Portfolio profile updated successfully.', 'success');
 setEditModalOpen(false);
 fetchPortfolio();
 }
 } catch (err: any) {
 showToast('Failed to update portfolio.', 'error');
 }
 };

 if (loading) {
 return (
 <div className="flex h-[400px] items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-ieeeBlue" />
 </div>
 );
 }

 if (!data) {
 return (
 <div className="bg-cardBg shadow-sm p-20 rounded-xl border border-border text-center max-w-lg mx-auto">
 <User className="h-10 w-10 text-slate-700 mx-auto mb-4" />
 <p className="text-sm text-slate-500">Portfolio record not found.</p>
 </div>
 );
 }

 const isOwnProfile = user?.member?.id === data.id;

 return (
 <AnimatedPage>
 <div className="p-6 max-w-7xl mx-auto space-y-8">
 {/* 1. Profile Hero Section */}
 <div className="bg-cardBg shadow-sm p-6 md:p-8 rounded-3xl border border-border shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 bg-cardBg">
 <div className="absolute top-0 right-0 w-48 h-48 bg-ieeeBlue/5 rounded-full blur-3xl -mr-20 -mt-20" />
 
 {/* Avatar */}
 {data.avatarUrl ? (
 <img src={data.avatarUrl} alt={data.firstName} className="h-28 w-28 rounded-xl object-cover border-2 border-ieeeBlue/20 shadow-md" />
 ) : (
 <div className="h-28 w-28 rounded-xl bg-gradient-to-tr from-ieeeBlue/10 to-techTeal/10 border-2 border-ieeeBlue/20 flex items-center justify-center text-ieeeBlue font-extrabold text-4xl shadow-md">
 {data.firstName[0]}
 {data.lastName[0]}
 </div>
 )}

 {/* Info */}
 <div className="flex-1 space-y-4 text-center md:text-left">
 <div className="space-y-2">
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
 <h2 className="text-2xl md:text-3xl font-extrabold text-textPrimary">
 {data.firstName} {data.lastName}
 </h2>
 <span className="text-[10px] font-bold bg-ieeeBlue/15 border border-ieeeBlue/30 text-ieeeBlue px-2.5 py-0.5 rounded-full uppercase tracking-wider">
 IEEE Member
 </span>
 </div>
 <p className="text-xs text-textMuted max-w-xl leading-relaxed">
 {data.bio || 'This member has not written a bio yet.'}
 </p>
 </div>

 {/* Social Links */}
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-textMuted text-xs">
 {data.githubUrl && (
 <a href={data.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-textPrimary transition-colors">
 <FolderGit2 className="h-4 w-4" /> GitHub
 </a>
 )}
 {data.linkedinUrl && (
 <a href={data.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-textPrimary transition-colors">
 <User className="h-4 w-4" /> LinkedIn
 </a>
 )}
 {data.resumeUrl && (
 <a href={data.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-textPrimary transition-colors">
 <FileText className="h-4 w-4" /> Resume
 </a>
 )}
 {data.portfolioUrl && (
 <a href={data.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-textPrimary transition-colors">
 <Globe className="h-4 w-4" /> Personal Website
 </a>
 )}
 </div>
 </div>

 {/* Action Button */}
 {isOwnProfile && (
 <button
 onClick={() => setEditModalOpen(true)}
 className="md:self-start bg-appBg/80 hover:bg-cardBg border border-border hover:border-border text-textBody hover:text-slate-250 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
 >
 <Settings className="h-4 w-4" />
 Edit Profile
 </button>
 )}
 </div>

 {/* 2. Grid Sections */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left Columns (Contribution Analytics, Projects, Awards) */}
 <div className="lg:col-span-2 space-y-8">
 
 {/* Projects Contributed To */}
 <div className="bg-cardBg shadow-sm p-6 rounded-3xl border border-border space-y-4">
 <h3 className="text-base font-extrabold text-textPrimary flex items-center gap-2">
 <FolderGit2 className="h-5 w-5 text-ieeeBlue" />
 Active Projects Mapped
 </h3>
 {data.projectMembers.length === 0 ? (
 <p className="text-xs text-slate-500">Not participating in active project workspaces yet.</p>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {data.projectMembers.map((pm) => (
 <div key={pm.id} className="bg-appBg/40 p-4 rounded-xl border border-slate-850 space-y-2">
 <div className="flex justify-between items-center">
 <h4 className="font-bold text-slate-350 text-xs">{pm.project.title}</h4>
 <span className="text-[8px] font-bold bg-cardBg border border-border text-slate-500 px-2 py-0.5 rounded-full uppercase">
 {pm.project.status}
 </span>
 </div>
 <p className="text-[10px] text-ieeeBlue font-semibold uppercase tracking-wider">Role: {pm.role}</p>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Activity Timeline / Logs */}
 <div className="bg-cardBg shadow-sm p-6 rounded-3xl border border-border space-y-4">
 <h3 className="text-base font-extrabold text-textPrimary flex items-center gap-2">
 <Calendar className="h-5 w-5 text-techTeal" />
 Contribution Timeline Logs
 </h3>
 {data.contributions.length === 0 ? (
 <p className="text-xs text-slate-500 font-serif">No activities logged yet.</p>
 ) : (
 <div className="space-y-4">
 {data.contributions.map((act) => (
 <div key={act.id} className="flex gap-4 items-start relative border-l border-slate-850 pl-4 pb-2">
 <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-ieeeBlue/20 border border-ieeeBlue" />
 <div className="flex-1">
 <div className="flex justify-between items-start gap-2">
 <span className="text-[10px] text-slate-500 font-mono">
 {new Date(act.date).toLocaleDateString()}
 </span>
 <span className="text-[10px] text-success font-bold">+{act.scorePoints} Points</span>
 </div>
 <h4 className="font-bold text-slate-350 text-xs mt-1">{act.description}</h4>
 <span className="text-[9px] text-ieeeBlue font-bold uppercase tracking-wider block mt-0.5">
 Category: {act.activityType}
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Right Columns (Metrics, Badges, Tech Stack) */}
 <div className="lg:col-span-1 space-y-8">
 
 {/* Analytics Stats */}
 <div className="bg-cardBg shadow-sm p-6 rounded-3xl border border-border space-y-5 bg-gradient-to-br from-ieeeBlue/10 via-techTeal/5 to-slate-900/30">
 <h3 className="text-base font-extrabold text-textPrimary flex items-center gap-2">
 <TrendingUp className="h-5 w-5 text-success" />
 Contribution Analytics
 </h3>
 <div className="text-center bg-appBg/50 p-6 rounded-xl border border-slate-900/80">
 <span className="text-5xl font-black tracking-tight text-white block">
 {data.totalScore}
 </span>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-2">
 Overall Contribution Score
 </p>
 </div>
 </div>

 {/* Badges / Verified Awards */}
 <div className="bg-cardBg shadow-sm p-6 rounded-3xl border border-border space-y-4">
 <h3 className="text-base font-extrabold text-textPrimary flex items-center gap-2">
 <Trophy className="h-5 w-5 text-warning" />
 Verified Badges ({data.awardNominations.length})
 </h3>
 {data.awardNominations.length === 0 ? (
 <p className="text-xs text-slate-500">No verified badges claimed yet.</p>
 ) : (
 <div className="space-y-3">
 {data.awardNominations.map((nom) => (
 <div key={nom.id} className="bg-appBg/40 p-3.5 rounded-xl border border-slate-850 flex items-center gap-3">
 <div className="h-9 w-9 rounded-full bg-warning/10 border border-warning/20 text-warning flex items-center justify-center shrink-0">
 <Trophy className="h-4.5 w-4.5" />
 </div>
 <div>
 <h4 className="font-bold text-slate-250 text-xs">{nom.awardRule.name}</h4>
 <p className="text-[9px] text-slate-500">Period: {nom.period}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Skills & Tech Stack */}
 <div className="bg-cardBg shadow-sm p-6 rounded-3xl border border-border space-y-5">
 <h3 className="text-base font-extrabold text-textPrimary flex items-center gap-2">
 <Code2 className="h-5 w-5 text-ieeeBlue" />
 Technical Stack
 </h3>
 <div className="space-y-4 text-xs">
 <div>
 <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">
 Skills:
 </span>
 <div className="flex flex-wrap gap-2">
 {(data.skills || '').split(',').filter(Boolean).map((skill, idx) => (
 <span key={idx} className="bg-cardBg border border-border text-textBody px-2.5 py-1 rounded-xl text-[10px]">
 {skill.trim()}
 </span>
 ))}
 </div>
 </div>
 <div>
 <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-2">
 Languages & Frameworks:
 </span>
 <div className="flex flex-wrap gap-2">
 {(data.techStack || '').split(',').filter(Boolean).map((tech, idx) => (
 <span key={idx} className="bg-ieeeBlue/10 border border-ieeeBlue/20 text-ieeeBlue px-2.5 py-1 rounded-xl text-[10px] font-mono">
 {tech.trim()}
 </span>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Edit Profile Modal */}
 {editModalOpen && (
 <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
 <div className="bg-cardBg shadow-sm p-6 rounded-xl border border-border max-w-lg w-full my-8 space-y-6">
 <div className="flex justify-between items-center">
 <h2 className="text-lg font-bold text-slate-250">Edit Portfolio Details</h2>
 <button onClick={() => setEditModalOpen(false)} className="text-slate-500 hover:text-textMuted cursor-pointer">
 <XCircle className="h-5 w-5" />
 </button>
 </div>
 <form onSubmit={handleSubmit(handleUpdatePortfolio)} className="space-y-4 text-xs">
 <div>
 <label className="block text-textMuted mb-1">Biography Profile Bio</label>
 <textarea
 {...register('bio')}
 placeholder="Tell peers about your focus, experience, and timeline goals..."
 rows={4}
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none resize-none"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-textMuted mb-1">Skills (Comma-separated)</label>
 <input
 type="text"
 {...register('skills')}
 placeholder="WebDev, Public Speaking, Writing"
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-textMuted mb-1">Languages & Tech Stack</label>
 <input
 type="text"
 {...register('techStack')}
 placeholder="React, SQLite, TypeScript"
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-textMuted mb-1">GitHub Profile Link</label>
 <input
 type="url"
 {...register('githubUrl')}
 placeholder="https://github.com/..."
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-textMuted mb-1">LinkedIn Profile Link</label>
 <input
 type="url"
 {...register('linkedinUrl')}
 placeholder="https://linkedin.com/in/..."
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-textMuted mb-1">Resume File Link</label>
 <input
 type="url"
 {...register('resumeUrl')}
 placeholder="Link to GDrive / Dropbox PDF"
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-textMuted mb-1">Portfolio Link</label>
 <input
 type="url"
 {...register('portfolioUrl')}
 placeholder="https://..."
 className="w-full bg-cardBg border border-border rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none"
 />
 </div>
 </div>
 <button type="submit" className="w-full bg-ieeeBlue hover:bg-ieeeBlue text-white font-bold py-2.5 rounded-xl cursor-pointer">
 Save Profile Changes
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 </AnimatedPage>
 );
};

export default Portfolio;
