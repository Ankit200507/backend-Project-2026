'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, ShieldAlert, UserPlus, Heart, Hash, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Nominee {
  _id: string;
  relationship: string;
  user: {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    aadharNumber?: string;
    phoneNumber?: string;
  };
}

export default function FamilyInfoPage() {
  const { currentUser } = useAuth();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [aadharNumber, setAadharNumber] = useState('');
  const [relationship, setRelationship] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchNominees();
  }, []);

  const fetchNominees = async () => {
    try {
      const res = await fetch('/api/family-info');
      const data = await res.json();
      if (data.success) {
        setNominees(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch family information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNominee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/family-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadharNumber, relationship }),
      });
      const data = await res.json();
      if (data.success) {
        setNominees(data.data);
        setShowAddForm(false);
        setAadharNumber('');
        setRelationship('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to add nominee');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] tracking-tight flex items-center gap-3">
            <Users className="text-green-400" size={32} />
            Family & Inheritance Info
          </h1>
          <p className="text-gray-400 mt-1">Manage your family members and assign nominees for your properties.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 rounded-xl font-semibold text-white shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.25)] transition-all active:scale-95"
        >
          {showAddForm ? 'Cancel' : <><Plus size={20} /> Add Nominee</>}
        </button>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <ShieldAlert className="text-red-400 mt-0.5" size={20} />
          <div className="text-red-200">{error}</div>
        </div>
      )}

      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl space-y-5"
          onSubmit={handleAddNominee}
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserPlus className="text-blue-400" size={24} />
            Add New Nominee
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 uppercase tracking-wide">Nominee's Aadhar Number</label>
              <input
                type="text"
                required
                pattern="\d{12}"
                title="12 digit Aadhar Number"
                placeholder="123456789012"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                className="w-full bg-[#0a0c10] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 uppercase tracking-wide">Relationship</label>
              <input
                type="text"
                required
                placeholder="Spouse, Child, Sibling..."
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-[#0a0c10] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Confirm Nominee'}
          </button>
        </motion.form>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {nominees.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/[0.01] border border-white/5 rounded-2xl">
            <Heart className="mx-auto text-white/20 mb-3" size={48} />
            <h3 className="text-lg font-medium text-white/70">No Nominees Found</h3>
            <p className="text-gray-500 mt-1">You haven't added any family members or nominees yet.</p>
          </div>
        ) : (
          nominees.map((nominee, idx) => (
            <motion.div
              key={nominee._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors" />
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                    {nominee.user.firstName} {nominee.user.lastName || ''}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mt-2">
                    {nominee.relationship}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-lg font-bold text-gray-300">
                  {nominee.user.firstName.charAt(0)}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Hash size={16} />
                  <span>Aadhar: {nominee.user.aadharNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone size={16} />
                  <span>Mobile: {nominee.user.phoneNumber || 'Not provided'}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
