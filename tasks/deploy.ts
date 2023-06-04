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

// /?BTT DONAU LATEST!
// Verifier: 0xdCA920E77742a4CEa85D3fB1aAe9E148eA41Fe7F
// zktickets: 0x026E01a71C9F0d40a67BbC898e7715424c0cf405

//BTT MAINNET!
// Verifier: 0xA3e3470232b0E86F08c7CF21E4A41D005A59BF45
// zktickets: 0xf9C5B7737c0a46bC524F614025640dc375BBD392