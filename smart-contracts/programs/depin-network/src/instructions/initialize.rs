use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = NetworkState::LEN,
        seeds = [NETWORK_STATE_SEED],
        bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = network_state,
        seeds = [MINT_SEED],
        bump
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize(
    ctx: Context<Initialize>,
    total_supply: u64,
    decimals: u8,
) -> Result<()> {
    let network_state = &mut ctx.accounts.network_state;
    
    network_state.authority = ctx.accounts.authority.key();
    network_state.mint = ctx.accounts.mint.key();
    network_state.total_supply = total_supply;
    network_state.total_staked = 0;
    network_state.wifi_hotspots_count = 0;
    network_state.logistics_partners_count = 0;
    network_state.farms_count = 0;
    network_state.healthcare_providers_count = 0;
    network_state.tax_points_count = 0;
    network_state.wifi_reward_rate = 100 * 10_u64.pow(9); // 100 PKN per GB
    network_state.logistics_reward_rate = 50 * 10_u64.pow(9); // 50 PKN per delivery
    network_state.agriculture_reward_rate = 25 * 10_u64.pow(9); // 25 PKN per data submission
    network_state.healthcare_reward_rate = 100 * 10_u64.pow(9); // 100 PKN per data submission
    network_state.taxation_reward_rate = 150 * 10_u64.pow(9); // 150 PKN per tax record
    network_state.last_reward_distribution = Clock::get()?.unix_timestamp;
    network_state.governance_threshold = 1000 * 10_u64.pow(9); // 1000 PKN to create proposal
    network_state.proposals_count = 0;
    network_state.bump = ctx.bumps.network_state;

    msg!("Pakistani DePIN Network initialized successfully!");
    msg!("Total supply: {} PKN", total_supply / 10_u64.pow(9));
    msg!("WiFi reward rate: {} PKN per GB", network_state.wifi_reward_rate / 10_u64.pow(9));
    msg!("Logistics reward rate: {} PKN per delivery", network_state.logistics_reward_rate / 10_u64.pow(9));
    msg!("Agriculture reward rate: {} PKN per data submission", network_state.agriculture_reward_rate / 10_u64.pow(9));

    Ok(())
}