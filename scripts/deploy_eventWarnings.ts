import { ethers } from "hardhat";

async function main() {
    const EventWarningsFactory = await ethers.getContractFactory("EventWarnings");
    const EventWarningsDeploy = await EventWarningsFactory.deploy();
    const eventWarnings = await EventWarningsDeploy.deployed();
    console.log("Event warning are deployed to:", eventWarnings.address);
    // Event warning are deployed to: 0xA48bbf691169767F535490663aD8a5583367f701 // ON BTT
    // Event warning are deployed to: 0xF657e0Ed48cb90dB2181ae585B6B967d4881E45b on ZKTRON // NOT LATEST
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
})