 # Compiling the circuits
 # First we remove the extra files from the directory

 rm -rf ticket_js
 rm -f verification_key.json
 rm -f ticket_0000.zkey
 rm -f ticket_0001.zkey
 rm -f ticket.r1cs
 rm -f ticket.sym

# Compile the r1cs, wasm and the debugging files
 circom ticket.circom --r1cs --wasm --sym

# get the .zkey
snarkjs groth16 setup ticket.r1cs ../powersOfTau28_hez_final_15.ptau ticket_0000.zkey

# Contribute to the phase 2 ceremony, Add your name if you are not me XD
snarkjs zkey contribute ticket_0000.zkey ticket_0001.zkey --name="StrawberryChocolateFudge" -v

# export the verification key
snarkjs zkey export verificationkey ticket_0001.zkey verification_key.json

# generate the verifier.sol file
snarkjs zkey export solidityverifier ticket_0001.zkey TicketVerifier.sol

# copy the WithdrawVerifier.sol to the contracts directory
mv TicketVerifier.sol ../../contracts/TicketVerifier.sol

cp ticket_0001.zkey ../../dist/ticket_0001.zkey

cp ticket_js/ticket.wasm ../../dist/ticket.wasm