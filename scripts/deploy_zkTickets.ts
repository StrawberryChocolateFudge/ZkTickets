import { ethers } from "hardhat";

const VERIFIER = "0xC88ec599D643D84C7BE4315087b23581ac854064"; // Donau Testnet

async function main() {
    const ZkticketsFactory = await ethers.getContractFactory("ZKTickets");
    const ZkticketsDeploy = await ZkticketsFactory.deploy(VERIFIER);
    const zktickets = await ZkticketsDeploy.deployed();
    console.log("ZKTickets is deployed to :", zktickets.address);
}

// ZKTIckets is deployed to : 0x0680c8Fb31faC6029f01f5b75e55b2F3D4333fC2 fantom testnet
// 0x9096DaE3B7617148D3e2bd7A35409f1183193010 on donau testnet

// main().catch(err => {
//     console.error(err);
//     process.exitCode = 1;
// })