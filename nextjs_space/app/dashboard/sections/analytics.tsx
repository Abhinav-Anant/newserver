'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

interface AnalyticsPageProps {
  profileId: string;
}

interface AnalyticsData {
  queries?: number;
  blocked?: number;
  relayed?: number;
  domains?: Array<{
    name: string;
    queries: number;
    blocked?: number;
  }>;
}

export default function AnalyticsPage({ profileId }: AnalyticsPageProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [profileId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/analytics`);
      
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data ?? {});
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err?.message ?? 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

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

  const totalQueries = analytics?.queries ?? 0;
  const blockedQueries = analytics?.blocked ?? 0;
  const allowedQueries = totalQueries - blockedQueries;
  const blockRate = totalQueries > 0 ? ((blockedQueries / totalQueries) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          Analytics
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Traffic overview and query statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Total Queries</div>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold">{totalQueries.toLocaleString()}</div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Blocked</div>
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400">{blockedQueries.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">{blockRate}% of total</div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Allowed</div>
            <Shield className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{allowedQueries.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">{(100 - parseFloat(blockRate)).toFixed(1)}% of total</div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Protection Rate</div>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400">{blockRate}%</div>
        </div>
      </div>

      {/* Top Domains */}
      {analytics?.domains && analytics.domains.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Queried Domains</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Domain</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Queries</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Blocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {analytics.domains.slice(0, 10).map((domain, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono">{domain?.name}</td>
                    <td className="px-4 py-3 text-sm text-right">{domain?.queries?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {domain?.blocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                          {domain.blocked.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {totalQueries === 0 && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-slate-700/50 p-12 text-center">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No analytics data available yet</p>
          <p className="text-slate-500 text-sm mt-2">Data will appear once queries are processed</p>
        </div>
      )}
    </div>
  );
}
