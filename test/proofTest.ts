import { expect } from "chai";
import fs from "fs";
import { createCryptoNote, cryptoNote, generateTicketProof, parseNote, rbigint, verifyPublicSignals } from "../lib/crypto";

describe("Ticket ZKP", function () {
    it("should create a note, a proof and then verify it!", async function () {
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);
        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });
        const verificationKeyFile = fs.readFileSync("circuits/Ticket/verification_key.json", "utf-8");
        const verificationKey = JSON.parse(verificationKeyFile);
        const res = await verifyPublicSignals(verificationKey, { proof, publicSignals })
        expect(res).to.be.true;
    })
})