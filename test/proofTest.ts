import { expect } from "chai";
import fs from "fs";
import { ethers } from "hardhat";
import { createCryptoNote, cryptoNote, generateTicketProof, packToSolidityProof, parseNote, rbigint, toNoteHex, verifyPublicSignals } from "../lib/crypto";

describe("Ticket ZKP", function () {
    it("should create a note, a proof and then verify it!", async function () {
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);
        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });
        const verificationKeyFile = fs.readFileSync("circuits/Ticket/verification_key.json", "utf-8");
        const verificationKey = JSON.parse(verificationKeyFile);
        const res = await verifyPublicSignals(verificationKey, { proof, publicSignals })
        expect(res).to.be.true;

        const factory = await ethers.getContractFactory("contracts/TicketVerifier.sol:Verifier");
        const contract = await factory.deploy();
        await contract.deployed();
        console.log(parsedNote.cryptoNote.nullifierHash);
        console.log(parsedNote.cryptoNote.commitment);
        console.log(proof);
        const p = packToSolidityProof(proof);
        const valid = await contract.verifyProof(
            [p[0], p[1]],
            [[p[2], p[3]], [p[4], p[5]]],
            [p[6], p[7]],
            [toNoteHex(parsedNote.cryptoNote.nullifierHash),
            toNoteHex(parsedNote.cryptoNote.commitment)]
        );

        expect(valid).to.be.true;
    })
})