'use client';

import { useEffect, useState } from 'react';
import { Users, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface ParentalControlPageProps {
  profileId: string;
}

const PARENTAL_SETTINGS = [
  {
    key: 'safeSearch',
    label: 'SafeSearch Enforcement',
    description: 'Force SafeSearch on supported search engines',
  },
  {
    key: 'youtubeRestrictedMode',
    label: 'YouTube Restricted Mode',
    description: 'Enable restricted mode on YouTube',
  },
  {
    key: 'blockBypass',
    label: 'Block Bypass Methods',
    description: 'Prevent circumvention via VPNs, proxies, and Tor',
  },
  {
    key: 'porn',
    label: 'Block Adult Content',
    description: 'Block websites with adult or explicit content',
  },
  {
    key: 'gambling',
    label: 'Block Gambling',
    description: 'Block online gambling and betting sites',
  },
  {
    key: 'dating',
    label: 'Block Dating',
    description: 'Block dating and adult-oriented relationship sites',
  },
  {
    key: 'piracy',
    label: 'Block Piracy',
    description: 'Block sites that facilitate copyright infringement',
  },
  {
    key: 'socialNetworks',
    label: 'Block Social Networks',
    description: 'Block major social networking platforms',
  },
];

export default function ParentalControlPage({ profileId }: ParentalControlPageProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, [profileId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/parental-control`);
      
      if (res.ok) {
        const data = await res.json();
        setSettings(data ?? {});
      }
    } catch (err) {
      console.error('Error loading parental control settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/parental-control`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Parental control settings saved successfully' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Parental Control
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Content filtering and access restrictions
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-medium shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl border text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Parental Controls */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Content Restrictions</h3>
          <p className="text-slate-400 text-sm">Configure filtering and access controls</p>
        </div>
        
        <div className="space-y-3">
          {PARENTAL_SETTINGS.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium">{setting.label}</div>
                <div className="text-sm text-slate-400">{setting.description}</div>
              </div>
              <button
                onClick={() => handleToggle(setting.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings?.[setting.key]
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-600'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    settings?.[setting.key] ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
