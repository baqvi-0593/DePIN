/**
 * Wallet Diagnostics Utility
 * 
 * Helpful functions for debugging wallet connectivity issues.
 * Use these in the browser console or add to your components for troubleshooting.
 */

export interface WalletDiagnostics {
  mode: 'demo' | 'production';
  wallets: {
    phantom: {
      installed: boolean;
      connected: boolean;
      address?: string;
    };
    solflare: {
      installed: boolean;
      connected: boolean;
      address?: string;
    };
    backpack: {
      installed: boolean;
      connected: boolean;
      address?: string;
    };
  };
  session: {
    exists: boolean;
    walletAddress?: string;
    provider?: string;
    expiresAt?: number;
    isExpired?: boolean;
  };
  environment: {
    useRealWallets: boolean;
    solanaNetwork: string;
    programId: string;
  };
}

/**
 * Get comprehensive wallet diagnostics
 */
export function getWalletDiagnostics(): WalletDiagnostics {
  // Safely access environment variables with fallbacks
  let useRealWallets = false;
  try {
    useRealWallets = import.meta.env?.VITE_USE_REAL_WALLETS === 'true';
  } catch (e) {
    // Environment variable not available
  }
  
  // Check wallet installations
  const phantomInstalled = typeof window !== 'undefined' && 
    'phantom' in window && 
    !!(window as any).phantom?.solana?.isPhantom;
    
  const solflareInstalled = typeof window !== 'undefined' && 
    'solflare' in window && 
    !!(window as any).solflare?.isSolflare;
    
  const backpackInstalled = typeof window !== 'undefined' && 
    'backpack' in window && 
    !!(window as any).backpack?.isBackpack;

  // Check wallet connections
  const phantomConnected = phantomInstalled && (window as any).phantom?.solana?.publicKey !== null;
  const solflareConnected = solflareInstalled && (window as any).solflare?.publicKey !== null;
  const backpackConnected = backpackInstalled && (window as any).backpack?.publicKey !== null;

  // Get addresses
  const phantomAddress = phantomConnected ? (window as any).phantom?.solana?.publicKey?.toString() : undefined;
  const solflareAddress = solflareConnected ? (window as any).solflare?.publicKey?.toString() : undefined;
  const backpackAddress = backpackConnected ? (window as any).backpack?.publicKey?.toString() : undefined;

  // Check session
  let session: WalletDiagnostics['session'] = { exists: false };
  try {
    const sessionData = localStorage.getItem('pakistani_depin_wallet_session');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      const now = Date.now();
      session = {
        exists: true,
        walletAddress: parsedSession.walletAddress,
        provider: parsedSession.user?.provider,
        expiresAt: parsedSession.expires_at,
        isExpired: now > parsedSession.expires_at
      };
    }
  } catch (error) {
    console.warn('Failed to parse wallet session:', error);
  }

  // Safely access environment variables
  let solanaNetwork = 'devnet';
  let programId = 'not-set';
  try {
    solanaNetwork = import.meta.env?.VITE_SOLANA_NETWORK || 'devnet';
    programId = import.meta.env?.VITE_PROGRAM_ID || 'not-set';
  } catch (e) {
    // Environment variables not available
  }

  return {
    mode: useRealWallets ? 'production' : 'demo',
    wallets: {
      phantom: {
        installed: !!phantomInstalled,
        connected: !!phantomConnected,
        address: phantomAddress
      },
      solflare: {
        installed: !!solflareInstalled,
        connected: !!solflareConnected,
        address: solflareAddress
      },
      backpack: {
        installed: !!backpackInstalled,
        connected: !!backpackConnected,
        address: backpackAddress
      }
    },
    session,
    environment: {
      useRealWallets,
      solanaNetwork,
      programId
    }
  };
}

/**
 * Print formatted diagnostics to console
 */
