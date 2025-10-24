use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use constants::*;
use errors::*;
use instructions::*;
use state::*;

#[program]
pub mod depin_network {
    use super::*;

    /// Initialize the DePIN network program
    pub fn initialize(
        ctx: Context<Initialize>,
        total_supply: u64,
        decimals: u8,
    ) -> Result<()> {
        instructions::initialize(ctx, total_supply, decimals)
    }

    /// Register a WiFi hotspot infrastructure
    pub fn register_wifi_hotspot(
        ctx: Context<RegisterWiFiHotspot>,
        location: String,
        coverage_radius: u32,
        bandwidth_mbps: u32,
    ) -> Result<()> {
        instructions::register_wifi_hotspot(ctx, location, coverage_radius, bandwidth_mbps)
    }

    /// Register a logistics partner
    pub fn register_logistics_partner(
        ctx: Context<RegisterLogisticsPartner>,
        partner_name: String,
        service_areas: Vec<String>,
        vehicle_count: u32,
    ) -> Result<()> {
        instructions::register_logistics_partner(ctx, partner_name, service_areas, vehicle_count)
    }

    /// Register an agricultural farm
    pub fn register_farm(
        ctx: Context<RegisterFarm>,
        farm_name: String,
        location: String,
        farm_size_acres: u32,
        crop_types: Vec<String>,
    ) -> Result<()> {
        instructions::register_farm(ctx, farm_name, location, farm_size_acres, crop_types)
    }

    /// Submit WiFi network data for rewards
    pub fn submit_wifi_data(
        ctx: Context<SubmitWiFiData>,
        users_connected: u32,
        data_transferred_gb: u64,
        uptime_percentage: u8,
    ) -> Result<()> {
        instructions::submit_wifi_data(ctx, users_connected, data_transferred_gb, uptime_percentage)
    }

    /// Submit logistics data for rewards
    pub fn submit_logistics_data(
        ctx: Context<SubmitLogisticsData>,
        deliveries_completed: u32,
        distance_traveled_km: u32,
        fuel_efficiency: u32,
        route_optimization_score: u8,
    ) -> Result<()> {
        instructions::submit_logistics_data(ctx, deliveries_completed, distance_traveled_km, fuel_efficiency, route_optimization_score)
    }

    /// Submit agricultural sensor data for rewards
    pub fn submit_agriculture_data(
        ctx: Context<SubmitAgricultureData>,
        soil_moisture: u8,
        temperature: i16,
        humidity: u8,
        ph_level: u8,
    ) -> Result<()> {
        instructions::submit_agriculture_data(ctx, soil_moisture, temperature, humidity, ph_level)
    }

    /// Register a healthcare provider
    pub fn register_healthcare_provider(
        ctx: Context<RegisterHealthcareProvider>,
        provider_name: String,
        provider_type: String,
        location: String,
        license_number: String,
    ) -> Result<()> {
        instructions::register_healthcare_provider(ctx, provider_name, provider_type, location, license_number)
    }

    /// Register a tax collection point
    pub fn register_tax_point(
        ctx: Context<RegisterTaxPoint>,
        point_name: String,
        authority_type: String,
        location: String,
        jurisdiction: String,
    ) -> Result<()> {
        instructions::register_tax_point(ctx, point_name, authority_type, location, jurisdiction)
    }

    /// Submit healthcare data for rewards
    pub fn submit_healthcare_data(
        ctx: Context<SubmitHealthcareData>,
        records_count: u32,
        data_quality_score: u8,
    ) -> Result<()> {
        instructions::submit_healthcare_data(ctx, records_count, data_quality_score)
    }

    /// Submit taxation data for rewards
    pub fn submit_taxation_data(
        ctx: Context<SubmitTaxationData>,
        records_count: u32,
        amount_processed: u64,
        verification_score: u8,
    ) -> Result<()> {
        instructions::submit_taxation_data(ctx, records_count, amount_processed, verification_score)
    }

    /// Stake PKN tokens in a staking pool
    pub fn stake_tokens(
        ctx: Context<StakeTokens>,
        amount: u64,
        pool_type: PoolType,
    ) -> Result<()> {
        instructions::stake_tokens(ctx, amount, pool_type)
    }

    /// Unstake PKN tokens from a staking pool
    pub fn unstake_tokens(
        ctx: Context<UnstakeTokens>,
        amount: u64,
    ) -> Result<()> {
        instructions::unstake_tokens(ctx, amount)
    }

    /// Claim staking rewards
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        instructions::claim_rewards(ctx)
    }

    /// Distribute rewards to infrastructure operators
    pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
        instructions::distribute_rewards(ctx)
    }

    /// Update network parameters (admin only)
    pub fn update_network_params(
        ctx: Context<UpdateNetworkParams>,
        wifi_reward_rate: u64,
        logistics_reward_rate: u64,
        agriculture_reward_rate: u64,
    ) -> Result<()> {
        instructions::update_network_params(ctx, wifi_reward_rate, logistics_reward_rate, agriculture_reward_rate)
    }

    /// Create governance proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: ProposalType,
    ) -> Result<()> {
        instructions::create_proposal(ctx, title, description, proposal_type)
    }

    /// Vote on governance proposal
    pub fn vote_proposal(
        ctx: Context<VoteProposal>,
        vote: Vote,
    ) -> Result<()> {
        instructions::vote_proposal(ctx, vote)
    }

    /// Execute approved governance proposal
    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        instructions::execute_proposal(ctx)
    }
}