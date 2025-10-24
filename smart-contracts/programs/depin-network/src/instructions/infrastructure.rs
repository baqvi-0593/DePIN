use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer, transfer};
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(location: String)]
pub struct RegisterWiFiHotspot<'info> {
    #[account(
        init,
        payer = owner,
        space = WiFiHotspot::LEN,
        seeds = [WIFI_HOTSPOT_SEED, owner.key().as_ref()],
        bump
    )]
    pub wifi_hotspot: Account<'info, WiFiHotspot>,
    
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    #[account(
        init_if_needed,
        payer = owner,
        space = UserProfile::LEN,
        seeds = [USER_PROFILE_SEED, owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn register_wifi_hotspot(
    ctx: Context<RegisterWiFiHotspot>,
    location: String,
    coverage_radius: u32,
    bandwidth_mbps: u32,
) -> Result<()> {
    require!(location.len() <= WiFiHotspot::MAX_LOCATION_LEN, DePINError::LocationTooLong);
    require!(coverage_radius > 0 && coverage_radius <= 5000, DePINError::InvalidCoverageRadius);
    require!(bandwidth_mbps >= 10 && bandwidth_mbps <= 1000, DePINError::InvalidBandwidth);

    let wifi_hotspot = &mut ctx.accounts.wifi_hotspot;
    let network_state = &mut ctx.accounts.network_state;
    let user_profile = &mut ctx.accounts.user_profile;

    wifi_hotspot.owner = ctx.accounts.owner.key();
    wifi_hotspot.location = location.clone();
    wifi_hotspot.coverage_radius = coverage_radius;
    wifi_hotspot.bandwidth_mbps = bandwidth_mbps;
    wifi_hotspot.total_users_served = 0;
    wifi_hotspot.total_data_transferred = 0;
    wifi_hotspot.total_rewards_earned = 0;
    wifi_hotspot.last_data_submission = 0;
    wifi_hotspot.is_active = true;
    wifi_hotspot.reputation_score = 100;
    wifi_hotspot.bump = ctx.bumps.wifi_hotspot;

    network_state.wifi_hotspots_count += 1;

    // Initialize user profile if needed
    if user_profile.owner == Pubkey::default() {
        user_profile.owner = ctx.accounts.owner.key();
        user_profile.total_earned = 0;
        user_profile.total_staked = 0;
        user_profile.reputation_score = 100;
        user_profile.last_activity = Clock::get()?.unix_timestamp;
        user_profile.wifi_hotspots = 1;
        user_profile.logistics_partners = 0;
        user_profile.farms = 0;
        user_profile.governance_votes = 0;
        user_profile.bump = ctx.bumps.user_profile;
    } else {
        user_profile.wifi_hotspots += 1;
        user_profile.last_activity = Clock::get()?.unix_timestamp;
    }

    msg!("WiFi hotspot registered successfully at {}", location);
    msg!("Coverage radius: {} meters, Bandwidth: {} Mbps", coverage_radius, bandwidth_mbps);

    Ok(())
}

#[derive(Accounts)]
#[instruction(partner_name: String)]
pub struct RegisterLogisticsPartner<'info> {
    #[account(
        init,
        payer = owner,
        space = LogisticsPartner::LEN,
        seeds = [LOGISTICS_PARTNER_SEED, owner.key().as_ref()],
        bump
    )]
    pub logistics_partner: Account<'info, LogisticsPartner>,
    
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    #[account(
        init_if_needed,
        payer = owner,
        space = UserProfile::LEN,
        seeds = [USER_PROFILE_SEED, owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn register_logistics_partner(
    ctx: Context<RegisterLogisticsPartner>,
    partner_name: String,
    service_areas: Vec<String>,
    vehicle_count: u32,
) -> Result<()> {
    require!(partner_name.len() <= LogisticsPartner::MAX_NAME_LEN, DePINError::NameTooLong);
    require!(service_areas.len() <= LogisticsPartner::MAX_SERVICE_AREAS, DePINError::TooManyServiceAreas);
    require!(vehicle_count > 0 && vehicle_count <= 1000, DePINError::InvalidVehicleCount);

    for area in &service_areas {
        require!(area.len() <= LogisticsPartner::MAX_AREA_LEN, DePINError::ServiceAreaTooLong);
    }

    let logistics_partner = &mut ctx.accounts.logistics_partner;
    let network_state = &mut ctx.accounts.network_state;
    let user_profile = &mut ctx.accounts.user_profile;

    logistics_partner.owner = ctx.accounts.owner.key();
    logistics_partner.partner_name = partner_name.clone();
    logistics_partner.service_areas = service_areas;
    logistics_partner.vehicle_count = vehicle_count;
    logistics_partner.total_deliveries = 0;
    logistics_partner.total_distance_km = 0;
    logistics_partner.total_rewards_earned = 0;
    logistics_partner.last_data_submission = 0;
    logistics_partner.is_active = true;
    logistics_partner.efficiency_score = 100;
    logistics_partner.bump = ctx.bumps.logistics_partner;

    network_state.logistics_partners_count += 1;

    // Initialize user profile if needed
    if user_profile.owner == Pubkey::default() {
        user_profile.owner = ctx.accounts.owner.key();
        user_profile.total_earned = 0;
        user_profile.total_staked = 0;
        user_profile.reputation_score = 100;
        user_profile.last_activity = Clock::get()?.unix_timestamp;
        user_profile.wifi_hotspots = 0;
        user_profile.logistics_partners = 1;
        user_profile.farms = 0;
        user_profile.governance_votes = 0;
        user_profile.bump = ctx.bumps.user_profile;
    } else {
        user_profile.logistics_partners += 1;
        user_profile.last_activity = Clock::get()?.unix_timestamp;
    }

    msg!("Logistics partner '{}' registered successfully", partner_name);
    msg!("Service areas: {:?}, Vehicle count: {}", logistics_partner.service_areas, vehicle_count);

    Ok(())
}

#[derive(Accounts)]
#[instruction(farm_name: String)]
pub struct RegisterFarm<'info> {
    #[account(
        init,
        payer = owner,
        space = Farm::LEN,
        seeds = [FARM_SEED, owner.key().as_ref()],
        bump
    )]
    pub farm: Account<'info, Farm>,
    
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    #[account(
        init_if_needed,
        payer = owner,
        space = UserProfile::LEN,
        seeds = [USER_PROFILE_SEED, owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn register_farm(
    ctx: Context<RegisterFarm>,
    farm_name: String,
    location: String,
    farm_size_acres: u32,
    crop_types: Vec<String>,
) -> Result<()> {
    require!(farm_name.len() <= Farm::MAX_NAME_LEN, DePINError::NameTooLong);
    require!(location.len() <= Farm::MAX_LOCATION_LEN, DePINError::LocationTooLong);
    require!(farm_size_acres > 0 && farm_size_acres <= 10000, DePINError::InvalidFarmSize);
    require!(crop_types.len() <= Farm::MAX_CROP_TYPES, DePINError::TooManyCropTypes);

    for crop in &crop_types {
        require!(crop.len() <= Farm::MAX_CROP_LEN, DePINError::CropNameTooLong);
    }

    let farm = &mut ctx.accounts.farm;
    let network_state = &mut ctx.accounts.network_state;
    let user_profile = &mut ctx.accounts.user_profile;

    farm.owner = ctx.accounts.owner.key();
    farm.farm_name = farm_name.clone();
    farm.location = location.clone();
    farm.farm_size_acres = farm_size_acres;
    farm.crop_types = crop_types;
    farm.total_data_submissions = 0;
    farm.total_rewards_earned = 0;
    farm.last_data_submission = 0;
    farm.is_active = true;
    farm.yield_improvement = 0;
    farm.bump = ctx.bumps.farm;

    network_state.farms_count += 1;

    // Initialize user profile if needed
    if user_profile.owner == Pubkey::default() {
        user_profile.owner = ctx.accounts.owner.key();
        user_profile.total_earned = 0;
        user_profile.total_staked = 0;
        user_profile.reputation_score = 100;
        user_profile.last_activity = Clock::get()?.unix_timestamp;
        user_profile.wifi_hotspots = 0;
        user_profile.logistics_partners = 0;
        user_profile.farms = 1;
        user_profile.governance_votes = 0;
        user_profile.bump = ctx.bumps.user_profile;
    } else {
        user_profile.farms += 1;
        user_profile.last_activity = Clock::get()?.unix_timestamp;
    }

    msg!("Farm '{}' registered successfully at {}", farm_name, location);
    msg!("Size: {} acres, Crop types: {:?}", farm_size_acres, farm.crop_types);

    Ok(())
}

// Data submission instructions for earning rewards
#[derive(Accounts)]
pub struct SubmitWiFiData<'info> {
    #[account(
        mut,
        seeds = [WIFI_HOTSPOT_SEED, owner.key().as_ref()],
        bump = wifi_hotspot.bump,
        has_one = owner
    )]
    pub wifi_hotspot: Account<'info, WiFiHotspot>,
    
    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, owner.key().as_ref()],
        bump = user_profile.bump,
        has_one = owner
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [MINT_SEED],
        bump
    )]
    pub mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn submit_wifi_data(
    ctx: Context<SubmitWiFiData>,
    users_connected: u32,
    data_transferred_gb: u64,
    uptime_percentage: u8,
) -> Result<()> {
    require!(uptime_percentage <= 100, DePINError::InvalidUptime);
    require!(data_transferred_gb > 0, DePINError::NoDataTransferred);

    let wifi_hotspot = &mut ctx.accounts.wifi_hotspot;
    let user_profile = &mut ctx.accounts.user_profile;
    let network_state = &ctx.accounts.network_state;

    // Check minimum time between submissions (1 hour)
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time - wifi_hotspot.last_data_submission >= 3600,
        DePINError::SubmissionTooFrequent
    );

    // Calculate rewards based on data transferred and uptime
    let base_reward = data_transferred_gb * network_state.wifi_reward_rate;
    let uptime_multiplier = uptime_percentage as u64;
    let reward_amount = (base_reward * uptime_multiplier) / 100;

    // Update hotspot data
    wifi_hotspot.total_users_served += users_connected;
    wifi_hotspot.total_data_transferred += data_transferred_gb;
    wifi_hotspot.total_rewards_earned += reward_amount;
    wifi_hotspot.last_data_submission = current_time;

    // Update reputation score based on performance
    if uptime_percentage >= 95 {
        wifi_hotspot.reputation_score = std::cmp::min(100, wifi_hotspot.reputation_score + 1);
    } else if uptime_percentage < 80 {
        wifi_hotspot.reputation_score = std::cmp::max(0, wifi_hotspot.reputation_score - 1);
    }

    // Update user profile
    user_profile.total_earned += reward_amount;
    user_profile.last_activity = current_time;

    // Mint rewards to user (in production, this would use a treasury account)
    // For now, we'll emit an event for the frontend to handle
    msg!("WiFi data submitted successfully!");
    msg!("Users connected: {}, Data transferred: {} GB, Uptime: {}%", 
         users_connected, data_transferred_gb, uptime_percentage);
    msg!("Reward earned: {} PKN", reward_amount / 10_u64.pow(9));

    Ok(())
}

