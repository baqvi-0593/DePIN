# Pakistani DePIN Network Smart Contracts

This directory contains the Solana smart contracts for the Pakistani DePIN (Decentralized Physical Infrastructure Network) project.

## Overview

The smart contracts enable:
- **Infrastructure Registration**: WiFi hotspots, logistics partners, and farms
- **Token Economics**: PKN token with staking and rewards
- **Data Submission & Rewards**: Automated reward distribution for infrastructure operators
- **Governance**: Community voting on network parameters and upgrades
- **Multichain Support**: Architecture ready for expansion to other blockchains

## Architecture

### Core Contracts

1. **DePIN Network (`lib.rs`)** - Main program coordinator
2. **Infrastructure Management** - Registration and data submission
3. **Token Staking** - Multiple staking pools with different APYs
4. **Governance** - Proposal creation and voting system
5. **Reward Distribution** - Automated reward calculations

### Key Features

- **Multichain Ready**: Designed for deployment across Solana, Polygon, BSC, and Avalanche
- **Modular Design**: Separate modules for different DePIN phases
- **Performance Optimized**: Efficient account structures and minimal compute usage
- **Security First**: Comprehensive validation and error handling

## Prerequisites

Before deploying, ensure you have:

```bash
# Solana CLI
curl -sSf https://release.solana.com/v1.16.0/install | sh

# Anchor Framework
npm install -g @project-serum/anchor-cli

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Quick Start

### 1. Deploy to Devnet

```bash
# Navigate to smart contracts directory
cd smart-contracts

# Run deployment script
node deploy.js devnet
```

### 2. Deploy to Mainnet

```bash
# Deploy to mainnet (ensure you have sufficient SOL)
node deploy.js mainnet-beta
```

### 3. Manual Deployment

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Initialize the network
anchor run initialize
```

## Contract Addresses

### Devnet
- **Program ID**: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`
- **Network State**: Derived from program
- **PKN Token Mint**: Derived from program

### Mainnet
- **Program ID**: TBD (To Be Deployed)

## Smart Contract Functions

### Infrastructure Management

```rust
// Register WiFi hotspot
register_wifi_hotspot(location, coverage_radius, bandwidth_mbps)

// Register logistics partner
register_logistics_partner(partner_name, service_areas, vehicle_count)

// Register agricultural farm
register_farm(farm_name, location, farm_size_acres, crop_types)
```

### Data Submission & Rewards

```rust
// Submit WiFi performance data
submit_wifi_data(users_connected, data_transferred_gb, uptime_percentage)

// Submit logistics efficiency data
submit_logistics_data(deliveries_completed, distance_traveled_km, fuel_efficiency, route_optimization_score)

// Submit agricultural sensor data
submit_agriculture_data(soil_moisture, temperature, humidity, ph_level)
```

### Token Staking

```rust
// Stake tokens in a pool
stake_tokens(amount, pool_type)

// Unstake tokens
unstake_tokens(amount)

// Claim staking rewards
claim_rewards()
```

### Governance

```rust
// Create governance proposal
create_proposal(title, description, proposal_type)

// Vote on proposal
vote_proposal(vote)

// Execute approved proposal
execute_proposal()
```

## Staking Pools

| Pool Type | APY | Lock Period | Description |
|-----------|-----|-------------|-------------|
| WiFi Infrastructure | 12% | 30 days | For WiFi hotspot operators |
| Logistics Optimization | 15% | 90 days | For logistics partners |
| Agriculture Data | 18% | 180 days | For farm sensor operators |
| Governance | 8% | No lock | For governance participation |
| Liquidity Mining | 25% | 14 days | For providing liquidity |

## Token Economics

- **Total Supply**: 1,000,000,000 PKN
- **Decimals**: 9
- **Reward Rates**:
  - WiFi: 100 PKN per GB transferred
  - Logistics: 50 PKN per delivery
  - Agriculture: 25 PKN per data submission

## Network Parameters

### Current Settings (Devnet)
- **Governance Threshold**: 1,000 PKN (minimum to create proposals)
- **Voting Period**: 7 days
- **Reward Distribution**: Daily
- **Min Stake Amount**: 100 PKN

## Security Considerations

### Implemented Protections
- **Time-based Submission Limits**: Prevent spam attacks
- **Validation Checks**: Comprehensive input validation
- **Access Controls**: Owner-only functions for critical operations
- **Reputation Scoring**: Performance-based trust system

### Best Practices
- Always test on devnet first
- Use hardware wallets for mainnet deployments
- Monitor contract interactions closely
- Keep private keys secure

## Integration with Frontend

The smart contracts are integrated with the React frontend through:

1. **Solana Client** (`/utils/solana/client.ts`)
2. **Type Definitions** (`/utils/types/depin_network.ts`)
3. **Wallet Integration** (`/hooks/useWalletAuth.ts`)
4. **Multichain Component** (`/components/MultichainIntegration.tsx`)

## Testing

```bash
# Run contract tests
anchor test

# Test specific functionality
anchor test --skip-build

# Generate coverage report
anchor test --coverage
```

## Monitoring & Analytics

### On-Chain Metrics
- Total infrastructure registered
- Token distribution and staking
- Governance participation
- Network utilization

### Explorer Links
- **Devnet**: https://explorer.solana.com?cluster=devnet
- **Mainnet**: https://explorer.solana.com

## Troubleshooting

### Common Issues

1. **Insufficient SOL Balance**
   ```bash
   # Request airdrop on devnet
   solana airdrop 2
   ```

2. **Program Already Deployed**
   ```bash
   # Upgrade existing program
   anchor upgrade target/deploy/depin_network.so
   ```

3. **Account Not Found**
   - Ensure proper account initialization
   - Check account derivation seeds

### Getting Help

- Check Solana documentation: https://docs.solana.com
- Anchor documentation: https://project-serum.github.io/anchor/
- Join our Discord community: [Coming Soon]

## Roadmap

### Phase 1 (Current)
- ✅ Core smart contract development
- ✅ Solana integration
- ✅ Basic staking and rewards

### Phase 2 (Q2 2024)
- 🔄 Multichain deployment (Polygon, BSC, Avalanche)
- 🔄 Cross-chain bridge implementation
- 🔄 Advanced governance features

### Phase 3 (Q3 2024)
- 📋 Oracle integration for real-world data
- 📋 Insurance and slashing mechanisms
- 📋 Mobile SDK for infrastructure operators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

For questions or support, please reach out to the Pakistani DePIN Network team.