export type DePINNetwork = {
  "version": "0.1.0",
  "name": "depin_network",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "totalSupply",
          "type": "u64"
        },
        {
          "name": "decimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "registerWifiHotspot",
      "accounts": [
        {
          "name": "wifiHotspot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "coverageRadius",
          "type": "u32"
        },
        {
          "name": "bandwidthMbps",
          "type": "u32"
        }
      ]
    },
    {
      "name": "registerLogisticsPartner",
      "accounts": [
        {
          "name": "logisticsPartner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "partnerName",
          "type": "string"
        },
        {
          "name": "serviceAreas",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "vehicleCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "registerFarm",
      "accounts": [
        {
          "name": "farm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "farmName",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "farmSizeAcres",
          "type": "u32"
        },
        {
          "name": "cropTypes",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "submitWifiData",
      "accounts": [
        {
          "name": "wifiHotspot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "usersConnected",
          "type": "u32"
        },
        {
          "name": "dataTransferredGb",
          "type": "u64"
        },
        {
          "name": "uptimePercentage",
          "type": "u8"
        }
      ]
    },
    {
      "name": "submitLogisticsData",
      "accounts": [
        {
          "name": "logisticsPartner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "deliveriesCompleted",
          "type": "u32"
        },
        {
          "name": "distanceTraveledKm",
          "type": "u32"
        },
        {
          "name": "fuelEfficiency",
          "type": "u32"
        },
        {
          "name": "routeOptimizationScore",
          "type": "u8"
        }
      ]
    },
    {
      "name": "submitAgricultureData",
      "accounts": [
        {
          "name": "farm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "soilMoisture",
          "type": "u8"
        },
        {
          "name": "temperature",
          "type": "i16"
        },
        {
          "name": "humidity",
          "type": "u8"
        },
        {
          "name": "phLevel",
          "type": "u8"
        }
      ]
    },
    {
      "name": "stakeTokens",
      "accounts": [
        {
          "name": "stakingPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStake",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "poolType",
          "type": {
            "defined": "PoolType"
          }
        }
      ]
    },
    {
      "name": "unstakeTokens",
      "accounts": [
        {
          "name": "stakingPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStake",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "stakingPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStake",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "networkState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          },
          {
            "name": "wifiHotspotsCount",
            "type": "u32"
          },
          {
            "name": "logisticsPartnersCount",
            "type": "u32"
          },
          {
            "name": "farmsCount",
            "type": "u32"
          },
          {
            "name": "wifiRewardRate",
            "type": "u64"
          },
          {
            "name": "logisticsRewardRate",
            "type": "u64"
          },
          {
            "name": "agricultureRewardRate",
            "type": "u64"
          },
          {
            "name": "lastRewardDistribution",
            "type": "i64"
          },
          {
            "name": "governanceThreshold",
            "type": "u64"
          },
          {
            "name": "proposalsCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "wiFiHotspot",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "coverageRadius",
            "type": "u32"
          },
          {
            "name": "bandwidthMbps",
            "type": "u32"
          },
          {
            "name": "totalUsersServed",
            "type": "u32"
          },
          {
            "name": "totalDataTransferred",
            "type": "u64"
          },
          {
            "name": "totalRewardsEarned",
            "type": "u64"
          },
          {
            "name": "lastDataSubmission",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "reputationScore",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "logisticsPartner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "partnerName",
            "type": "string"
          },
          {
            "name": "serviceAreas",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "vehicleCount",
            "type": "u32"
          },
          {
            "name": "totalDeliveries",
            "type": "u32"
          },
          {
            "name": "totalDistanceKm",
            "type": "u32"
          },
          {
            "name": "totalRewardsEarned",
            "type": "u64"
          },
          {
            "name": "lastDataSubmission",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "efficiencyScore",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "farm",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "farmName",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "farmSizeAcres",
            "type": "u32"
          },
          {
            "name": "cropTypes",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "totalDataSubmissions",
            "type": "u32"
          },
          {
            "name": "totalRewardsEarned",
            "type": "u64"
          },
          {
            "name": "lastDataSubmission",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "yieldImprovement",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "totalEarned",
            "type": "u64"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          },
          {
            "name": "reputationScore",
            "type": "u16"
          },
          {
            "name": "lastActivity",
            "type": "i64"
          },
          {
            "name": "wifiHotspots",
            "type": "u8"
          },
          {
            "name": "logisticsPartners",
            "type": "u8"
          },
          {
            "name": "farms",
            "type": "u8"
          },
          {
            "name": "governanceVotes",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PoolType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WiFiInfrastructure"
          },
          {
            "name": "LogisticsOptimization"
          },
          {
            "name": "AgricultureData"
          },
          {
            "name": "Governance"
          },
          {
            "name": "LiquidityMining"
          }
        ]
      }
    },
    {
      "name": "ProposalType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ParameterChange"
          },
          {
            "name": "TreasurySpend"
          },
          {
            "name": "ProtocolUpgrade"
          },
          {
            "name": "RewardRateChange"
          },
          {
            "name": "NetworkExpansion"
          }
        ]
      }
    },
    {
      "name": "Vote",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Yes"
          },
          {
            "name": "No"
          },
          {
            "name": "Abstain"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "LocationTooLong",
      "msg": "Location string is too long"
    },
    {
      "code": 6001,
      "name": "InvalidCoverageRadius",
      "msg": "Invalid coverage radius"
    },
    {
      "code": 6002,
      "name": "InvalidBandwidth",
      "msg": "Invalid bandwidth specification"
    }
  ]
};

