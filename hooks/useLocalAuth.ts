import { useState, useEffect } from 'react';
import { localDb } from '../utils/localDb';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storageHelpers';

interface User {
  id: string;
  email: string;
  name: string;
  user_metadata?: {
    name?: string;
  };
  provider?: 'email' | 'google';
}

interface AuthSession {
  user: User;
  access_token: string;
  expires_at: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  session: AuthSession | null;
}

// Simple session management using localStorage
class SessionManager {
  private sessionKey = 'pakistani_depin_session';

  saveSession(session: AuthSession): void {
    try {
      const success = setStorageItem(this.sessionKey, JSON.stringify(session));
      if (!success) {
        console.warn('Failed to save session');
      }
    } catch (error) {
      console.warn('Failed to serialize session:', error);
    }
  }

  getSession(): AuthSession | null {
    const data = getStorageItem(this.sessionKey);
    if (!data) return null;
    
    try {
      const session = JSON.parse(data);
      
      // Check if session is expired
      if (Date.now() > session.expires_at) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.warn('Failed to parse session data:', error);
      this.clearSession();
      return null;
    }
  }

  clearSession(): void {
    removeStorageItem(this.sessionKey);
  }

  generateAccessToken(): string {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }
}

const sessionManager = new SessionManager();

// Mock Google OAuth functionality
class GoogleAuth {
  static async signInWithGoogle(): Promise<User> {
    // In a real implementation, this would open Google OAuth popup
    // For demo purposes, we'll simulate the OAuth flow
    return new Promise((resolve, reject) => {
      // Simulate OAuth popup
      const shouldSucceed = window.confirm(
        'Google OAuth Simulation\n\nThis would normally open Google\'s OAuth popup.\n\nClick OK to simulate successful authentication, or Cancel to simulate failure.'
      );

      setTimeout(() => {
        if (shouldSucceed) {
          // Simulate successful Google OAuth response
          const googleUser = {
            email: 'demo@gmail.com',
            name: 'Demo User',
            provider: 'google' as const,
            password: '', // No password for OAuth users
            user_metadata: {
              name: 'Demo User'
            }
          };

          // Check if user already exists
          let user = localDb.getUserByEmail(googleUser.email);
          
          if (!user) {
            // Create new user
            user = localDb.createUser(googleUser);
          }

          resolve({
            id: user.id,
            email: user.email,
            name: user.name,
            user_metadata: user.user_metadata,
            provider: 'google'
          });
        } else {
          reject(new Error('Google OAuth was cancelled by user'));
        }
      }, 1500); // Simulate OAuth delay
    });
  }
}

export function useLocalAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    session: null,
  });

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check for existing session on mount
        const session = sessionManager.getSession();
        
        if (!isMounted) return;

        if (session?.user) {
          setAuthState({
            user: session.user,
            loading: false,
            session,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            session: null,
          });
        }

        // Initialize demo data
        localDb.initializeDemoData();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (isMounted) {
          setAuthState({
            user: null,
            loading: false,
            session: null,
          });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
      }

      const user = localDb.getUserByEmail(email.trim());
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      const session: AuthSession = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          user_metadata: user.user_metadata,
          provider: user.provider || 'email'
        },
        access_token: sessionManager.generateAccessToken(),
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      };

      sessionManager.saveSession(session);
      setAuthState({
        user: session.user,
        loading: false,
        session,
      });

      return { user: session.user, session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if user already exists
      const existingUser = localDb.getUserByEmail(email.trim());
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const userName = name?.trim() || email.split('@')[0];
      
      const user = localDb.createUser({
        email: email.trim(),
        password,
        name: userName,
        user_metadata: { name: userName },
        provider: 'email'
      });

      const session: AuthSession = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          user_metadata: user.user_metadata,
          provider: 'email'
        },
        access_token: sessionManager.generateAccessToken(),
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      };

      sessionManager.saveSession(session);
      setAuthState({
        user: session.user,
        loading: false,
        session,
      });

      return { user: session.user, session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    sessionManager.clearSession();
    setAuthState({
      user: null,
      loading: false,
      session: null,
    });
  };

  const signInWithGoogle = async () => {
    try {
      const googleUser = await GoogleAuth.signInWithGoogle();
      
      if (!googleUser?.id || !googleUser?.email) {
        throw new Error('Invalid Google user data');
      }
      
      const session: AuthSession = {
        user: googleUser,
        access_token: sessionManager.generateAccessToken(),
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      };

      sessionManager.saveSession(session);
      setAuthState({
        user: session.user,
        loading: false,
        session,
      });

      return { user: session.user, session };
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const getSession = () => {
    return sessionManager.getSession();
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    getSession,
  };
}