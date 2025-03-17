import type { User } from '../types';

export const saveUsersToFile = async (users: User[]) => {
  try {
    const response = await fetch('/update-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(users),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save users');
    }
    
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
}; 