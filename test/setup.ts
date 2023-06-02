
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

export async function setUpTicketer(): Promise<{
    owner: SignerWithAddress,
    eventCreator: SignerWithAddress,
    buyer1: SignerWithAddress,
    buyer2: SignerWithAddress,
    ticketer: ZKTickets,
}> {
    const [owner, eventCreator, buyer1, buyer2] = await ethers.getSigners();

    const VerifierFactory = await ethers.getContractFactory("contracts/TicketVerifier.sol:Verifier");
    const VeriferDeploy = await VerifierFactory.deploy();
    const Verifier = await VeriferDeploy.deployed();

    const TicketFactory = await ethers.getContractFactory("ZKTickets");
    const TicketDeploy = await TicketFactory.deploy(Verifier.address);
    const ticketer = await TicketDeploy.deployed() as ZKTickets;

    return { owner, eventCreator, buyer1, buyer2, ticketer }
}