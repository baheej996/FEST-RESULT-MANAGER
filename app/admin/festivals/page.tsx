'use client';

import React, { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin-topbar';
import { Calendar, Plus, MapPin, CheckCircle, Clock, Archive, Sparkles, Trash2, Edit2, AlertTriangle, Check } from 'lucide-react';

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFestival, setEditingFestival] = useState<any | null>(null);
  const [festivalToDelete, setFestivalToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newFest, setNewFest] = useState({
    name: '',
    code: '',
    year: '2026',
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    venue: '',
    description: '',
    status: 'ACTIVE',
  });

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    code: '',
    year: '2026',
    startDate: '',
    endDate: '',
    venue: '',
    description: '',
    status: 'ACTIVE',
  });

  const fetchFestivals = () => {
    setLoading(true);
    fetch('/api/festivals')
      .then((res) => res.json())
      .then((data) => {
        setFestivals(data.festivals || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/festivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFest),
      });
      if (res.ok) {
        setShowAddModal(false);
        setMessage({ type: 'success', text: `Festival ${newFest.name} created successfully.` });
        fetchFestivals();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to create festival' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Error occurred' });
    }
  };

  const openEditModal = (fest: any) => {
    setEditForm({
      id: fest.id,
      name: fest.name,
      code: fest.code,
      year: fest.year ? fest.year.toString() : '2026',
      startDate: fest.startDate ? new Date(fest.startDate).toISOString().split('T')[0] : '',
      endDate: fest.endDate ? new Date(fest.endDate).toISOString().split('T')[0] : '',
      venue: fest.venue || '',
      description: fest.description || '',
      status: fest.status || 'ACTIVE',
    });
    setEditingFestival(fest);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/festivals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update festival');
      }

      setMessage({
        type: 'success',
        text: `Festival "${editForm.name}" was updated successfully.`,
      });
      setEditingFestival(null);
      fetchFestivals();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!festivalToDelete) return;
    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/festivals?id=${festivalToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete festival');
      }

      setMessage({
        type: 'success',
        text: `Festival "${festivalToDelete.name}" (${festivalToDelete.code}) was deleted successfully.`,
      });
      setFestivalToDelete(null);
      fetchFestivals();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AdminTopbar
        title="Multi-Festival Management"
        subtitle="Manage festival editions, venues, status and multi-tenant isolation"
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Status notification */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="font-bold text-xs">
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Festival Editions</h2>
            <p className="text-xs text-slate-500">
              All data across schools, participants, and programs is strictly partitioned by festival
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Festival Edition
          </button>
        </div>

        {/* Festival Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-400">
              Loading festival records...
            </div>
          ) : festivals.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-400">
              No festival editions found. Create one to get started.
            </div>
          ) : (
            festivals.map((fest) => (
              <div
                key={fest.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-all relative ${
                  fest.status === 'ACTIVE'
                    ? 'border-indigo-600 ring-2 ring-indigo-50'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {fest.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fest.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : fest.status === 'UPCOMING'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : fest.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {fest.status}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(fest)}
                      title="Edit Festival Details"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200/80 hover:border-indigo-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFestivalToDelete(fest)}
                      title="Delete Festival"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200/80 hover:border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{fest.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    {fest.venue}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs font-mono">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Schools</span>
                    <span className="font-bold text-slate-800">{fest._count?.institutions || 0}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Events</span>
                    <span className="font-bold text-slate-800">{fest._count?.programs || 0}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidates</span>
                    <span className="font-bold text-slate-800">{fest._count?.participants || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Festival Modal */}
        {editingFestival && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-600" />
                  Edit Festival: {editingFestival.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingFestival(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Festival Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Code</label>
                    <input
                      type="text"
                      required
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Year</label>
                    <input
                      type="number"
                      required
                      value={editForm.year}
                      onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    value={editForm.venue}
                    onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-800 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE (Current)</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setEditingFestival(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm shadow-indigo-200 transition-all"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {festivalToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Festival: {festivalToDelete.name}?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-slate-800">{festivalToDelete.name}</strong> (
                  <span className="font-mono text-indigo-600 font-bold">{festivalToDelete.code}</span>
                  )?
                </p>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  ⚠️ <strong>Warning:</strong> This will permanently delete all associated schools,
                  competition items, student entries, marks, and result calculations for this festival edition.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setFestivalToDelete(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm shadow-rose-200 transition-all flex items-center gap-1.5"
                >
                  {isDeleting ? (
                    <span>Deleting...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4">Create Festival Edition</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Festival Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sahodaya Kalotsav 2027"
                    value={newFest.name}
                    onChange={(e) => setNewFest({ ...newFest, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Code</label>
                    <input
                      type="text"
                      required
                      placeholder="SK2027"
                      value={newFest.code}
                      onChange={(e) => setNewFest({ ...newFest, code: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Year</label>
                    <input
                      type="number"
                      required
                      value={newFest.year}
                      onChange={(e) => setNewFest({ ...newFest, year: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="Campus Name, City"
                    value={newFest.venue}
                    onChange={(e) => setNewFest({ ...newFest, venue: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newFest.startDate}
                      onChange={(e) => setNewFest({ ...newFest, startDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={newFest.endDate}
                      onChange={(e) => setNewFest({ ...newFest, endDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                  >
                    Create Festival
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
