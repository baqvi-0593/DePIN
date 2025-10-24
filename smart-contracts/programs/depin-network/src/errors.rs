use anchor_lang::prelude::*;

#[error_code]
pub enum DePINError {
    #[msg("Location string is too long")]
    LocationTooLong,
    #[msg("Invalid coverage radius")]
    InvalidCoverageRadius,
    #[msg("Invalid bandwidth specification")]
    InvalidBandwidth,
    #[msg("Name is too long")]
    NameTooLong,
    #[msg("Too many service areas specified")]
    TooManyServiceAreas,
    #[msg("Service area name is too long")]
    ServiceAreaTooLong,
    #[msg("Invalid vehicle count")]
    InvalidVehicleCount,
    #[msg("Invalid farm size")]
    InvalidFarmSize,
    #[msg("Too many crop types specified")]
    TooManyCropTypes,
    #[msg("Crop name is too long")]
    CropNameTooLong,
    #[msg("Invalid uptime percentage")]
    InvalidUptime,
    #[msg("No data transferred")]
    NoDataTransferred,
    #[msg("Data submission too frequent")]
    SubmissionTooFrequent,
    #[msg("Invalid score value")]
    InvalidScore,
    #[msg("No deliveries completed")]
    NoDeliveries,
    #[msg("Invalid soil moisture value")]
    InvalidMoisture,
    #[msg("Invalid humidity value")]
    InvalidHumidity,
    #[msg("Invalid pH level")]
    InvalidPH,
    #[msg("Invalid temperature value")]
    InvalidTemperature,
    #[msg("Invalid stake amount")]
    InvalidStakeAmount,
    #[msg("Staking pool is inactive")]
    PoolInactive,
    #[msg("Amount below minimum stake requirement")]
    BelowMinimumStake,
    #[msg("Pool capacity exceeded")]
    PoolCapacityExceeded,
    #[msg("Insufficient staked amount")]
    InsufficientStake,
    #[msg("Stake is still locked")]
    StakeLocked,
    #[msg("No stake found")]
    NoStakeFound,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("Title is too long")]
    TitleTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Insufficient tokens to create proposal")]
    InsufficientTokensForProposal,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,
    #[msg("User has already voted")]
    AlreadyVoted,
    #[msg("User has no voting power")]
    NoVotingPower,
    #[msg("Voting is still active")]
    VotingStillActive,
    #[msg("No votes were cast")]
    NoVotesCast,
    #[msg("Reward distribution too frequent")]
    DistributionTooFrequent,
    #[msg("Invalid reward rate")]
    InvalidRewardRate,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Account not initialized")]
    NotInitialized,
    #[msg("Invalid account data")]
    InvalidAccountData,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Invalid program state")]
    InvalidProgramState,
}