const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔄 Updating Oracle Address...");

  // Get deployment info
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("./deployments/latest.json", "utf8"));
  } catch (error) {
    console.error("❌ Could not read deployment info. Make sure contract is deployed.");
    return;
  }

  const contractAddress = deploymentInfo.contractAddress;
  const network = deploymentInfo.network;

  console.log(`📄 Contract: ${contractAddress}`);
  console.log(`🌐 Network: ${network}`);

  // Get the contract
  const GasPredictionLeague = await hre.ethers.getContractFactory("GasPredictionLeague");
  const contract = await GasPredictionLeague.attach(contractAddress);

  // Get current oracle
  const currentOracle = await contract.oracle();
  console.log(`👤 Current Oracle: ${currentOracle}`);

  // Get new oracle address from environment or generate one
  let newOracleAddress = process.env.NEW_ORACLE_ADDRESS;

  if (!newOracleAddress) {
    // Generate new wallet
    const newWallet = hre.ethers.Wallet.createRandom();
    newOracleAddress = newWallet.address;
    console.log(`🆕 Generated New Oracle Address: ${newOracleAddress}`);
    console.log(`🔑 Private Key: ${newWallet.privateKey}`);
    console.log(`\n💾 Add to .env file:`);
    console.log(`ORACLE_PRIVATE_KEY=${newWallet.privateKey}`);
  }

  // Update oracle (only current oracle can do this)
  console.log(`🔄 Updating oracle to: ${newOracleAddress}`);

  try {
    const tx = await contract.updateOracle(newOracleAddress);
    await tx.wait();

    console.log(`✅ Oracle updated successfully!`);
    console.log(`🔗 Transaction: ${tx.hash}`);

    // Update deployment info
    deploymentInfo.oracleAddress = newOracleAddress;
    deploymentInfo.lastOracleUpdate = new Date().toISOString();
    fs.writeFileSync("./deployments/latest.json", JSON.stringify(deploymentInfo, null, 2));

    console.log(`📄 Updated deployment info`);

    // View on explorer
    if (network === "bscTestnet") {
      console.log(`🔗 View on BSCScan: https://testnet.bscscan.com/tx/${tx.hash}`);
    }

  } catch (error) {
    console.error("❌ Failed to update oracle:", error.message);
    console.log("\n💡 Make sure you're using the current oracle's private key!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
