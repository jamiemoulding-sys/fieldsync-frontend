import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

function Employees() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee'
  });

  useEffect(() => {
    if (user) loadEmployees();
  }, [user]);

  const loadEmployees = async () => {
    try {
      if (!user?.company?.id) {
        setEmployees([]);
        return;
      }

      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          role,
          profiles:profiles!employees_user_id_fkey (
            name,
            email
          )
        `)
        .eq('company_id', user?.company.id);

      if (error) throw error;

      setEmployees((data || []).map(emp => ({
        id: emp.id,
        name: emp.profiles?.name || 'No name',
        email: emp.profiles?.email || 'No email',
        role: emp.role
      })));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      const token = uuidv4();

      await supabase.from('invitations').insert({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        company_id: user?.company.id,
        token
      });

      await fetch('http://localhost:5000/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, token })
      });

      setSuccess(`Invite sent to ${formData.email}`);
      setShowModal(false);
      setFormData({ name: '', email: '', role: 'employee' });

    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove employee?')) return;

    await supabase.from('employees').delete().eq('id', id);
    loadEmployees();
  };

  if (loading) {
    return <div className="center-screen text-white">Loading team...</div>;
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-1">👥 Team</h1>
          <p className="subtle-text mt-1">
            Manage your workforce with FieldSync
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            ← Dashboard
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            + Invite Employee
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {error && <div className="badge-error">{error}</div>}
      {success && <div className="badge-success">{success}</div>}

      {/* EMPLOYEE GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="card">

            {/* AVATAR */}
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-semibold text-lg">
              {emp.name.charAt(0).toUpperCase()}
            </div>

            {/* INFO */}
            <div className="mt-4">
              <p className="font-semibold text-white">{emp.name}</p>
              <p className="text-sm text-gray-400">{emp.email}</p>
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex justify-between items-center">

              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                emp.role === 'manager'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {emp.role}
              </span>

              <button
                onClick={() => handleDelete(emp.id)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {employees.length === 0 && (
        <div className="card text-center">
          <p className="text-gray-400">No employees yet</p>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center">

          <div className="card w-full max-w-md">

            <h2 className="heading-2 mb-4">Invite Employee</h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                placeholder="Full Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />

              <input
                placeholder="Email Address"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />

              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="input-field"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>

              <button className="btn-primary w-full">
                Send Invite
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Employees;