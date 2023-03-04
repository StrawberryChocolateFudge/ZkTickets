pragma circom 2.0.0;
include "../utils/CommitmentHasher.circom";

template Ticket(){
    signal input nullifierHash;
    signal input commitmentHash;

    signal input nullifier;
    signal input secret;

    component commitmentHasher = CommitmentHasher();

    commitmentHasher.nullifier <== nullifier;
    commitmentHasher.secret <== secret;

    //Assert that the hashes are correct

    commitmentHasher.nullifierHash === nullifierHash;
    commitmentHasher.commitment === commitmentHash;
}

component main {public [nullifierHash, commitmentHash]} = Ticket();