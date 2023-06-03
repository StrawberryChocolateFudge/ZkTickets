// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

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
    using SafeMath for uint256;
    using Address for address;
    address payable contractCreator;
    IVerifier public verifier;

    uint256 private constant ONEPECENTFEE = 100; // if fee is 100, it's a 1 percent fee

    constructor(IVerifier _verifier) {
        verifier = _verifier;
        ticketedEventIndex = 0;
        contractCreator = payable(msg.sender);
    }

    event NewTicketedEventCreated(
        address indexed creator,
        uint256 indexed index,
        string name,
        uint256 availableTickets
    );
    event TicketPurchased(
        uint256 indexed eventIndex,
        address buyer,
        bytes32 commitment
    );
    event TicketInvalidated(bytes32 commitment);

    mapping(uint256 => TicketedEvents) public ticketedEvents; // The events that are ticketed
    mapping(bytes32 => TicketCommitments) public ticketCommitments; // The commitments of the tickets, we check here if the ticket exists or if it has been used!
    mapping(bytes32 => bool) public nullifierHashes; // The nullifier hashes are used to store the note nullifiers!

    uint256 public ticketedEventIndex;

    /*
    Helper function to calculate fees
    */
    function calculatePurchaseFee(
        uint256 purchasePrice
    ) public pure returns (uint256 fee, uint256 total) {
        // Calculate 1% of the purchase price
        fee = purchasePrice.div(ONEPECENTFEE);
        total = purchasePrice.add(fee);
    }

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
        emit NewTicketedEventCreated(
            msg.sender,
            ticketedEventIndex,
            eventName,
            availableTickets
        );
    }

    function purchaseTicket(
        uint256 _ticketedEventIndex,
        bytes32 commitment
    ) external payable {
        (uint256 fee, uint256 total) = calculatePurchaseFee(
            ticketedEvents[_ticketedEventIndex].price
        );
        require(msg.value == total, "Invalid Ticket Price!");

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

        // Forward the eth to the creator of the ticket
        Address.sendValue(
            ticketedEvents[_ticketedEventIndex].creator,
            ticketedEvents[_ticketedEventIndex].price
        );

        // Forward the fee to the creator of the contract
        Address.sendValue(contractCreator, fee);

        emit TicketPurchased(_ticketedEventIndex, msg.sender, commitment);
    }

    // Handle the ticket This will invalidate it.

    function invalidateTicket(
        uint256[8] calldata _proof,
        bytes32 _nullifierHash,
        bytes32 _commitment
    ) external {
        require(!nullifierHashes[_nullifierHash], "Ticket was already used!");
        require(ticketCommitments[_commitment].used, "Ticket does not exist!");
        require(
            ticketedEvents[ticketCommitments[_commitment].ticketedEventIndex]
                .creator == msg.sender,
            "Only event creator!"
        );
        require(
            verifier.verifyProof(
                [_proof[0], _proof[1]],
                [[_proof[2], _proof[3]], [_proof[4], _proof[5]]],
                [_proof[6], _proof[7]],
                [uint256(_nullifierHash), uint256(_commitment)]
            ),
            "Invalid ticket"
        );
        nullifierHashes[_nullifierHash] = true;

        emit TicketInvalidated(_commitment);
    }

    /*
 A view function to verify the ticket before the transaction is submitted to the blockchain!
 Returns if the ticket is valid and was not handled yet
*/
    function verifyTicket(
        bytes32 _commitment,
        bytes32 _nullifierHash
    ) external view returns (bool) {
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
