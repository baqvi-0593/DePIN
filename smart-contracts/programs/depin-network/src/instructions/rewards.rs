use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct DistributeRewards<'info> {
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump,
        has_one = authority
    )]
    pub network_state: Account<'info, NetworkState>,
    
    #[account(
        seeds = [MINT_SEED],
        bump
    )]
    pub mint: Account<'info, anchor_spl::token::Mint>,
    
    pub authority: Signer<'info>,
}

pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
    let network_state = &mut ctx.accounts.network_state;
    let current_time = Clock::get()?.unix_timestamp;

    // Check if enough time has passed since last distribution (24 hours)
    require!(
        current_time - network_state.last_reward_distribution >= 86400,
        DePINError::DistributionTooFrequent
    );

    network_state.last_reward_distribution = current_time;

    // In a production system, this would:
    // 1. Calculate rewards for all active infrastructure
    // 2. Mint new tokens or transfer from treasury
    // 3. Distribute to operators based on performance
    
    msg!("Daily rewards distribution completed");
    msg!("WiFi hotspots: {}", network_state.wifi_hotspots_count);
    msg!("Logistics partners: {}", network_state.logistics_partners_count);
    msg!("Farms: {}", network_state.farms_count);

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateNetworkParams<'info> {
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump,
        has_one = authority
    )]
    pub network_state: Account<'info, NetworkState>,
    
    pub authority: Signer<'info>,
}

pub fn update_network_params(
    ctx: Context<UpdateNetworkParams>,
    wifi_reward_rate: u64,
    logistics_reward_rate: u64,
    agriculture_reward_rate: u64,
) -> Result<()> {
    let network_state = &mut ctx.accounts.network_state;

    require!(wifi_reward_rate > 0, DePINError::InvalidRewardRate);
    require!(logistics_reward_rate > 0, DePINError::InvalidRewardRate);
    require!(agriculture_reward_rate > 0, DePINError::InvalidRewardRate);

    let old_wifi_rate = network_state.wifi_reward_rate;
    let old_logistics_rate = network_state.logistics_reward_rate;
    let old_agriculture_rate = network_state.agriculture_reward_rate;

    network_state.wifi_reward_rate = wifi_reward_rate;
    network_state.logistics_reward_rate = logistics_reward_rate;
    network_state.agriculture_reward_rate = agriculture_reward_rate;

    msg!("Network parameters updated successfully");
    msg!("WiFi reward rate: {} -> {} PKN per GB", 
         old_wifi_rate / 10_u64.pow(9), wifi_reward_rate / 10_u64.pow(9));
    msg!("Logistics reward rate: {} -> {} PKN per delivery", 
         old_logistics_rate / 10_u64.pow(9), logistics_reward_rate / 10_u64.pow(9));
    msg!("Agriculture reward rate: {} -> {} PKN per submission", 
         old_agriculture_rate / 10_u64.pow(9), agriculture_reward_rate / 10_u64.pow(9));

    Ok(())
}