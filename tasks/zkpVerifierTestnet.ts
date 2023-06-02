import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
import { cryptoNote, generateTicketProof, packToSolidityProof, parseNote, toNoteHex } from "../lib/crypto";

const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
    const [signer] = await hre.ethers.getSigners();
    const VerifierFactory = await hre.ethers.getContractFactory("contracts/TicketVerifier.sol:Verifier");
    const verifier = VerifierFactory.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

    const noteString = await cryptoNote(0x2b6653dc);
    const parsedNote = await parseNote(noteString);
    const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });
    const p = packToSolidityProof(proof);
    const result = await verifier.verifyProof(
        [p[0], p[1]],
        [[p[2], p[3]], [p[4], p[5]]],
        [p[6], p[7]],
        [toNoteHex(parsedNote.cryptoNote.nullifierHash),
        toNoteHex(parsedNote.cryptoNote.commitment)]
    );
    console.log(result);

}


task("verifiertest", "test the verifier on live testnet").setAction(main);
