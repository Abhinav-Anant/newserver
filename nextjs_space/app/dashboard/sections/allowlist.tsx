'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Plus, Trash2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface AllowlistPageProps {
  profileId: string;
}

interface AllowlistEntry {
  id: string;
  active?: boolean;
}

export default function AllowlistPage({ profileId }: AllowlistPageProps) {
  const [entries, setEntries] = useState<AllowlistEntry[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAllowlist();
  }, [profileId]);

  const loadAllowlist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/allowlist`);
      
      if (res.ok) {
        const data = await res.json();
        setEntries(data?.data ?? []);
      }
    } catch (err) {
      console.error('Error loading allowlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDomain?.trim()) {
      setMessage({ type: 'error', text: 'Please enter a domain' });
      return;
    }

    try {
      setAdding(true);
      setMessage(null);

      const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/allowlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Domain added to allowlist' });
        setNewDomain('');
        await loadAllowlist();
      } else {
        throw new Error('Failed to add domain');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? 'Failed to add domain' });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (domain: string) => {
    if (!confirm(`Remove ${domain} from allowlist?`)) return;

    try {
      setMessage(null);

      const res = await fetch(
        `/api/profiles/${encodeURIComponent(profileId)}/allowlist/${encodeURIComponent(domain)}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setMessage({ type: 'success', text: 'Domain removed from allowlist' });
        await loadAllowlist();
      } else {
        throw new Error('Failed to remove domain');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? 'Failed to remove domain' });
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase() ?? '')
  );

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
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-400" />
          Allowlist
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Always allow specific domains, bypassing all filters
        </p>
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

      {/* Add Domain Form */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4">Add Domain</h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            disabled={adding}
          />
          <button
            type="submit"
            disabled={adding}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-medium shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {adding ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search domains..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-800/30 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
        />
      </div>

      {/* Allowlist Table */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 overflow-hidden">
        {filteredEntries?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredEntries.map((entry) => (
                  <tr key={entry?.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono">{entry?.id}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemove(entry?.id)}
                        className="px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            {searchQuery ? 'No domains match your search' : 'No domains in allowlist yet'}
          </div>
        )}
      </div>
    </div>
  );
}
