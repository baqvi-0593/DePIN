use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer, transfer};
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(pool_type: PoolType)]
pub struct StakeTokens<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = StakingPool::LEN,
        seeds = [STAKING_POOL_SEED, &[pool_type as u8]],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = UserStake::LEN,
        seeds = [USER_STAKE_SEED, user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = staking_pool
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [MINT_SEED],
        bump
    )]
    pub mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, user.key().as_ref()],
        bump = user_profile.bump,
        has_one = user
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn stake_tokens(
    ctx: Context<StakeTokens>,
    amount: u64,
    pool_type: PoolType,
) -> Result<()> {
    require!(amount > 0, DePINError::InvalidStakeAmount);

    let staking_pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let network_state = &mut ctx.accounts.network_state;
    let user_profile = &mut ctx.accounts.user_profile;

    // Initialize staking pool if needed
    if staking_pool.pool_type == PoolType::WiFiInfrastructure && staking_pool.total_staked == 0 {
        staking_pool.pool_type = pool_type.clone();
        staking_pool.total_staked = 0;
        staking_pool.reward_rate = match pool_type {
            PoolType::WiFiInfrastructure => 1200, // 12% APY
            PoolType::LogisticsOptimization => 1500, // 15% APY
            PoolType::AgricultureData => 1800, // 18% APY
            PoolType::Governance => 800, // 8% APY
            PoolType::LiquidityMining => 2500, // 25% APY
        };
        staking_pool.min_stake_amount = 100 * 10_u64.pow(9); // 100 PKN minimum
        staking_pool.max_capacity = 1_000_000 * 10_u64.pow(9); // 1M PKN capacity
        staking_pool.lock_period = match pool_type {
            PoolType::WiFiInfrastructure => 30 * 24 * 3600, // 30 days
            PoolType::LogisticsOptimization => 90 * 24 * 3600, // 90 days
            PoolType::AgricultureData => 180 * 24 * 3600, // 180 days
            PoolType::Governance => 0, // No lock period
            PoolType::LiquidityMining => 14 * 24 * 3600, // 14 days
        };
        staking_pool.total_rewards_paid = 0;
        staking_pool.is_active = true;
        staking_pool.bump = ctx.bumps.staking_pool;
    }

    require!(staking_pool.is_active, DePINError::PoolInactive);
    require!(amount >= staking_pool.min_stake_amount, DePINError::BelowMinimumStake);
    require!(
        staking_pool.total_staked + amount <= staking_pool.max_capacity,
        DePINError::PoolCapacityExceeded
    );

    let current_time = Clock::get()?.unix_timestamp;

    // Initialize user stake if needed
    if user_stake.user == Pubkey::default() {
        user_stake.user = ctx.accounts.user.key();
        user_stake.pool = staking_pool.key();
        user_stake.amount = 0;
        user_stake.start_time = current_time;
        user_stake.last_reward_claim = current_time;
        user_stake.pending_rewards = 0;
        user_stake.bump = ctx.bumps.user_stake;
    }

    // Transfer tokens to staking pool
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.pool_token_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    transfer(cpi_ctx, amount)?;

    // Update balances
    user_stake.amount += amount;
    staking_pool.total_staked += amount;
    network_state.total_staked += amount;
    user_profile.total_staked += amount;

    msg!("Successfully staked {} PKN in {:?} pool", amount / 10_u64.pow(9), pool_type);
    msg!("Total staked in pool: {} PKN", staking_pool.total_staked / 10_u64.pow(9));

    Ok(())
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(
        mut,
        seeds = [STAKING_POOL_SEED, &[staking_pool.pool_type as u8]],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [USER_STAKE_SEED, user.key().as_ref(), staking_pool.key().as_ref()],
        bump = user_stake.bump,
        has_one = user,
        has_one = pool @ staking_pool
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = staking_pool
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [MINT_SEED],
        bump
    )]
    pub mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, user.key().as_ref()],
        bump = user_profile.bump,
        has_one = user
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn unstake_tokens(
    ctx: Context<UnstakeTokens>,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, DePINError::InvalidStakeAmount);

    let staking_pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let network_state = &mut ctx.accounts.network_state;
    let user_profile = &mut ctx.accounts.user_profile;

    require!(user_stake.amount >= amount, DePINError::InsufficientStake);

    // Check lock period
    let current_time = Clock::get()?.unix_timestamp;
    if staking_pool.lock_period > 0 {
        require!(
            current_time >= user_stake.start_time + staking_pool.lock_period,
            DePINError::StakeLocked
        );
    }

    // Calculate and add pending rewards before unstaking
    let time_staked = current_time - user_stake.last_reward_claim;
    let reward_rate_per_second = staking_pool.reward_rate / (365 * 24 * 3600 * 100); // Convert APY to per-second rate
    let rewards = (user_stake.amount * reward_rate_per_second * time_staked as u64) / 10_u64.pow(9);
    
    user_stake.pending_rewards += rewards;
    user_stake.last_reward_claim = current_time;

    // Transfer tokens back to user (using PDA signer)
    let pool_type_bytes = [staking_pool.pool_type as u8];
    let signer_seeds = &[
        STAKING_POOL_SEED,
        &pool_type_bytes,
        &[staking_pool.bump],
    ];
    let signer = &[&signer_seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.pool_token_account.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: staking_pool.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    transfer(cpi_ctx, amount)?;

    // Update balances
    user_stake.amount -= amount;
    staking_pool.total_staked -= amount;
    network_state.total_staked -= amount;
    user_profile.total_staked -= amount;

    msg!("Successfully unstaked {} PKN", amount / 10_u64.pow(9));
    msg!("Pending rewards: {} PKN", user_stake.pending_rewards / 10_u64.pow(9));

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        mut,
        seeds = [STAKING_POOL_SEED, &[staking_pool.pool_type as u8]],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [USER_STAKE_SEED, user.key().as_ref(), staking_pool.key().as_ref()],
        bump = user_stake.bump,
        has_one = user,
        has_one = pool @ staking_pool
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [MINT_SEED],
        bump
    )]
    pub mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, user.key().as_ref()],
        bump = user_profile.bump,
        has_one = user
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    let staking_pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let user_profile = &mut ctx.accounts.user_profile;

    require!(user_stake.amount > 0, DePINError::NoStakeFound);

    let current_time = Clock::get()?.unix_timestamp;

    // Calculate rewards since last claim
    let time_staked = current_time - user_stake.last_reward_claim;
    let reward_rate_per_second = staking_pool.reward_rate / (365 * 24 * 3600 * 100); // Convert APY to per-second rate
    let new_rewards = (user_stake.amount * reward_rate_per_second * time_staked as u64) / 10_u64.pow(9);
    
    let total_rewards = user_stake.pending_rewards + new_rewards;
    
    require!(total_rewards > 0, DePINError::NoRewardsToClaim);

    // In production, this would mint new tokens or transfer from treasury
    // For now, we'll emit an event for the frontend to handle
    user_stake.pending_rewards = 0;
    user_stake.last_reward_claim = current_time;
    staking_pool.total_rewards_paid += total_rewards;
    user_profile.total_earned += total_rewards;

    msg!("Successfully claimed {} PKN rewards", total_rewards / 10_u64.pow(9));

    Ok(())
}