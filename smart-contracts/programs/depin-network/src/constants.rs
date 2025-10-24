use anchor_lang::prelude::*;

// Program seeds
pub const NETWORK_STATE_SEED: &[u8] = b"network_state";
pub const MINT_SEED: &[u8] = b"mint";
pub const WIFI_HOTSPOT_SEED: &[u8] = b"wifi_hotspot";
pub const LOGISTICS_PARTNER_SEED: &[u8] = b"logistics_partner";
pub const FARM_SEED: &[u8] = b"farm";
pub const STAKING_POOL_SEED: &[u8] = b"staking_pool";
pub const USER_STAKE_SEED: &[u8] = b"user_stake";
pub const USER_PROFILE_SEED: &[u8] = b"user_profile";
pub const PROPOSAL_SEED: &[u8] = b"proposal";
pub const VOTE_SEED: &[u8] = b"vote";

// Token constants
pub const PKN_DECIMALS: u8 = 9;
pub const INITIAL_SUPPLY: u64 = 1_000_000_000 * 10_u64.pow(PKN_DECIMALS as u32); // 1B PKN

// Reward rates (in smallest unit)
pub const DEFAULT_WIFI_REWARD_RATE: u64 = 100 * 10_u64.pow(PKN_DECIMALS as u32); // 100 PKN per GB
pub const DEFAULT_LOGISTICS_REWARD_RATE: u64 = 50 * 10_u64.pow(PKN_DECIMALS as u32); // 50 PKN per delivery
pub const DEFAULT_AGRICULTURE_REWARD_RATE: u64 = 25 * 10_u64.pow(PKN_DECIMALS as u32); // 25 PKN per submission

// Staking parameters
pub const MIN_STAKE_AMOUNT: u64 = 100 * 10_u64.pow(PKN_DECIMALS as u32); // 100 PKN
pub const GOVERNANCE_THRESHOLD: u64 = 1000 * 10_u64.pow(PKN_DECIMALS as u32); // 1000 PKN

// Time constants
pub const SECONDS_PER_DAY: i64 = 86400;
pub const SECONDS_PER_HOUR: i64 = 3600;
pub const VOTING_PERIOD: i64 = 7 * SECONDS_PER_DAY; // 7 days

// Network limits
pub const MAX_HOTSPOTS_PER_USER: u8 = 10;
pub const MAX_LOGISTICS_PARTNERS_PER_USER: u8 = 5;
pub const MAX_FARMS_PER_USER: u8 = 20;