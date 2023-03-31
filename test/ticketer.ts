import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { cryptoNote, generateTicketProof, parseNote, toNoteHex, packToSolidityProof } from "../lib/crypto";
import { mineBlocks, setUpTicketer, TOKENINITIALSUPPLY } from "./setup";
export const ZEROADDRESS = "0x0000000000000000000000000000000000000000"

export const TransferType = {
    TRANSFER: 0,
    REFUND: 1,
    RESALE: 2
}

export const TransferStatus = {
    INITIATED: 0,
    CANCELLED: 1,
    FINISHED: 2
}

describe("ZKTickets!!", function () {
    it("It should deploy a ticketer, then I create a ticket and handle it", async function () {
        const { owner, eventCreator, buyer1, buyer2, ticketer } = await setUpTicketer();

        let eventIndex = await ticketer.ticketedEventIndex();

        expect(eventIndex).to.equal(0);

        // A new event with 100 tickts
        const res = await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My New Event", 2, ZEROADDRESS, false);


        await res.wait().then(receipt => {
            const events = receipt.events;
            if (events) {
                const event = events[0];
                if (event) {
                    const args = event.args;
                    if (args) {
                        const arg = args[0]
                        expect(arg.toString()).to.equal("1");
                    }
                    expect(event.event).to.equal("NewTicketedEventCreated");
                }
            }
        })


        eventIndex = await ticketer.ticketedEventIndex();

        expect(eventIndex).to.equal(1);
        let event = await ticketer.ticketedEvents(eventIndex);
        expect(event.eventName).to.equal("My New Event");
        expect(event.price).to.equal(ethers.utils.parseEther("10"));

        const eventCreatorBalance = await eventCreator.getBalance();
        // // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);


        const ticketPrice = await ticketer.calculatePurchaseFee(event.price);

        expect(ticketPrice.fee).to.equal(ethers.utils.parseEther("0.1"));

        let ownerBalance = await owner.getBalance();
        await ticketer.connect(buyer1).purchaseTicket(eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),

            { value: ticketPrice.total });

        event = await ticketer.ticketedEvents(eventIndex);

        expect(event.availableTickets).to.equal(1);

        let newOwnerBalance = await owner.getBalance();
        expect(ownerBalance.add(ticketPrice.fee)).to.equal(newOwnerBalance);


        const creatorBalanceAfterSale: BigNumber = await eventCreator.getBalance();
        expect(eventCreatorBalance.lt(creatorBalanceAfterSale)).to.be.true;

        // I buy the second ticket then I run out

        const noteString2 = await cryptoNote(0x2b6653dc);
        const parsedNote2 = await parseNote(noteString2);

        await ticketer.connect(buyer2).purchaseTicket(eventIndex,
            toNoteHex(parsedNote2.cryptoNote.commitment),
            { value: ticketPrice.total }
        )

        event = await ticketer.ticketedEvents(eventIndex);

        expect(event.availableTickets).to.equal(0);
        ownerBalance = await owner.getBalance();
        expect(newOwnerBalance.add(ticketPrice.fee)).to.equal(ownerBalance);

        // Now I try to buy again and it should fail!

        const noteString3 = await cryptoNote(0x2b6653dc);
        const parsedNote3 = await parseNote(noteString3);

        let threwErrr = false;
        try {
            await ticketer.connect(buyer2).purchaseTicket(eventIndex,
                toNoteHex(parsedNote3.cryptoNote.commitment),
                { value: ethers.utils.parseEther("10") })
        } catch (err) {
            threwErrr = true;
        }

        expect(threwErrr).to.be.true;

        // now I will handle the tickets... anyone can do that, not only the creator!

        let ticketValid = await ticketer.verifyTicket(toNoteHex(parsedNote.cryptoNote.commitment), toNoteHex(parsedNote.cryptoNote.nullifierHash));
        expect(ticketValid).to.be.true;

        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });

        await ticketer.handleTicket(packToSolidityProof(proof), toNoteHex(parsedNote.cryptoNote.nullifierHash), toNoteHex(parsedNote.cryptoNote.commitment));

        const nullifierHashExists = await ticketer.nullifierHashes(toNoteHex(parsedNote.cryptoNote.nullifierHash));
        expect(nullifierHashExists).to.be.true;

        // So now the ticket was handled

        ticketValid = await ticketer.verifyTicket(toNoteHex(parsedNote.cryptoNote.commitment), toNoteHex(parsedNote.cryptoNote.nullifierHash));
        expect(ticketValid).to.be.false;
    })

    it("Test Ticketer Handlers", async function () {
        const { eventCreator, buyer1, buyer2, ticketer, externalHandler } = await setUpTicketer();
        await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My event", 2, externalHandler.address, false);
        const eventIndex = await ticketer.ticketedEventIndex();
        // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);

        let event = await ticketer.ticketedEvents(eventIndex);
        const ticketPrice = await ticketer.calculatePurchaseFee(event.price);


        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),
            { value: ticketPrice.total });

        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });
        const tx = await ticketer.connect(eventCreator).handleTicket(
            packToSolidityProof(proof),
            toNoteHex(parsedNote.cryptoNote.nullifierHash),
            toNoteHex(parsedNote.cryptoNote.commitment));
        await tx.wait().then(receipt => {
            const log = externalHandler.interface.parseLog(receipt.logs[0]);
            const logName = log.name;
            expect(logName).to.equal("TicketAction");
            expect(log.args.sender).to.equal(eventCreator.address);
            expect(log.args.ticketOwner).to.equal(buyer1.address);
        })
    })

    it("Test Ticket Transfer Request and cancellation", async function () {
        // So let's create an event, buy tickets and transfer the ticket
        const { owner, eventCreator, buyer1, buyer2, ticketer, externalHandler } = await setUpTicketer();
        await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My event", 2, externalHandler.address, false);
        const eventIndex = await ticketer.ticketedEventIndex();
        // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);

        let event = await ticketer.ticketedEvents(eventIndex);
        const ticketPrice = await ticketer.calculatePurchaseFee(event.price);
        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),
            { value: ticketPrice.total });


        // buyer 1 initiates a transfer request to buyer2
        let errorOccured = false;
        let errorReason = "";
        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });

        try {

            await ticketer.connect(buyer2).createTransferRequest(
                toNoteHex(parsedNote.cryptoNote.commitment),
                toNoteHex(parsedNote.cryptoNote.nullifierHash),
                packToSolidityProof(proof),
                eventIndex,
                TransferType.TRANSFER,
                buyer2.address,
                0

            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }
        // I expect only the buyer1 can create the transferRequest
        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Only the buyer can initiate transfer")).to.be.true;

        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash),
            packToSolidityProof(proof),
            eventIndex,
            TransferType.TRANSFER,
            buyer2.address,
            ZEROADDRESS
        )

        let transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);
        expect(transferRequests.length).to.equal(1);
        // Now  I test a bunch of errors

        // Trying to cancel a request that doesn't exists
        errorOccured = false;
        try {
            await ticketer.connect(buyer2).cancelTransferRequest(toNoteHex(parsedNote.cryptoNote.commitment),
                toNoteHex(parsedNote.cryptoNote.nullifierHash),
                packToSolidityProof(proof),
                eventIndex, 0) // The request is at zero index
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Can't cancel")).to.be.true;

        // Now I try to cancel one that doesn't exists
        errorOccured = false;
        try {
            await ticketer.connect(buyer2).cancelTransferRequest(
                toNoteHex(parsedNote.cryptoNote.commitment),
                toNoteHex(parsedNote.cryptoNote.nullifierHash),
                packToSolidityProof(proof),
                eventIndex, 1) // The request is at first index
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        // Accessing index out of bounds!
        expect(errorReason.includes("panic code 0x32")).to.be.true;

        // Now I generate a note to try to hack the verification
        const noteString2 = await cryptoNote(0x2b6653dc);
        const parsedNote2 = await parseNote(noteString2);

        // I create a new ticket with this commitment to try to evade some checks in the code
        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote2.cryptoNote.commitment),
            { value: ticketPrice.total });

        const proof2 = await generateTicketProof({ cryptoNote: parsedNote2.cryptoNote });

        // Now I try to verify one with invalid commitment or nullifierHash
        errorOccured = false;
        try {
            await ticketer.connect(buyer1).cancelTransferRequest(
                toNoteHex(parsedNote2.cryptoNote.commitment),
                toNoteHex(parsedNote2.cryptoNote.nullifierHash),
                packToSolidityProof(proof2.proof),
                eventIndex, 0)
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Invalid Commitment")).to.be.true;

        // Now I just cancel it!

        await ticketer.connect(buyer1).cancelTransferRequest(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash),
            packToSolidityProof(proof),
            eventIndex, 0);

        transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);

        expect(transferRequests[0][1]).to.equal(TransferStatus.CANCELLED);



    })

    it("Test ticket transfer request and accept transfer!", async function () {
        const { owner, eventCreator, buyer1, buyer2, ticketer, externalHandler } = await setUpTicketer();
        await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My event", 2, externalHandler.address, false);
        const eventIndex = await ticketer.ticketedEventIndex();
        // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);

        let event = await ticketer.ticketedEvents(eventIndex);
        const ticketPrice = await ticketer.calculatePurchaseFee(event.price);
        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),
            { value: ticketPrice.total });

        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });

        // Now I create another transfer request
        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash),
            packToSolidityProof(proof),
            eventIndex,
            TransferType.TRANSFER,
            buyer2.address,
            ZEROADDRESS
        )

        let transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);

        expect(transferRequests.length).to.equal(1);

        // Buyer2 will accept this transfer request but first, errors!
        // Now I generate a note to try to hack the verification
        const noteString2 = await cryptoNote(0x2b6653dc);
        const parsedNote2 = await parseNote(noteString2);

        let errorOccured = false;
        let errorReason = "";
        try {
            await ticketer.connect(buyer1).acceptTransfer(
                eventIndex,
                0,
                toNoteHex(parsedNote.cryptoNote.commitment)
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Commitment is used")).to.be.true;

        // Try to accept the cancelled request
        errorOccured = false;
        try {
            await ticketer.connect(buyer1).acceptTransfer(
                eventIndex,
                0,
                toNoteHex(parsedNote2.cryptoNote.commitment)
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }
        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Invalid sender")).to.be.true;

        await ticketer.connect(buyer2).acceptTransfer(
            eventIndex,
            0,
            toNoteHex(parsedNote2.cryptoNote.commitment)
        )
        // Now the old note is invalid and the new note is valid and the transfer request is finished
        transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);
        expect(transferRequests[0].status).to.equal(TransferStatus.FINISHED);

        const oldTicketValid = await ticketer.verifyTicket(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash));

        expect(oldTicketValid).to.be.false;

        const newTicketValid = await ticketer.verifyTicket(
            toNoteHex(parsedNote2.cryptoNote.commitment),
            toNoteHex(parsedNote2.cryptoNote.nullifierHash)
        )
        expect(newTicketValid).to.be.true;

    })

    it("Test ticket refund request", async function () {
        const { owner, eventCreator, buyer1, buyer2, ticketer, externalHandler } = await setUpTicketer();
        await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My event", 2, externalHandler.address, false);
        const eventIndex = await ticketer.ticketedEventIndex();
        // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);

        let event = await ticketer.ticketedEvents(eventIndex);
        const ticketPrice = await ticketer.calculatePurchaseFee(event.price);
        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),
            { value: ticketPrice.total });

        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });

        // Now I decided I want to get my ticket purchase refunded!

        // Let's do some errors!
        let errorOccured = false;
        let errorReason = "";
        try {
            await ticketer.connect(buyer1).createTransferRequest(
                toNoteHex(parsedNote.cryptoNote.commitment),
                toNoteHex(parsedNote.cryptoNote.nullifierHash),
                packToSolidityProof(proof),
                eventIndex,
                TransferType.REFUND,
                buyer2.address,
                ethers.utils.parseEther("0")
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Only creator can refund")).to.be.true;
        errorOccured = false;
        try {
            await ticketer.connect(buyer1).createTransferRequest(
                toNoteHex(parsedNote.cryptoNote.commitment),
                toNoteHex(parsedNote.cryptoNote.nullifierHash),
                packToSolidityProof(proof),
                eventIndex,
                TransferType.REFUND,
                eventCreator.address,
                ethers.utils.parseEther("0")
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Price must equal sale price")).to.be.true;

        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash),
            packToSolidityProof(proof),
            eventIndex,
            TransferType.REFUND,
            eventCreator.address,
            event.price
        )

        let transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);
        expect(transferRequests.length).to.equal(1);
        expect(transferRequests[0].transferType).to.equal(TransferType.REFUND);

        // Now the refund request will be accepted
        // Some errors first
        errorOccured = false;
        try {
            await ticketer.connect(buyer1).acceptRefundRequest(
                eventIndex,
                0
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Only event creator can refund")).to.be.true;

        errorOccured = false;
        try {
            await ticketer.connect(eventCreator).acceptRefundRequest(
                eventIndex,
                0
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Invalid Refund Price")).to.be.true;

        const buyer1Balance = await buyer1.getBalance();

        await ticketer.connect(eventCreator).acceptRefundRequest(
            eventIndex,
            0,
            { value: event.price }
        )
        // I expect the buyer is refunded, his ticket is invalidated and his balance is higher
        const buyer1NewBalance = await buyer1.getBalance();
        expect(buyer1Balance.add(event.price)).to.equal(buyer1NewBalance);
        const ticketValid = await ticketer.verifyTicket(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash)
        );
        expect(ticketValid).to.be.false;

        // the request is finished

        const requests = await ticketer.getTransferRequestsByEventIndex(eventIndex);
        expect(requests[0].status).to.equal(TransferStatus.FINISHED);
    })

    it("ticket resale without speculation", async function () {
        const { ticketProToken, proStaking, owner, eventCreator, buyer1, buyer2, ticketer, externalHandler } = await setUpTicketer();
        await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My event", 2, externalHandler.address, false);// no speculation allowed for resale

        const eventIndex = await ticketer.ticketedEventIndex();
        // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);

        let event = await ticketer.ticketedEvents(eventIndex);
        const ticketPrice = await ticketer.calculatePurchaseFee(event.price);
        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),
            { value: ticketPrice.total });

        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });
        let errorOccured = false;
        let errorReason = "";
        try {
            await ticketer.connect(buyer1).createTransferRequest(
                toNoteHex(parsedNote.cryptoNote.commitment),
                toNoteHex(parsedNote.cryptoNote.nullifierHash),
                packToSolidityProof(proof),
                eventIndex,
                TransferType.RESALE,
                ZEROADDRESS,
                ethers.utils.parseEther("10000")
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }
        expect(errorOccured).to.be.true;
        expect(errorReason.includes("No speculation")).to.be.true;

        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash),
            packToSolidityProof(proof),
            eventIndex,
            TransferType.RESALE,
            ZEROADDRESS,
            event.price
        )
        let transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);
        expect(transferRequests.length).to.equal(1);
        expect(transferRequests[0].transferType).to.equal(TransferType.RESALE);

        // Anyone can accept this request price
        const noteString2 = await cryptoNote(0x2b6653dc);
        const parsedNote2 = await parseNote(noteString2);
        errorOccured = false;
        try {
            await ticketer.connect(buyer2).acceptResaleRequest(
                eventIndex,
                0,
                toNoteHex(parsedNote2.cryptoNote.commitment));
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }
        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Invalid Value")).to.be.true;

        const eventCreatorBalance = await eventCreator.getBalance();
        const ownerBalance = await owner.getBalance();

        const resalePrice = await ticketer.calculateResaleFee(event.price);

        await ticketer.connect(buyer2).acceptResaleRequest(
            eventIndex,
            0,
            toNoteHex(parsedNote2.cryptoNote.commitment), { value: resalePrice.total });

        // / I expect this succeeds and the event creator and the contract creator both receive 1% fee
        const eventCreatorNewBalance = await eventCreator.getBalance();
        const ownerNewBalance = await owner.getBalance();

        expect(eventCreatorBalance.add(resalePrice.singleFee)).to.equal(eventCreatorNewBalance);
        expect(ownerBalance.add(resalePrice.singleFee)).to.equal(ownerNewBalance);


        // the request is finished
        transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);
        expect(transferRequests[0].status).to.equal(TransferStatus.FINISHED);

        const oldTicketValid = await ticketer.verifyTicket(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash));

        const newTicketValid = await ticketer.verifyTicket(
            toNoteHex(parsedNote2.cryptoNote.commitment),
            toNoteHex(parsedNote2.cryptoNote.nullifierHash)
        )
        expect(oldTicketValid).to.be.false;
        expect(newTicketValid).to.be.true;
    })


    it("Test ticket resale with speculation and staking!", async function () {
        const { ticketProToken, proStaking, owner, eventCreator, buyer1, buyer2, ticketer, externalHandler } = await setUpTicketer();
        await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My event", 2, externalHandler.address, true);

        const eventIndex = await ticketer.ticketedEventIndex();
        // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);

        let event = await ticketer.ticketedEvents(eventIndex);
        const ticketPrice = await ticketer.calculatePurchaseFee(event.price);
        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),
            { value: ticketPrice.total });

        const { proof, publicSignals } = await generateTicketProof({ cryptoNote: parsedNote.cryptoNote });

        let errorOccured = false;
        let errorReason = "";
        try {
            await ticketer.connect(buyer1).createTransferRequest(
                toNoteHex(parsedNote.cryptoNote.commitment),
                toNoteHex(parsedNote.cryptoNote.nullifierHash),
                packToSolidityProof(proof),
                eventIndex,
                TransferType.RESALE,
                ZEROADDRESS,
                ethers.utils.parseEther("20")
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }
        expect(errorOccured).to.be.true;
        expect(errorReason.includes("You need to stake")).to.be.true;


        // I airdrop some tokens now to the buyers
        const ownerBalance = await ticketProToken.balanceOf(owner.address);

        expect(ownerBalance).to.equal(TOKENINITIALSUPPLY);

        await ticketProToken.connect(owner).transfer(buyer1.address, ethers.utils.parseEther("4000"));

        const buyer1Balance = await ticketProToken.balanceOf(buyer1.address);
        expect(buyer1Balance).to.equal(ethers.utils.parseEther("4000"));

        // I try to unstake but it should not work, yet;
        errorOccured = false;
        try {
            await proStaking.connect(buyer1).unstake(ethers.utils.parseEther("1000"));
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }
        expect(errorOccured).to.be.true;
        expect(errorReason.includes("not staking")).to.be.true;

        // Buyer 1 Approves spend for staking contract
        await ticketProToken.connect(buyer1).approve(
            proStaking.address,
            ethers.utils.parseEther("4000")
        );
        let staker = await proStaking.stakers(buyer1.address);

        expect(staker.isStaking).to.be.false;
        // Stake will add stake Amount to the staking balance
        await proStaking.connect(buyer1).stake(ethers.utils.parseEther("1000"));

        staker = await proStaking.stakers(buyer1.address);

        expect(staker.isStaking).to.be.true;
        expect(staker.stakeAmount).to.equal(ethers.utils.parseEther("1000"));
        const totalStaked = await proStaking.totalStaked();

        expect(totalStaked).to.equal(ethers.utils.parseEther("1000"));

        // I try to unstake but it should not work, yet;
        errorOccured = false;
        try {
            await proStaking.connect(buyer1).unstake(ethers.utils.parseEther("1000"));
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }
        expect(errorOccured).to.be.true;
        expect(errorReason.includes("stake unexpired")).to.be.true;

        // Now the buyer can resell it!

        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(parsedNote.cryptoNote.commitment),
            toNoteHex(parsedNote.cryptoNote.nullifierHash),
            packToSolidityProof(proof),
            eventIndex,
            TransferType.RESALE,
            ZEROADDRESS,
            ethers.utils.parseEther("20")
        )

        let transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);
        expect(transferRequests.length).to.equal(1);
        expect(transferRequests[0].transferType).to.equal(TransferType.RESALE);

        // Now I will try to create another resale request

        const noteString2 = await cryptoNote(0x2b6653dc);
        const parsedNote2 = await parseNote(noteString2);
        const proof2 = await generateTicketProof({ cryptoNote: parsedNote2.cryptoNote });

        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote2.cryptoNote.commitment),
            { value: ticketPrice.total });
        errorOccured = false;

        try {
            await ticketer.connect(buyer1).createTransferRequest(
                toNoteHex(parsedNote2.cryptoNote.commitment),
                toNoteHex(parsedNote2.cryptoNote.nullifierHash),
                packToSolidityProof(proof2.proof),
                eventIndex,
                TransferType.RESALE,
                ZEROADDRESS,
                ethers.utils.parseEther("20")
            )
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errorReason.includes("You need to stake more")).to.be.true;



        // So I stake 1000 tokens more
        await proStaking.connect(buyer1).stake(ethers.utils.parseEther("1000"));

        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(parsedNote2.cryptoNote.commitment),
            toNoteHex(parsedNote2.cryptoNote.nullifierHash),
            packToSolidityProof(proof2.proof),
            eventIndex,
            TransferType.RESALE,
            buyer2.address,
            ethers.utils.parseEther("20"));

        const noteString3 = await cryptoNote(0x2b6653dc);
        const parsedNote3 = await parseNote(noteString3);
        // This should succeed, now this will be accepted by buyer2..
        errorOccured = false;

        try {
            await ticketer.connect(owner).acceptResaleRequest(
                eventIndex,
                1,
                toNoteHex(parsedNote3.cryptoNote.commitment)
            );
        } catch (err) {
            errorOccured = true;
            errorReason = err.message;
        }
        transferRequests = await ticketer.getTransferRequestsByEventIndex(eventIndex);
        expect(errorOccured).to.be.true;
        expect(errorReason.includes("Invalid sender")).to.be.true;
    })

    it("test staking and unstaking", async function () {
        const { ticketProToken, proStaking, owner, eventCreator, buyer1, buyer2, ticketer, externalHandler } = await setUpTicketer();

        await ticketProToken.connect(owner).transfer(buyer1.address, ethers.utils.parseEther("4000"));

        await ticketProToken.connect(buyer1).approve(proStaking.address, ethers.utils.parseEther("1000"));

        await proStaking.connect(buyer1).stake(ethers.utils.parseEther("1000"));
        expect(await ticketProToken.balanceOf(buyer1.address)).to.equal(ethers.utils.parseEther("3000"))
        // Now I need to mine 10 blocks and then I unstake

        let staker = await proStaking.stakers(buyer1.address);

        expect(staker.isStaking).to.be.true;

        await mineBlocks(10).then(async () => {
            await proStaking.connect(buyer1).unstake(ethers.utils.parseEther("1000"));
            expect(await ticketProToken.balanceOf(buyer1.address)).to.equal(ethers.utils.parseEther("4000"))
            staker = await proStaking.stakers(buyer1.address);
            expect(staker.isStaking).to.be.false;
        });
    })

    it("Test requestsByMe and requestsToMe and requests for pagination", async function () {
        const { owner, eventCreator, buyer1, buyer2, ticketer, externalHandler } = await setUpTicketer();

        await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My New Event", 20, ZEROADDRESS, false);
        let event = await ticketer.ticketedEvents(1);
        const ticketPrice = await ticketer.calculatePurchaseFee(event.price);

        // Buyer1 will buy 2 tickets
        const getParsedNote = async () => {
            const noteString = await cryptoNote(0x2b6653dc);
            return await parseNote(noteString);
        }
        let eventIndex = await ticketer.ticketedEventIndex();

        const note1 = await getParsedNote();
        const note2 = await getParsedNote();
        const note3 = await getParsedNote();

        await ticketer.connect(buyer1).purchaseTicket(eventIndex,
            toNoteHex(note1.cryptoNote.commitment),

            { value: ticketPrice.total });

        await ticketer.connect(buyer1).purchaseTicket(eventIndex,
            toNoteHex(note2.cryptoNote.commitment),

            { value: ticketPrice.total });

        await ticketer.connect(buyer1).purchaseTicket(eventIndex,
            toNoteHex(note3.cryptoNote.commitment),

            { value: ticketPrice.total });



        // Now buyer1 will create 2 transfer requests
        const { proof: proof1, publicSignals: sig1 } = await generateTicketProof({ cryptoNote: note1.cryptoNote });
        const { proof: proof2, publicSignals: sig2 } = await generateTicketProof({ cryptoNote: note2.cryptoNote });
        const { proof: proof3, publicSignals: sig3 } = await generateTicketProof({ cryptoNote: note3.cryptoNote });

        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(note1.cryptoNote.commitment),
            toNoteHex(note1.cryptoNote.nullifierHash),
            packToSolidityProof(proof1),
            eventIndex,
            TransferType.TRANSFER,
            buyer2.address,
            ZEROADDRESS
        )

        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(note2.cryptoNote.commitment),
            toNoteHex(note2.cryptoNote.nullifierHash),
            packToSolidityProof(proof2),
            eventIndex,
            TransferType.REFUND,
            eventCreator.address,
            event.price
        )
        await ticketer.connect(buyer1).createTransferRequest(
            toNoteHex(note3.cryptoNote.commitment),
            toNoteHex(note3.cryptoNote.nullifierHash),
            packToSolidityProof(proof3),
            eventIndex,
            TransferType.RESALE,
            ZEROADDRESS,
            event.price
        )


        const requestsByMe = await ticketer.getRequestsByMe(eventIndex, buyer1.address)

        // I expect I have 2 requests created at 0 and at 1 index of transfer requests!
        expect(requestsByMe.length).to.equal(3);
        expect(requestsByMe[0].toNumber()).to.equal(0);
        expect(requestsByMe[1].toNumber()).to.equal(1);
        expect(requestsByMe[2].toNumber()).to.equal(2);

        const requestsToBuyer2 = await ticketer.getRequestsToMe(eventIndex, buyer2.address);

        expect(requestsToBuyer2.length).to.equal(1);
        expect(requestsByMe[0].toNumber()).to.equal(0);

        const requestsToEventCreator = await ticketer.getRequestsToMe(eventIndex, eventCreator.address);

        expect(requestsToEventCreator.length).to.equal(1);
        expect(requestsToEventCreator[0].toNumber()).to.equal(1);

        const requestsToZeroAddress = await ticketer.getRequestsToMe(eventIndex, ZEROADDRESS);
        expect(requestsToZeroAddress.length).to.equal(1);
        expect(requestsToZeroAddress[0].toNumber()).to.equal(2);

        // getting them for pagination
        const transferRequestsForPagination = await ticketer.getTransferRequestsForPagination(eventIndex, [0, 1, 2, 0, 0]);
        expect(transferRequestsForPagination.length).to.equal(5);
        //From logging I can see it contains the data I'm looking for
        // console.log(transferRequestsForPagination);

    });
})