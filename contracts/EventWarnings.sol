// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// If you aren't satisfied with an event creator you can save a warning that will show for users

enum WarningLevel {
    NONE,
    LOW,
    MEDIUM,
    HIGH
}

struct Warning {
    WarningLevel level;
    string message;
    address createdBy;
}

contract EventWarnings {
    mapping(address => Warning[]) warnings;
    mapping(address => uint256) public warningCount;

    // Check if the sender created a warning already about another address
    mapping(address => mapping(address => bool)) public createdWarning;

    event NewWarning(
        WarningLevel level,
        string message,
        address createdBy,
        address warnAbout
    );

    event EditWarning(
        WarningLevel level,
        string message,
        address editedBy,
        address warnAbout
    );

    function createWarning(
        WarningLevel level,
        string calldata message,
        address about
    ) external {
        require(!createdWarning[msg.sender][about], "Warning already exists!");
        Warning memory warning = Warning(level, message, msg.sender);
        warnings[about].push(warning);
        warningCount[about] += 1;
        createdWarning[msg.sender][about] = true;
        emit NewWarning(level, message, msg.sender, about);
    }

    function editWarning(
        WarningLevel level,
        string calldata message,
        address about,
        uint256 arrayIndex
    ) external {
        require(
            warnings[about][arrayIndex].createdBy == msg.sender,
            "Only creator can edit"
        );
        warnings[about][arrayIndex].level = level;
        warnings[about][arrayIndex].message = message;

        emit EditWarning(level, message, msg.sender, about);
    }

    function getWarnings(
        address about
    ) external view returns (Warning[] memory) {
        return warnings[about];
    }
}
