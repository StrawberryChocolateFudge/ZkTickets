// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ExternalTicketHandler {
    function ticketAction(address sender, address ticketOwer) external;

    function onTicketActionSupported(
        address sender,
        address ticketOwner
    ) external returns (bytes4);
}
