use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

// Healthcare Provider Registration
#[derive(Accounts)]
#[instruction(provider_name: String)]
pub struct RegisterHealthcareProvider<'info> {
    #[account(
        init,
        payer = owner,
        space = HealthcareProvider::LEN,
        seeds = [b"healthcare_provider", owner.key().as_ref()],
        bump
    )]
    pub healthcare_provider: Account<'info, HealthcareProvider>,
    
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

pub fn register_healthcare_provider(
    ctx: Context<RegisterHealthcareProvider>,
    provider_name: String,
    provider_type: String,
    location: String,
    license_number: String,
) -> Result<()> {
    require!(provider_name.len() <= HealthcareProvider::MAX_NAME_LEN, DePINError::NameTooLong);
    require!(provider_type.len() <= HealthcareProvider::MAX_TYPE_LEN, DePINError::NameTooLong);
    require!(location.len() <= HealthcareProvider::MAX_LOCATION_LEN, DePINError::LocationTooLong);
    require!(license_number.len() <= HealthcareProvider::MAX_LICENSE_LEN, DePINError::NameTooLong);

    let healthcare_provider = &mut ctx.accounts.healthcare_provider;
    let network_state = &mut ctx.accounts.network_state;
    let user_profile = &mut ctx.accounts.user_profile;

    healthcare_provider.owner = ctx.accounts.owner.key();
    healthcare_provider.provider_name = provider_name.clone();
    healthcare_provider.provider_type = provider_type.clone();
    healthcare_provider.location = location.clone();
    healthcare_provider.license_number = license_number.clone();
    healthcare_provider.total_data_submissions = 0;
    healthcare_provider.total_records_collected = 0;
    healthcare_provider.total_rewards_earned = 0;
    healthcare_provider.last_data_submission = 0;
    healthcare_provider.is_active = true;
    healthcare_provider.compliance_score = 100;
    healthcare_provider.bump = ctx.bumps.healthcare_provider;

    network_state.healthcare_providers_count += 1;

    // Initialize user profile if needed
    if user_profile.owner == Pubkey::default() {
        user_profile.owner = ctx.accounts.owner.key();
        user_profile.total_earned = 0;
        user_profile.total_staked = 0;
        user_profile.reputation_score = 100;
        user_profile.last_activity = Clock::get()?.unix_timestamp;
        user_profile.wifi_hotspots = 0;
        user_profile.logistics_partners = 0;
        user_profile.farms = 0;
        user_profile.governance_votes = 0;
        user_profile.bump = ctx.bumps.user_profile;
    } else {
        user_profile.last_activity = Clock::get()?.unix_timestamp;
    }

    msg!(\"Healthcare provider '{}' registered successfully\", provider_name);
    msg!(\"Type: {}, License: {}\", provider_type, license_number);

    Ok(())
}

// Tax Collection Point Registration
#[derive(Accounts)]
#[instruction(point_name: String)]
pub struct RegisterTaxPoint<'info> {
    #[account(
        init,
        payer = owner,
        space = TaxCollectionPoint::LEN,
        seeds = [b"tax_point", owner.key().as_ref()],
        bump
    )]
    pub tax_point: Account<'info, TaxCollectionPoint>,
    
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

pub fn register_tax_point(
    ctx: Context<RegisterTaxPoint>,
    point_name: String,
    authority_type: String,
    location: String,
    jurisdiction: String,
) -> Result<()> {
    require!(point_name.len() <= TaxCollectionPoint::MAX_NAME_LEN, DePINError::NameTooLong);
    require!(authority_type.len() <= TaxCollectionPoint::MAX_TYPE_LEN, DePINError::NameTooLong);
    require!(location.len() <= TaxCollectionPoint::MAX_LOCATION_LEN, DePINError::LocationTooLong);
    require!(jurisdiction.len() <= TaxCollectionPoint::MAX_JURISDICTION_LEN, DePINError::NameTooLong);

    let tax_point = &mut ctx.accounts.tax_point;
    let network_state = &mut ctx.accounts.network_state;
    let user_profile = &mut ctx.accounts.user_profile;

    tax_point.owner = ctx.accounts.owner.key();
    tax_point.point_name = point_name.clone();
    tax_point.authority_type = authority_type.clone();
    tax_point.location = location.clone();
    tax_point.jurisdiction = jurisdiction.clone();
    tax_point.total_records_submitted = 0;
    tax_point.total_amount_processed = 0;
    tax_point.total_rewards_earned = 0;
    tax_point.last_data_submission = 0;
    tax_point.is_active = true;
    tax_point.verification_score = 100;
    tax_point.bump = ctx.bumps.tax_point;

    network_state.tax_points_count += 1;

    // Initialize user profile if needed
    if user_profile.owner == Pubkey::default() {
        user_profile.owner = ctx.accounts.owner.key();
        user_profile.total_earned = 0;
        user_profile.total_staked = 0;
        user_profile.reputation_score = 100;
        user_profile.last_activity = Clock::get()?.unix_timestamp;
        user_profile.wifi_hotspots = 0;
        user_profile.logistics_partners = 0;
        user_profile.farms = 0;
        user_profile.governance_votes = 0;
        user_profile.bump = ctx.bumps.user_profile;
    } else {
        user_profile.last_activity = Clock::get()?.unix_timestamp;
    }

    msg!(\"Tax collection point '{}' registered successfully\", point_name);
    msg!(\"Authority: {}, Jurisdiction: {}\", authority_type, jurisdiction);

    Ok(())
}

// Healthcare Data Submission
#[derive(Accounts)]
pub struct SubmitHealthcareData<'info> {
    #[account(
        mut,
        seeds = [b"healthcare_provider", owner.key().as_ref()],
        bump = healthcare_provider.bump,
        has_one = owner
    )]
    pub healthcare_provider: Account<'info, HealthcareProvider>,
    
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

