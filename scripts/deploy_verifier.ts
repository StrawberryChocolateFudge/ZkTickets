import { ethers } from "hardhat";

async function main() {
    const VerifierFactory = await ethers.getContractFactory("contracts/TicketVerifier.sol:Verifier");
    const VerifierDeploy = await VerifierFactory.deploy();
    const verifier = await VerifierDeploy.deployed();

    console.log("Verifier has been deployed to : ", verifier.address);
    // verifier deployed on Fantom testnet: 0xFF71eDf05312B4b25f8b1433304193AF9886721E
}

// main().catch(error => {
//     console.error(error);
//     process.exitCode = 1;
// })