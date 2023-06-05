import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ZKTickets } from "../typechain";
import { task } from "hardhat/config";
const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
    const ZkticketsFactory = await hre.ethers.getContractFactory("ZKTickets");
    const contract = ZkticketsFactory.attach("0x026E01a71C9F0d40a67BbC898e7715424c0cf405") as ZKTickets;

    const filter = contract.filters.NewTicketedEventCreated("0xFefE84360b11563cf336E327f1181A97d26DFFe5");
    const res = await contract.queryFilter(filter);


}

task("fetchevents", "fetch events").setAction(main);
