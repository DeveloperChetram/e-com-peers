export interface StoredUser {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

export const saveUserToStorage = (user: unknown, role?: string | null): void => {
  if (typeof window === 'undefined') return;
  if (!user || typeof user !== 'object') {
    clearUserFromStorage();
    return;
  }

  try {
    const rawUser = user as Record<string, unknown>;
    const resolvedRole = role || (rawUser.role as string) || 'USER';
    const userToSave: StoredUser = {
      ...rawUser,
      id: rawUser.id as number | string,
      name: (rawUser.name as string) || '',
      email: (rawUser.email as string) || '',
      role: resolvedRole,
    };

    localStorage.setItem('user', JSON.stringify(userToSave));
    localStorage.setItem('role', resolvedRole);
  } catch (err) {
    console.error('Error saving user to localStorage:', err);
  }
};

export const getUserFromStorage = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('user');
    return data ? (JSON.parse(data) as StoredUser) : null;
  } catch (err) {
    console.error('Error reading user from localStorage:', err);
    return null;
  }
};

export const getRoleFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const role = localStorage.getItem('role');
    if (role) return role;
    const user = getUserFromStorage();
    return user?.role || null;
  } catch (err) {
    console.error('Error reading role from localStorage:', err);
    return null;
  }
};

export const clearUserFromStorage = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  } catch (err) {
    console.error('Error clearing user from localStorage:', err);
  }
};

export const getAppropriateDashboardUrl = (role?: string | null): string => {
  const currentRole = role?.toUpperCase();
  if (currentRole === 'ADMIN') {
    return '/dashboard/admin';
  }
  if (currentRole === 'PROVIDER' || currentRole === 'PROVIDER_STAFF') {
    return '/dashboard/provider';
  }
  if (currentRole === 'USER') {
    return '/dashboard/user';
  }
  return '/dashboard/user';
};
