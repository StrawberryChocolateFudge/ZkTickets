import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { cryptoNote, generateTicketProof, parseNote, toNoteHex, packToSolidityProof } from "../lib/crypto";
import { setUpTicketer } from "./setup";
export const ZEROADDRESS = "0x0000000000000000000000000000000000000000"

describe("ZKTickets!!", function () {
    it("It should deploy a ticketer, then I create a ticket and handle it", async function () {
        const { eventCreator, buyer1, buyer2, ticketer } = await setUpTicketer();

        let eventIndex = await ticketer.ticketedEventIndex();

        expect(eventIndex).to.equal(0);

        // A new event with 100 tickts
        const res = await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My New Event", 2, ZEROADDRESS);

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
        // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);

        await ticketer.connect(buyer1).purchaseTicket(eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),
            { value: ethers.utils.parseEther("10") });

        event = await ticketer.ticketedEvents(eventIndex);

        expect(event.availableTickets).to.equal(1);

        const creatorBalanceAfterSale: BigNumber = await eventCreator.getBalance();
        expect(eventCreatorBalance.lt(creatorBalanceAfterSale)).to.be.true;

        // I buy the second ticket then I run out

        const noteString2 = await cryptoNote(0x2b6653dc);
        const parsedNote2 = await parseNote(noteString2);

        await ticketer.connect(buyer2).purchaseTicket(eventIndex,
            toNoteHex(parsedNote2.cryptoNote.commitment),
            { value: ethers.utils.parseEther("10") }
        )

        event = await ticketer.ticketedEvents(eventIndex);

        expect(event.availableTickets).to.equal(0);

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
        await ticketer.connect(eventCreator).createNewTicketedEvent(ethers.utils.parseEther("10"), "My event", 2, externalHandler.address);
        const eventIndex = await ticketer.ticketedEventIndex();
        // Buyer 1 purchases a ticket!
        const noteString = await cryptoNote(0x2b6653dc);
        const parsedNote = await parseNote(noteString);
        await ticketer.connect(buyer1).purchaseTicket(
            eventIndex,
            toNoteHex(parsedNote.cryptoNote.commitment),
            { value: ethers.utils.parseEther("10") });
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
})