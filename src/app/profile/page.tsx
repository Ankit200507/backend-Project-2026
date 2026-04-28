'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Hash, Phone, MapPin, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
          setProfileData(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const user = profileData || currentUser;

  if (!user) {
    return <div className="p-8 text-red-400">Not authenticated.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <header>
        <h1 className="text-3xl font-bold font-['Space_Grotesk'] tracking-tight flex items-center gap-3">
          <User className="text-blue-400" size={32} />
          My Profile
        </h1>
        <p className="text-gray-400 mt-1">View your personal information and account settings.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl font-bold text-blue-400 shadow-xl">
            {user.firstName?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {user.firstName} {user.lastName || ''}
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${user.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                {user.role}
              </span>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border bg-blue-500/10 border-blue-500/20 text-blue-400">
                {user.accountType === 'organization' ? 'Organization' : 'Individual'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Mail size={14} /> Email Address</span>
              <span className="text-gray-200 text-lg">{user.email}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Hash size={14} /> Aadhar Number</span>
              <span className="text-gray-200 text-lg">{user.aadharNumber || 'Not provided'}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Phone size={14} /> Mobile Number</span>
              <span className="text-gray-200 text-lg">{user.phoneNumber || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><MapPin size={14} /> Residence Info</span>
              <span className="text-gray-200 text-lg whitespace-pre-line">{user.address || 'Not provided'}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Shield size={14} /> User ID</span>
              <span className="text-gray-400 font-mono text-sm">{user._id}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
