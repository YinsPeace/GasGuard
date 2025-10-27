import { ethers } from 'ethers';

// Generate a new oracle wallet
const wallet = ethers.Wallet.createRandom();

console.log('=== NEW ORACLE WALLET ===');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('');
console.log('⚠️  SAVE THIS PRIVATE KEY SECURELY!');
console.log('🔐 Add to your .env file:');
console.log(`ORACLE_PRIVATE_KEY=${wallet.privateKey}`);
console.log('');
console.log('📝 Next steps:');
console.log('1. Save the private key securely');
console.log('2. Update your .env file');
console.log('3. Update smart contract oracle address');
console.log('4. Transfer any funds if needed');
