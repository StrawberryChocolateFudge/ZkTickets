import { CryptoNote, cryptoNote, packToSolidityProof, parseNote, Proof, SolidityProof, generateTicketProof, SnarkArtifacts } from "../../lib/crypto";

export type ParsedNote = { cryptoNote: CryptoNote, netId: number }

export type CryptoNoteDetails = [ParsedNote, string];

export async function getNote(hexNetId): Promise<CryptoNoteDetails> {
    const netId = parseInt(hexNetId);
    const noteString = await cryptoNote(netId);
    const parsedNote = await parseNote(noteString);
    return [parsedNote, noteString];
}

export function convertProof(proof: Proof): SolidityProof {
    return packToSolidityProof(proof);
}

export async function parseCryptoNote(note: string): Promise<ParsedNote> {
    return await parseNote(note);
}

export async function generateProof(cryptoNote: CryptoNote) {
    const snarkArtifacts: SnarkArtifacts = {
        wasmFilePath: window.location.origin + "/ticket.wasm",
        zkeyFilePath: window.location.origin + "/ticket_final.zkey"
    }
    const { proof, publicSignals } = await generateTicketProof({ cryptoNote, snarkArtifacts });

    return convertProof(proof);
}