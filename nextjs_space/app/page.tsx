'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Shield, Lock, Gauge, Database, Bolt, ArrowRight, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [profileId, setProfileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileId?.trim()) {
      setError('Please enter a profile identifier');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(profileId.trim())}`);
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Failed to validate profile' }));
        throw new Error(data?.message ?? 'Invalid profile ID');
      }

      // Store profile ID and redirect to dashboard
      localStorage.setItem('leo_prime_profile_id', profileId.trim());
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load profile. Please check your Profile ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wider">LEO PRIME FIREWALL</h1>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Bolt className="w-3 h-3" />
                  Adaptive network protection
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-green-500/50 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></span>
              <span className="text-slate-300">Control plane online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-slate-700/50 shadow-2xl p-8">
            {/* Card Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></span>
                Unified profile control
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-cyan-500/10">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold">Manage Firewall Profile</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center gap-1.5 text-slate-400">
                  <Cloud className="w-3 h-3" />
                  Cloud-backed policy engine
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-3">
                Load a profile and fine-tune Leo Prime Firewall's security, privacy, performance
                and logging behavior from a single, streamlined console.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs flex items-center gap-1.5 text-slate-400">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  Threat intelligence
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs flex items-center gap-1.5 text-slate-400">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  Privacy controls
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs flex items-center gap-1.5 text-slate-400">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  Performance tuning
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs flex items-center gap-1.5 text-slate-400">
                  <Database className="w-3 h-3 text-cyan-400" />
                  Smart logging
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="profile-id" className="block text-sm font-semibold mb-2 text-slate-200">
                  Profile Identifier
                </label>
                <input
                  id="profile-id"
                  type="text"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  placeholder="e.g., abc123"
                  className="w-full px-4 py-3 rounded-full bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  disabled={loading}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500">
                    Paste the identifier from your management portal URL (<code className="text-slate-400">…/abc123</code> → ID is <strong className="text-slate-300">abc123</strong>).
                  </p>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center gap-1 text-slate-500 whitespace-nowrap">
                    <Lock className="w-3 h-3" />
                    No keys stored
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Load Profile Settings
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center gap-2 text-slate-400">
              <Lock className="w-3 h-3 text-green-500" />
              Control plane API keys stay on your server – never exposed in this page.
            </span>
            <p className="text-sm text-slate-500">
              Leo Prime Firewall · Policy-driven protection for your network traffic.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