#[derive(Accounts)]
pub struct SubmitLogisticsData<'info> {
    #[account(
        mut,
        seeds = [LOGISTICS_PARTNER_SEED, owner.key().as_ref()],
        bump = logistics_partner.bump,
        has_one = owner
    )]
    pub logistics_partner: Account<'info, LogisticsPartner>,
    
    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, owner.key().as_ref()],
        bump = user_profile.bump,
        has_one = owner
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    pub owner: Signer<'info>,
}

pub fn submit_logistics_data(
    ctx: Context<SubmitLogisticsData>,
    deliveries_completed: u32,
    distance_traveled_km: u32,
    fuel_efficiency: u32,
    route_optimization_score: u8,
) -> Result<()> {
    require!(route_optimization_score <= 100, DePINError::InvalidScore);
    require!(deliveries_completed > 0, DePINError::NoDeliveries);

    let logistics_partner = &mut ctx.accounts.logistics_partner;
    let user_profile = &mut ctx.accounts.user_profile;
    let network_state = &ctx.accounts.network_state;

    // Check minimum time between submissions (1 hour)
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time - logistics_partner.last_data_submission >= 3600,
        DePINError::SubmissionTooFrequent
    );

    // Calculate rewards based on deliveries and efficiency
    let base_reward = deliveries_completed as u64 * network_state.logistics_reward_rate;
    let efficiency_multiplier = route_optimization_score as u64;
    let reward_amount = (base_reward * efficiency_multiplier) / 100;

    // Update logistics partner data
    logistics_partner.total_deliveries += deliveries_completed;
    logistics_partner.total_distance_km += distance_traveled_km;
    logistics_partner.total_rewards_earned += reward_amount;
    logistics_partner.last_data_submission = current_time;

    // Update efficiency score
    if route_optimization_score >= 90 {
        logistics_partner.efficiency_score = std::cmp::min(100, logistics_partner.efficiency_score + 1);
    } else if route_optimization_score < 70 {
        logistics_partner.efficiency_score = std::cmp::max(0, logistics_partner.efficiency_score - 1);
    }

    // Update user profile
    user_profile.total_earned += reward_amount;
    user_profile.last_activity = current_time;

    msg!("Logistics data submitted successfully!");
    msg!("Deliveries: {}, Distance: {} km, Efficiency score: {}%", 
         deliveries_completed, distance_traveled_km, route_optimization_score);
    msg!("Reward earned: {} PKN", reward_amount / 10_u64.pow(9));

    Ok(())
}

