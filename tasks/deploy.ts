import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";


const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
    const TOKENINITIALSUPPLY = hre.ethers.utils.parseEther("10000000");

    const [signer] = await hre.ethers.getSigners();
    console.log(`🔑 Using account: ${signer.address}\n`);

    const VerifierFactory = await hre.ethers.getContractFactory("contracts/TicketVerifier.sol:Verifier");
    const VerifierDeploy = await VerifierFactory.deploy();
    const verifier = await VerifierDeploy.deployed();
    const TicketProTokenFactory = await hre.ethers.getContractFactory("TicketPro");
    const TicketProTokenDeploy = await TicketProTokenFactory.deploy(TOKENINITIALSUPPLY);
    const ticketProToken = await TicketProTokenDeploy.deployed();
    const STAKINGBLOCKS = 1209600;
    const STAKEUNIT = hre.ethers.utils.parseEther("1000"); // 1000 Tokens to stake

    const ProStakingFactory = await hre.ethers.getContractFactory("ProStaking");
    const ProStakingDeploy = await ProStakingFactory.deploy(ticketProToken.address, STAKINGBLOCKS, STAKEUNIT);
    const proStaking = await ProStakingDeploy.deployed();

    const ZkticketsFactory = await hre.ethers.getContractFactory("ZKTickets");
    const ZkticketsDeploy = await ZkticketsFactory.deploy(verifier.address, proStaking.address);
    const zktickets = await ZkticketsDeploy.deployed();
    const EventWarningsFactory = await hre.ethers.getContractFactory("EventWarnings");
    const EventWarningsDeploy = await EventWarningsFactory.deploy();
    const eventWarnings = await EventWarningsDeploy.deployed();
    console.log("CONTRACT DEPLOYED!");
    console.log(`Verifier: ${verifier.address}`);
    console.log(`TicketProToken: ${ticketProToken.address}`);
    console.log(`ProStaking: ${proStaking.address}`);
    console.log(`zktickets: ${zktickets.address}`);
    console.log("Event warning are deployed to:", eventWarnings.address);

}

task("deploy", "Deploy the contracts").setAction(main);

// How to use 

// Deploy
// npx hardhat deploy --network <network>

// LATEST:
// Verifier: 0x5FbDB2315678afecb367f032d93F642f64180aa3
// TicketProToken: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
// ProStaking: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
// zktickets: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
// Event warning are deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9








// PREVIOUS TESTNET DEPLOYMENT:
// CONTRACT DEPLOYED! on ZKTRON
// Verifier: 0xD98F9B6AB4fbA9b7173Cfe92Ae1Eb9A3F3F91751
// TicketProToken: 0xeE55e7A619343B2f045bfD9A720BF912e1FCfEC7
// ProStaking: 0xF273919f7e9239D5C8C70f49368fF80c0a91064A
// zktickets: 0x57ca49c07328da62335Fc450176C274157C01eB6












// LATEST ON DONAU TESTNET:

// Verifier: 0x60C2352df0dEE01dB8Dbf261AfC2D8D4b5e3fb55
// TicketProToken: 0xe48179BaB24c62E48eec1C73f8FB25CBb2B8E635
// ProStaking: 0x26B7E178CE20bf43ce8fa3aB945B2B65088dC963
// zktickets: 0x3E6F7e33F99d76803365184a0a83B473A75e425d
// Event warning are deployed to: 0x44930bCdA63307ce111804D858fAE487b36A599a