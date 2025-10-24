import { useState, useEffect } from 'react';
import { localDb } from '../utils/localDb';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storageHelpers';
import { simpleSolanaClient } from '../utils/solana/simple-client';

interface WalletUser {
  id: string;
  walletAddress: string;
  provider: string;
  publicKey: string;
  name: string;
  user_metadata?: {
    name?: string;
  };
}

interface WalletConnection {
  address: string;
  provider: string;
  publicKey: string;
}

interface WalletSession {
  user: WalletUser;
  walletAddress: string;
  access_token: string;
  expires_at: number;
}

interface WalletAuthState {
  user: WalletUser | null;
  loading: boolean;
  session: WalletSession | null;
  walletConnected: boolean;
}

// Session management for wallet-based authentication
class WalletSessionManager {
  private sessionKey = 'pakistani_depin_wallet_session';

  saveSession(session: WalletSession): void {
    try {
      const success = setStorageItem(this.sessionKey, JSON.stringify(session));
      if (!success) {
        console.warn('Failed to save wallet session');
      }
    } catch (error) {
      console.warn('Failed to serialize wallet session:', error);
    }
  }

  getSession(): WalletSession | null {
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
      console.warn('Failed to parse wallet session data:', error);
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

const walletSessionManager = new WalletSessionManager();

// Enhanced localDb functions for wallet users
const walletDb = {
  ...localDb,
  
  getUserByWalletAddress(walletAddress: string): any {
    try {
      return localDb.getUserByWalletAddress(walletAddress);
    } catch (error) {
      console.error('Error getting user by wallet address:', error);
      return null;
    }
  },

  createWalletUser(walletData: { walletAddress: string; provider: string; publicKey: string; name?: string }): any {
    try {
      const userData = {
        email: `${walletData.walletAddress}@wallet.local`, // Fake email for compatibility
        password: '', // No password for wallet users
        name: walletData.name || `User ${walletData.walletAddress.slice(0, 6)}...`,
        walletAddress: walletData.walletAddress,
        provider: 'wallet',
        walletProvider: walletData.provider,
        publicKey: walletData.publicKey,
        user_metadata: {
          name: walletData.name || `User ${walletData.walletAddress.slice(0, 6)}...`,
          walletAddress: walletData.walletAddress, // Add wallet address to metadata
          walletProvider: walletData.provider,
        }
      };

      return localDb.createUser(userData);
    } catch (error) {
      console.error('Error creating wallet user:', error);
      throw new Error('Failed to create wallet user');
    }
  }
};

export function useWalletAuth() {
  const [authState, setAuthState] = useState<WalletAuthState>({
    user: null,
    loading: true,
    session: null,
    walletConnected: false,
  });

  useEffect(() => {
    let isMounted = true;

    const initializeWalletAuth = async () => {
      try {
        // Check for existing wallet session on mount
        const session = walletSessionManager.getSession();
        
        if (!isMounted) return;

        if (session?.user) {
          setAuthState({
            user: session.user,
            loading: false,
            session,
            walletConnected: true,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            session: null,
            walletConnected: false,
          });
        }

        // Initialize demo data
        localDb.initializeDemoData();
      } catch (error) {
        console.error('Failed to initialize wallet auth:', error);
        if (isMounted) {
          setAuthState({
            user: null,
            loading: false,
            session: null,
            walletConnected: false,
          });
        }
      }
    };

    initializeWalletAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const connectWallet = async (walletConnection: WalletConnection) => {
    try {
      if (!walletConnection?.address?.trim()) {
        throw new Error('Wallet address is required');
      }

      const { address, provider, publicKey } = walletConnection;

      // Initialize Solana client with wallet if it's a Solana wallet
      if (provider === 'phantom' || provider === 'solflare' || provider === 'solana') {
        try {
          // Connect to Solana using simplified client
          await simpleSolanaClient.connect({
            publicKey: publicKey,
            provider: provider
          });
          console.log('✅ Solana client connected successfully');
        } catch (error) {
          console.warn('⚠️ Failed to connect Solana client:', error);
        }
      }

      // Check if user already exists
      let user = walletDb.getUserByWalletAddress(address);
      
      if (!user) {
        // Create new wallet user
        user = walletDb.createWalletUser({
          walletAddress: address,
          provider,
          publicKey,
          name: `User ${address.slice(0, 6)}...`
        });
      }

      const walletUser: WalletUser = {
        id: user.id,
        walletAddress: address,
        provider,
        publicKey,
        name: user.name || `User ${address.slice(0, 6)}...`,
        user_metadata: user.user_metadata,
      };

      const session: WalletSession = {
        user: walletUser,
        walletAddress: address,
        access_token: walletSessionManager.generateAccessToken(),
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      };

      walletSessionManager.saveSession(session);
      
      setAuthState({
        user: walletUser,
        loading: false,
        session,
        walletConnected: true,
      });

      return { user: walletUser, session };
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    // Disconnect from Solana client
    try {
      simpleSolanaClient.disconnect();
    } catch (error) {
      console.warn('⚠️ Failed to disconnect Solana client:', error);
    }
    
    walletSessionManager.clearSession();
    setAuthState({
      user: null,
      loading: false,
      session: null,
      walletConnected: false,
    });
  };

  const getSession = () => {
    return walletSessionManager.getSession();
  };

  // Helper function to get user for compatibility with existing components
  const getCompatibleUser = () => {
    if (!authState.user) return null;
    
    try {
      return {
        id: authState.user.id,
        email: `${authState.user.walletAddress}@wallet.local`,
        user_metadata: {
          name: authState.user.name,
          walletAddress: authState.user.walletAddress,
          walletProvider: authState.user.provider,
        }
      };
    } catch (error) {
      console.error('Error creating compatible user object:', error);
      return null;
    }
  };

  return {
    ...authState,
    connectWallet,
    disconnectWallet,
    getSession,
    // Compatibility functions for existing components
    signOut: disconnectWallet,
    user: getCompatibleUser(),
  };
}