use anchor_lang::prelude::*;

/// Utility function to validate string lengths
pub fn validate_string_length(s: &str, max_len: usize, field_name: &str) -> Result<()> {
    require!(s.len() <= max_len, 
        anchor_lang::error::Error::from(anchor_lang::error::ErrorCode::ConstraintRaw)
            .with_account_name(field_name)
    );
    Ok(())
}

/// Calculate rewards based on performance metrics
pub fn calculate_performance_multiplier(
    score: u8,
    excellent_threshold: u8,
    poor_threshold: u8,
) -> u64 {
    if score >= excellent_threshold {
        120 // 20% bonus
    } else if score >= poor_threshold {
        100 // Standard rate
    } else {
        80  // 20% penalty
    }
}

/// Convert APY basis points to per-second rate
pub fn apy_to_per_second_rate(apy_basis_points: u64) -> u64 {
    // APY in basis points (100 = 1%) to per-second rate
    apy_basis_points / (365 * 24 * 3600 * 100)
}

/// Validate geographic coordinates (basic validation)
pub fn validate_coordinates(latitude: f64, longitude: f64) -> bool {
    latitude >= -90.0 && latitude <= 90.0 && longitude >= -180.0 && longitude <= 180.0
}

/// Calculate distance between two points (simplified Haversine formula)
pub fn calculate_distance_km(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371.0; // Earth's radius in kilometers
    let d_lat = (lat2 - lat1).to_radians();
    let d_lon = (lon2 - lon1).to_radians();
    let a = (d_lat / 2.0).sin().powi(2) + 
            lat1.to_radians().cos() * lat2.to_radians().cos() * 
            (d_lon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    r * c
}

/// Check if a timestamp is within a certain period
pub fn is_within_period(timestamp: i64, period_seconds: i64) -> bool {
    let current_time = Clock::get().unwrap().unix_timestamp;
    (current_time - timestamp) <= period_seconds
}

/// Calculate reputation score update
pub fn update_reputation_score(
    current_score: u8,
    performance_score: u8,
    excellent_threshold: u8,
    poor_threshold: u8,
) -> u8 {
    if performance_score >= excellent_threshold {
        std::cmp::min(100, current_score + 1)
    } else if performance_score < poor_threshold {
        std::cmp::max(0, current_score.saturating_sub(2))
    } else {
        current_score
    }
}

/// Validate sensor data ranges
pub fn validate_sensor_data(
    soil_moisture: u8,
    temperature: i16,
    humidity: u8,
    ph_level: u8,
) -> bool {
    soil_moisture <= 100 &&
    temperature >= -50 && temperature <= 70 &&
    humidity <= 100 &&
    ph_level <= 14
}

/// Calculate staking rewards based on time and rate
pub fn calculate_staking_rewards(
    staked_amount: u64,
    apy_basis_points: u64,
    time_staked_seconds: i64,
) -> u64 {
    let annual_rate = apy_basis_points as f64 / 10000.0; // Convert basis points to decimal
    let time_factor = time_staked_seconds as f64 / (365.25 * 24.0 * 3600.0); // Years
    (staked_amount as f64 * annual_rate * time_factor) as u64
}