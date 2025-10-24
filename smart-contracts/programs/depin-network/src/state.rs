use anchor_lang::prelude::*;

#[account]
pub struct NetworkState {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_supply: u64,
    pub total_staked: u64,
    pub wifi_hotspots_count: u32,
    pub logistics_partners_count: u32,
    pub farms_count: u32,
    pub healthcare_providers_count: u32,
    pub tax_points_count: u32,
    pub wifi_reward_rate: u64,      // Tokens per GB transferred
    pub logistics_reward_rate: u64,  // Tokens per delivery
    pub agriculture_reward_rate: u64, // Tokens per data submission
    pub healthcare_reward_rate: u64,  // Tokens per data submission
    pub taxation_reward_rate: u64,    // Tokens per tax record
    pub last_reward_distribution: i64,
    pub governance_threshold: u64,   // Minimum tokens to create proposal
    pub proposals_count: u64,        // Total proposals created
    pub bump: u8,
}

impl NetworkState {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 4 + 4 + 4 + 4 + 4 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct WiFiHotspot {
    pub owner: Pubkey,
    pub location: String,
    pub coverage_radius: u32,
    pub bandwidth_mbps: u32,
    pub total_users_served: u32,
    pub total_data_transferred: u64,
    pub total_rewards_earned: u64,
    pub last_data_submission: i64,
    pub is_active: bool,
    pub reputation_score: u8,
    pub bump: u8,
}

impl WiFiHotspot {
    pub const MAX_LOCATION_LEN: usize = 100;
    pub const LEN: usize = 8 + 32 + 4 + Self::MAX_LOCATION_LEN + 4 + 4 + 4 + 8 + 8 + 8 + 1 + 1 + 1;
}

#[account]
pub struct LogisticsPartner {
    pub owner: Pubkey,
    pub partner_name: String,
    pub service_areas: Vec<String>,
    pub vehicle_count: u32,
    pub total_deliveries: u32,
    pub total_distance_km: u32,
    pub total_rewards_earned: u64,
    pub last_data_submission: i64,
    pub is_active: bool,
    pub efficiency_score: u8,
    pub bump: u8,
}

impl LogisticsPartner {
    pub const MAX_NAME_LEN: usize = 50;
    pub const MAX_SERVICE_AREAS: usize = 10;
    pub const MAX_AREA_LEN: usize = 30;
    pub const LEN: usize = 8 + 32 + 4 + Self::MAX_NAME_LEN + 4 + (Self::MAX_SERVICE_AREAS * (4 + Self::MAX_AREA_LEN)) + 4 + 4 + 4 + 8 + 8 + 1 + 1 + 1;
}

#[account]
pub struct Farm {
    pub owner: Pubkey,
    pub farm_name: String,
    pub location: String,
    pub farm_size_acres: u32,
    pub crop_types: Vec<String>,
    pub total_data_submissions: u32,
    pub total_rewards_earned: u64,
    pub last_data_submission: i64,
    pub is_active: bool,
    pub yield_improvement: u8,
    pub bump: u8,
}

impl Farm {
    pub const MAX_NAME_LEN: usize = 50;
    pub const MAX_LOCATION_LEN: usize = 100;
    pub const MAX_CROP_TYPES: usize = 5;
    pub const MAX_CROP_LEN: usize = 20;
    pub const LEN: usize = 8 + 32 + 4 + Self::MAX_NAME_LEN + 4 + Self::MAX_LOCATION_LEN + 4 + 4 + (Self::MAX_CROP_TYPES * (4 + Self::MAX_CROP_LEN)) + 4 + 8 + 8 + 1 + 1 + 1;
}

#[account]
pub struct HealthcareProvider {
    pub owner: Pubkey,
    pub provider_name: String,
    pub provider_type: String,
    pub location: String,
    pub license_number: String,
    pub total_data_submissions: u32,
    pub total_records_collected: u32,
    pub total_rewards_earned: u64,
    pub last_data_submission: i64,
    pub is_active: bool,
    pub compliance_score: u8,
    pub bump: u8,
}

impl HealthcareProvider {
    pub const MAX_NAME_LEN: usize = 100;
    pub const MAX_TYPE_LEN: usize = 50;
    pub const MAX_LOCATION_LEN: usize = 100;
    pub const MAX_LICENSE_LEN: usize = 50;
    pub const LEN: usize = 8 + 32 + 4 + Self::MAX_NAME_LEN + 4 + Self::MAX_TYPE_LEN + 4 + Self::MAX_LOCATION_LEN + 4 + Self::MAX_LICENSE_LEN + 4 + 4 + 8 + 8 + 1 + 1 + 1;
}

#[account]
pub struct TaxCollectionPoint {
    pub owner: Pubkey,
    pub point_name: String,
    pub authority_type: String,
    pub location: String,
    pub jurisdiction: String,
    pub total_records_submitted: u32,
    pub total_amount_processed: u64,
    pub total_rewards_earned: u64,
    pub last_data_submission: i64,
    pub is_active: bool,
    pub verification_score: u8,
    pub bump: u8,
}

impl TaxCollectionPoint {
    pub const MAX_NAME_LEN: usize = 100;
    pub const MAX_TYPE_LEN: usize = 50;
    pub const MAX_LOCATION_LEN: usize = 100;
    pub const MAX_JURISDICTION_LEN: usize = 50;
    pub const LEN: usize = 8 + 32 + 4 + Self::MAX_NAME_LEN + 4 + Self::MAX_TYPE_LEN + 4 + Self::MAX_LOCATION_LEN + 4 + Self::MAX_JURISDICTION_LEN + 4 + 8 + 8 + 8 + 1 + 1 + 1;
}

#[account]
pub struct StakingPool {
    pub pool_type: PoolType,
    pub total_staked: u64,
    pub reward_rate: u64,        // APY in basis points (100 = 1%)
    pub min_stake_amount: u64,
    pub max_capacity: u64,
    pub lock_period: i64,        // Lock period in seconds
    pub total_rewards_paid: u64,
    pub is_active: bool,
    pub bump: u8,
}

impl StakingPool {
    pub const LEN: usize = 8 + 1 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct UserStake {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub start_time: i64,
    pub last_reward_claim: i64,
    pub pending_rewards: u64,
    pub bump: u8,
}

impl UserStake {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Proposal {
    pub id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub total_votes: u32,
    pub start_time: i64,
    pub end_time: i64,
    pub executed: bool,
    pub approved: bool,
    pub bump: u8,
}

impl Proposal {
    pub const MAX_TITLE_LEN: usize = 100;
    pub const MAX_DESCRIPTION_LEN: usize = 500;
    pub const LEN: usize = 8 + 8 + 32 + 4 + Self::MAX_TITLE_LEN + 4 + Self::MAX_DESCRIPTION_LEN + 1 + 8 + 8 + 4 + 8 + 8 + 1 + 1 + 1;
}

#[account]
pub struct UserProfile {
    pub owner: Pubkey,
    pub total_earned: u64,
    pub total_staked: u64,
    pub reputation_score: u16,
    pub last_activity: i64,
    pub wifi_hotspots: u8,
    pub logistics_partners: u8,
    pub farms: u8,
    pub governance_votes: u32,
    pub bump: u8,
}

impl UserProfile {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 2 + 8 + 1 + 1 + 1 + 4 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PoolType {
    WiFiInfrastructure,
    LogisticsOptimization,
    AgricultureData,
    Governance,
    LiquidityMining,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalType {
    ParameterChange,
    TreasurySpend,
    ProtocolUpgrade,
    RewardRateChange,
    NetworkExpansion,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Vote {
    Yes,
    No,
    Abstain,
}