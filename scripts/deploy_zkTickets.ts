import { ethers } from "hardhat";

const VERIFIER = "0xC88ec599D643D84C7BE4315087b23581ac854064"; // Donau Testnet
const PROSTAKIGNADDRESS = "0xddD5455619eEe9A6AD5A8cbBD668Db15A4ab3710"; //Donau testnet

async function main() {
    const ZkticketsFactory = await ethers.getContractFactory("ZKTickets");
    const ZkticketsDeploy = await ZkticketsFactory.deploy(VERIFIER, PROSTAKIGNADDRESS);
    const zktickets = await ZkticketsDeploy.deployed();
    console.log("ZKTickets is deployed to :", zktickets.address);

    // ZKTickets is deployed to : 0x0e7EDA461a9d4129Fa70DCf08753708107dbced4 //Donau testnet
}


main().catch(err => {
    console.error(err);
    process.exitCode = 1;
})