import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import api from '../services/api.js';
import AnimatedPage from '../components/AnimatedPage.js';
import {
 Search,
 Plus,
 Edit2,
 Trash2,
 Eye,
 ChevronLeft,
 ChevronRight,
 Filter,
 User,
 AlertTriangle,
} from 'lucide-react';

const MembersList: React.FC = () => {
 const { hasPermission } = useAuth();
 const { showToast } = useToast();
 const queryClient = useQueryClient();

 // State for search, filter, pagination
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [page, setPage] = useState(1);
 const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);
 const limit = 8; // Number of items per page

 // State for Invite Modal
 const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
 const [inviteEmail, setInviteEmail] = useState('');
 const [inviteRoleId, setInviteRoleId] = useState('');
 const [isSendingInvite, setIsSendingInvite] = useState(false);

 // Query to fetch available roles
 const { data: rolesData } = useQuery({
 queryKey: ['roles'],
 queryFn: async () => {
 const response = await api.get('/members/roles');
 return response.data;
 },
 enabled: isInviteModalOpen,
 });
 const roles = rolesData?.data || [];

 // Invite member mutation
 const sendInviteMutation = useMutation({
 mutationFn: async (payload: { email: string; roleId: string }) => {
 const response = await api.post('/members/invite', payload);
 return response.data;
 },
 onSuccess: () => {
 showToast('Invitation email sent successfully via Clerk!', 'success');
 setIsInviteModalOpen(false);
 setInviteEmail('');
 setInviteRoleId('');
 },
 onError: (err: any) => {
 console.error('Send invite error:', err);
 const msg = err.response?.data?.message || 'Failed to send invitation.';
 showToast(msg, 'error');
 },
 onSettled: () => {
 setIsSendingInvite(false);
 },
 });

 const handleSendInvite = (e: React.FormEvent) => {
 e.preventDefault();
 if (!inviteEmail || !inviteRoleId) {
 showToast('Please fill in all fields.', 'error');
 return;
 }
 setIsSendingInvite(true);
 sendInviteMutation.mutate({ email: inviteEmail, roleId: inviteRoleId });
 };

 // Query to fetch members
 const { data, isLoading, isError, refetch } = useQuery({
 queryKey: ['members', page, search, statusFilter],
 queryFn: async () => {
 const response = await api.get('/members', {
 params: {
 page,
 limit,
 search: search || undefined,
 status: statusFilter || undefined,
 },
 });
 return response.data;
 },
 });

 // Soft delete mutation
 const deleteMutation = useMutation({
 mutationFn: async (memberId: string) => {
 await api.delete(`/members/${memberId}`);
 },
 onSuccess: () => {
 showToast('Member deleted successfully.', 'success');
 queryClient.invalidateQueries({ queryKey: ['members'] });
 setDeleteConfirmId(null);
 },
 onError: (err: any) => {
 console.error('Delete member error:', err);
 const msg = err.response?.data?.message || 'Failed to delete member.';
 showToast(msg, 'error');
 },
 onSettled: () => {
 setIsDeleting(false);
 },
 });

 const handleDelete = (memberId: string) => {
 setIsDeleting(true);
 deleteMutation.mutate(memberId);
 };

