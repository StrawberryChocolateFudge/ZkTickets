import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
    const ZkticketsFactory = await hre.ethers.getContractFactory("ZKTickets");
    const contract = ZkticketsFactory.attach("0x04ce7D262c474A2d55589dCE8DCe23A9678c35E3");

    const filter = contract.filters.NewTicketedEventCreated("0xFefE84360b11563cf336E327f1181A97d26DFFe5");
    const res = await contract.queryFilter(filter);

    console.log(res);

}

task("fetchevents", "fetch events").setAction(main);
