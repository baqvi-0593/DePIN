const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description) {
  log(`\n📋 ${description}...`, 'cyan');
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
    return output;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    throw error;
  }
}

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'yellow');
  
  try {
    execSync('solana --version', { stdio: 'pipe' });
    log('✅ Solana CLI is installed', 'green');
  } catch (error) {
    log('❌ Solana CLI is not installed. Please install it first:', 'red');
    log('   curl -sSf https://release.solana.com/v1.16.0/install | sh', 'yellow');
    process.exit(1);
  }

  try {
    execSync('anchor --version', { stdio: 'pipe' });
    log('✅ Anchor CLI is installed', 'green');
  } catch (error) {
    log('❌ Anchor CLI is not installed. Please install it first:', 'red');
    log('   npm install -g @project-serum/anchor-cli', 'yellow');
    process.exit(1);
  }

  try {
    execSync('rust --version', { stdio: 'pipe' });
    log('✅ Rust is installed', 'green');
  } catch (error) {
    log('❌ Rust is not installed. Please install it first:', 'red');
    log('   curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh', 'yellow');
    process.exit(1);
  }
}

function setupSolanaConfig(network = 'devnet') {
  log(`\n🔧 Setting up Solana configuration for ${network}...`, 'cyan');
  
  try {
    executeCommand(`solana config set --url ${network}`, `Set Solana cluster to ${network}`);
    
    // Check if keypair exists, if not create one
    try {
      execSync('solana address', { stdio: 'pipe' });
      log('✅ Solana keypair already exists', 'green');
    } catch (error) {
      executeCommand('solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase', 'Generate new Solana keypair');
    }

    const address = execSync('solana address', { encoding: 'utf-8' }).trim();
    log(`📍 Wallet address: ${address}`, 'blue');

    if (network !== 'mainnet-beta') {
      executeCommand('solana airdrop 2', 'Request SOL airdrop for deployment');
    }

    const balance = execSync('solana balance', { encoding: 'utf-8' }).trim();
    log(`💰 Wallet balance: ${balance}`, 'blue');

  } catch (error) {
    log('❌ Failed to setup Solana configuration', 'red');
    throw error;
  }
}

function buildProgram() {
  log('\n🔨 Building Anchor program...', 'cyan');
  
  try {
    // Change to smart-contracts directory
    process.chdir(path.join(__dirname));
    
    executeCommand('anchor build', 'Build the DePIN Network program');
    
    // Get program ID
    const programId = execSync('solana address -k target/deploy/depin_network-keypair.json', { encoding: 'utf-8' }).trim();
    log(`🆔 Program ID: ${programId}`, 'magenta');
    
    return programId;
  } catch (error) {
    log('❌ Failed to build program', 'red');
    throw error;
  }
}

function deployProgram(network = 'devnet') {
  log(`\n🚀 Deploying program to ${network}...`, 'cyan');
  
  try {
    executeCommand('anchor deploy', `Deploy DePIN Network program to ${network}`);
    
    const programId = execSync('solana address -k target/deploy/depin_network-keypair.json', { encoding: 'utf-8' }).trim();
    
    // Update the program ID in the TypeScript file
    updateProgramId(programId);
    
    log(`🎉 Program deployed successfully!`, 'green');
    log(`📍 Program ID: ${programId}`, 'magenta');
    log(`🔗 Explorer: https://explorer.solana.com/address/${programId}?cluster=${network}`, 'blue');
    
    return programId;
  } catch (error) {
    log('❌ Failed to deploy program', 'red');
    throw error;
  }
}

function updateProgramId(programId) {
  log('\n📝 Updating program ID in TypeScript files...', 'cyan');
  
  const clientPath = path.join(__dirname, '..', 'utils', 'solana', 'client.ts');
  
  try {
    let content = fs.readFileSync(clientPath, 'utf-8');
    content = content.replace(
      /const PROGRAM_ID = new PublicKey\(['"`][^'"`]+['"`]\);/,
      `const PROGRAM_ID = new PublicKey('${programId}');`
    );
    fs.writeFileSync(clientPath, content);
    log('✅ Updated Solana client with new program ID', 'green');
  } catch (error) {
    log('⚠️ Failed to update TypeScript files with program ID', 'yellow');
    log(`   Please manually update the PROGRAM_ID in: ${clientPath}`, 'yellow');
  }
}

function initializeNetwork(programId) {
  log('\n🎯 Initializing DePIN Network...', 'cyan');
  
  try {
    executeCommand('anchor run initialize', 'Initialize the network state');
    log('✅ Network initialized successfully', 'green');
  } catch (error) {
    log('⚠️ Network initialization failed. You may need to run this manually later:', 'yellow');
    log(`   anchor run initialize`, 'yellow');
  }
}

function generatePackageJson() {
  log('\n📦 Generating package.json for smart contracts...', 'cyan');
  
  const packageJson = {
    name: "pakistani-depin-smart-contracts",
    version: "1.0.0",
    description: "Smart contracts for Pakistani DePIN Network",
    scripts: {
      "build": "anchor build",
      "deploy": "anchor deploy",
      "deploy:devnet": "anchor deploy --provider.cluster devnet",
      "deploy:mainnet": "anchor deploy --provider.cluster mainnet-beta",
      "test": "anchor test",
      "initialize": "node scripts/initialize.js",
      "upgrade": "anchor upgrade target/deploy/depin_network.so"
    },
    dependencies: {
      "@project-serum/anchor": "^0.29.0",
      "@solana/web3.js": "^1.90.0",
      "@solana/spl-token": "^0.3.8"
    },
    keywords: ["solana", "depin", "blockchain", "pakistan", "infrastructure"],
    author: "Pakistani DePIN Network Team",
    license: "MIT"
  };
  
  fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packageJson, null, 2));
  log('✅ Generated package.json', 'green');
}

function main() {
  const args = process.argv.slice(2);
  const network = args[0] || 'devnet';
  
  log('🚀 Pakistani DePIN Network Smart Contract Deployment', 'magenta');
  log('=' .repeat(60), 'magenta');
  
  try {
    checkPrerequisites();
    generatePackageJson();
    setupSolanaConfig(network);
    const programId = buildProgram();
    deployProgram(network);
    
    if (network !== 'mainnet-beta') {
      initializeNetwork(programId);
    }
    
    log('\n🎉 Deployment completed successfully!', 'green');
    log('=' .repeat(60), 'green');
    log('📋 Next steps:', 'cyan');
    log('1. Update your frontend with the new program ID', 'white');
    log('2. Test the integration with your React app', 'white');
    log('3. Initialize staking pools and network parameters', 'white');
    
    if (network === 'devnet') {
      log('4. When ready, deploy to mainnet with: node deploy.js mainnet-beta', 'white');
    }
    
  } catch (error) {
    log('\n💥 Deployment failed!', 'red');
    log('Please check the error messages above and try again.', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  setupSolanaConfig,
  buildProgram,
  deployProgram,
  updateProgramId,
  initializeNetwork
};