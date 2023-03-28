
//@ts-ignore
import { ethers, network } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyExternalHandlerExample, TicketPro, ZKTickets } from "../typechain";


export async function mineBlocks(blockNumber: number) {
    console.log(`    ⛏️️`);
    while (blockNumber > 0) {
        blockNumber--;
        await network.provider.request({
            method: "evm_mine",
            params: [],
        });
    }
}

//note: I handled the errors manually because using a function like this is sometimes buggy, it was more fast to just do tyr catch in the test case
export async function expectRevert(callback: CallableFunction, errorMessage: string) {
    let throws = false;
    try {
        await callback();
    } catch (err: any) {
        const message = err.stackTrace[1].message;
        const value: string = message.value.toString();
        console.log("Expect Revert: ", value);
        expect(value.includes(errorMessage)).to.be.true;
        throws = true;
    } finally {
        if (!throws) {
            throw new Error("Function failed to revert!");
        }
    }
}

// BTT has 2 second blocktime, so 1209600 blocks is the lock time for mainnet
// For testing I will use something like 10 blocks
export const STAKINGBLOCKS = 10;
export const STAKEUNIT = ethers.utils.parseEther("1000"); // 1000 Tokens to stake
export const TOKENINITIALSUPPLY = ethers.utils.parseEther("10000000");

export async function setUpTicketer(): Promise<{
    owner: SignerWithAddress,
    eventCreator: SignerWithAddress,
    buyer1: SignerWithAddress,
    buyer2: SignerWithAddress,
    ticketer: ZKTickets,
    externalHandler: MyExternalHandlerExample,
    ticketProToken: any,
    proStaking: any
}> {
    const [owner, eventCreator, buyer1, buyer2] = await ethers.getSigners();


    const TicketProTokenFactory = await ethers.getContractFactory("TicketPro");

    const TicketProTokenDeploy = await TicketProTokenFactory.deploy(TOKENINITIALSUPPLY);

    const ticketProToken = await TicketProTokenDeploy.deployed();

    const ProStakingFactory = await ethers.getContractFactory("ProStaking");
    const ProStakingDeploy = await ProStakingFactory.deploy(ticketProToken.address, STAKINGBLOCKS, STAKEUNIT);
    const proStaking = await ProStakingDeploy.deployed();

    const VerifierFactory = await ethers.getContractFactory("contracts/TicketVerifier.sol:Verifier");
    const VeriferDeploy = await VerifierFactory.deploy();
    const Verifier = await VeriferDeploy.deployed();

    const TicketFactory = await ethers.getContractFactory("ZKTickets");
    const TicketDeploy = await TicketFactory.deploy(Verifier.address, proStaking.address);
    const ticketer = await TicketDeploy.deployed() as ZKTickets;

    const ExternalHandlerFactory = await ethers.getContractFactory("MyExternalHandlerExample");
    const ExternalHandlerDeploy = await ExternalHandlerFactory.deploy();
    const externalHandler = await ExternalHandlerDeploy.deployed() as MyExternalHandlerExample;

    return { owner, eventCreator, buyer1, buyer2, ticketer, externalHandler, ticketProToken, proStaking }
}