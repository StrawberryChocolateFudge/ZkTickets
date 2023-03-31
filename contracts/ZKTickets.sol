// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ProStaking.sol";
import "./ExternalTicketHandler.sol";

struct TicketedEvents {
    address payable creator;
    uint256 price;
    string eventName;
    uint256 availableTickets;
    address externalHandler;
    bool allowSpeculation;
}

struct TicketCommitments {
    address buyer;
    uint256 ticketedEventIndex;
    bool used;
    bool transferInitiated;
}

enum TransferType {
    TRANSFER,
    REFUND,
    RESALE
}

enum TransferStatus {
    INITIATED,
    CANCELLED,
    FINISHED
}

struct TransferRequest {
    bool exists;
    TransferStatus status;
    bytes32 ticketCommitment;
    bytes32 ticketNullifierHash;
    address transferTo;
    TransferType transferType;
    uint256 price;
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
    ProStaking public proStaking;

    uint256 private constant ONEPECENTFEE = 100; // if fee is 100, it's a 1 percent fee
    uint256 private constant TWOPERCENTFEE = 200;

    constructor(IVerifier _verifier, ProStaking _proStaking_) {
        verifier = _verifier;
        ticketedEventIndex = 0;
        contractCreator = payable(msg.sender);
        proStaking = _proStaking_;
    }

    event NewTicketedEventCreated(uint256 index);
    event TicketPurchased(uint256 eventIndex);
    event TicketInvalidated(bytes32 commitment);
    event TicketTransferRequestCreated(
        uint256 eventIndex,
        uint256 requestIndex
    );
    event TicketTransferRequestCancelled(
        uint256 eventIndex,
        uint256 requestIndex
    );

    event TicketTransferComplete(uint256 eventIndex, uint256 requestIndex);
    event TicketRefundComplete(uint256 eventIndex, uint256 requestIndex);
    event TicketResaleComplete(uint256 eventIndex, uint256 requestIndex);

    mapping(uint256 => TicketedEvents) public ticketedEvents; // The events that are ticketed
    mapping(bytes32 => TicketCommitments) public ticketCommitments; // The commitments of the tickets, we check here if the ticket exists or if it has been used!
    mapping(bytes32 => bool) public nullifierHashes; // The nullifier hashes are used to store the note nullifiers!

    uint256 public ticketedEventIndex;

    mapping(uint256 => TransferRequest[]) transferRequests; // Access the transfer requests by event index. Then access the specific transfer requests by their array index!s

    // The eventIndex =>  msg.sender => TransferRequest Index these helper mappings allow easy querying the TransferRequests Array!
    mapping(uint256 => mapping(address => uint256[])) requestsByMe; // Requests created by my address
    mapping(uint256 => mapping(address => uint256[])) requestsToMe; // Requests created for me to accept. Requests that anyone can accept are at address(0)

    mapping(uint256 => mapping(address => uint256))
        public speculativeSaleCounter; // A mapping to check (eventIndex => (msg.sender => relaseCount)) for events where speculative resale is allowed. This will work together with the ProStaking contract

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

    function calculateResaleFee(
        uint256 resalePrice
    )
        public
        pure
        returns (uint256 singleFee, uint256 doubleFee, uint256 total)
    {
        singleFee = resalePrice.div(ONEPECENTFEE);
        doubleFee = singleFee.mul(2);
        total = resalePrice.add(doubleFee);
    }

    /*
    Create a new ticketed event!
    */
    // ..TODO verify the event name is max 50 characters

    function createNewTicketedEvent(
        uint256 price,
        string calldata eventName,
        uint256 availableTickets,
        address externalHandler,
        bool allowSpeculation
    ) external {
        ticketedEventIndex += 1;
        ticketedEvents[ticketedEventIndex].creator = payable(msg.sender);
        ticketedEvents[ticketedEventIndex].price = price;
        ticketedEvents[ticketedEventIndex].eventName = eventName;
        ticketedEvents[ticketedEventIndex].availableTickets = availableTickets;
        ticketedEvents[ticketedEventIndex].allowSpeculation = allowSpeculation;
        ticketedEvents[ticketedEventIndex].externalHandler = externalHandler;
        emit NewTicketedEventCreated(ticketedEventIndex);
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
        ticketCommitments[commitment].transferInitiated = false;
        ticketedEvents[_ticketedEventIndex].availableTickets -= 1;

        // Forward the eth to the creator of the ticket
        Address.sendValue(
            ticketedEvents[_ticketedEventIndex].creator,
            ticketedEvents[_ticketedEventIndex].price
        );

        // Forward the fee to the creator of the contract
        Address.sendValue(contractCreator, fee);

        emit TicketPurchased(_ticketedEventIndex);
    }

