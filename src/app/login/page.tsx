'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await login(email, password);
      const query = typeof window === 'undefined' ? '' : window.location.search;
      const nextPath = new URLSearchParams(query).get('next') || '/my-properties';
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#0a0c10] text-[#f0f4ff] relative overflow-hidden p-6">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white/10 group-hover:scale-105">
          <Shield size={20} className="text-green-400" />
        </div>
        <span className="font-['Space_Grotesk'] font-bold text-lg text-white">TerraLedger</span>
      </Link>

      <motion.form 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        onSubmit={onSubmit} 
        className="w-full max-w-[440px] p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md relative z-10 shadow-2xl"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-white mb-2 tracking-tight">Sign In</h2>
          <p className="text-gray-400">Access TerraLedger using your registered account.</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-gray-400 uppercase">Email</label>
            <input
              className="bg-white/5 border border-white/10 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all outline-none"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@terraledger.gov"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-gray-400 uppercase">Password</label>
            <input
              className="bg-white/5 border border-white/10 focus:border-green-400 focus:ring-1 focus:ring-green-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all outline-none"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 mt-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold text-white transition-all shadow-[0_4px_20px_rgba(34,197,94,0.2)] disabled:opacity-70 disabled:pointer-events-none" 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </motion.button>

          <div className="text-center mt-2 text-sm text-gray-400">
            Don't have an account? <Link href="/signup" className="text-green-400 hover:text-green-300 font-semibold transition-colors">Sign up</Link>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
