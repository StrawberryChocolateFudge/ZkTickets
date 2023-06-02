//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TicketPro is ERC20 {
    event Burn(uint256 value, address burner);

    constructor(uint256 initialSupply) ERC20("ZkTicketPro", "ZTP") {
        _mint(msg.sender, initialSupply);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit Burn(amount, msg.sender);
    }
}
