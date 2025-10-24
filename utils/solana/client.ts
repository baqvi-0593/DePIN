// Advanced Solana client with full Web3.js integration
// Note: This module requires @solana/web3.js and @project-serum/anchor to be installed
// For development without these dependencies, use simple-client.ts instead

// This file is preserved for future production use when Solana dependencies are fully integrated
// Currently using simple-client.ts to avoid build issues

export class SolanaClientPlaceholder {
  constructor() {
    console.log('📝 SolanaClient placeholder - use simple-client.ts for development');
  }
}

export const solanaClient = new SolanaClientPlaceholder();

// Program ID - this should match your deployed program ID
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// Network endpoints
const NETWORKS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localnet: 'http://127.0.0.1:8899',
} as const;

export type NetworkType = keyof typeof NETWORKS;

export class SolanaClient {
  public connection: Connection;
  public program: Program<DePINNetwork> | null = null;
  public provider: AnchorProvider | null = null;
  private network: NetworkType;

  constructor(network: NetworkType = 'devnet') {
    this.network = network;
    this.connection = new Connection(
      NETWORKS[network],
      { commitment: 'confirmed' }
    );
  }

  /**
   * Initialize the program with a wallet
   */
  async initializeProgram(wallet: Wallet): Promise<Program<DePINNetwork>> {
    try {
      this.provider = new AnchorProvider(
        this.connection,
        wallet,
        { commitment: 'confirmed' }
      );

      this.program = new Program<DePINNetwork>(
        IDL,
        PROGRAM_ID,
        this.provider
      );

      console.log('✅ Solana program initialized successfully');
      console.log('📍 Network:', this.network);
      console.log('🏛️ Program ID:', PROGRAM_ID.toString());
      
      return this.program;
    } catch (error) {
      console.error('❌ Failed to initialize Solana program:', error);
      throw new Error(`Failed to initialize Solana program: ${error}`);
    }
  }

  /**
   * Get program derived addresses
   */
  getPDAs() {
    const [networkState] = PublicKey.findProgramAddressSync(
      [Buffer.from('network_state')],
      PROGRAM_ID
    );

    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint')],
      PROGRAM_ID
    );

