import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { Network, Plus, Users, Loader2, XCircle, Shield } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage.js';

interface Department {
 id: string;
 name: string;
 description: string | null;
 _count: {
 members: number;
 };
}

interface Member {
 id: string;
 userId: string;
 firstName: string;
 lastName: string;
}

interface Role {
 id: string;
 name: string;
}

const Departments: React.FC = () => {
 const { showToast } = useToast();
 
 const [departments, setDepartments] = useState<Department[]>([]);
 const [members, setMembers] = useState<Member[]>([]);
 const [roles, setRoles] = useState<Role[]>([]);
 const [loading, setLoading] = useState(true);
 
 const [modalOpen, setModalOpen] = useState(false);
 const [assignModalOpen, setAssignModalOpen] = useState(false);
 const [selectedDept, setSelectedDept] = useState<string | null>(null);

 const { register, handleSubmit, reset } = useForm<{ name: string; description: string }>();
 const { register: registerAssign, handleSubmit: handleAssignSubmit, reset: resetAssign } = useForm<{ userId: string; roleId: string }>();

 const fetchDepartments = async () => {
 try {
 const res = await api.get('/departments');
 if (res.data?.success) {
 setDepartments(res.data.data);
 }
 } catch (error) {
 console.error('Error fetching departments:', error);
 showToast('Failed to fetch departments', 'error');
 }
 };

 const fetchMembers = async () => {
 try {
 const res = await api.get('/members');
 if (res.data?.success) {
 setMembers(res.data.data);
 }
 } catch (error) {
 console.error('Error fetching members:', error);
 }
 };

 const fetchRoles = async () => {
 try {
 const res = await api.get('/members/roles');
 if (res.data?.success) {
 setRoles(res.data.data);
 }
 } catch (error) {
 console.error('Error fetching roles:', error);
 }
 };

 useEffect(() => {
 Promise.all([fetchDepartments(), fetchMembers(), fetchRoles()]).finally(() => setLoading(false));
 }, []);

 const onSubmit = async (data: { name: string; description: string }) => {
 try {
 const res = await api.post('/departments', data);
 if (res.data?.success) {
 showToast('Department created successfully', 'success');
 setModalOpen(false);
 reset();
 fetchDepartments();
 }
 } catch (error) {
 console.error('Error creating department:', error);
 showToast('Failed to create department', 'error');
 }
 };

 const onAssignSubmit = async (data: { userId: string; roleId: string }) => {
 if (!selectedDept) return;
 try {
 const res = await api.post(`/departments/${selectedDept}/users`, data);
 if (res.data?.success) {
 showToast('User assigned to department', 'success');
 setAssignModalOpen(false);
 resetAssign();
 fetchDepartments();
 }
 } catch (error) {
 console.error('Error assigning user:', error);
 showToast('Failed to assign user', 'error');
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <Loader2 className="h-8 w-8 text-ieeeBlue animate-spin" />
 </div>
 );
 }

 return (
 <AnimatedPage>
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
 <Network className="h-6 w-6 text-ieeeBlue" />
 Departments
 </h1>
 <p className="text-sm text-textMuted mt-1">Manage society departments and their members</p>
 </div>
 <button
 onClick={() => setModalOpen(true)}
 className="flex items-center gap-2 px-4 py-2 bg-ieeeBlue hover:bg-ieeeBlue text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-ieeeBlue/20"
 >
 <Plus size={16} />
 Create Department
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {departments.map((dept) => (
 <div key={dept.id} className="bg-cardBg shadow-sm p-6 rounded-xl flex flex-col h-full border border-slate-200 hover:border-ieeeBlue/30 transition-all duration-300">
 <div className="flex-1">
 <h3 className="text-lg font-semibold text-textPrimary">{dept.name}</h3>
 <p className="text-sm text-textMuted mt-2 line-clamp-3">
 {dept.description || 'No description provided.'}
 </p>
 </div>
 <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
 <div className="flex items-center gap-2 text-sm text-textMuted">
 <Users size={16} className="text-slate-500" />
 <span>{dept._count.members} Members</span>
 </div>
 <button
 onClick={() => {
 setSelectedDept(dept.id);
 setAssignModalOpen(true);
 }}
 className="px-3 py-1.5 text-xs font-medium text-ieeeBlue hover:text-white hover:bg-ieeeBlue rounded-lg transition-colors border border-ieeeBlue/20"
 >
 Assign User
 </button>
 </div>
 </div>
 ))}
 {departments.length === 0 && (
 <div className="col-span-full py-12 text-center text-textMuted bg-cardBg shadow-sm rounded-xl border border-slate-200 border-dashed">
 <Network size={48} className="mx-auto text-slate-600 mb-3" />
 <p>No departments found.</p>
 </div>
 )}
 </div>

 {/* Create Department Modal */}
 {modalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-appBg/80 animate-fadeIn">
 <div className="bg-cardBg border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
 <div className="flex justify-between items-center p-6 border-b border-slate-200">
 <h2 className="text-xl font-semibold text-textPrimary flex items-center gap-2">
 <Network className="text-ieeeBlue" size={20} />
 New Department
 </h2>
 <button onClick={() => setModalOpen(false)} className="text-textMuted hover:text-textPrimary transition-colors">
 <XCircle size={20} />
 </button>
 </div>
 <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium text-textBody mb-1">Name</label>
 <input
 {...register('name', { required: true })}
 className="w-full bg-appBg border border-slate-200 rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none focus:border-ieeeBlue"
 placeholder="e.g. IT, Finance, Security"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-textBody mb-1">Description</label>
 <textarea
 {...register('description')}
 rows={3}
 className="w-full bg-appBg border border-slate-200 rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none focus:border-ieeeBlue"
 placeholder="Brief description of the department..."
 />
 </div>
 <div className="pt-4 flex gap-3">
 <button
 type="button"
 onClick={() => setModalOpen(false)}
 className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-textBody hover:bg-slate-100 transition-colors font-medium text-sm"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="flex-1 px-4 py-2.5 bg-ieeeBlue hover:bg-ieeeBlue text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-ieeeBlue/20"
 >
 Create
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Assign User Modal */}
 {assignModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-appBg/80 animate-fadeIn">
 <div className="bg-cardBg border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
 <div className="flex justify-between items-center p-6 border-b border-slate-200">
 <h2 className="text-xl font-semibold text-textPrimary flex items-center gap-2">
 <Shield className="text-ieeeBlue" size={20} />
 Assign User
 </h2>
 <button onClick={() => setAssignModalOpen(false)} className="text-textMuted hover:text-textPrimary transition-colors">
 <XCircle size={20} />
 </button>
 </div>
 <form onSubmit={handleAssignSubmit(onAssignSubmit)} className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium text-textBody mb-1">Select User</label>
 <select
 {...registerAssign('userId', { required: true })}
 className="w-full bg-appBg border border-slate-200 rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none focus:border-ieeeBlue"
 >
 <option value="">Choose a user...</option>
 {members.map(m => (
 <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-textBody mb-1">Role ID</label>
 <select
 {...registerAssign('roleId', { required: true })}
 className="w-full bg-appBg border border-slate-200 rounded-xl px-4 py-2.5 text-textPrimary focus:outline-none focus:border-ieeeBlue"
 >
 <option value="">Select a role...</option>
 {roles.map(r => (
 <option key={r.id} value={r.id}>{r.name}</option>
 ))}
 </select>
 </div>
 <div className="pt-4 flex gap-3">
 <button
 type="button"
 onClick={() => setAssignModalOpen(false)}
 className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-textBody hover:bg-slate-100 transition-colors font-medium text-sm"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="flex-1 px-4 py-2.5 bg-ieeeBlue hover:bg-ieeeBlue text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-ieeeBlue/20"
 >
 Assign
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 </AnimatedPage>
 );
};

export default Departments;
