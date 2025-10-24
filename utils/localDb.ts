import { getStorageItem, setStorageItem } from './storageHelpers';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  user_metadata?: {
    name?: string;
    walletAddress?: string;
    walletProvider?: string;
  };
  provider?: 'email' | 'google' | 'wallet';
  walletAddress?: string;
  walletProvider?: string;
  publicKey?: string;
  createdAt: string;
}

interface TokenBalance {
  userId: string;
  tokens: number;
  staked: number;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'earned' | 'staked' | 'unstaked' | 'transferred';
  amount: number;
  description: string;
  timestamp: string;
}

interface Hotspot {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  operatorId: string;
  earnings: number;
  users: number;
  uptime: number;
  createdAt: string;
}

interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  rating: number;
  deliveries: number;
  earnings: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  size: number;
  cropType: string;
  sensors: number;
  lastUpdate: string;
  earnings: number;
  createdAt: string;
}

interface HealthcareProvider {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'diagnostic_center' | 'pharmacy';
  location: string;
  address: string;
  license: string;
  capacity: number; // beds/patients per day
  dataPoints: number; // number of anonymized records shared
  earnings: number;
  status: 'active' | 'inactive' | 'pending';
  registeredBy: string;
  createdAt: string;
}

interface TaxCollectionPoint {
  id: string;
  name: string;
  type: 'fbr_office' | 'provincial_office' | 'excise_office' | 'customs_office';
  location: string;
  address: string;
  jurisdiction: string;
  transactionsLogged: number;
  dataPoints: number;
  earnings: number;
  status: 'active' | 'inactive';
  registeredBy: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'reward' | 'system' | 'verification' | 'governance' | 'security';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  code: string;
  status: 'pending' | 'completed';
  reward: number;
  createdAt: string;
}

