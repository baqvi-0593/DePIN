import { localDb } from './localDb';

class LocalApiClient {
  private authToken: string | null = null;
  private currentUserId: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  private async simulateApiDelay() {
    // Simulate network delay for realistic experience - reduced for better performance
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  }

  // WiFi Network API
  async getHotspots() {
    await this.simulateApiDelay();
    return localDb.getHotspots();
  }

  async createHotspot(hotspotData: any) {
    await this.simulateApiDelay();
    
    const hotspot = localDb.createHotspot({
      ...hotspotData,
      operatorId: hotspotData.operatorId || this.currentUserId || 'pending-verification',
      earnings: 0,
      users: 0,
      uptime: 0,
    });

    // Award tokens for creating hotspot if user is authenticated
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 50
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 50,
        description: `Hotspot deployment reward: ${hotspot.name}`
      });
    }

    return hotspot;
  }

  async updateHotspotStatus(hotspotId: string, statusData: any) {
    await this.simulateApiDelay();
    localDb.updateHotspot(hotspotId, statusData);
    return { success: true };
  }

  // Logistics API
  async getDeliveryPartners() {
    await this.simulateApiDelay();
    return localDb.getDeliveryPartners();
  }

  async createDeliveryPartner(partnerData: any) {
    await this.simulateApiDelay();
    const partner = localDb.createDeliveryPartner({
      ...partnerData,
      rating: 0,
      deliveries: 0,
      earnings: 0,
      status: partnerData.status || 'inactive',
    });

    // Award tokens for partner registration if user is authenticated
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 25
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 25,
        description: `Delivery partner registration: ${partner.name}`
      });
    }

    return partner;
  }

  async recordDelivery(deliveryData: any) {
    await this.simulateApiDelay();
    
    // Award tokens for delivery data
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 5
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 5,
        description: 'Delivery route data contribution'
      });
    }

    return { success: true, deliveryId: localDb.generateId() };
  }

  // Agriculture API
  async getFarms() {
    await this.simulateApiDelay();
    return localDb.getFarms();
  }

  async createFarm(farmData: any) {
    await this.simulateApiDelay();
    
    const farm = localDb.createFarm({
      ...farmData,
      ownerId: farmData.ownerId || this.currentUserId || 'pending-verification',
      sensors: farmData.sensors || 0,
      lastUpdate: new Date().toISOString(),
      earnings: 0,
    });

    // Award tokens for farm registration if user is authenticated
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 75
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 75,
        description: `Farm registration: ${farm.name}`
      });
    }

    return farm;
  }

  async recordSensorData(sensorData: any) {
    await this.simulateApiDelay();
    
    // Award tokens for sensor data
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 2
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 2,
        description: 'Agricultural sensor data contribution'
      });
    }

    return { success: true };
  }

  // Healthcare API
  async getHealthcareProviders() {
    await this.simulateApiDelay();
    return localDb.getHealthcareProviders();
  }

  async createHealthcareProvider(providerData: any) {
    await this.simulateApiDelay();
    
    const provider = localDb.createHealthcareProvider({
      ...providerData,
      registeredBy: providerData.registeredBy || this.currentUserId || 'pending-verification',
      dataPoints: 0,
      earnings: 0,
      status: providerData.status || 'pending',
    });

    // Award tokens for healthcare provider registration
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 100
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 100,
        description: `Healthcare provider registration: ${provider.name}`
      });
    }

    return provider;
  }

  async recordHealthcareData(healthData: any) {
    await this.simulateApiDelay();
    
    // Award tokens for healthcare data contribution
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 10
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 10,
        description: 'Anonymized healthcare data contribution'
      });
    }

    return { success: true };
  }

  // Taxation API
  async getTaxCollectionPoints() {
    await this.simulateApiDelay();
    return localDb.getTaxCollectionPoints();
  }

  async createTaxCollectionPoint(pointData: any) {
    await this.simulateApiDelay();
    
    const point = localDb.createTaxCollectionPoint({
      ...pointData,
      registeredBy: pointData.registeredBy || this.currentUserId || 'pending-verification',
      transactionsLogged: 0,
      dataPoints: 0,
      earnings: 0,
      status: pointData.status || 'inactive',
    });

    // Award tokens for tax collection point registration
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 150
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 150,
        description: `Tax collection point registration: ${point.name}`
      });
    }

    return point;
  }

  async recordTaxData(taxData: any) {
    await this.simulateApiDelay();
    
    // Award tokens for tax transaction data
    if (this.currentUserId) {
      const balance = localDb.getTokenBalance(this.currentUserId);
      localDb.updateTokenBalance(this.currentUserId, {
        tokens: balance.tokens + 15
      });

      localDb.createTransaction({
        userId: this.currentUserId,
        type: 'earned',
        amount: 15,
        description: 'Tax transaction data contribution'
      });
    }

    return { success: true };
  }

  // Token Economics API
  async getTokenBalance(userId: string) {
    await this.simulateApiDelay();
    return localDb.getTokenBalance(userId);
  }

  async getTransactions(userId: string) {
    await this.simulateApiDelay();
    return localDb.getTransactions(userId);
  }

  async stakeTokens(stakeData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const balance = localDb.getTokenBalance(this.currentUserId);
    const { amount } = stakeData;

    if (balance.tokens < amount) {
      throw new Error('Insufficient tokens for staking');
    }

    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens - amount,
      staked: balance.staked + amount
    });

    localDb.createTransaction({
      userId: this.currentUserId,
      type: 'staked',
      amount,
      description: 'Tokens staked for network rewards'
    });

    return { success: true };
  }

  async unstakeTokens(unstakeData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    const balance = localDb.getTokenBalance(this.currentUserId);
    const { amount } = unstakeData;

    if (balance.staked < amount) {
      throw new Error('Insufficient staked tokens for unstaking');
    }

    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens + amount,
      staked: balance.staked - amount
    });

    localDb.createTransaction({
      userId: this.currentUserId,
      type: 'unstaked',
      amount,
      description: 'Tokens unstaked from network pools'
    });

    return { success: true };
  }

  async claimRewards(rewardData: any) {
    await this.simulateApiDelay();
    if (!this.currentUserId) {
      throw new Error('Authentication required');
    }

    // For demo purposes, calculate a small reward amount
    const rewardAmount = Math.floor(Math.random() * 20) + 5; // 5-25 tokens

    const balance = localDb.getTokenBalance(this.currentUserId);
    localDb.updateTokenBalance(this.currentUserId, {
      tokens: balance.tokens + rewardAmount
    });

    localDb.createTransaction({
      userId: this.currentUserId,
      type: 'earned',
      amount: rewardAmount,
      description: 'Staking pool rewards claimed'
    });

    return { success: true, amount: rewardAmount };
  }

  // Health check with timeout protection
  async healthCheck() {
    try {
      // Very quick health check - no delay needed
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error('Health check failed');
    }
  }
}

export const localApiClient = new LocalApiClient();