import { ethers } from "hardhat";

const VERIFIER = "0xFF71eDf05312B4b25f8b1433304193AF9886721E"; // Fantom Testnet

async function main() {
    const ZkticketsFactory = await ethers.getContractFactory("ZKTickets");
    const ZkticketsDeploy = await ZkticketsFactory.deploy(VERIFIER);
    const zktickets = await ZkticketsDeploy.deployed();
    console.log("ZKTickets is deployed to :", zktickets.address);
}

// ZKTIckets is deployed to : 0x0680c8Fb31faC6029f01f5b75e55b2F3D4333fC2

// main().catch(err => {
//     console.error(err);
//     process.exitCode = 1;
// })