interface VerificationQueue {
  id: string;
  resourceType: 'hotspot' | 'partner' | 'farm' | 'healthcare' | 'tax_point';
  resourceId: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface GovernanceProposal {
  id: string;
  proposerId: string;
  title: string;
  description: string;
  type: 'parameter_change' | 'treasury_allocation' | 'feature_request' | 'partnership';
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

interface Vote {
  id: string;
  proposalId: string;
  voterId: string;
  vote: 'for' | 'against' | 'abstain';
  votingPower: number;
  createdAt: string;
}

class LocalDatabase {
  private getKey(table: string): string {
    return `pakistani_depin_${table}`;
  }

  private get<T>(key: string): T[] 
  private get<T>(key: string, defaultValue: T): T
  private get<T>(key: string, defaultValue?: T): T[] | T {
    const data = getStorageItem(key);
    if (!data) {
      return defaultValue !== undefined ? defaultValue : [];
    }
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn(`Failed to parse data for key ${key}:`, error);
      return defaultValue !== undefined ? defaultValue : [];
    }
  }

  private set<T>(key: string, data: T[] | T): void {
    try {
      const success = setStorageItem(key, JSON.stringify(data));
      if (!success) {
        console.warn(`Failed to save data for key ${key}`);
      }
    } catch (error) {
      console.warn(`Failed to serialize data for key ${key}:`, error);
    }
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Users
  getUsers(): User[] {
    return this.get<User>(this.getKey('users'));
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    this.set(this.getKey('users'), users);
    return user;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  getAllUsers(): User[] {
    return this.getUsers();
  }

  getUserByWalletAddress(walletAddress: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.walletAddress === walletAddress) || null;
  }

  // Token Balances
  getTokenBalance(userId: string): TokenBalance {
    const balances = this.get<TokenBalance>(this.getKey('token_balances'));
    const existing = balances.find(b => b.userId === userId);
    
    if (existing) {
      return existing;
    }

    // Create default balance for new user
    const newBalance: TokenBalance = {
      userId,
      tokens: 100, // Starting bonus
      staked: 0,
      lastUpdated: new Date().toISOString(),
    };
    
    balances.push(newBalance);
    this.set(this.getKey('token_balances'), balances);
    return newBalance;
  }

  updateTokenBalance(userId: string, updates: Partial<TokenBalance>): void {
    const balances = this.get<TokenBalance>(this.getKey('token_balances'));
    const index = balances.findIndex(b => b.userId === userId);
    
    if (index >= 0) {
      balances[index] = { ...balances[index], ...updates, lastUpdated: new Date().toISOString() };
    } else {
      balances.push({
        userId,
        tokens: updates.tokens || 0,
        staked: updates.staked || 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    
    this.set(this.getKey('token_balances'), balances);
  }

  // Transactions
  getTransactions(userId: string): Transaction[] {
    const transactions = this.get<Transaction>(this.getKey('transactions'));
    return transactions.filter(t => t.userId === userId);
  }

  createTransaction(transactionData: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const transactions = this.get<Transaction>(this.getKey('transactions'));
    const transaction: Transaction = {
      ...transactionData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };
    transactions.push(transaction);
    this.set(this.getKey('transactions'), transactions);
    return transaction;
  }

  // Hotspots
  getHotspots(): Hotspot[] {
    return this.get<Hotspot>(this.getKey('hotspots'));
  }

  createHotspot(hotspotData: Omit<Hotspot, 'id' | 'createdAt'>): Hotspot {
    const hotspots = this.getHotspots();
    const hotspot: Hotspot = {
      ...hotspotData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    hotspots.push(hotspot);
    this.set(this.getKey('hotspots'), hotspots);
    return hotspot;
  }

  updateHotspot(id: string, updates: Partial<Hotspot>): void {
    const hotspots = this.getHotspots();
    const index = hotspots.findIndex(h => h.id === id);
    if (index >= 0) {
      hotspots[index] = { ...hotspots[index], ...updates };
      this.set(this.getKey('hotspots'), hotspots);
    }
  }

  // Delivery Partners
  getDeliveryPartners(): DeliveryPartner[] {
    return this.get<DeliveryPartner>(this.getKey('delivery_partners'));
  }

  createDeliveryPartner(partnerData: Omit<DeliveryPartner, 'id' | 'createdAt'>): DeliveryPartner {
    const partners = this.getDeliveryPartners();
    const partner: DeliveryPartner = {
      ...partnerData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    partners.push(partner);
    this.set(this.getKey('delivery_partners'), partners);
    return partner;
  }

  // Farms
  getFarms(): Farm[] {
    return this.get<Farm>(this.getKey('farms'));
  }

  createFarm(farmData: Omit<Farm, 'id' | 'createdAt'>): Farm {
    const farms = this.getFarms();
    const farm: Farm = {
      ...farmData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    farms.push(farm);
    this.set(this.getKey('farms'), farms);
    return farm;
  }

  // Healthcare Providers
  getHealthcareProviders(): HealthcareProvider[] {
    return this.get<HealthcareProvider>(this.getKey('healthcare_providers'));
  }

  createHealthcareProvider(providerData: Omit<HealthcareProvider, 'id' | 'createdAt'>): HealthcareProvider {
    const providers = this.getHealthcareProviders();
    const provider: HealthcareProvider = {
      ...providerData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    providers.push(provider);
    this.set(this.getKey('healthcare_providers'), providers);
    return provider;
  }

  updateHealthcareProvider(id: string, updates: Partial<HealthcareProvider>): void {
    const providers = this.getHealthcareProviders();
    const index = providers.findIndex(p => p.id === id);
    if (index >= 0) {
      providers[index] = { ...providers[index], ...updates };
      this.set(this.getKey('healthcare_providers'), providers);
    }
  }

  // Tax Collection Points
  getTaxCollectionPoints(): TaxCollectionPoint[] {
    return this.get<TaxCollectionPoint>(this.getKey('tax_collection_points'));
  }

  createTaxCollectionPoint(pointData: Omit<TaxCollectionPoint, 'id' | 'createdAt'>): TaxCollectionPoint {
    const points = this.getTaxCollectionPoints();
    const point: TaxCollectionPoint = {
      ...pointData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    points.push(point);
    this.set(this.getKey('tax_collection_points'), points);
    return point;
  }

  updateTaxCollectionPoint(id: string, updates: Partial<TaxCollectionPoint>): void {
    const points = this.getTaxCollectionPoints();
    const index = points.findIndex(p => p.id === id);
    if (index >= 0) {
      points[index] = { ...points[index], ...updates };
      this.set(this.getKey('tax_collection_points'), points);
    }
  }

  // Notifications
  getNotifications(userId: string): Notification[] {
    const notifications = this.get<Notification>(this.getKey('notifications'));
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notifications = this.get<Notification>(this.getKey('notifications'));
    const notification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    notifications.push(notification);
    this.set(this.getKey('notifications'), notifications);
    return notification;
  }

  markNotificationAsRead(id: string): void {
    const notifications = this.get<Notification>(this.getKey('notifications'));
    const index = notifications.findIndex(n => n.id === id);
    if (index >= 0) {
      notifications[index].read = true;
      this.set(this.getKey('notifications'), notifications);
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    const notifications = this.get<Notification>(this.getKey('notifications'));
    const updated = notifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    this.set(this.getKey('notifications'), updated);
  }

  // Audit Logs
  getAuditLogs(userId?: string): AuditLog[] {
    const logs = this.get<AuditLog>(this.getKey('audit_logs'));
    if (userId) {
      return logs.filter(l => l.userId === userId);
    }
    return logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  createAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.get<AuditLog>(this.getKey('audit_logs'));
    const log: AuditLog = {
      ...logData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };
    logs.push(log);
    this.set(this.getKey('audit_logs'), logs);
    return log;
  }

  // Referrals
  getReferrals(userId?: string): Referral[] {
    const referrals = this.get<Referral>(this.getKey('referrals'));
    if (userId) {
      return referrals.filter(r => r.referrerId === userId || r.refereeId === userId);
    }
    return referrals;
  }

  getReferralByCode(code: string): Referral | null {
    const referrals = this.get<Referral>(this.getKey('referrals'));
    return referrals.find(r => r.code === code) || null;
  }

  createReferral(referralData: Omit<Referral, 'id' | 'createdAt'>): Referral {
    const referrals = this.get<Referral>(this.getKey('referrals'));
    const referral: Referral = {
      ...referralData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    referrals.push(referral);
    this.set(this.getKey('referrals'), referrals);
    return referral;
  }

  updateReferral(id: string, updates: Partial<Referral>): void {
    const referrals = this.get<Referral>(this.getKey('referrals'));
    const index = referrals.findIndex(r => r.id === id);
    if (index >= 0) {
      referrals[index] = { ...referrals[index], ...updates };
      this.set(this.getKey('referrals'), referrals);
    }
  }

  // Verification Queue
  getVerificationQueue(status?: 'pending' | 'approved' | 'rejected'): VerificationQueue[] {
    const queue = this.get<VerificationQueue>(this.getKey('verification_queue'));
    if (status) {
      return queue.filter(q => q.status === status);
    }
    return queue.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createVerificationRequest(requestData: Omit<VerificationQueue, 'id' | 'createdAt'>): VerificationQueue {
    const queue = this.get<VerificationQueue>(this.getKey('verification_queue'));
    const request: VerificationQueue = {
      ...requestData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    queue.push(request);
    this.set(this.getKey('verification_queue'), queue);
    return request;
  }

  updateVerificationRequest(id: string, updates: Partial<VerificationQueue>): void {
    const queue = this.get<VerificationQueue>(this.getKey('verification_queue'));
    const index = queue.findIndex(q => q.id === id);
    if (index >= 0) {
      queue[index] = { 
        ...queue[index], 
        ...updates,
        reviewedAt: updates.status && updates.status !== 'pending' ? new Date().toISOString() : queue[index].reviewedAt
      };
      this.set(this.getKey('verification_queue'), queue);
    }
  }

  // Governance Proposals
  getProposals(status?: string): GovernanceProposal[] {
    const proposals = this.get<GovernanceProposal>(this.getKey('proposals'));
    if (status) {
      return proposals.filter(p => p.status === status);
    }
    return proposals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createProposal(proposalData: Omit<GovernanceProposal, 'id' | 'createdAt' | 'votesFor' | 'votesAgainst' | 'votesAbstain'>): GovernanceProposal {
    const proposals = this.get<GovernanceProposal>(this.getKey('proposals'));
    const proposal: GovernanceProposal = {
      ...proposalData,
      id: this.generateId(),
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      createdAt: new Date().toISOString(),
    };
    proposals.push(proposal);
    this.set(this.getKey('proposals'), proposals);
    return proposal;
  }

  updateProposal(id: string, updates: Partial<GovernanceProposal>): void {
    const proposals = this.get<GovernanceProposal>(this.getKey('proposals'));
    const index = proposals.findIndex(p => p.id === id);
    if (index >= 0) {
      proposals[index] = { ...proposals[index], ...updates };
      this.set(this.getKey('proposals'), proposals);
    }
  }

  // Votes
  getVotes(proposalId: string): Vote[] {
    const votes = this.get<Vote>(this.getKey('votes'));
    return votes.filter(v => v.proposalId === proposalId);
  }

  getUserVote(proposalId: string, userId: string): Vote | null {
    const votes = this.get<Vote>(this.getKey('votes'));
    return votes.find(v => v.proposalId === proposalId && v.voterId === userId) || null;
  }

  createVote(voteData: Omit<Vote, 'id' | 'createdAt'>): Vote {
    const votes = this.get<Vote>(this.getKey('votes'));
    
    // Check if user already voted
    const existingVote = votes.find(v => 
      v.proposalId === voteData.proposalId && v.voterId === voteData.voterId
    );
    if (existingVote) {
      throw new Error('User has already voted on this proposal');
    }

    const vote: Vote = {
      ...voteData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    votes.push(vote);
    this.set(this.getKey('votes'), votes);

    // Update proposal vote counts
    const proposals = this.get<GovernanceProposal>(this.getKey('proposals'));
    const proposalIndex = proposals.findIndex(p => p.id === voteData.proposalId);
    if (proposalIndex >= 0) {
      if (vote.vote === 'for') proposals[proposalIndex].votesFor += vote.votingPower;
      else if (vote.vote === 'against') proposals[proposalIndex].votesAgainst += vote.votingPower;
      else if (vote.vote === 'abstain') proposals[proposalIndex].votesAbstain += vote.votingPower;
      this.set(this.getKey('proposals'), proposals);
    }

    return vote;
  }

  // Initialize with demo data
  initializeDemoData(): void {
    try {
      // Only initialize if no data exists and prevent double initialization
      const initKey = this.getKey('demo_initialized');
      if (this.get<boolean>(initKey, false)) {
        return; // Already initialized
      }
      
      if (this.getHotspots().length === 0) {
      // Create demo hotspots
      const demoHotspots = [
        {
          name: "Karachi Central Hub",
          location: "Saddar, Karachi",
          latitude: 24.8607,
          longitude: 67.0011,
          status: "online" as const,
          operatorId: "demo-user",
          earnings: 245,
          users: 127,
          uptime: 98.5,
        },
        {
          name: "Lahore University Zone",
          location: "PU Campus, Lahore",
          latitude: 31.5204,
          longitude: 74.3587,
          status: "online" as const,
          operatorId: "demo-user",
          earnings: 189,
          users: 98,
          uptime: 96.2,
        },
        {
          name: "Islamabad Tech Park",
          location: "Blue Area, Islamabad",
          latitude: 33.6844,
          longitude: 73.0479,
          status: "maintenance" as const,
          operatorId: "demo-user",
          earnings: 156,
          users: 67,
          uptime: 89.1,
        }
      ];

      demoHotspots.forEach(hotspot => this.createHotspot(hotspot));
    }

    if (this.getDeliveryPartners().length === 0) {
      // Create demo delivery partners
      const demoPartners = [
        {
          name: "Ahmad Ali",
          email: "ahmad@foodpanda.pk",
          phone: "+92-300-1234567",
          vehicle: "Motorcycle",
          rating: 4.8,
          deliveries: 142,
          earnings: 1250,
          status: "active" as const,
        },
        {
          name: "Fatima Khan",
          email: "fatima@tcs.pk",
          phone: "+92-301-2345678",
          vehicle: "Car",
          rating: 4.9,
          deliveries: 98,
          earnings: 1450,
          status: "active" as const,
        },
        {
          name: "Hassan Sheikh",
          email: "hassan@local.pk",
          phone: "+92-302-3456789",
          vehicle: "Bicycle",
          rating: 4.6,
          deliveries: 76,
          earnings: 890,
          status: "inactive" as const,
        }
      ];

      demoPartners.forEach(partner => this.createDeliveryPartner(partner));
    }

    if (this.getFarms().length === 0) {
      // Create demo farms
      const demoFarms = [
        {
          name: "Green Valley Farm",
          ownerId: "demo-user",
          location: "Sargodha, Punjab",
          size: 25,
          cropType: "Wheat",
          sensors: 8,
          lastUpdate: new Date().toISOString(),
          earnings: 340,
        },
        {
          name: "Sindhi Agriculture Co.",
          ownerId: "demo-user",
          location: "Hyderabad, Sindh",
          size: 40,
          cropType: "Cotton",
          sensors: 12,
          lastUpdate: new Date().toISOString(),
          earnings: 520,
        },
        {
          name: "Mountain View Orchard",
          ownerId: "demo-user",
          location: "Swat, KPK",
          size: 15,
          cropType: "Apple",
          sensors: 6,
          lastUpdate: new Date().toISOString(),
          earnings: 280,
        }
      ];

      demoFarms.forEach(farm => this.createFarm(farm));
    }

    if (this.getHealthcareProviders().length === 0) {
      // Create demo healthcare providers
      const demoProviders = [
        {
          name: "Shaukat Khanum Memorial Cancer Hospital",
          type: "hospital" as const,
          location: "Lahore, Punjab",
          address: "7-A Block R-3 M.A. Johar Town, Lahore",
          license: "PMA-LHR-001234",
          capacity: 200,
          dataPoints: 1240,
          earnings: 620,
          status: "active" as const,
          registeredBy: "demo-user",
        },
        {
          name: "Aga Khan University Hospital",
          type: "hospital" as const,
          location: "Karachi, Sindh",
          address: "Stadium Road, Karachi",
          license: "PMA-KHI-005678",
          capacity: 700,
          dataPoints: 3420,
          earnings: 1710,
          status: "active" as const,
          registeredBy: "demo-user",
        },
        {
          name: "Chughtai Lab",
          type: "diagnostic_center" as const,
          location: "Islamabad, ICT",
          address: "Blue Area, Islamabad",
          license: "PMA-ISB-009876",
          capacity: 500,
          dataPoints: 890,
          earnings: 445,
          status: "active" as const,
          registeredBy: "demo-user",
        }
      ];

      demoProviders.forEach(provider => this.createHealthcareProvider(provider));
    }

    if (this.getTaxCollectionPoints().length === 0) {
      // Create demo tax collection points
      const demoTaxPoints = [
        {
          name: "FBR Regional Tax Office",
          type: "fbr_office" as const,
          location: "Karachi, Sindh",
          address: "I.I. Chundrigar Road, Karachi",
          jurisdiction: "Karachi Zone",
          transactionsLogged: 5670,
          dataPoints: 2835,
          earnings: 1418,
          status: "active" as const,
          registeredBy: "demo-user",
        },
        {
          name: "Punjab Revenue Authority",
          type: "provincial_office" as const,
          location: "Lahore, Punjab",
          address: "Civil Secretariat, Lahore",
          jurisdiction: "Punjab Province",
          transactionsLogged: 4320,
          dataPoints: 2160,
          earnings: 1080,
          status: "active" as const,
          registeredBy: "demo-user",
        },
        {
          name: "Customs House",
          type: "customs_office" as const,
          location: "Karachi Port, Sindh",
          address: "Port Qasim, Karachi",
          jurisdiction: "Karachi Port Authority",
          transactionsLogged: 3240,
          dataPoints: 1620,
          earnings: 810,
          status: "active" as const,
          registeredBy: "demo-user",
        }
      ];

      demoTaxPoints.forEach(point => this.createTaxCollectionPoint(point));
    }
    
    // Mark as initialized
    this.set(initKey, true);
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
    }
  }
}

export const localDb = new LocalDatabase();