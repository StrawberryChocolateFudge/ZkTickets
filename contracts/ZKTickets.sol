// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

struct TicketedEvents {
    address payable creator;
    uint256 price;
    string eventName;
    uint256 availableTickets;
}

struct TicketCommitments {
    address buyer;
    uint256 ticketedEventIndex;
    bool used;
}

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory _input
    ) external returns (bool);
}

contract ZKTickets {
    IVerifier public verifier;

    constructor(IVerifier _verifier) {
        verifier = _verifier;
        ticketedEventIndex = 0;
    }

    mapping(uint256 => TicketedEvents) public ticketedEvents; // The events that are ticketed
    mapping(bytes32 => TicketCommitments) public ticketCommitments; // The commitments of the tickets, we check here if the ticket exists or if it has been used!
    mapping(bytes32 => bool) public nullifierHashes; // The nullifier hashes are used to store the note nullifiers!

    uint256 public ticketedEventIndex;

    /*
    Create a new ticketed event!
    */

    function createNewTicketedEvent(
        uint256 price,
        string calldata eventName,
        uint256 availableTickets
    ) external {
        ticketedEventIndex += 1;
        ticketedEvents[ticketedEventIndex].creator = payable(msg.sender);
        ticketedEvents[ticketedEventIndex].price = price;
        ticketedEvents[ticketedEventIndex].eventName = eventName;
        ticketedEvents[ticketedEventIndex].availableTickets = availableTickets;
    }

    function purchaseTicket(uint256 _ticketedEventIndex, bytes32 commitment)
        external
        payable
    {
        require(
            msg.value == ticketedEvents[_ticketedEventIndex].price,
            "Invalid Ticket Price!"
        );

        require(
            !ticketCommitments[commitment].used,
            "That commitment was already used!"
        );
        require(
            ticketedEvents[_ticketedEventIndex].availableTickets > 0,
            "Sold out!"
        );

        ticketCommitments[commitment].used = true;
        ticketCommitments[commitment].buyer = msg.sender;
        ticketCommitments[commitment].ticketedEventIndex = _ticketedEventIndex;

        ticketedEvents[_ticketedEventIndex].availableTickets -= 1;

        // Forward the eth to the craetor of the ticket
        Address.sendValue(
            ticketedEvents[_ticketedEventIndex].creator,
            msg.value
        );
    }

    // Handle the ticket

    function handleTicket(
        uint256[8] calldata _proof,
        bytes32 _nullifierHash,
        bytes32 _commitment
    ) external {
        require(!nullifierHashes[_nullifierHash], "Ticket was already used!");
        require(ticketCommitments[_commitment].used, "Ticket does not exist!");

        require(
            verifier.verifyProof(
                [_proof[0], _proof[1]],
                [[_proof[2], _proof[3]], [_proof[4], _proof[5]]],
                [_proof[6], _proof[7]],
                [uint256(_nullifierHash), uint256(_commitment)]
            ),
            "Invalid ticket "
        );
        nullifierHashes[_nullifierHash] = true;
    }

    /*
 A view function to verify the ticket before the transaction is submitted to the blockchain!
 Returns if the ticket is valid and was not handled yet
*/
    function verifyTicket(bytes32 _commitment, bytes32 _nullifierHash)
        external
        view
        returns (bool)
    {
        // If the ticket is already nullified return false
        if (nullifierHashes[_nullifierHash]) {
            return false;
        }
        // if the ticket was not created at all, return false
        if (!ticketCommitments[_commitment].used) {
            return false;
        }

        // Otherwise there is a ticket

        return true;
    }
}
