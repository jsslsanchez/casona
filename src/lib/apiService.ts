// src/lib/apiService.ts

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'An unexpected error occurred');
    }
  
    return response.json();
  }  