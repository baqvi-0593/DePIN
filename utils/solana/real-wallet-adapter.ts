/**
 * Real Solana Wallet Adapter for Production
 * 
 * This file provides integration with actual Solana wallets like Phantom, Solflare, and Backpack.
 * 
 * INSTALLATION REQUIRED:
 * npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/web3.js
 * 
 * USAGE:
 * 1. Install the required packages
 * 2. Set VITE_USE_REAL_WALLETS=true in your .env file
 * 3. Wrap your app with WalletProvider (see example below)
 */

// Types for wallet detection
export interface DetectedWallet {
  name: string;
  icon: string;
  adapter: string;
  detected: boolean;
  downloadUrl: string;
}

/**
 * Detect which Solana wallets are installed in the browser
 */
export function detectInstalledWallets(): DetectedWallet[] {
  const wallets: DetectedWallet[] = [
    {
      name: 'Phantom',
      icon: '👻',
      adapter: 'phantom',
      detected: typeof window !== 'undefined' && 'phantom' in window && !!(window as any).phantom?.solana?.isPhantom,
      downloadUrl: 'https://phantom.app/download'
    },
    {
      name: 'Solflare',
      icon: '🔥',
      adapter: 'solflare',
      detected: typeof window !== 'undefined' && 'solflare' in window && !!(window as any).solflare?.isSolflare,
      downloadUrl: 'https://solflare.com/download'
    },
    {
      name: 'Backpack',
      icon: '🎒',
      adapter: 'backpack',
      detected: typeof window !== 'undefined' && 'backpack' in window && !!(window as any).backpack?.isBackpack,
      downloadUrl: 'https://backpack.app/download'
    },
  ];

  return wallets;
}

/**
 * Connect to a real Solana wallet
 */
export async function connectRealWallet(walletName: string): Promise<{
  publicKey: string;
  provider: string;
  connected: boolean;
}> {
  try {
    let wallet: any = null;

    // Get the wallet from browser window
    switch (walletName.toLowerCase()) {
      case 'phantom':
        if (typeof window !== 'undefined' && 'phantom' in window && (window as any).phantom?.solana) {
          wallet = (window as any).phantom.solana;
        }
        break;
      case 'solflare':
        if (typeof window !== 'undefined' && 'solflare' in window) {
          wallet = (window as any).solflare;
        }
        break;
      case 'backpack':
        if (typeof window !== 'undefined' && 'backpack' in window) {
          wallet = (window as any).backpack;
        }
        break;
    }

    if (!wallet) {
      throw new Error(`${walletName} wallet not found. Please install it first.`);
    }

    // Connect to the wallet
    const response = await wallet.connect();
    const publicKey = response.publicKey.toString();

    console.log(`✅ Connected to ${walletName} wallet:`, publicKey);

    return {
      publicKey,
      provider: walletName.toLowerCase(),
      connected: true
    };
  } catch (error: any) {
    console.error(`Failed to connect to ${walletName}:`, error);
    throw new Error(error.message || `Failed to connect to ${walletName}`);
  }
}

/**
 * Disconnect from a real Solana wallet
 */
export async function disconnectRealWallet(walletName: string): Promise<void> {
  try {
    let wallet: any = null;

    switch (walletName.toLowerCase()) {
      case 'phantom':
        if (typeof window !== 'undefined' && 'phantom' in window && (window as any).phantom?.solana) {
          wallet = (window as any).phantom.solana;
        }
        break;
      case 'solflare':
        if (typeof window !== 'undefined' && 'solflare' in window) {
          wallet = (window as any).solflare;
        }
        break;
      case 'backpack':
        if (typeof window !== 'undefined' && 'backpack' in window) {
          wallet = (window as any).backpack;
        }
        break;
    }

    if (wallet && wallet.disconnect) {
      await wallet.disconnect();
      console.log(`✅ Disconnected from ${walletName} wallet`);
    }
  } catch (error) {
    console.error(`Failed to disconnect from ${walletName}:`, error);
  }
}

/**
 * Sign a transaction with the connected wallet
 */
export async function signTransaction(walletName: string, transaction: any): Promise<any> {
  try {
    let wallet: any = null;

    switch (walletName.toLowerCase()) {
      case 'phantom':
        if (typeof window !== 'undefined' && 'phantom' in window && (window as any).phantom?.solana) {
          wallet = (window as any).phantom.solana;
        }
        break;
      case 'solflare':
        if (typeof window !== 'undefined' && 'solflare' in window) {
          wallet = (window as any).solflare;
        }
        break;
      case 'backpack':
        if (typeof window !== 'undefined' && 'backpack' in window) {
          wallet = (window as any).backpack;
        }
        break;
    }

    if (!wallet || !wallet.signTransaction) {
      throw new Error(`${walletName} wallet not connected or doesn't support signing`);
    }

    const signedTransaction = await wallet.signTransaction(transaction);
    return signedTransaction;
  } catch (error: any) {
    console.error(`Failed to sign transaction with ${walletName}:`, error);
    throw new Error(error.message || 'Failed to sign transaction');
  }
}

/**
 * Get wallet public key
 */
export async function getWalletPublicKey(walletName: string): Promise<string | null> {
  try {
    let wallet: any = null;

    switch (walletName.toLowerCase()) {
      case 'phantom':
        if (typeof window !== 'undefined' && 'phantom' in window && (window as any).phantom?.solana) {
          wallet = (window as any).phantom.solana;
        }
        break;
      case 'solflare':
        if (typeof window !== 'undefined' && 'solflare' in window) {
          wallet = (window as any).solflare;
        }
        break;
      case 'backpack':
        if (typeof window !== 'undefined' && 'backpack' in window) {
          wallet = (window as any).backpack;
        }
        break;
    }

    if (wallet && wallet.publicKey) {
      return wallet.publicKey.toString();
    }

    return null;
  } catch (error) {
    console.error(`Failed to get public key from ${walletName}:`, error);
    return null;
  }
}
