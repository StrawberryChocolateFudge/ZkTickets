// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ZKTickets.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/*
  This is an example contract that implements the ExternalTicketHandler interface
  the ZkTickets will call.
  
*/
contract TokenClaimEvent is ExternalTicketHandler {
    event TicketAction(address sender, address ticketOwner);

    IERC20 public ticketPro;

    uint256 airdropAmount;

    address tokenOwner;

    address zkTickets;

    constructor(
        address _zktickets,
        IERC20 _ticketPro,
        uint256 _airdropAmount,
        address _tokenOwner
    ) {
        zkTickets = _zktickets;
        ticketPro = _ticketPro;
        airdropAmount = _airdropAmount;
        tokenOwner = _tokenOwner;
    }

    function ticketAction(
        address sender,
        address ticketOwner
    ) external override {
        require(msg.sender == zkTickets, "Only zkTickets!");
        ticketPro.transferFrom(tokenOwner, ticketOwner, airdropAmount);
        emit TicketAction(sender, ticketOwner);
    }

    function onTicketActionSupported(
        address,
        address
    ) public virtual override returns (bytes4) {
        return this.onTicketActionSupported.selector;
    }
}
