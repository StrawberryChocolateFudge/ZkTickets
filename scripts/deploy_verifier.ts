import { ethers } from "hardhat";

async function main() {
    const VerifierFactory = await ethers.getContractFactory("contracts/TicketVerifier.sol:Verifier");
    const VerifierDeploy = await VerifierFactory.deploy();
    const verifier = await VerifierDeploy.deployed();

    console.log("Verifier has been deployed to : ", verifier.address);
    // verifier deployed on BTT Donau testnet : 0xC88ec599D643D84C7BE4315087b23581ac854064
}

// main().catch(error => {
//     console.error(error);
//     process.exitCode = 1;
// })