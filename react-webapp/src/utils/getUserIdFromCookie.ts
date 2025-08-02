// utils/getUserIdFromCookie.ts
import Cookies from 'js-cookie';

export const getUidFromUserProfile = (): string | null => {
  const cookie = Cookies.get('userProfile');
  if (!cookie) return null;

  try {
    const parsed = JSON.parse(cookie);
    return parsed.uid || null;
  } catch (error) {
    console.error('Invalid userProfile cookie:', error);
    return null;
  }
};
