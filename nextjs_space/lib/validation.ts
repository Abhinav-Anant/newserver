/**
 * Validates domain names according to DNS standards
 * Allows domains like: example.com, sub.example.com, etc.
 */
export function validateDomain(domain: unknown): { valid: boolean; error?: string } {
  if (typeof domain !== 'string') {
    return { valid: false, error: 'Domain must be a string' };
  }

  const trimmed = domain.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Domain must be at least 3 characters' };
  }

  if (trimmed.length > 253) {
    return { valid: false, error: 'Domain must not exceed 253 characters' };
  }

  // DNS name validation regex
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

  if (!domainRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid domain format' };
  }

  return { valid: true };
}

/**
 * Validates profile ID
 */
export function validateProfileId(id: unknown): { valid: boolean; error?: string } {
  if (typeof id !== 'string') {
    return { valid: false, error: 'Profile ID must be a string' };
  }

  if (id.trim().length === 0) {
    return { valid: false, error: 'Profile ID is required' };
  }

  if (id.length > 255) {
    return { valid: false, error: 'Profile ID is too long' };
  }

  return { valid: true };
}

// Export schemas for compatibility with zod usage
export const domainSchema = {
  safeParse: (data: unknown) => {
    const result = validateDomain(data);
    if (result.valid) {
      return { success: true, data: (data as string).trim() };
    }
    return { success: false, error: { errors: [{ message: result.error }] } };
  },
};

export const profileIdSchema = {
  safeParse: (data: unknown) => {
    const result = validateProfileId(data);
    if (result.valid) {
      return { success: true, data: (data as string).trim() };
    }
    return { success: false, error: { errors: [{ message: result.error }] } };
  },
};
