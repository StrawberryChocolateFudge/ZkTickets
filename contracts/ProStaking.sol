//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct Staker {
    bool isStaking;
    uint256 stakeDate;
    uint256 stakeAmount;
}

contract ProStaking is Ownable {
    using SafeERC20 for IERC20;
    IERC20 private _token; // The TicketPro Token

    uint256 public totalStaked;
    uint256 public stakingBlocks;

    uint256 public stakeUnit;

    mapping(address => Staker) public stakers;

    event Stake(address indexed _address, uint256 totalStaked);
    event Unstake(address indexed _address, uint256 totalStaked);
    event ExtendStakeTime(address indexed _address, uint256 stakeDate);

    constructor(IERC20 _token_, uint256 _stakingBlocks_, uint256 _stakeUnit_) {
        _token = _token_;
        stakingBlocks = _stakingBlocks_;
        stakeUnit = _stakeUnit_;
    }

    /*
    A function to add stake,this will allow a user to access pro features in the app
    */
    function stake(uint256 amount) external {
        // I add staking to the stakers
        require(
            _token.balanceOf(msg.sender) >= amount,
            "Not Enough tokens to stake"
        );

        uint256 stakingAlready = stakers[msg.sender].stakeAmount;

        // If the address is staking already, I add to the stake

        stakers[msg.sender].isStaking = true;
        stakers[msg.sender].stakeDate = block.number;
        stakers[msg.sender].stakeAmount = stakingAlready + amount;

        totalStaked += amount;
        _token.safeTransferFrom(msg.sender, address(this), amount);
        emit Stake(msg.sender, totalStaked);
    }

    /*
       Remove the stake of the address by amount if stake is unlocked
    */

    function unstake(uint256 amount) external {
        require(stakers[msg.sender].isStaking, "not staking");
        require(
            stakers[msg.sender].stakeDate + stakingBlocks < block.number,
            "stake unexpired"
        );
        require(stakers[msg.sender].stakeAmount >= amount, "Invalid amount");

        totalStaked -= amount;

        uint256 stakeLeft = stakers[msg.sender].stakeAmount - amount;

        if (stakeLeft == 0) {
            stakers[msg.sender].isStaking = false;
        }

        _token.safeTransfer(msg.sender, amount);
        emit Unstake(msg.sender, totalStaked);
    }
}
