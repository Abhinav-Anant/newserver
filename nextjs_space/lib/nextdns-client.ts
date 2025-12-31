/**
 * NextDNS API Client - Internal proxy layer
 * This file is never exposed to the frontend
 */

const NEXTDNS_API_BASE = 'https://api.nextdns.io';
const API_KEY = process.env.NEXTDNS_API_KEY;

if (!API_KEY) {
  console.error('NEXTDNS_API_KEY is not configured in environment variables');
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
        throw new Error(`NextDNS API error: ${response.status} - ${errorText}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`NextDNS API request failed: ${method} ${path}`, error);
      throw error;
    }
  }

  // Profile operations
  async getProfile(profileId: string): Promise<NextDNSProfile> {
    return this.request<NextDNSProfile>('GET', `/profiles/${profileId}`);
  }

  async updateProfile(profileId: string, data: Partial<NextDNSProfile>): Promise<NextDNSProfile> {
    return this.request<NextDNSProfile>('PATCH', `/profiles/${profileId}`, data);
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
    return profile.parentalControl ?? {};
  }

  async updateParentalControlSettings(
    profileId: string,
    settings: Record<string, any>
  ): Promise<Record<string, any>> {
    const updated = await this.updateProfile(profileId, { parentalControl: settings });
    return updated.parentalControl ?? {};
  }

  // Allowlist operations
  async getAllowlist(profileId: string): Promise<any[]> {
    try {
      const data = await this.request<{ data: any[] }>('GET', `/profiles/${profileId}/allowlist`);
      return data?.data ?? [];
    } catch {
      return [];
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
    } catch {
      return [];
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
      return await this.request('GET', `/profiles/${profileId}/analytics/status${queryString}`);
    } catch {
      return { queries: 0, blocked: 0, relayed: 0, domains: [] };
    }
  }

  // Logs
  async getLogs(profileId: string, params?: Record<string, string>): Promise<any[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    try {
      const data = await this.request<{ data: any[] }>('GET', `/profiles/${profileId}/logs${queryString}`);
      return data?.data ?? [];
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const nextDNSClient = new NextDNSClient(API_KEY ?? '');
