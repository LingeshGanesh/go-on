// components/GoogleLoginButton.tsx
import React, { useEffect, useRef, useState } from "react";
import { useCustomScenarios } from "../hooks/useCustomScenarios";

// Extend the Window interface to include gapi
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface UserProfile {
  uid: string;
  name: string;
  picture: string;
  email: string;
  googleId: string;
}

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Generate a unique UID based on Google ID
const generateUID = (googleId: string): string => {
  // Create a simple hash of the Google ID for a shorter UID
  let hash = 0;
  for (let i = 0; i < googleId.length; i++) {
    const char = googleId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to positive number and add timestamp for uniqueness
  const positiveHash = Math.abs(hash);
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  return `uid_${positiveHash}`;
};

const GoogleLoginButton: React.FC = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing user session on component mount
  useEffect(() => {
    const savedUser = getCookie('userProfile');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // const { loadCustomScenario } = useCustomScenarios(); // <-- Call the hook
        // loadCustomScenario(parsedUser.uid); // <-- Call the method

        setUser(parsedUser);
        console.log("Restored user session:", parsedUser);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        deleteCookie('userProfile');
      }
    }
  }, []);

  useEffect(() => {
    // Only load and render Google sign-in button if user is not signed in
    if (!user) {
      // Load Google APIs
      const loadGoogleAPIs = async () => {
        // Load gapi library
        if (!window.gapi) {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => {
            window.gapi.load('auth2', () => {
              window.gapi.auth2.init({
                client_id: "209838160061-68gppurq96cgm0ffa3bec6hg3e2rn6i3.apps.googleusercontent.com",
              });
            });
          };
          document.head.appendChild(script);
        }

        // Initialize Google One Tap
        if (window.google && buttonRef.current) {
          window.google.accounts.id.initialize({
            client_id: "209838160061-68gppurq96cgm0ffa3bec6hg3e2rn6i3.apps.googleusercontent.com",
            callback: handleCredentialResponse,
          });

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill"
          });

          window.google.accounts.id.prompt(); // optional: auto popup
        }
      };

      loadGoogleAPIs();
    }
  }, [user]);

  const handleCredentialResponse = async (response: google.accounts.id.CredentialResponse) => {
    setIsLoading(true);
    const token = response.credential; // This is a JWT
    console.log("Google JWT token:", token);

    try {
      // Decode the JWT to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if user already exists in cookies with same Google ID
      let uid: string;
      const existingUser = getCookie('userProfile');
      if (existingUser) {
        try {
          const parsedExistingUser = JSON.parse(existingUser);
          if (parsedExistingUser.googleId === payload.sub) {
            // Same user, keep existing UID
            uid = parsedExistingUser.uid;
          } else {
            // Different user, generate new UID
            uid = generateUID(payload.sub);
          }
        } catch {
          // Error parsing existing user, generate new UID
          uid = generateUID(payload.sub);
        }
      } else {
        // New user, generate new UID
        uid = generateUID(payload.sub);
      }
      
      const userProfile: UserProfile = {
        uid: uid,
        name: payload.given_name || payload.name?.split(' ')[0] || 'User',
        picture: payload.picture,
        email: payload.email,
        googleId: payload.sub // Google's unique identifier
      };

      // Save user to cookies (expires in 30 days)
      setCookie('userProfile', JSON.stringify(userProfile), 30);
      
      setUser(userProfile);
      console.log("User profile saved:", userProfile);
    } catch (error) {
      console.error("Error decoding token:", error);
    } finally {
      setIsLoading(false);
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    try {
      // Sign out using gapi.auth2 if available
      if (window.gapi && window.gapi.auth2) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (authInstance && authInstance.isSignedIn.get()) {
          await authInstance.signOut();
          console.log("User signed out from Google");
        }
      }
      
      // Disable auto-select for Google One Tap
      if (window.google) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      // Clear cookies and local state
      deleteCookie('userProfile');
      setUser(null);
      
      console.log("User signed out successfully and cookies cleared");
      window.location.reload();
    } catch (error) {
      console.error("Error during sign out:", error);
      // Still clear local state and cookies even if sign-out fails
      deleteCookie('userProfile');
      setUser(null);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-full bg-white shadow-sm">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Signing in...</span>
        </div>
      )}

      {user && (
        <div className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <img
            src={user.picture}
            alt={`${user.name}'s profile`}
            className="w-6 h-6 rounded-full mr-3"
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4285f4&color=fff&size=24`;
            }}
          />
          <span className="text-gray-700 font-medium mr-3">
            Hi, {user.name}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-500 hover:text-gray-700 border-l border-gray-300 pl-3"
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      )}

      {!user && !isLoading && <div ref={buttonRef}></div>}
    </>
  );
};

export default GoogleLoginButton;