pub fn submit_healthcare_data(
    ctx: Context<SubmitHealthcareData>,
    records_count: u32,
    data_quality_score: u8,
) -> Result<()> {
    require!(data_quality_score <= 100, DePINError::InvalidScore);
    require!(records_count > 0, DePINError::NoDataTransferred);

    let healthcare_provider = &mut ctx.accounts.healthcare_provider;
    let user_profile = &mut ctx.accounts.user_profile;
    let network_state = &ctx.accounts.network_state;

    // Check minimum time between submissions (1 hour)
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time - healthcare_provider.last_data_submission >= 3600,
        DePINError::SubmissionTooFrequent
    );

    // Calculate rewards based on records and quality
    let base_reward = records_count as u64 * network_state.healthcare_reward_rate;
    let quality_multiplier = data_quality_score as u64;
    let reward_amount = (base_reward * quality_multiplier) / 100;

    // Update healthcare provider data
    healthcare_provider.total_data_submissions += 1;
    healthcare_provider.total_records_collected += records_count;
    healthcare_provider.total_rewards_earned += reward_amount;
    healthcare_provider.last_data_submission = current_time;

    // Update compliance score based on quality
    if data_quality_score >= 95 {
        healthcare_provider.compliance_score = std::cmp::min(100, healthcare_provider.compliance_score + 1);
    } else if data_quality_score < 80 {
        healthcare_provider.compliance_score = std::cmp::max(0, healthcare_provider.compliance_score - 1);
    }

    // Update user profile
    user_profile.total_earned += reward_amount;
    user_profile.last_activity = current_time;

    msg!(\"Healthcare data submitted successfully!\");
    msg!(\"Records: {}, Quality score: {}%\", records_count, data_quality_score);
    msg!(\"Reward earned: {} BUILD\", reward_amount / 10_u64.pow(9));

    Ok(())
}

// Taxation Data Submission
#[derive(Accounts)]
pub struct SubmitTaxationData<'info> {
    #[account(
        mut,
        seeds = [b"tax_point", owner.key().as_ref()],
        bump = tax_point.bump,
        has_one = owner
    )]
    pub tax_point: Account<'info, TaxCollectionPoint>,
    
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

pub fn submit_taxation_data(
    ctx: Context<SubmitTaxationData>,
    records_count: u32,
    amount_processed: u64,
    verification_score: u8,
) -> Result<()> {
    require!(verification_score <= 100, DePINError::InvalidScore);
    require!(records_count > 0, DePINError::NoDataTransferred);

    let tax_point = &mut ctx.accounts.tax_point;
    let user_profile = &mut ctx.accounts.user_profile;
    let network_state = &ctx.accounts.network_state;

    // Check minimum time between submissions (1 hour)
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time - tax_point.last_data_submission >= 3600,
        DePINError::SubmissionTooFrequent
    );

    // Calculate rewards based on records and verification score
    let base_reward = records_count as u64 * network_state.taxation_reward_rate;
    let verification_multiplier = verification_score as u64;
    let reward_amount = (base_reward * verification_multiplier) / 100;

    // Update tax point data
    tax_point.total_records_submitted += records_count;
    tax_point.total_amount_processed += amount_processed;
    tax_point.total_rewards_earned += reward_amount;
    tax_point.last_data_submission = current_time;

    // Update verification score based on performance
    if verification_score >= 95 {
        tax_point.verification_score = std::cmp::min(100, tax_point.verification_score + 1);
    } else if verification_score < 80 {
        tax_point.verification_score = std::cmp::max(0, tax_point.verification_score - 1);
    }

    // Update user profile
    user_profile.total_earned += reward_amount;
    user_profile.last_activity = current_time;

    msg!(\"Taxation data submitted successfully!\");
    msg!(\"Records: {}, Amount processed: {} PKR, Verification score: {}%\", 
         records_count, amount_processed, verification_score);
    msg!(\"Reward earned: {} BUILD\", reward_amount / 10_u64.pow(9));

    Ok(())
}
