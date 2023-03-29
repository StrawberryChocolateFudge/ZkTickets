import { ethers } from "hardhat";

export const TOKENINITIALSUPPLY = ethers.utils.parseEther("10000000");

async function main() {
    const TicketProTokenFactory = await ethers.getContractFactory("TicketPro");
    const TicketProTokenDeploy = await TicketProTokenFactory.deploy(TOKENINITIALSUPPLY);
    const ticketProToken = await TicketProTokenDeploy.deployed();

    console.log("Ticket Pro Token Deployed to :", ticketProToken.address);
    // Ticket Pro Token Deployed to : 0x305c9d8599d4e6d85ad0C1b4d2De294b6eFB82a2

}


// main().catch(err => {
//     console.error(err);
//     process.exitCode = 1;
// })