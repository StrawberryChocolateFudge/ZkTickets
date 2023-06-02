import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";
import { ERC20 } from "../typechain";
const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
    const [signer] = await hre.ethers.getSigners();
    console.log(`🔑 Using account: ${signer.address}\n`);

    const ZKTICKETS = "0x3E6F7e33F99d76803365184a0a83B473A75e425d";
    const TICKETPRO = "0xe48179BaB24c62E48eec1C73f8FB25CBb2B8E635";
    const airdropAmount = parseEther("100000");
    const TOTALAIRDROP = parseEther("2000000");
    //GONNA BE 20 TOKENS AIRDROPPED!
    const TokenClaimEventHandlerFactory = await hre.ethers.getContractFactory("TokenClaimEvent")
    const TokenClaimEventHandler = await TokenClaimEventHandlerFactory.deploy(ZKTICKETS, TICKETPRO, airdropAmount, signer.address);
    await TokenClaimEventHandler.deployed();
    console.log("Deployment complete!, ", TokenClaimEventHandler.address);
    const ticketProFactory = await hre.ethers.getContractFactory("TicketPro");
    const ticketPro = await ticketProFactory.attach(TICKETPRO) as ERC20;

    const res = await ticketPro.approve(TokenClaimEventHandler.address, TOTALAIRDROP);
    console.log("APPROVAL TX SENT! ", res.hash);

    await res.wait().then((receipt) => {
        console.log("Receipt status : ", receipt.status)
    })
}


task("deployairdrop", "deploy airdrop and approve spend!").setAction(main);