    // Handle the ticket This will invalidate it.

    function handleTicket(
        uint256[8] calldata _proof,
        bytes32 _nullifierHash,
        bytes32 _commitment
    ) external {
        require(!nullifierHashes[_nullifierHash], "Ticket was already used!");
        require(ticketCommitments[_commitment].used, "Ticket does not exist!");
        require(
            !ticketCommitments[_commitment].transferInitiated,
            "Ticket is being transferred"
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
        // I get the event using the commitment
        TicketedEvents storage events = ticketedEvents[
            ticketCommitments[_commitment].ticketedEventIndex
        ];
        // I get the added external handler
        address externalHandler = events.externalHandler;

        // If the handler is not zero address I call the external smart contract
        // I verify if the interface was implemented

        if (externalHandler != address(0)) {
            if (
                isValidHandler(
                    externalHandler,
                    msg.sender,
                    ticketCommitments[_commitment].buyer
                )
            ) {
                ExternalTicketHandler(externalHandler).ticketAction(
                    msg.sender,
                    ticketCommitments[_commitment].buyer
                );
            }
        }

        emit TicketInvalidated(_commitment);
    }

    function isValidHandler(
        address handler,
        address sender,
        address ticketOwner
    ) private returns (bool) {
        if (handler.isContract()) {
            try
                ExternalTicketHandler(handler).onTicketActionSupported(
                    sender,
                    ticketOwner
                )
            returns (bytes4 response) {
                if (
                    response !=
                    ExternalTicketHandler.onTicketActionSupported.selector
                ) {
                    return false;
                } else {
                    return true;
                }
            } catch {
                return false;
            }
        } else {
            return false;
        }
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

        if (ticketCommitments[_commitment].transferInitiated) {
            return false;
        }

        // Otherwise there is a ticket

        return true;
    }

    /*
    A function to create a transfer request for the event
    */

    function createTransferRequest(
        bytes32 _commitment,
        bytes32 _nullifierHash,
        uint256[8] calldata _proof,
        uint256 eventIndex,
        TransferType transferType,
        address transferTo,
        uint256 transferPrice
    ) external {
        require(!nullifierHashes[_nullifierHash], "Ticket was already used!");
        require(ticketCommitments[_commitment].used, "Ticket does not exist!");
        require(
            !ticketCommitments[_commitment].transferInitiated,
            "Ticket is being transferred"
        );
        require(
            msg.sender == ticketCommitments[_commitment].buyer,
            "Only the buyer can initiate transfer"
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
        require(
            ticketedEvents[eventIndex].creator != address(0),
            "The event doesn't exist!"
        );

        if (transferType == TransferType.TRANSFER) {
            require(transferTo != address(0), "Invalid Transfer To");
            require(transferPrice == 0, "Transfers must be free");
        } else if (transferType == TransferType.REFUND) {
            require(
                transferTo == ticketedEvents[eventIndex].creator,
                "Only creator can refund"
            );
            require(
                transferPrice == ticketedEvents[eventIndex].price,
                "Price must equal sale price"
            );
        } else if (transferType == TransferType.RESALE) {
            if (!ticketedEvents[eventIndex].allowSpeculation) {
                // If price speculation is turned off then the price must equal the event price
                require(
                    ticketedEvents[eventIndex].price == transferPrice,
                    "No speculation"
                );
            } else if (
                ticketedEvents[eventIndex].allowSpeculation &&
                transferPrice != ticketedEvents[eventIndex].price
            ) {
                // Speculative sales are only available for pro members
                // If the resale price is new and the event allows speculation
                // the seller has to stake!
                speculativeSaleCounter[eventIndex][msg.sender] += 1;

                // Let's check how much the memebers are staking
                (bool isStaking, , uint256 stakeAmount) = proStaking.stakers(
                    msg.sender
                );
                require(isStaking, "You need to stake");

                // the needed stake amount is:
                uint256 neededStake = speculativeSaleCounter[eventIndex][
                    msg.sender
                ].mul(proStaking.stakeUnit());
                // If the stake amount in ProStaking is less then the needed stake, this will revert!
                require(stakeAmount >= neededStake, "You need to stake more");
            }
            // Resale tickets can have defined or zero address transferTo fields
        } else {
            revert("Invalid TransferType supplied");
        }
        TransferRequest memory request = TransferRequest(
            true,
            TransferStatus.INITIATED,
            _commitment,
            _nullifierHash,
            transferTo,
            transferType,
            transferPrice
        );
        transferRequests[eventIndex].push(request);
        ticketCommitments[_commitment].transferInitiated = true;

        //Save this as it's a request by me
        requestsByMe[eventIndex][ticketCommitments[_commitment].buyer].push(
            transferRequests[eventIndex].length - 1
        );

        // This is a transfer to me
        requestsToMe[eventIndex][transferTo].push(
            transferRequests[eventIndex].length - 1
        );

        emit TicketTransferRequestCreated(
            eventIndex,
            transferRequests[eventIndex].length - 1
        );
    }

    /*
    A function to cancel a transfer request
    */

    function cancelTransferRequest(
        bytes32 _commitment,
        bytes32 _nullifierHash,
        uint256[8] calldata _proof,
        uint256 eventIndex,
        uint256 transferRequestIndex
    ) external {
        // If there is a transfer request going on, the owner of the note can cancel it if the transaction is sent from the ticket buyer's address!
        TransferRequest memory transferRequest = transferRequests[eventIndex][
            transferRequestIndex
        ];
        require(
            transferRequest.status == TransferStatus.INITIATED,
            "Request is not initiated"
        );
        require(
            msg.sender == ticketCommitments[_commitment].buyer,
            "Can't cancel"
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
        require(
            transferRequest.ticketCommitment == _commitment,
            "Invalid Commitment"
        );
        require(
            transferRequest.ticketNullifierHash == _nullifierHash,
            "Invalid NullifierHash"
        );

        // Cancel the transfer Request
        transferRequests[eventIndex][transferRequestIndex]
            .status = TransferStatus.CANCELLED;
        ticketCommitments[_commitment].transferInitiated = false;

        emit TicketTransferRequestCancelled(eventIndex, transferRequestIndex);
    }

    /*
      A function to accept a transfer request
    */

    function acceptTransfer(
        uint256 eventIndex,
        uint256 transferRequestIndex,
        bytes32 _newCommitment
    ) external {
        require(!ticketCommitments[_newCommitment].used, "Commitment is used");
        TransferRequest memory transferRequest = transferRequests[eventIndex][
            transferRequestIndex
        ];
        require(
            transferRequest.status == TransferStatus.INITIATED,
            "Request is not initiated"
        );
        require(
            transferRequest.transferType == TransferType.TRANSFER,
            "Invalid Transfer Type"
        );
        require(transferRequest.transferTo == msg.sender, "Invalid sender");

        // Invalidates the old ticket
        nullifierHashes[transferRequest.ticketNullifierHash] = true;
        transferRequests[eventIndex][transferRequestIndex]
            .status = TransferStatus.FINISHED;
        // Now the user creates a new ticket
        ticketCommitments[_newCommitment].used = true;
        ticketCommitments[_newCommitment].buyer = msg.sender;
        ticketCommitments[_newCommitment].ticketedEventIndex = eventIndex;
        ticketCommitments[_newCommitment].transferInitiated = false;

        emit TicketTransferComplete(eventIndex, transferRequestIndex);
    }

    /*
        a function to accept the refund request
    */
    function acceptRefundRequest(
        uint256 eventIndex,
        uint256 transferRequestIndex
    ) external payable {
        TransferRequest memory transferRequest = transferRequests[eventIndex][
            transferRequestIndex
        ];
        require(
            transferRequest.status == TransferStatus.INITIATED,
            "Request is not initiated"
        );
        require(
            transferRequest.transferType == TransferType.REFUND,
            "Invalid Transfer Type"
        );

        require(
            msg.sender == ticketedEvents[eventIndex].creator,
            "Only event creator can refund"
        );

        require(msg.value == transferRequest.price, "Invalid Refund Price");

        nullifierHashes[transferRequest.ticketNullifierHash] = true;
        transferRequests[eventIndex][transferRequestIndex]
            .status = TransferStatus.FINISHED;

        address sendTo = ticketCommitments[transferRequest.ticketCommitment]
            .buyer;
        // Route the refund payment to the ticket buyer
        Address.sendValue(payable(sendTo), msg.value);
        emit TicketRefundComplete(eventIndex, transferRequestIndex);
    }

    /*
        a function to accept the resale request
    */

    function acceptResaleRequest(
        uint256 eventIndex,
        uint256 transferRequestIndex,
        bytes32 _newCommitment
    ) external payable {
        require(!ticketCommitments[_newCommitment].used, "Commitment is used");
        TransferRequest memory transferRequest = transferRequests[eventIndex][
            transferRequestIndex
        ];
        require(transferRequest.exists, "Request doesn't exiss!");
        require(
            transferRequest.status == TransferStatus.INITIATED,
            "Invalid Transfer Status"
        );
        require(
            transferRequest.transferType == TransferType.RESALE,
            "Invalid Transfer Type"
        );
        if (transferRequest.transferTo != address(0)) {
            require(transferRequest.transferTo == msg.sender, "Invalid sender");
        }

        (uint256 singleFee, , uint256 total) = calculateResaleFee(
            transferRequest.price
        );

        require(msg.value == total, "Invalid Value");

        nullifierHashes[transferRequest.ticketNullifierHash] = true;
        transferRequests[eventIndex][transferRequestIndex]
            .status = TransferStatus.FINISHED;

        // The new user creates the ticket
        ticketCommitments[_newCommitment].used = true;
        ticketCommitments[_newCommitment].buyer = msg.sender;
        ticketCommitments[_newCommitment].ticketedEventIndex = eventIndex;
        ticketCommitments[_newCommitment].transferInitiated = false;

        address sendTo = ticketCommitments[transferRequest.ticketCommitment]
            .buyer;

        // Send the transferRequest price to the request initiator
        Address.sendValue(payable(sendTo), transferRequest.price);

        // Send a 1% fee to the event creator
        Address.sendValue(
            payable(ticketedEvents[eventIndex].creator),
            singleFee
        );

        // Send a 1% fee to the contract creator
        Address.sendValue(payable(contractCreator), singleFee);

        emit TicketResaleComplete(eventIndex, transferRequestIndex);
    }

    /*
    Get the transfer requests by event index
    */

    function getTransferRequestsByEventIndex(
        uint256 eventIndex
    ) external view returns (TransferRequest[] memory) {
        return transferRequests[eventIndex];
    }

    /*
    Get requests by me
    */
    function getRequestsByMe(
        uint256 eventIndex,
        address myAddress
    ) external view returns (uint256[] memory) {
        return requestsByMe[eventIndex][myAddress];
    }

    /*
      Get requests sent to me
    */

    function getRequestsToMe(
        uint256 eventIndex,
        address myAddress
    ) external view returns (uint256[] memory) {
        return requestsToMe[eventIndex][myAddress];
    }

    /*
    Get the transfer requests for the front end to use!
    */

    function getTransferRequestsForPagination(
        uint256 eventIndex,
        uint256[5] calldata indexes
    ) external view returns (TransferRequest[5] memory) {
        return [
            transferRequests[eventIndex][indexes[0]],
            transferRequests[eventIndex][indexes[1]],
            transferRequests[eventIndex][indexes[2]],
            transferRequests[eventIndex][indexes[3]],
            transferRequests[eventIndex][indexes[4]]
        ];
    }
}
