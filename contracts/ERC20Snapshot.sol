// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ERC20Votes, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

abstract contract ERC20Snapshot is ERC20Votes {
    uint48 private _snapshotId;

    event ERC20SnapshotCheckpointed(uint48 id);

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) EIP712(name_, "1") {}

    function clock() public view virtual override returns (uint48) {
        return _snapshotId;
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public view virtual override returns (string memory) {
        // Check that the clock was not modified
        if (clock() != _snapshotId) {
            revert ERC6372InconsistentClock();
        }
        return "mode=counter";
    }

    function delegates(address account) public pure override returns (address) {
        return account;
    }

    function _snapshot() internal virtual returns (uint256) {
        uint48 currentId = _snapshotId++;
        emit ERC20SnapshotCheckpointed(currentId);
        return currentId;
    }

    function balanceOfAt(address account, uint256 snapshotId) public view virtual returns (uint256) {
        return getPastVotes(account, snapshotId);
    }

    function totalSupplyAt(uint256 snapshotId) public view virtual returns (uint256) {
        return getPastTotalSupply(snapshotId);
    }
}
