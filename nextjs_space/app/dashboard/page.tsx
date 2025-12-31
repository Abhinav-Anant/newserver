'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Shield, Lock, Users, Ban, CheckCircle, Activity, FileText, Settings } from 'lucide-react';
import SecurityPage from './sections/security';
import PrivacyPage from './sections/privacy';
import ParentalControlPage from './sections/parental-control';
import AllowlistPage from './sections/allowlist';
import DenylistPage from './sections/denylist';
import AnalyticsPage from './sections/analytics';
import LogsPage from './sections/logs';

type Section = 'security' | 'privacy' | 'parental' | 'allowlist' | 'denylist' | 'analytics' | 'logs';

export default function DashboardPage() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<Section>('security');
  const router = useRouter();

  useEffect(() => {
    const storedProfileId = localStorage.getItem('leo_prime_profile_id');
    
    if (!storedProfileId) {
      router.push('/');
      return;
    }

    setProfileId(storedProfileId);
    loadProfile(storedProfileId);
  }, [router]);

  const loadProfile = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${encodeURIComponent(id)}`);
      
      if (!res.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await res.json();
      setProfileName(data?.name ?? id);
      setError('');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('leo_prime_profile_id');
    router.push('/');
  };

  if (loading || !profileId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'security' as Section, label: 'Security', icon: Shield },
    { id: 'privacy' as Section, label: 'Privacy', icon: Lock },
    { id: 'parental' as Section, label: 'Parental Control', icon: Users },
    { id: 'allowlist' as Section, label: 'Allowlist', icon: CheckCircle },
    { id: 'denylist' as Section, label: 'Denylist', icon: Ban },
    { id: 'analytics' as Section, label: 'Analytics', icon: Activity },
    { id: 'logs' as Section, label: 'Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-wider">LEO PRIME FIREWALL</h1>
                <p className="text-xs text-slate-400">Control Center</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs">
                <span className="text-slate-400">Profile:</span> <span className="text-slate-200 font-medium">{profileName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm transition-colors"
              >
                Change Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/50 border-b border-slate-800/50 sticky top-[64px] z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-600/20 text-cyan-400 border border-cyan-500/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeSection === 'security' && <SecurityPage profileId={profileId} />}
        {activeSection === 'privacy' && <PrivacyPage profileId={profileId} />}
        {activeSection === 'parental' && <ParentalControlPage profileId={profileId} />}
        {activeSection === 'allowlist' && <AllowlistPage profileId={profileId} />}
        {activeSection === 'denylist' && <DenylistPage profileId={profileId} />}
        {activeSection === 'analytics' && <AnalyticsPage profileId={profileId} />}
        {activeSection === 'logs' && <LogsPage profileId={profileId} />}
      </main>
    </div>
  );
}
