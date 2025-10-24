use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = proposer,
        space = Proposal::LEN,
        seeds = [PROPOSAL_SEED, &network_state.proposals_count.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    #[account(
        seeds = [USER_PROFILE_SEED, proposer.key().as_ref()],
        bump = user_profile.bump,
        has_one = proposer
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,
    description: String,
    proposal_type: ProposalType,
) -> Result<()> {
    require!(title.len() <= Proposal::MAX_TITLE_LEN, DePINError::TitleTooLong);
    require!(description.len() <= Proposal::MAX_DESCRIPTION_LEN, DePINError::DescriptionTooLong);

    let network_state = &mut ctx.accounts.network_state;
    let user_profile = &ctx.accounts.user_profile;

    // Check if user has enough tokens to create proposal
    require!(
        user_profile.total_staked >= network_state.governance_threshold,
        DePINError::InsufficientTokensForProposal
    );

    let proposal = &mut ctx.accounts.proposal;
    let current_time = Clock::get()?.unix_timestamp;

    proposal.id = network_state.proposals_count;
    proposal.proposer = ctx.accounts.proposer.key();
    proposal.title = title.clone();
    proposal.description = description.clone();
    proposal.proposal_type = proposal_type.clone();
    proposal.yes_votes = 0;
    proposal.no_votes = 0;
    proposal.total_votes = 0;
    proposal.start_time = current_time;
    proposal.end_time = current_time + (7 * 24 * 3600); // 7 days voting period
    proposal.executed = false;
    proposal.approved = false;
    proposal.bump = ctx.bumps.proposal;

    network_state.proposals_count += 1;

    msg!("Proposal '{}' created successfully", title);
    msg!("Proposal ID: {}, Type: {:?}", proposal.id, proposal_type);
    msg!("Voting period: {} days", 7);

    Ok(())
}

#[derive(Accounts)]
pub struct VoteProposal<'info> {
    #[account(
        mut,
        seeds = [PROPOSAL_SEED, &proposal.id.to_le_bytes()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, voter.key().as_ref()],
        bump = user_profile.bump,
        has_one = voter
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + 32 + 8 + 1 + 8 + 1, // UserVote account
        seeds = [VOTE_SEED, proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub user_vote: Account<'info, UserVote>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserVote {
    pub voter: Pubkey,
    pub proposal: Pubkey,
    pub vote: Vote,
    pub voting_power: u64,
    pub timestamp: i64,
    pub bump: u8,
}

pub fn vote_proposal(
    ctx: Context<VoteProposal>,
    vote: Vote,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let user_profile = &mut ctx.accounts.user_profile;
    let user_vote = &mut ctx.accounts.user_vote;

    let current_time = Clock::get()?.unix_timestamp;

    // Check if voting period is active
    require!(
        current_time >= proposal.start_time && current_time <= proposal.end_time,
        DePINError::VotingPeriodEnded
    );

    require!(!proposal.executed, DePINError::ProposalAlreadyExecuted);

    // Check if user has already voted
    require!(user_vote.voter == Pubkey::default(), DePINError::AlreadyVoted);

    // Voting power based on staked tokens
    let voting_power = user_profile.total_staked;
    require!(voting_power > 0, DePINError::NoVotingPower);

    // Record the vote
    user_vote.voter = ctx.accounts.voter.key();
    user_vote.proposal = proposal.key();
    user_vote.vote = vote.clone();
    user_vote.voting_power = voting_power;
    user_vote.timestamp = current_time;
    user_vote.bump = ctx.bumps.user_vote;

    // Update proposal vote counts
    match vote {
        Vote::Yes => proposal.yes_votes += voting_power,
        Vote::No => proposal.no_votes += voting_power,
        Vote::Abstain => {} // Abstain votes don't count towards yes/no
    }

    proposal.total_votes += 1;
    user_profile.governance_votes += 1;

    msg!("Vote cast successfully on proposal {}", proposal.id);
    msg!("Vote: {:?}, Voting power: {} PKN", vote, voting_power / 10_u64.pow(9));

    Ok(())
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(
        mut,
        seeds = [PROPOSAL_SEED, &proposal.id.to_le_bytes()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        mut,
        seeds = [NETWORK_STATE_SEED],
        bump = network_state.bump
    )]
    pub network_state: Account<'info, NetworkState>,
    
    pub executor: Signer<'info>,
}

pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let network_state = &mut ctx.accounts.network_state;

    let current_time = Clock::get()?.unix_timestamp;

    // Check if voting period has ended
    require!(current_time > proposal.end_time, DePINError::VotingStillActive);
    require!(!proposal.executed, DePINError::ProposalAlreadyExecuted);

    // Check if proposal passed (simple majority for now)
    let total_voted = proposal.yes_votes + proposal.no_votes;
    require!(total_voted > 0, DePINError::NoVotesCast);

    let approval_threshold = total_voted / 2; // 50% threshold
    let approved = proposal.yes_votes > approval_threshold;

    proposal.approved = approved;
    proposal.executed = true;

    if approved {
        // Execute the proposal based on its type
        match proposal.proposal_type {
            ProposalType::ParameterChange => {
                // Implementation would depend on specific parameter changes
                msg!("Parameter change proposal approved and executed");
            }
            ProposalType::TreasurySpend => {
                // Implementation for treasury spending
                msg!("Treasury spend proposal approved");
            }
            ProposalType::ProtocolUpgrade => {
                // Implementation for protocol upgrades
                msg!("Protocol upgrade proposal approved");
            }
            ProposalType::RewardRateChange => {
                // Implementation for reward rate changes
                msg!("Reward rate change proposal approved");
            }
            ProposalType::NetworkExpansion => {
                // Implementation for network expansion
                msg!("Network expansion proposal approved");
            }
        }

        msg!("Proposal {} executed successfully", proposal.id);
    } else {
        msg!("Proposal {} rejected by voters", proposal.id);
    }

    msg!("Yes votes: {} PKN, No votes: {} PKN", 
         proposal.yes_votes / 10_u64.pow(9), proposal.no_votes / 10_u64.pow(9));

    Ok(())
}