// Admin authentication utilities

export function checkAuth(): string | null {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = '/admin/login';
    return null;
  }
  return token;
}

export function getUsername(): string | null {
  return localStorage.getItem('admin_username');
}

export function logout(): void {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_username');
  window.location.href = '/admin/login';
}

export async function apiCall(endpoint: string, token: string): Promise<Response> {
  return fetch(`https://expat-savvy-api.fly.dev${endpoint}`, {
    headers: {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

export async function fetchWithAuth(endpoint: string): Promise<any> {
  const token = checkAuth();
  if (!token) return null;
  
  try {
    const response = await apiCall(endpoint, token);
    if (!response.ok) {
      if (response.status === 401) {
        logout();
        return null;
      }
      throw new Error(`API call failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Never';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatTimeAgo(dateString: string): string {
  if (!dateString) return 'Never';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  } catch {
    return 'Unknown';
  }
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'contacted': return 'bg-yellow-100 text-yellow-800';
    case 'booked': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getChannelColor(channel: string): string {
  switch (channel) {
    case 'organic': return 'bg-green-100 text-green-800';
    case 'paid': return 'bg-blue-100 text-blue-800';
    case 'social': return 'bg-purple-100 text-purple-800';
    case 'direct': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function downloadCSV(data: any[], filename: string): void {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