export const IDL: DePINNetwork = {
  "version": "0.1.0",
  "name": "depin_network",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "totalSupply",
          "type": "u64"
        },
        {
          "name": "decimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "registerWifiHotspot",
      "accounts": [
        {
          "name": "wifiHotspot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "coverageRadius",
          "type": "u32"
        },
        {
          "name": "bandwidthMbps",
          "type": "u32"
        }
      ]
    },
    {
      "name": "registerLogisticsPartner",
      "accounts": [
        {
          "name": "logisticsPartner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "partnerName",
          "type": "string"
        },
        {
          "name": "serviceAreas",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "vehicleCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "registerFarm",
      "accounts": [
        {
          "name": "farm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "farmName",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "farmSizeAcres",
          "type": "u32"
        },
        {
          "name": "cropTypes",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "submitWifiData",
      "accounts": [
        {
          "name": "wifiHotspot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "usersConnected",
          "type": "u32"
        },
        {
          "name": "dataTransferredGb",
          "type": "u64"
        },
        {
          "name": "uptimePercentage",
          "type": "u8"
        }
      ]
    },
    {
      "name": "submitLogisticsData",
      "accounts": [
        {
          "name": "logisticsPartner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "deliveriesCompleted",
          "type": "u32"
        },
        {
          "name": "distanceTraveledKm",
          "type": "u32"
        },
        {
          "name": "fuelEfficiency",
          "type": "u32"
        },
        {
          "name": "routeOptimizationScore",
          "type": "u8"
        }
      ]
    },
    {
      "name": "submitAgricultureData",
      "accounts": [
        {
          "name": "farm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "soilMoisture",
          "type": "u8"
        },
        {
          "name": "temperature",
          "type": "i16"
        },
        {
          "name": "humidity",
          "type": "u8"
        },
        {
          "name": "phLevel",
          "type": "u8"
        }
      ]
    },
    {
      "name": "stakeTokens",
      "accounts": [
        {
          "name": "stakingPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStake",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "poolType",
          "type": {
            "defined": "PoolType"
          }
        }
      ]
    },
    {
      "name": "unstakeTokens",
      "accounts": [
        {
          "name": "stakingPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStake",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "networkState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "stakingPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStake",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "networkState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          },
          {
            "name": "wifiHotspotsCount",
            "type": "u32"
          },
          {
            "name": "logisticsPartnersCount",
            "type": "u32"
          },
          {
            "name": "farmsCount",
            "type": "u32"
          },
          {
            "name": "wifiRewardRate",
            "type": "u64"
          },
          {
            "name": "logisticsRewardRate",
            "type": "u64"
          },
          {
            "name": "agricultureRewardRate",
            "type": "u64"
          },
          {
            "name": "lastRewardDistribution",
            "type": "i64"
          },
          {
            "name": "governanceThreshold",
            "type": "u64"
          },
          {
            "name": "proposalsCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "wiFiHotspot",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "coverageRadius",
            "type": "u32"
          },
          {
            "name": "bandwidthMbps",
            "type": "u32"
          },
          {
            "name": "totalUsersServed",
            "type": "u32"
          },
          {
            "name": "totalDataTransferred",
            "type": "u64"
          },
          {
            "name": "totalRewardsEarned",
            "type": "u64"
          },
          {
            "name": "lastDataSubmission",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "reputationScore",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "logisticsPartner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "partnerName",
            "type": "string"
          },
          {
            "name": "serviceAreas",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "vehicleCount",
            "type": "u32"
          },
          {
            "name": "totalDeliveries",
            "type": "u32"
          },
          {
            "name": "totalDistanceKm",
            "type": "u32"
          },
          {
            "name": "totalRewardsEarned",
            "type": "u64"
          },
          {
            "name": "lastDataSubmission",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "efficiencyScore",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "farm",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "farmName",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "farmSizeAcres",
            "type": "u32"
          },
          {
            "name": "cropTypes",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "totalDataSubmissions",
            "type": "u32"
          },
          {
            "name": "totalRewardsEarned",
            "type": "u64"
          },
          {
            "name": "lastDataSubmission",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "yieldImprovement",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "totalEarned",
            "type": "u64"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          },
          {
            "name": "reputationScore",
            "type": "u16"
          },
          {
            "name": "lastActivity",
            "type": "i64"
          },
          {
            "name": "wifiHotspots",
            "type": "u8"
          },
          {
            "name": "logisticsPartners",
            "type": "u8"
          },
          {
            "name": "farms",
            "type": "u8"
          },
          {
            "name": "governanceVotes",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PoolType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WiFiInfrastructure"
          },
          {
            "name": "LogisticsOptimization"
          },
          {
            "name": "AgricultureData"
          },
          {
            "name": "Governance"
          },
          {
            "name": "LiquidityMining"
          }
        ]
      }
    },
    {
      "name": "ProposalType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ParameterChange"
          },
          {
            "name": "TreasurySpend"
          },
          {
            "name": "ProtocolUpgrade"
          },
          {
            "name": "RewardRateChange"
          },
          {
            "name": "NetworkExpansion"
          }
        ]
      }
    },
    {
      "name": "Vote",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Yes"
          },
          {
            "name": "No"
          },
          {
            "name": "Abstain"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "LocationTooLong",
      "msg": "Location string is too long"
    },
    {
      "code": 6001,
      "name": "InvalidCoverageRadius",
      "msg": "Invalid coverage radius"
    },
    {
      "code": 6002,
      "name": "InvalidBandwidth",
      "msg": "Invalid bandwidth specification"
    }
  ]
};