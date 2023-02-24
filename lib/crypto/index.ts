//@ts-ignore
import { poseidon } from "circomlibjs";
//@ts-ignore
import { utils } from "ffjavascript";
import crypto from "crypto";
import bigInt from "big-integer";
//@ts-ignore
import { groth16 } from "snarkjs";

export type BigNumberish = string | bigint

export type CryptoNote = {
    nullifier: bigint,
    secret: bigint,
    preimage: Buffer,
    commitment: bigint,
    nullifierHash: bigint
}

export type SnarkArtifacts = {
    wasmFilePath: string
    zkeyFilePath: string
}

export type Proof = {
    pi_a: BigNumberish[]
    pi_b: BigNumberish[][]
    pi_c: BigNumberish[]
    protocol: string
    curve: string
}

export type FullProof = {
    proof: Proof
    publicSignals: Array<any>
}

export type PublicSignals = {
    nullifierHash: bigint,
    commitmentHash: bigint
}

export type SolidityProof = [
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish,
    BigNumberish
]

export function generateCommitmentHash(nullifier: BigNumberish, secret: BigNumberish): bigint {
    return poseidon([BigInt(nullifier), BigInt(secret)]);
}

export function generateNullifierHash(nullifier: BigNumberish): bigint {
    return poseidon([BigInt(nullifier)])
}

export function rbigint(): bigint { return utils.leBuff2int(crypto.randomBytes(31)) };

/**
 * Makes a proof compatible with the Verifier.sol method inputs.
 * @param proof The proof generated with SnarkJS.
 * @returns The Solidity compatible proof.
 */
export function packToSolidityProof(proof: Proof): SolidityProof {
    return [
        proof.pi_a[0],
        proof.pi_a[1],
        proof.pi_b[0][1],
        proof.pi_b[0][0],
        proof.pi_b[1][1],
        proof.pi_b[1][0],
        proof.pi_c[0],
        proof.pi_c[1]
    ]
}

/**
 * Create a crypto note from a secret and a nullifier
 */

export async function createCryptoNote({ nullifier, secret }: { nullifier: bigint, secret: bigint }): Promise<CryptoNote> {
    return {
        nullifier, secret,
        preimage: Buffer.concat([utils.leInt2Buff(nullifier, 31), utils.leInt2Buff(secret, 31)]),
        commitment: await generateCommitmentHash(nullifier, secret),
        nullifierHash: await generateNullifierHash(nullifier)
    }
}

/** BigNumber to hex string of specified length */
export function toNoteHex(number: Buffer | any, length = 32) {
    const str = number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)
    return '0x' + str.padStart(length * 2, '0')
}

export async function cryptoNote(netId: number): Promise<string> {
    const cryptoNote = await createCryptoNote({ nullifier: rbigint(), secret: rbigint() });
    const note = toNoteHex(cryptoNote.preimage, 62);
    const noteString = `zkticket-${netId}-${note}`
    return noteString;
}

export async function parseNote(noteString: string) {
    const noteRegex = /zkticket-(?<netId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g;
    const match = noteRegex.exec(noteString);

    if (!match || !match.groups) {
        throw new Error("Invalid Note!");
    }

    const buf = Buffer.from(match.groups.note, "hex");
    const nullifier = utils.leBuff2int(buf.slice(0, 31));
    const secret = utils.leBuff2int(buf.slice(31, 62));
    const cryptoNote = await createCryptoNote({ nullifier, secret });
    const netId = Number(match.groups.netId);

    return { cryptoNote, netId }
}

// Generates the proofs for verification

export async function generateTicketProof({ cryptoNote, snarkArtifacts }: { cryptoNote: CryptoNote, snarkArtifacts?: SnarkArtifacts }): Promise<FullProof> {
    console.log("Generate proof start");

    const input = {
        nullifierHash: cryptoNote.nullifierHash,
        commitmentHash: cryptoNote.commitment,

        // private snark inputs
        nullifier: cryptoNote.nullifier,
        secret: cryptoNote.secret
    }


    if (!snarkArtifacts) {
        snarkArtifacts = {
            wasmFilePath: `circuits/Ticket/ticket_js/ticket.wasm`,
            zkeyFilePath: `circuits/Ticket/ticket_0001.zkey`
        }
    }

    console.time("Proof time");
    const { proof, publicSignals } = await groth16.fullProve(input, snarkArtifacts.wasmFilePath, snarkArtifacts.zkeyFilePath);
    console.timeEnd("Proof time");

    return { proof, publicSignals }
}

/**
 * Verifies a SnarkJS proof.
 * @param verificationKey The zero-knowledge verification key.
 * @param fullProof The SnarkJS full proof.
 * @returns True if the proof is valid, false otherwise.
 */

export function verifyPublicSignals(verificationKey: any, { proof, publicSignals }: FullProof): Promise<boolean> {
    return groth16.verify(
        verificationKey,
        [
            publicSignals[0],
            publicSignals[1]
        ],
        proof
    )
}