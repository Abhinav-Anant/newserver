/**
 * Firewall Service Client - Internal proxy layer
 * This file is never exposed to the frontend
 */

import { getEnv } from './env';

const NEXTDNS_API_BASE = 'https://api.nextdns.io';

let API_KEY: string;

try {
  const env = getEnv();
  API_KEY = env.NEXTDNS_API_KEY;
} catch (error) {
  console.error('Failed to initialize NextDNS client:', error instanceof Error ? error.message : String(error));
  // Will be caught when client is instantiated
  API_KEY = '';
}

export interface NextDNSProfile {
  id: string;
  fingerprint: string;
  name: string;
  security?: Record<string, any>;
  privacy?: Record<string, any>;
  parentalControl?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface NextDNSError {
  error: boolean;
  message: string;
  status?: number;
}

class NextDNSClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = NEXTDNS_API_BASE) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error(
        'NextDNS API key is not configured. Please set NEXTDNS_API_KEY environment variable.'
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Firewall service error: ${response.status} - ${errorText}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`Firewall service request failed: ${method} ${path}`, error);
      throw error;
    }
  }

  // Profile operations
  async getProfile(profileId: string): Promise<NextDNSProfile> {
    const response = await this.request<{ data: NextDNSProfile }>('GET', `/profiles/${profileId}`);
    return response.data;
  }

  async updateProfile(profileId: string, data: Partial<NextDNSProfile>): Promise<NextDNSProfile> {
    await this.request('PATCH', `/profiles/${profileId}`, data);
    // PATCH returns 204 No Content, so fetch the updated profile
    return this.getProfile(profileId);
  }

  // Security settings
  async getSecuritySettings(profileId: string): Promise<Record<string, any>> {
    const profile = await this.getProfile(profileId);
    return profile.security ?? {};
  }

  async updateSecuritySettings(
    profileId: string,
    settings: Record<string, any>
  ): Promise<Record<string, any>> {
    const updated = await this.updateProfile(profileId, { security: settings });
    return updated.security ?? {};
  }

  // Privacy settings
  async getPrivacySettings(profileId: string): Promise<Record<string, any>> {
    const profile = await this.getProfile(profileId);
    return profile.privacy ?? {};
  }

  async updatePrivacySettings(
    profileId: string,
    settings: Record<string, any>
  ): Promise<Record<string, any>> {
    const updated = await this.updateProfile(profileId, { privacy: settings });
    return updated.privacy ?? {};
  }

  // Parental control settings
  async getParentalControlSettings(profileId: string): Promise<Record<string, any>> {
    const profile = await this.getProfile(profileId);
    const parentalControl = profile.parentalControl ?? {};
    
    // Transform categories array (objects with id/active) to boolean flags for frontend
    const categories = parentalControl.categories ?? [];
    
    // Helper to check if a category is active
    const isCategoryActive = (categoryId: string): boolean => {
      const cat = categories.find((c: any) => c.id === categoryId);
      return cat?.active === true;
    };
    
    return {
      safeSearch: parentalControl.safeSearch ?? false,
      youtubeRestrictedMode: parentalControl.youtubeRestrictedMode ?? false,
      blockBypass: parentalControl.blockBypass ?? false,
      porn: isCategoryActive('porn'),
      gambling: isCategoryActive('gambling'),
      dating: isCategoryActive('dating'),
      piracy: isCategoryActive('piracy'),
      socialNetworks: isCategoryActive('social-networks'),
    };
  }

  async updateParentalControlSettings(
    profileId: string,
    settings: Record<string, any>
  ): Promise<Record<string, any>> {
    // Transform boolean flags back to categories array of objects for API
    const categories: Array<{id: string; active: boolean}> = [];
    
    // Only add categories that are active
    if (settings.porn) categories.push({ id: 'porn', active: true });
    if (settings.gambling) categories.push({ id: 'gambling', active: true });
    if (settings.dating) categories.push({ id: 'dating', active: true });
    if (settings.piracy) categories.push({ id: 'piracy', active: true });
    if (settings.socialNetworks) categories.push({ id: 'social-networks', active: true });
    
    const apiSettings = {
      safeSearch: settings.safeSearch ?? false,
      youtubeRestrictedMode: settings.youtubeRestrictedMode ?? false,
      blockBypass: settings.blockBypass ?? false,
      categories,
    };
    
    const updated = await this.updateProfile(profileId, { parentalControl: apiSettings });
    
    // Return transformed settings for frontend
    const pc = updated.parentalControl ?? {};
    const updatedCategories = pc.categories ?? [];
    
    // Helper to check if a category is active
    const isCategoryActive = (categoryId: string): boolean => {
      const cat = updatedCategories.find((c: any) => c.id === categoryId);
      return cat?.active === true;
    };
    
    return {
      safeSearch: pc.safeSearch ?? false,
      youtubeRestrictedMode: pc.youtubeRestrictedMode ?? false,
      blockBypass: pc.blockBypass ?? false,
      porn: isCategoryActive('porn'),
      gambling: isCategoryActive('gambling'),
      dating: isCategoryActive('dating'),
      piracy: isCategoryActive('piracy'),
      socialNetworks: isCategoryActive('social-networks'),
    };
  }

  // Allowlist operations
  async getAllowlist(profileId: string): Promise<any[]> {
    try {
      const data = await this.request<{ data: any[] }>('GET', `/profiles/${profileId}/allowlist`);
      return data?.data ?? [];
    } catch (error) {
      console.error(`Error fetching allowlist for profile ${profileId}:`, error);
      throw error;
    }
  }

  async addToAllowlist(profileId: string, domain: string): Promise<any> {
    return this.request('POST', `/profiles/${profileId}/allowlist`, { id: domain });
  }

  async removeFromAllowlist(profileId: string, domain: string): Promise<void> {
    return this.request('DELETE', `/profiles/${profileId}/allowlist/${domain}`);
  }

  // Denylist operations
  async getDenylist(profileId: string): Promise<any[]> {
    try {
      const data = await this.request<{ data: any[] }>('GET', `/profiles/${profileId}/denylist`);
      return data?.data ?? [];
    } catch (error) {
      console.error(`Error fetching denylist for profile ${profileId}:`, error);
      throw error;
    }
  }

  async addToDenylist(profileId: string, domain: string): Promise<any> {
    return this.request('POST', `/profiles/${profileId}/denylist`, { id: domain });
  }

  async removeFromDenylist(profileId: string, domain: string): Promise<void> {
    return this.request('DELETE', `/profiles/${profileId}/denylist/${domain}`);
  }

  // Analytics
  async getAnalytics(profileId: string, params?: Record<string, string>): Promise<any> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    try {
      // Fetch status data (queries and blocked counts)
      const statusData = await this.request<{ data: Array<{ status: string; queries: number }> }>(
        'GET',
        `/profiles/${profileId}/analytics/status${queryString}`
      );

      // Fetch domains data
      const domainsData = await this.request<{ data: Array<{ domain: string; queries: number; tracker?: string }> }>(
        'GET',
        `/profiles/${profileId}/analytics/domains${queryString}`
      );

      // Process status data
      let totalQueries = 0;
      let blockedQueries = 0;
      let relayedQueries = 0;

      statusData?.data?.forEach((item) => {
        if (item.status === 'default') {
          totalQueries += item.queries;
        } else if (item.status === 'blocked') {
          blockedQueries += item.queries;
        } else if (item.status === 'relayed') {
          relayedQueries += item.queries;
        }
      });

      // Add blocked queries to total
      totalQueries += blockedQueries + relayedQueries;

      // Process domains data
      const domains = domainsData?.data?.map((item) => ({
        name: item.domain,
        queries: item.queries,
        blocked: item.tracker ? item.queries : undefined,
      })) ?? [];

      return {
        queries: totalQueries,
        blocked: blockedQueries,
        relayed: relayedQueries,
        domains,
      };
    } catch (error) {
      console.error(`Error fetching analytics for profile ${profileId}:`, error);
      throw error;
    }
  }

  // Logs
  async getLogs(profileId: string, params?: Record<string, string>): Promise<any[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    try {
      const data = await this.request<{ data: any[] }>('GET', `/profiles/${profileId}/logs${queryString}`);
      return data?.data ?? [];
    } catch (error) {
      console.error(`Error fetching logs for profile ${profileId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const nextDNSClient = (() => {
  try {
    return new NextDNSClient(API_KEY);
  } catch (error) {
    console.error('Failed to initialize NextDNSClient:', error instanceof Error ? error.message : String(error));
    // Return a dummy client that will throw on any method call
    return {
      getProfile: () => Promise.reject(new Error('NextDNS client not initialized')),
      updateProfile: () => Promise.reject(new Error('NextDNS client not initialized')),
      getSecuritySettings: () => Promise.reject(new Error('NextDNS client not initialized')),
      updateSecuritySettings: () => Promise.reject(new Error('NextDNS client not initialized')),
      getPrivacySettings: () => Promise.reject(new Error('NextDNS client not initialized')),
      updatePrivacySettings: () => Promise.reject(new Error('NextDNS client not initialized')),
      getParentalControlSettings: () => Promise.reject(new Error('NextDNS client not initialized')),
      updateParentalControlSettings: () => Promise.reject(new Error('NextDNS client not initialized')),
      getAllowlist: () => Promise.reject(new Error('NextDNS client not initialized')),
      addToAllowlist: () => Promise.reject(new Error('NextDNS client not initialized')),
      removeFromAllowlist: () => Promise.reject(new Error('NextDNS client not initialized')),
      getDenylist: () => Promise.reject(new Error('NextDNS client not initialized')),
      addToDenylist: () => Promise.reject(new Error('NextDNS client not initialized')),
      removeFromDenylist: () => Promise.reject(new Error('NextDNS client not initialized')),
      getAnalytics: () => Promise.reject(new Error('NextDNS client not initialized')),
      getLogs: () => Promise.reject(new Error('NextDNS client not initialized')),
    } as any;
  }
})();
