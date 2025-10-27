const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying GasPredictionLeague...");
  
  // Get the contract factory
  const GasPredictionLeague = await hre.ethers.getContractFactory("GasPredictionLeague");
  
  // Deploy the contract
  const gasPredictionLeague = await GasPredictionLeague.deploy();
  
  // Wait for deployment
  await gasPredictionLeague.deployed();
  
  const contractAddress = gasPredictionLeague.address;
  
  console.log("✅ GasPredictionLeague deployed to:", contractAddress);
  console.log("🔗 Network:", hre.network.name);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: contractAddress,
    deploymentTime: new Date().toISOString(),
    compiler: "0.8.19"
  };
  
  // Save to file
  fs.writeFileSync(
    "./deployments/latest.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📄 Deployment info saved to deployments/latest.json");
  
  // Instructions for BSC Testnet
  if (hre.network.name === "bscTestnet") {
    console.log("\n📝 Next steps for BSC Testnet:");
    console.log("1. Verify contract on BSCScan:");
    console.log(`   npx hardhat verify --network bscTestnet ${contractAddress}`);
    console.log("2. View on BSCScan:");
    console.log(`   https://testnet.bscscan.com/address/${contractAddress}`);
    console.log("3. Get test BNB from faucet:");
    console.log("   https://testnet.bnbchain.org/faucet-smart");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
