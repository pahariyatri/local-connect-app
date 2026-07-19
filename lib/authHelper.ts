
export const saveAuthToken = async (type: string, token: string) => {
  try {
    const response = await fetch(`/api/auth/save-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, type }),
    });

    if (!response.ok) {
      throw new Error('Failed to save token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

export function getAuthToken(name: string): string | null {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return value ? value.split("=")[1] : null;
}

export const fetchAuthToken = async () => {
  try {
    const response = await fetch('/api/auth/get-token', {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

