import { ethers } from "hardhat";

const VERIFIER = "0xC88ec599D643D84C7BE4315087b23581ac854064"; // Donau Testnet
const PROSTAKIGNADDRESS = "0xddD5455619eEe9A6AD5A8cbBD668Db15A4ab3710"; //Donau testnet

async function main() {
    const ZkticketsFactory = await ethers.getContractFactory("ZKTickets");
    const ZkticketsDeploy = await ZkticketsFactory.deploy(VERIFIER, PROSTAKIGNADDRESS);
    const zktickets = await ZkticketsDeploy.deployed();
    console.log("ZKTickets is deployed to :", zktickets.address);

    // ZKTickets is deployed to : 0xA186deff34278c32d2176f6b90e1B2A3FBD824f9 //Donau testnet
}


main().catch(err => {
    console.error(err);
    process.exitCode = 1;
})