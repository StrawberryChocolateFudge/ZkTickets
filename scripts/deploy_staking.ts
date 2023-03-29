import { ethers } from "hardhat";

const TICKETPROTOKENADDRESS = "0x305c9d8599d4e6d85ad0C1b4d2De294b6eFB82a2"
// BTT has 2 second blocktime, so 1209600 blocks is the lock time for mainnet
export const STAKINGBLOCKS = 1209600;
export const STAKEUNIT = ethers.utils.parseEther("1000"); // 1000 Tokens to stake

async function main() {
    const ProStakingFactory = await ethers.getContractFactory("ProStaking");
    const ProStakingDeploy = await ProStakingFactory.deploy(TICKETPROTOKENADDRESS, STAKINGBLOCKS, STAKEUNIT);
    const proStaking = await ProStakingDeploy.deployed();

    console.log("Pro staking deployed to ", proStaking.address);
    // Pro staking deployed to  0xddD5455619eEe9A6AD5A8cbBD668Db15A4ab3710
}


// main().catch(err => {
//     console.error(err);
//     process.exitCode = 1;
// })