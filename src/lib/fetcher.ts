// src/lib/fetcher.ts

export const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'An error occurred while fetching data.');
    }
    return response.json();
  };  