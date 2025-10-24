// Simplified Solana client for development
// This avoids complex imports that may cause build issues

export interface SimpleSolanaWallet {
  publicKey: string;
  provider: string;
}

export class SimpleSolanaClient {
  private network: string;
  private connected: boolean = false;
  private wallet: SimpleSolanaWallet | null = null;

  constructor(network: string = 'devnet') {
    this.network = network;
  }

  async connect(wallet: SimpleSolanaWallet): Promise<boolean> {
    try {
      this.wallet = wallet;
      this.connected = true;
      console.log(`✅ Connected to Solana ${this.network} with wallet ${wallet.publicKey.slice(0, 8)}...`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Solana:', error);
      return false;
    }
  }

  disconnect(): void {
    this.wallet = null;
    this.connected = false;
    console.log('🔌 Disconnected from Solana');
  }

  isConnected(): boolean {
    return this.connected;
  }

  getWallet(): SimpleSolanaWallet | null {
    return this.wallet;
  }

  getNetwork(): string {
    return this.network;
  }

  // Mock functions for development
  async getBalance(): Promise<number> {
    if (!this.connected) return 0;
    // Return mock balance
    return Math.random() * 1000 + 500;
  }

  async getTokenBalance(): Promise<number> {
    if (!this.connected) return 0;
    // Return mock PKN balance
    return Math.random() * 5000 + 1000;
  }

  async submitWiFiData(data: any): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    console.log('📡 Submitting WiFi data to Solana:', data);
    // Return mock transaction signature
    return `${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 9)}`;
  }

  async submitLogisticsData(data: any): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    console.log('🚚 Submitting logistics data to Solana:', data);
    // Return mock transaction signature
    return `${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 9)}`;
  }

  async submitAgricultureData(data: any): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    console.log('🌾 Submitting agriculture data to Solana:', data);
    // Return mock transaction signature
    return `${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 9)}`;
  }

  async stakeTokens(amount: number, poolType: string): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    console.log(`💰 Staking ${amount} PKN in ${poolType} pool`);
    // Return mock transaction signature
    return `${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 9)}`;
  }

  async unstakeTokens(amount: number): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    console.log(`💸 Unstaking ${amount} PKN`);
    // Return mock transaction signature
    return `${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 9)}`;
  }

  async claimRewards(): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    console.log('🎁 Claiming staking rewards');
    // Return mock transaction signature
    return `${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 9)}`;
  }

  getExplorerUrl(signature: string): string {
    const baseUrl = this.network === 'mainnet' 
      ? 'https://explorer.solana.com' 
      : `https://explorer.solana.com?cluster=${this.network}`;
    
    return `${baseUrl}/tx/${signature}`;
  }
}

// Create singleton instance
export const simpleSolanaClient = new SimpleSolanaClient('devnet');