    return { networkState, mint };
  }

  /**
   * Get user-specific PDAs
   */
  getUserPDAs(userPublicKey: PublicKey) {
    const [userProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), userPublicKey.toBuffer()],
      PROGRAM_ID
    );

    const [wifiHotspot] = PublicKey.findProgramAddressSync(
      [Buffer.from('wifi_hotspot'), userPublicKey.toBuffer()],
      PROGRAM_ID
    );

    const [logisticsPartner] = PublicKey.findProgramAddressSync(
      [Buffer.from('logistics_partner'), userPublicKey.toBuffer()],
      PROGRAM_ID
    );

    const [farm] = PublicKey.findProgramAddressSync(
      [Buffer.from('farm'), userPublicKey.toBuffer()],
      PROGRAM_ID
    );

    return {
      userProfile,
      wifiHotspot,
      logisticsPartner,
      farm
    };
  }

  /**
   * Get staking pool PDA
   */
  getStakingPoolPDA(poolType: number) {
    const [stakingPool] = PublicKey.findProgramAddressSync(
      [Buffer.from('staking_pool'), Buffer.from([poolType])],
      PROGRAM_ID
    );

    return stakingPool;
  }

  /**
   * Get user stake PDA
   */
  getUserStakePDA(userPublicKey: PublicKey, stakingPool: PublicKey) {
    const [userStake] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_stake'),
        userPublicKey.toBuffer(),
        stakingPool.toBuffer()
      ],
      PROGRAM_ID
    );

    return userStake;
  }

  /**
   * Initialize the DePIN network (admin only)
   */
  async initializeNetwork(
    authorityKeypair: Keypair,
    totalSupply: BN = new BN(1_000_000_000 * 10 ** 9) // 1B PKN with 9 decimals
  ): Promise<string> {
    if (!this.program) throw new Error('Program not initialized');

    try {
      const { networkState, mint } = this.getPDAs();

      const tx = await this.program.methods
        .initialize(totalSupply, 9)
        .accounts({
          networkState,
          mint,
          authority: authorityKeypair.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([authorityKeypair])
        .rpc();

      console.log('✅ Network initialized successfully');
      console.log('📄 Transaction signature:', tx);
      
      return tx;
    } catch (error) {
      console.error('❌ Failed to initialize network:', error);
      throw error;
    }
  }

  /**
   * Register a WiFi hotspot
   */
  async registerWiFiHotspot(
    location: string,
    coverageRadius: number,
    bandwidthMbps: number
  ): Promise<string> {
    if (!this.program || !this.provider) throw new Error('Program not initialized');

    try {
      const { networkState } = this.getPDAs();
      const { userProfile, wifiHotspot } = this.getUserPDAs(this.provider.wallet.publicKey);

      const tx = await this.program.methods
        .registerWifiHotspot(location, coverageRadius, bandwidthMbps)
        .accounts({
          wifiHotspot,
          networkState,
          userProfile,
          owner: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ WiFi hotspot registered successfully');
      console.log('📄 Transaction signature:', tx);
      
      return tx;
    } catch (error) {
      console.error('❌ Failed to register WiFi hotspot:', error);
      throw error;
    }
  }

  /**
   * Register a logistics partner
   */
  async registerLogisticsPartner(
    partnerName: string,
    serviceAreas: string[],
    vehicleCount: number
  ): Promise<string> {
    if (!this.program || !this.provider) throw new Error('Program not initialized');

    try {
      const { networkState } = this.getPDAs();
      const { userProfile, logisticsPartner } = this.getUserPDAs(this.provider.wallet.publicKey);

      const tx = await this.program.methods
        .registerLogisticsPartner(partnerName, serviceAreas, vehicleCount)
        .accounts({
          logisticsPartner,
          networkState,
          userProfile,
          owner: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Logistics partner registered successfully');
      console.log('📄 Transaction signature:', tx);
      
      return tx;
    } catch (error) {
      console.error('❌ Failed to register logistics partner:', error);
      throw error;
    }
  }

  /**
   * Register a farm
   */
  async registerFarm(
    farmName: string,
    location: string,
    farmSizeAcres: number,
    cropTypes: string[]
  ): Promise<string> {
    if (!this.program || !this.provider) throw new Error('Program not initialized');

    try {
      const { networkState } = this.getPDAs();
      const { userProfile, farm } = this.getUserPDAs(this.provider.wallet.publicKey);

      const tx = await this.program.methods
        .registerFarm(farmName, location, farmSizeAcres, cropTypes)
        .accounts({
          farm,
          networkState,
          userProfile,
          owner: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Farm registered successfully');
      console.log('📄 Transaction signature:', tx);
      
      return tx;
    } catch (error) {
      console.error('❌ Failed to register farm:', error);
      throw error;
    }
  }

  /**
   * Submit WiFi data for rewards
   */
  async submitWiFiData(
    usersConnected: number,
    dataTransferredGb: BN,
    uptimePercentage: number
  ): Promise<string> {
    if (!this.program || !this.provider) throw new Error('Program not initialized');

    try {
      const { networkState, mint } = this.getPDAs();
      const { userProfile, wifiHotspot } = this.getUserPDAs(this.provider.wallet.publicKey);
      
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        this.provider.wallet.publicKey
      );

      const tx = await this.program.methods
        .submitWifiData(usersConnected, dataTransferredGb, uptimePercentage)
        .accounts({
          wifiHotspot,
          userProfile,
          userTokenAccount,
          mint,
          networkState,
          owner: this.provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log('✅ WiFi data submitted successfully');
      console.log('📄 Transaction signature:', tx);
      
      return tx;
    } catch (error) {
      console.error('❌ Failed to submit WiFi data:', error);
      throw error;
    }
  }

  /**
   * Submit logistics data for rewards
   */
  async submitLogisticsData(
    deliveriesCompleted: number,
    distanceTraveledKm: number,
    fuelEfficiency: number,
    routeOptimizationScore: number
  ): Promise<string> {
    if (!this.program || !this.provider) throw new Error('Program not initialized');

    try {
      const { networkState } = this.getPDAs();
      const { userProfile, logisticsPartner } = this.getUserPDAs(this.provider.wallet.publicKey);

      const tx = await this.program.methods
        .submitLogisticsData(
          deliveriesCompleted,
          distanceTraveledKm,
          fuelEfficiency,
          routeOptimizationScore
        )
        .accounts({
          logisticsPartner,
          userProfile,
          networkState,
          owner: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log('✅ Logistics data submitted successfully');
      console.log('📄 Transaction signature:', tx);
      
      return tx;
    } catch (error) {
      console.error('❌ Failed to submit logistics data:', error);
      throw error;
    }
  }

  /**
   * Submit agriculture data for rewards
   */
  async submitAgricultureData(
    soilMoisture: number,
    temperature: number,
    humidity: number,
    phLevel: number
  ): Promise<string> {
    if (!this.program || !this.provider) throw new Error('Program not initialized');

    try {
      const { networkState } = this.getPDAs();
      const { userProfile, farm } = this.getUserPDAs(this.provider.wallet.publicKey);

      const tx = await this.program.methods
        .submitAgricultureData(soilMoisture, temperature, humidity, phLevel)
        .accounts({
          farm,
          userProfile,
          networkState,
          owner: this.provider.wallet.publicKey,
        })
        .rpc();

      console.log('✅ Agriculture data submitted successfully');
      console.log('📄 Transaction signature:', tx);
      
      return tx;
    } catch (error) {
      console.error('❌ Failed to submit agriculture data:', error);
      throw error;
    }
  }

  /**
   * Stake tokens in a pool
   */
  async stakeTokens(amount: BN, poolType: number): Promise<string> {
    if (!this.program || !this.provider) throw new Error('Program not initialized');

    try {
      const { networkState, mint } = this.getPDAs();
      const { userProfile } = this.getUserPDAs(this.provider.wallet.publicKey);
      const stakingPool = this.getStakingPoolPDA(poolType);
      const userStake = this.getUserStakePDA(this.provider.wallet.publicKey, stakingPool);
      
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        this.provider.wallet.publicKey
      );
      
      const poolTokenAccount = await getAssociatedTokenAddress(
        mint,
        stakingPool
      );

      const tx = await this.program.methods
        .stakeTokens(amount, { wifiInfrastructure: {} }) // Adjust based on pool type
        .accounts({
          stakingPool,
          userStake,
          userTokenAccount,
          poolTokenAccount,
          mint,
          networkState,
          userProfile,
          user: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log('✅ Tokens staked successfully');
      console.log('📄 Transaction signature:', tx);
      
      return tx;
    } catch (error) {
      console.error('❌ Failed to stake tokens:', error);
      throw error;
    }
  }

  /**
   * Get network state
   */
  async getNetworkState(): Promise<any> {
    if (!this.program) throw new Error('Program not initialized');

    try {
      const { networkState } = this.getPDAs();
      const account = await this.program.account.networkState.fetch(networkState);
      return account;
    } catch (error) {
      console.error('❌ Failed to fetch network state:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userPublicKey?: PublicKey): Promise<any> {
    if (!this.program) throw new Error('Program not initialized');

    try {
      const publicKey = userPublicKey || this.provider?.wallet.publicKey;
      if (!publicKey) throw new Error('No public key provided');

      const { userProfile } = this.getUserPDAs(publicKey);
      const account = await this.program.account.userProfile.fetch(userProfile);
      return account;
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Get user's WiFi hotspot
   */
  async getWiFiHotspot(userPublicKey?: PublicKey): Promise<any> {
    if (!this.program) throw new Error('Program not initialized');

    try {
      const publicKey = userPublicKey || this.provider?.wallet.publicKey;
      if (!publicKey) throw new Error('No public key provided');

      const { wifiHotspot } = this.getUserPDAs(publicKey);
      const account = await this.program.account.wiFiHotspot.fetch(wifiHotspot);
      return account;
    } catch (error) {
      console.error('❌ Failed to fetch WiFi hotspot:', error);
      return null; // Return null if not found
    }
  }

  /**
   * Get user's logistics partner
   */
  async getLogisticsPartner(userPublicKey?: PublicKey): Promise<any> {
    if (!this.program) throw new Error('Program not initialized');

    try {
      const publicKey = userPublicKey || this.provider?.wallet.publicKey;
      if (!publicKey) throw new Error('No public key provided');

      const { logisticsPartner } = this.getUserPDAs(publicKey);
      const account = await this.program.account.logisticsPartner.fetch(logisticsPartner);
      return account;
    } catch (error) {
      console.error('❌ Failed to fetch logistics partner:', error);
      return null; // Return null if not found
    }
  }

  /**
   * Get user's farm
   */
  async getFarm(userPublicKey?: PublicKey): Promise<any> {
    if (!this.program) throw new Error('Program not initialized');

    try {
      const publicKey = userPublicKey || this.provider?.wallet.publicKey;
      if (!publicKey) throw new Error('No public key provided');

      const { farm } = this.getUserPDAs(publicKey);
      const account = await this.program.account.farm.fetch(farm);
      return account;
    } catch (error) {
      console.error('❌ Failed to fetch farm:', error);
      return null; // Return null if not found
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(userPublicKey?: PublicKey): Promise<number> {
    try {
      const publicKey = userPublicKey || this.provider?.wallet.publicKey;
      if (!publicKey) throw new Error('No public key provided');

      const { mint } = this.getPDAs();
      const tokenAccount = await getAssociatedTokenAddress(mint, publicKey);
      
      const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      return accountInfo.value.uiAmount || 0;
    } catch (error) {
      console.error('❌ Failed to fetch token balance:', error);
      return 0;
    }
  }

  /**
   * Get SOL balance
   */
  async getSolBalance(userPublicKey?: PublicKey): Promise<number> {
    try {
      const publicKey = userPublicKey || this.provider?.wallet.publicKey;
      if (!publicKey) throw new Error('No public key provided');

      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('❌ Failed to fetch SOL balance:', error);
      return 0;
    }
  }

  /**
   * Airdrop SOL for testing (devnet/localnet only)
   */
  async airdropSol(amount: number = 1, userPublicKey?: PublicKey): Promise<string> {
    if (this.network === 'mainnet') {
      throw new Error('Airdrop not available on mainnet');
    }

    try {
      const publicKey = userPublicKey || this.provider?.wallet.publicKey;
      if (!publicKey) throw new Error('No public key provided');

      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      await this.connection.confirmTransaction(signature);
      
      console.log(`✅ Airdropped ${amount} SOL to ${publicKey.toString()}`);
      console.log('📄 Transaction signature:', signature);
      
      return signature;
    } catch (error) {
      console.error('❌ Failed to airdrop SOL:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const solanaClient = new SolanaClient(
  (process.env.NODE_ENV === 'production' ? 'mainnet' : 'devnet') as NetworkType
);

// Helper function to create a wallet from private key
export function createWalletFromPrivateKey(privateKeyArray: number[]): Wallet {
  const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
  return new Wallet(keypair);
}

// Helper function to get network explorer URL
export function getExplorerUrl(signature: string, network: NetworkType): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.solana.com' 
    : `https://explorer.solana.com?cluster=${network}`;
  
  return `${baseUrl}/tx/${signature}`;
}

export default SolanaClient;