'use client';

import { useEffect, useState } from 'react';
import { FileText, RefreshCw, Filter } from 'lucide-react';

interface LogsPageProps {
  profileId: string;
}

interface LogEntry {
  timestamp?: string;
  domain?: string;
  name?: string;
  type?: string;
  status?: number;
  protocol?: string;
  device?: string;
  clientIp?: string;
}

export default function LogsPage({ profileId }: LogsPageProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [profileId]);

  const loadLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/logs`);
      
      if (res.ok) {
        const data = await res.json();
        setLogs(data?.data ?? []);
      } else {
        throw new Error('Failed to load logs');
      }
    } catch (err: any) {
      console.error('Error loading logs:', err);
      setError(err?.message ?? 'Failed to load logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadLogs(true);
  };

  const getStatusLabel = (status?: number) => {
    if (!status) return 'Unknown';
    if (status === 0) return 'Blocked';
    if (status === 1) return 'Allowed';
    if (status === 2) return 'Relayed';
    return `Status ${status}`;
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    if (status === 0) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (status === 1) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (status === 2) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '-';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'blocked') return log?.status === 0;
    if (statusFilter === 'allowed') return log?.status === 1;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Query Logs
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Recent query activity for this profile
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="allowed">Allowed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="px-3 py-2 rounded-full bg-slate-800/30 border border-slate-700/50 text-sm text-slate-400">
          {filteredLogs.length} entries
        </div>
      </div>

      {/* Logs Table */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 overflow-hidden">
        {filteredLogs?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Domain</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {formatTimestamp(log?.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{log?.domain ?? log?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 uppercase">{log?.type ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${getStatusColor(log?.status)}`}>
                        {getStatusLabel(log?.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                      {log?.device ?? log?.clientIp ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No logs available</p>
            <p className="text-slate-500 text-sm mt-2">Logs will appear as queries are processed</p>
          </div>
        )}
      </div>
    </div>
  );
}