#[derive(Accounts)]
pub struct SubmitAgricultureData<'info> {
    #[account(
        mut,
        seeds = [FARM_SEED, owner.key().as_ref()],
        bump = farm.bump,
        has_one = owner
    )]
    pub farm: Account<'info, Farm>,
    
    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, owner.key().as_ref()],
        bump = user_profile.bump,
        has_one = owner
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    pub owner: Signer<'info>,
}

pub fn submit_agriculture_data(
    ctx: Context<SubmitAgricultureData>,
    soil_moisture: u8,
    temperature: i16,
    humidity: u8,
    ph_level: u8,
) -> Result<()> {
    require!(soil_moisture <= 100, DePINError::InvalidMoisture);
    require!(humidity <= 100, DePINError::InvalidHumidity);
    require!(ph_level <= 14, DePINError::InvalidPH);
    require!(temperature >= -50 && temperature <= 70, DePINError::InvalidTemperature);

    let farm = &mut ctx.accounts.farm;
    let user_profile = &mut ctx.accounts.user_profile;
    let network_state = &ctx.accounts.network_state;

    // Check minimum time between submissions (1 hour)
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time - farm.last_data_submission >= 3600,
        DePINError::SubmissionTooFrequent
    );

    // Calculate rewards (fixed amount per submission for now)
    let reward_amount = network_state.agriculture_reward_rate;

    // Update farm data
    farm.total_data_submissions += 1;
    farm.total_rewards_earned += reward_amount;
    farm.last_data_submission = current_time;

    // Update user profile
    user_profile.total_earned += reward_amount;
    user_profile.last_activity = current_time;

    msg!("Agriculture data submitted successfully!");
    msg!("Soil moisture: {}%, Temperature: {}°C, Humidity: {}%, pH: {}", 
         soil_moisture, temperature, humidity, ph_level);
    msg!("Reward earned: {} PKN", reward_amount / 10_u64.pow(9));

    Ok(())
}