export function printWalletDiagnostics(): void {
  const diagnostics = getWalletDiagnostics();
  
  console.group('🔍 BuildPK Wallet Diagnostics');
  
  console.log(`%c📊 Mode: ${diagnostics.mode.toUpperCase()}`, 
    `color: ${diagnostics.mode === 'production' ? '#10b981' : '#3b82f6'}; font-weight: bold; font-size: 14px`);
  
  console.group('💼 Wallets');
  Object.entries(diagnostics.wallets).forEach(([name, info]) => {
    const icon = info.installed ? '✅' : '❌';
    const status = info.connected ? '🔗 Connected' : info.installed ? '📦 Installed' : '⬇️ Not Installed';
    console.log(`${icon} ${name.charAt(0).toUpperCase() + name.slice(1)}: ${status}`);
    if (info.address) {
      console.log(`   Address: ${info.address.slice(0, 8)}...${info.address.slice(-8)}`);
    }
  });
  console.groupEnd();
  
  console.group('🔑 Session');
  if (diagnostics.session.exists) {
    console.log(`✅ Session exists`);
    console.log(`   Provider: ${diagnostics.session.provider || 'unknown'}`);
    console.log(`   Address: ${diagnostics.session.walletAddress?.slice(0, 8)}...${diagnostics.session.walletAddress?.slice(-8)}`);
    console.log(`   Expired: ${diagnostics.session.isExpired ? '❌ Yes' : '✅ No'}`);
    if (diagnostics.session.expiresAt) {
      console.log(`   Expires: ${new Date(diagnostics.session.expiresAt).toLocaleString()}`);
    }
  } else {
    console.log('❌ No active session');
  }
  console.groupEnd();
  
  console.group('⚙️ Environment');
  console.log(`Network: ${diagnostics.environment.solanaNetwork}`);
  console.log(`Program ID: ${diagnostics.environment.programId}`);
  console.log(`Real Wallets: ${diagnostics.environment.useRealWallets ? '✅ Enabled' : '❌ Disabled (Demo)'}`);
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * Check if wallet connectivity is properly configured
 */
export function validateWalletSetup(): {
  valid: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
} {
  const diagnostics = getWalletDiagnostics();
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check mode-specific issues
  if (diagnostics.mode === 'production') {
    // Production mode checks
    const hasAnyWallet = Object.values(diagnostics.wallets).some(w => w.installed);
    
    if (!hasAnyWallet) {
      issues.push('No Solana wallets installed. Users cannot connect in production mode.');
      recommendations.push('Install Phantom wallet: https://phantom.app/download');
    }

    if (diagnostics.environment.programId === 'not-set') {
      warnings.push('VITE_PROGRAM_ID not set. Smart contract interactions will fail.');
      recommendations.push('Deploy smart contracts and set VITE_PROGRAM_ID in .env');
    }

    if (diagnostics.environment.solanaNetwork === 'devnet') {
      warnings.push('Using devnet. Switch to mainnet-beta for production.');
    }

    if (!diagnostics.session.exists) {
      recommendations.push('No wallet connected. Click "Connect Wallet" to test.');
    }
  } else {
    // Demo mode checks
    if (diagnostics.session.exists && diagnostics.session.isExpired) {
      warnings.push('Demo session expired. Reconnect to continue.');
    }
  }

  // Check for conflicting states
  if (diagnostics.mode === 'production' && diagnostics.session.exists) {
    const connectedWallet = Object.entries(diagnostics.wallets).find(([name, info]) => 
      info.connected && name === diagnostics.session.provider
    );
    
    if (!connectedWallet) {
      warnings.push('Session exists but wallet is not connected. Try reconnecting.');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    recommendations
  };
}

/**
 * Print validation results
 */
export function printWalletValidation(): void {
  const validation = validateWalletSetup();
  
  console.group('✅ Wallet Setup Validation');
  
  if (validation.valid) {
    console.log('%c✅ All checks passed!', 'color: #10b981; font-weight: bold; font-size: 14px');
  } else {
    console.log('%c❌ Issues found', 'color: #ef4444; font-weight: bold; font-size: 14px');
  }
  
  if (validation.issues.length > 0) {
    console.group('🔴 Issues');
    validation.issues.forEach(issue => console.error(`❌ ${issue}`));
    console.groupEnd();
  }
  
  if (validation.warnings.length > 0) {
    console.group('⚠️ Warnings');
    validation.warnings.forEach(warning => console.warn(`��️ ${warning}`));
    console.groupEnd();
  }
  
  if (validation.recommendations.length > 0) {
    console.group('💡 Recommendations');
    validation.recommendations.forEach(rec => console.log(`💡 ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Run full diagnostics and print results
 */
export function runWalletDiagnostics(): void {
  console.clear();
  console.log('%c🏗️ BuildPK - Wallet Diagnostics', 
    'color: #10b981; font-weight: bold; font-size: 16px; padding: 10px 0;');
  console.log('');
  
  printWalletDiagnostics();
  console.log('');
  printWalletValidation();
  console.log('');
  
  console.log('%cℹ️ To run again, use: runWalletDiagnostics()', 
    'color: #6b7280; font-style: italic');
}

// Make available globally for browser console use
if (typeof window !== 'undefined') {
  try {
    (window as any).walletDiagnostics = {
      run: runWalletDiagnostics,
      get: getWalletDiagnostics,
      print: printWalletDiagnostics,
      validate: validateWalletSetup,
      printValidation: printWalletValidation
    };
    
    // Helpful console message
    console.log(
      '%c💡 Tip: Use walletDiagnostics.run() to check wallet connection status',
      'color: #10b981; font-style: italic'
    );
  } catch (error) {
    // Silently fail if console is not available
  }
}

export default {
  get: getWalletDiagnostics,
  print: printWalletDiagnostics,
  validate: validateWalletSetup,
  printValidation: printWalletValidation,
  run: runWalletDiagnostics
};
