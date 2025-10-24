import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Helper function to check authorization
async function checkAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) return null;
  
  return user.id;
}

// WiFi Network Routes
app.get('/make-server-8c9bb5bc/wifi/hotspots', async (c) => {
  try {
    const hotspots = await kv.getByPrefix('hotspot:');
    return c.json({ success: true, data: hotspots });
  } catch (error) {
    console.log('Error fetching hotspots:', error);
    return c.json({ success: false, error: 'Failed to fetch hotspots' }, 500);
  }
});

app.post('/make-server-8c9bb5bc/wifi/hotspots', async (c) => {
  try {
    const userId = await checkAuth(c.req.raw);
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const hotspotId = `hotspot:${Date.now()}`;
    
    const hotspotData = {
      id: hotspotId,
      name: body.name,
      address: body.address,
      status: 'offline',
      users: 0,
      dataUsage: 0,
      tokensEarned: 0,
      uptime: 0,
      signalStrength: 0,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      ...body
    };

    await kv.set(hotspotId, hotspotData);
    return c.json({ success: true, data: hotspotData });
  } catch (error) {
    console.log('Error creating hotspot:', error);
    return c.json({ success: false, error: 'Failed to create hotspot' }, 500);
  }
});

app.put('/make-server-8c9bb5bc/wifi/hotspots/:id/status', async (c) => {
  try {
    const userId = await checkAuth(c.req.raw);
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const hotspotId = c.req.param('id');
    const body = await c.req.json();
    
    const existing = await kv.get(`hotspot:${hotspotId}`);
    if (!existing) {
      return c.json({ success: false, error: 'Hotspot not found' }, 404);
    }

    const updated = {
      ...existing,
      status: body.status,
      users: body.users || existing.users,
      dataUsage: body.dataUsage || existing.dataUsage,
      uptime: body.uptime || existing.uptime,
      signalStrength: body.signalStrength || existing.signalStrength,
      updatedAt: new Date().toISOString()
    };

    // Calculate token rewards based on data usage
    if (body.dataUsage > existing.dataUsage) {
      const additionalTokens = Math.floor((body.dataUsage - existing.dataUsage) * 7); // 7 tokens per GB
      updated.tokensEarned = existing.tokensEarned + additionalTokens;
    }

    await kv.set(`hotspot:${hotspotId}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating hotspot status:', error);
    return c.json({ success: false, error: 'Failed to update hotspot' }, 500);
  }
});

// Logistics Routes
app.get('/make-server-8c9bb5bc/logistics/partners', async (c) => {
  try {
    const partners = await kv.getByPrefix('partner:');
    return c.json({ success: true, data: partners });
  } catch (error) {
    console.log('Error fetching partners:', error);
    return c.json({ success: false, error: 'Failed to fetch partners' }, 500);
  }
});

app.post('/make-server-8c9bb5bc/logistics/partners', async (c) => {
  try {
    const userId = await checkAuth(c.req.raw);
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const partnerId = `partner:${Date.now()}`;
    
    const partnerData = {
      id: partnerId,
      name: body.name,
      company: body.company,
      city: body.city,
      status: 'active',
      deliveries: 0,
      tokensEarned: 0,
      avgDeliveryTime: 0,
      dataPoints: 0,
      rating: 4.5,
      userId: userId,
      createdAt: new Date().toISOString(),
      ...body
    };

    await kv.set(partnerId, partnerData);
    return c.json({ success: true, data: partnerData });
  } catch (error) {
    console.log('Error creating partner:', error);
    return c.json({ success: false, error: 'Failed to create partner' }, 500);
  }
});

app.post('/make-server-8c9bb5bc/logistics/deliveries', async (c) => {
  try {
    const userId = await checkAuth(c.req.raw);
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const deliveryId = `delivery:${Date.now()}`;
    
    const deliveryData = {
      id: deliveryId,
      partnerId: body.partnerId,
      route: body.route,
      startTime: body.startTime,
      endTime: body.endTime,
      deliveryTime: body.deliveryTime,
      distance: body.distance,
      trafficData: body.trafficData,
      tokensEarned: Math.floor(body.deliveryTime * 0.5), // 0.5 tokens per minute
      createdAt: new Date().toISOString(),
      ...body
    };

    await kv.set(deliveryId, deliveryData);

    // Update partner statistics
    const partner = await kv.get(body.partnerId);
    if (partner) {
      const updatedPartner = {
        ...partner,
        deliveries: partner.deliveries + 1,
        tokensEarned: partner.tokensEarned + deliveryData.tokensEarned,
        dataPoints: partner.dataPoints + 1,
        avgDeliveryTime: Math.round(((partner.avgDeliveryTime * partner.deliveries) + body.deliveryTime) / (partner.deliveries + 1)),
        updatedAt: new Date().toISOString()
      };
      await kv.set(body.partnerId, updatedPartner);
    }

    return c.json({ success: true, data: deliveryData });
  } catch (error) {
    console.log('Error recording delivery:', error);
    return c.json({ success: false, error: 'Failed to record delivery' }, 500);
  }
});

// Agriculture Routes
app.get('/make-server-8c9bb5bc/agriculture/farms', async (c) => {
  try {
    const farms = await kv.getByPrefix('farm:');
    return c.json({ success: true, data: farms });
  } catch (error) {
    console.log('Error fetching farms:', error);
    return c.json({ success: false, error: 'Failed to fetch farms' }, 500);
  }
});

app.post('/make-server-8c9bb5bc/agriculture/farms', async (c) => {
  try {
    const userId = await checkAuth(c.req.raw);
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const farmId = `farm:${Date.now()}`;
    
    const farmData = {
      id: farmId,
      name: body.name,
      farmer: body.farmer,
      location: body.location,
      district: body.district,
      cropType: body.cropType,
      farmSize: body.farmSize,
      sensorsActive: 0,
      tokensEarned: 0,
      yieldImprovement: 0,
      sensorData: {
        soilMoisture: 0,
        temperature: 0,
        humidity: 0,
        pH: 7.0
      },
      userId: userId,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      ...body
    };

    await kv.set(farmId, farmData);
    return c.json({ success: true, data: farmData });
  } catch (error) {
    console.log('Error creating farm:', error);
    return c.json({ success: false, error: 'Failed to create farm' }, 500);
  }
});

app.post('/make-server-8c9bb5bc/agriculture/sensor-data', async (c) => {
  try {
    const userId = await checkAuth(c.req.raw);
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const dataId = `sensor:${Date.now()}`;
    
    const sensorData = {
      id: dataId,
      farmId: body.farmId,
      sensorType: body.sensorType,
      value: body.value,
      unit: body.unit,
      timestamp: new Date().toISOString(),
      tokensEarned: 5, // 5 tokens per sensor reading
      ...body
    };

    await kv.set(dataId, sensorData);

    // Update farm with latest sensor data
    const farm = await kv.get(body.farmId);
    if (farm) {
      const updatedFarm = {
        ...farm,
        sensorData: {
          ...farm.sensorData,
          [body.sensorType]: body.value
        },
        tokensEarned: farm.tokensEarned + sensorData.tokensEarned,
        lastUpdate: new Date().toISOString()
      };
      await kv.set(body.farmId, updatedFarm);
    }

    return c.json({ success: true, data: sensorData });
  } catch (error) {
    console.log('Error recording sensor data:', error);
    return c.json({ success: false, error: 'Failed to record sensor data' }, 500);
  }
});

// Token Economics Routes
app.get('/make-server-8c9bb5bc/tokens/balance/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const balance = await kv.get(`balance:${userId}`) || { tokens: 0, staked: 0 };
    return c.json({ success: true, data: balance });
  } catch (error) {
    console.log('Error fetching token balance:', error);
    return c.json({ success: false, error: 'Failed to fetch balance' }, 500);
  }
});

app.get('/make-server-8c9bb5bc/tokens/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const transactions = await kv.getByPrefix(`transaction:${userId}:`);
    return c.json({ success: true, data: transactions });
  } catch (error) {
    console.log('Error fetching transactions:', error);
    return c.json({ success: false, error: 'Failed to fetch transactions' }, 500);
  }
});

app.post('/make-server-8c9bb5bc/tokens/stake', async (c) => {
  try {
    const userId = await checkAuth(c.req.raw);
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const stakeId = `stake:${userId}:${Date.now()}`;
    
    const stakeData = {
      id: stakeId,
      userId: userId,
      poolName: body.poolName,
      amount: body.amount,
      apr: body.apr,
      lockPeriod: body.lockPeriod,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (body.lockDays * 24 * 60 * 60 * 1000)).toISOString(),
      status: 'active',
      rewardsEarned: 0,
      ...body
    };

    await kv.set(stakeId, stakeData);

    // Update user balance
    const balance = await kv.get(`balance:${userId}`) || { tokens: 0, staked: 0 };
    const updatedBalance = {
      ...balance,
      tokens: balance.tokens - body.amount,
      staked: balance.staked + body.amount
    };
    await kv.set(`balance:${userId}`, updatedBalance);

    return c.json({ success: true, data: stakeData });
  } catch (error) {
    console.log('Error staking tokens:', error);
    return c.json({ success: false, error: 'Failed to stake tokens' }, 500);
  }
});

// Health check
app.get('/make-server-8c9bb5bc/health', (c) => {
  return c.json({ 
    success: true, 
    message: 'Pakistani DePIN API is running',
    timestamp: new Date().toISOString()
  });
});

Deno.serve(app.fetch)