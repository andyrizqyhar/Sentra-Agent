import { ConfigData, EnvVariable } from '../types/config';

const API_BASE = '/api';

export function getAuthHeaders() {
  const token = sessionStorage.getItem('sentra_auth_token');
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token || ''
  };
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function fetchConfigs(): Promise<ConfigData> {
  // Add timestamp to prevent caching
  const response = await fetch(`${API_BASE}/configs?t=${Date.now()}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch configurations');
  }
  return response.json();
}

export async function saveModuleConfig(
  moduleName: string,
  variables: EnvVariable[]
): Promise<void> {
  const response = await fetch(`${API_BASE}/configs/module`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ moduleName, variables }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save module configuration');
  }
}

export async function savePluginConfig(
  pluginName: string,
  variables: EnvVariable[]
): Promise<void> {
  const response = await fetch(`${API_BASE}/configs/plugin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ pluginName, variables }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save plugin configuration');
  }
}
