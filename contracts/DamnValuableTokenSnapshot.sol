// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title DamnValuableTokenSnapshot
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract DamnValuableTokenSnapshot is ERC20Votes {
    uint48 private _lastId;

    event Snapshot(uint48 id);

    constructor(uint256 initialSupply) ERC20("DamnValuableToken", "DVT") EIP712("DVTSnapshot", "1") {
        _mint(msg.sender, initialSupply);
    }

    function clock() public view virtual override returns (uint48) {
        return _lastId;
    }

    function snapshot() public returns (uint256 lastId) {
        uint48 currentId = _lastId++;
        emit Snapshot(currentId);
        return currentId;
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public view virtual override returns (string memory) {
        // Check that the clock was not modified
        if (clock() != _lastId) {
            revert ERC6372InconsistentClock();
        }
        return "mode=counter";
    }

    function delegates(address account) public pure override returns (address) {
        return account;
    }

    function getBalanceAtLastSnapshot(address account) external view returns (uint256) {
        return getPastVotes(account, _lastId);
    }

    function getTotalSupplyAtLastSnapshot() external view returns (uint256) {
        return getPastTotalSupply(_lastId);
    }
}
