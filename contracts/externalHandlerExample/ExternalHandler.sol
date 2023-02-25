// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../ZKTickets.sol";

/*
  This is an example contract that implements the ExternalTicketHandler interface
  The ZkTickets will call 

*/
contract MyExternalHandlerExample is ExternalTicketHandler {
    event TicketAction(address sender, address ticketOwner);

    function ticketAction(address sender, address ticketOwner)
        external
        override
    {
        emit TicketAction(sender, ticketOwner);
    }
}
