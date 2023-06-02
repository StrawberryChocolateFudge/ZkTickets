import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";


const main = async (args: any, hre: HardhatRuntimeEnvironment) => {

    const [signer] = await hre.ethers.getSigners();
    console.log(`🔑 Using account: ${signer.address}\n`);

    const VerifierFactory = await hre.ethers.getContractFactory("contracts/TicketVerifier.sol:Verifier");
    const VerifierDeploy = await VerifierFactory.deploy();
    const verifier = await VerifierDeploy.deployed();

    const ZkticketsFactory = await hre.ethers.getContractFactory("ZKTickets");
    const ZkticketsDeploy = await ZkticketsFactory.deploy(verifier.address);
    const zktickets = await ZkticketsDeploy.deployed();
    console.log("CONTRACT DEPLOYED!");
    console.log(`Verifier: ${verifier.address}`);
    console.log(`zktickets: ${zktickets.address}`);

}

task("deploy", "Deploy the contracts").setAction(main);

// How to use 

// Deploy
// npx hardhat deploy --network <network>
