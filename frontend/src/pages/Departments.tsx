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
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Network className="h-6 w-6 text-indigo-400" />
              Departments
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage society departments and their members</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            Create Department
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800 hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-100">{dept.name}</h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                  {dept.description || 'No description provided.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users size={16} className="text-slate-500" />
                  <span>{dept._count.members} Members</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedDept(dept.id);
                    setAssignModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-500/20"
                >
                  Assign User
                </button>
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800 border-dashed">
              <Network size={48} className="mx-auto text-slate-600 mb-3" />
              <p>No departments found.</p>
            </div>
          )}
        </div>

        {/* Create Department Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <Network className="text-indigo-400" size={20} />
                  New Department
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    {...register('name', { required: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. IT, Finance, Security"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Brief description of the department..."
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-indigo-500/20"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <Shield className="text-indigo-400" size={20} />
                  Assign User
                </h2>
                <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleAssignSubmit(onAssignSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Select User</label>
                  <select
                    {...registerAssign('userId', { required: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Choose a user...</option>
                    {members.map(m => (
                      <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role ID</label>
                  <select
                    {...registerAssign('roleId', { required: true })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
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
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-indigo-500/20"
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