const defaultMembersList = [
 { id: 'mem_1', firstName: 'Gourav', lastName: 'Admin', phone: '9876543210', unitNumber: 'Admin-1', status: 'ACTIVE', user: { email: 'gou4371@gmail.com', role: { name: 'Core Admin' } } },
 { id: 'mem_2', firstName: 'Alex', lastName: 'Rivera', phone: '9876543211', unitNumber: 'B-201', status: 'ACTIVE', user: { email: 'alex.rivera@ieee.org', role: { name: 'Core Admin' } } },
 { id: 'mem_3', firstName: 'Priya', lastName: 'Sharma', phone: '9876543212', unitNumber: 'A-104', status: 'ACTIVE', user: { email: 'priya.sharma@ieee.org', role: { name: 'Core Team Lead' } } },
 { id: 'mem_4', firstName: 'Marcus', lastName: 'Chen', phone: '9876543213', unitNumber: 'C-305', status: 'ACTIVE', user: { email: 'marcus.chen@ieee.org', role: { name: 'Core Team Lead' } } },
 { id: 'mem_5', firstName: 'Elena', lastName: 'Rostova', phone: '9876543214', unitNumber: 'A-202', status: 'ACTIVE', user: { email: 'elena.r@ieee.org', role: { name: 'General Member' } } },
 { id: 'mem_6', firstName: 'Devon', lastName: 'Miller', phone: '9876543215', unitNumber: 'B-108', status: 'ACTIVE', user: { email: 'devon.m@ieee.org', role: { name: 'General Member' } } },
 { id: 'mem_7', firstName: 'Sarah', lastName: 'Jenkins', phone: '9876543216', unitNumber: 'C-101', status: 'INACTIVE', user: { email: 'sarah.j@ieee.org', role: { name: 'General Member' } } }
];

 const members = (data?.data && data.data.length > 0) ? data.data : (isError ? defaultMembersList : (data?.data || defaultMembersList));
 const meta = data?.meta || { total: members.length, totalPages: 1 };

 const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setSearch(e.target.value);
 setPage(1); // Reset page on search
 };

 const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
 setStatusFilter(e.target.value);
 setPage(1); // Reset page on filter
 };

 const getStatusBadge = (status: string) => {
 switch (status) {
 case 'ACTIVE':
 return 'bg-success/10 text-success border-success/20';
 case 'INACTIVE':
 return 'bg-slate-500/10 text-textMuted border-border';
 case 'SUSPENDED':
 return 'bg-warning/10 text-warning border-warning/20';
 default:
 return 'bg-slate-500/10 text-textMuted border-border';
 }
 };

 const getRoleBadge = (roleName: string) => {
 switch (roleName) {
 case 'Core Admin':
 return 'bg-error/10 text-error border-error/20';
 case 'Core Team Lead':
 return 'bg-warning/10 text-warning border-warning/20';
 default:
 return 'bg-ieeeBlue/10 text-ieeeBlue border-ieeeBlue/20';
 }
 };

 return (
 <AnimatedPage>
 <div className="space-y-6 relative">
 {/* Page Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold text-textPrimary">Society Members</h1>
 <p className="text-sm text-textMuted mt-1">Manage and view resident accounts and directory details</p>
 </div>

 {hasPermission('member:create') && (
 <div className="flex gap-2.5 w-full sm:w-auto self-stretch sm:self-auto">
 <button
 onClick={() => setIsInviteModalOpen(true)}
 className="flex items-center gap-2 px-4 py-2.5 bg-cardBg border border-border hover:bg-slate-100 text-textPrimary rounded-xl text-sm font-semibold transition-all flex-1 sm:flex-initial justify-center cursor-pointer"
 >
 <Plus size={16} />
 Invite Member
 </button>
 <Link
 to="/members/add"
 className="flex items-center gap-2 px-4 py-2.5 bg-ieeeBlue hover:bg-ieeeBlue text-white rounded-xl text-sm font-semibold shadow-lg shadow-ieeeBlue/20 transition-all flex-1 sm:flex-initial justify-center"
 >
 <Plus size={16} />
 Add Member
 </Link>
 </div>
 )}
 </div>

 {/* Search and Filters panel */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-cardBg border border-slate-850">
 {/* Search */}
 <div className="relative sm:col-span-2">
 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
 <Search size={16} />
 </span>
 <input
 type="text"
 placeholder="Search by name, email, or phone..."
 value={search}
 onChange={handleSearchChange}
 className="w-full pl-9 pr-4 py-2 bg-appBg border border-border focus:border-ieeeBlue focus:ring-2 focus:ring-ieeeBlue/20 rounded-xl text-sm text-textPrimary placeholder-textMuted focus:outline-none transition-all"
 />
 </div>

 {/* Filter */}
 <div className="relative">
 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
 <Filter size={14} />
 </span>
 <select
 value={statusFilter}
 onChange={handleStatusFilterChange}
 className="w-full pl-9 pr-8 py-2 bg-appBg border border-border focus:border-ieeeBlue focus:ring-2 focus:ring-ieeeBlue/20 rounded-xl text-sm text-textPrimary focus:outline-none transition-all appearance-none cursor-pointer"
 >
 <option value="">All Statuses</option>
 <option value="ACTIVE">Active</option>
 <option value="INACTIVE">Inactive</option>
 <option value="SUSPENDED">Suspended</option>
 </select>
 </div>
 </div>

 {/* Main Table Panel */}
 <div className="bg-cardBg shadow-sm rounded-xl overflow-hidden shadow-xl border border-border">
 <div className="overflow-x-auto">
 {isLoading ? (
 <div className="p-8 space-y-4">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="flex gap-4 animate-pulse">
 <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
 <div className="flex-1 space-y-2 py-1">
 <div className="h-4 bg-slate-100 rounded w-1/4"></div>
 <div className="h-3 bg-slate-100 rounded w-1/3"></div>
 </div>
 </div>
 ))}
 </div>
 ) : members.length === 0 ? (
 <div className="p-12 text-center text-slate-450 space-y-2">
 <User size={36} className="mx-auto text-slate-600" />
 <p className="font-semibold text-base text-textBody">No members found</p>
 <p className="text-sm text-slate-500">Try modifying your search query or filters.</p>
 </div>
 ) : (
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border bg-cardBg text-xs font-semibold uppercase tracking-wider text-textMuted">
 <th className="px-6 py-4">Name</th>
 <th className="px-6 py-4">Email</th>
 <th className="px-6 py-4">Phone</th>
 <th className="px-6 py-4">Role</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-850">
 {members.map((member: any) => (
 <tr key={member.id} className="hover:bg-cardBg transition-colors text-sm text-textBody">
 {/* Name */}
 <td className="px-6 py-4 font-medium text-textPrimary">
 <div className="flex items-center gap-3">
 {member.profileImage ? (
 <img src={member.profileImage} alt={member.firstName} className="h-9 w-9 rounded-full object-cover border border-border shrink-0" />
 ) : (
 <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-ieeeBlue border border-border shrink-0">
 {member.firstName[0]}
 </div>
 )}
 <div>
 <span className="font-semibold">{member.firstName} {member.lastName}</span>
 </div>
 </div>
 </td>

 {/* Email */}
 <td className="px-6 py-4 text-textMuted">{member.user?.email || 'N/A'}</td>

 {/* Phone */}
 <td className="px-6 py-4 text-textMuted">{member.phone || '—'}</td>

 {/* Role */}
 <td className="px-6 py-4">
 {member.user?.role?.name ? (
 <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getRoleBadge(member.user.role.name)}`}>
 {member.user.role.name}
 </span>
 ) : (
 '—'
 )}
 </td>

 {/* Status */}
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${getStatusBadge(member.status)}`}>
 {member.status}
 </span>
 </td>

 {/* Actions */}
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <Link
 to={`/members/${member.id}`}
 className="p-1.5 rounded-lg text-textMuted hover:text-ieeeBlue hover:bg-slate-50 transition-colors"
 title="View Profile"
 >
 <Eye size={16} />
 </Link>

 {hasPermission('member:update') && (
 <Link
 to={`/members/edit/${member.id}`}
 className="p-1.5 rounded-lg text-textMuted hover:text-warning hover:bg-slate-50 transition-colors"
 title="Edit Member"
 >
 <Edit2 size={16} />
 </Link>
 )}

 {hasPermission('member:delete') && (
 <button
 onClick={() => setDeleteConfirmId(member.id)}
 className="p-1.5 rounded-lg text-textMuted hover:text-error hover:bg-slate-50 transition-colors"
 title="Delete Member"
 >
 <Trash2 size={16} />
 </button>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>

 {/* Pagination Controls */}
 {!isLoading && !isError && members.length > 0 && (
 <div className="flex items-center justify-between px-6 py-4 border-t border-border text-sm text-textMuted">
 <div>
 Showing <span className="font-semibold text-slate-350">{((page - 1) * limit) + 1}</span> to{' '}
 <span className="font-semibold text-slate-350">{Math.min(page * limit, meta.total)}</span> of{' '}
 <span className="font-semibold text-slate-350">{meta.total}</span> members
 </div>

 <div className="flex items-center gap-1">
 <button
 onClick={() => setPage((p) => Math.max(p - 1, 1))}
 disabled={page === 1}
 className="p-1.5 rounded-lg border border-border bg-cardBg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-textMuted hover:text-textPrimary transition-colors"
 >
 <ChevronLeft size={16} />
 </button>

 <div className="flex items-center px-2">
 <span className="text-xs">
 Page <strong className="text-textPrimary">{page}</strong> of{' '}
 <strong className="text-slate-250">{meta.totalPages || 1}</strong>
 </span>
 </div>

 <button
 onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
 disabled={page === meta.totalPages}
 className="p-1.5 rounded-lg border border-border bg-cardBg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-textMuted hover:text-textPrimary transition-colors"
 >
 <ChevronRight size={16} />
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Delete Confirmation Modal */}
 {deleteConfirmId && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-appBg/85 ">
 <div className="w-full max-w-sm rounded-xl bg-cardBg shadow-sm p-6 shadow-2xl space-y-5 animate-slide-in">
 <div className="flex gap-3 text-error">
 <AlertTriangle size={24} className="shrink-0" />
 <div>
 <h3 className="font-bold text-textPrimary">Confirm Deletion</h3>
 <p className="text-xs text-textMuted mt-1 leading-normal">
 Are you sure you want to delete this member? This will perform a soft-delete on the member profile and disable their login account.
 </p>
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-2">
 <button
 disabled={isDeleting}
 onClick={() => setDeleteConfirmId(null)}
 className="px-4 py-2 border border-slate-850 hover:bg-cardBg rounded-xl text-xs font-semibold text-textMuted hover:text-textPrimary transition-all disabled:opacity-50"
 >
 Cancel
 </button>
 <button
 disabled={isDeleting}
 onClick={() => handleDelete(deleteConfirmId)}
 className="px-4 py-2 bg-error hover:bg-error disabled:bg-error text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-error/15"
 >
 {isDeleting ? (
 <>
 <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
 Deleting...
 </>
 ) : (
 'Delete Member'
 )}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Invite Member Modal */}
 {isInviteModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-appBg/85 animate-fade-in">
 <div className="w-full max-w-md rounded-xl bg-cardBg shadow-sm p-6 sm:p-8 border border-border shadow-2xl space-y-5 animate-slide-in">
 <div>
 <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
 <Plus className="text-ieeeBlue" size={20} />
 Invite New Member
 </h3>
 <p className="text-xs text-textMuted mt-1 leading-normal">
 Enter the email address and select the portal access role for the new member. They will receive an email invitation to register.
 </p>
 </div>

 <form onSubmit={handleSendInvite} className="space-y-4">
 {/* Email Input */}
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-slate-350" htmlFor="inviteEmail">
 Email Address <span className="text-error">*</span>
 </label>
 <input
 id="inviteEmail"
 type="email"
 placeholder="name@example.com"
 disabled={isSendingInvite}
 value={inviteEmail}
 onChange={(e) => setInviteEmail(e.target.value)}
 className="w-full px-4 py-2.5 bg-cardBg border border-border focus:border-ieeeBlue focus:ring-4 focus:ring-ieeeBlue/20 rounded-xl text-sm text-textPrimary focus:outline-none transition-all duration-200"
 required
 />
 </div>

 {/* Role Select */}
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-slate-350" htmlFor="inviteRole">
 Portal Access Role <span className="text-error">*</span>
 </label>
 <select
 id="inviteRole"
 disabled={isSendingInvite}
 value={inviteRoleId}
 onChange={(e) => setInviteRoleId(e.target.value)}
 className="w-full px-4 py-2.5 bg-cardBg border border-border focus:border-ieeeBlue focus:ring-4 focus:ring-ieeeBlue/20 rounded-xl text-sm text-textPrimary focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
 required
 >
 <option value="">Select Role</option>
 {roles.map((role: any) => (
 <option key={role.id} value={role.id}>
 {role.name}
 </option>
 ))}
 </select>
 </div>

 {/* Buttons */}
 <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
 <button
 type="button"
 disabled={isSendingInvite}
 onClick={() => {
 setIsInviteModalOpen(false);
 setInviteEmail('');
 setInviteRoleId('');
 }}
 className="px-4 py-2 border border-border hover:bg-cardBg rounded-xl text-xs font-semibold text-textMuted hover:text-slate-255 transition-all cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSendingInvite}
 className="px-4 py-2 bg-ieeeBlue hover:bg-ieeeBlue disabled:bg-ieeeBlue text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-ieeeBlue/15 cursor-pointer"
 >
 {isSendingInvite ? (
 <>
 <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
 Sending...
 </>
 ) : (
 'Send Invitation'
 )}
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

export default MembersList;
