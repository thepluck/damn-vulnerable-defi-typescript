// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./ERC20Snapshot.sol";

/**
 * @title DamnValuableTokenSnapshot
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract DamnValuableTokenSnapshot is ERC20Snapshot {
    uint256 private _lastSnapshotId;

    constructor(uint256 initialSupply) ERC20Snapshot("DamnValuableToken", "DVT") {
        _mint(msg.sender, initialSupply);
    }

    function snapshot() public returns (uint256 lastSnapshotId) {
        lastSnapshotId = _snapshot();
        _lastSnapshotId = lastSnapshotId;
    }

    function getBalanceAtLastSnapshot(address account) external view returns (uint256) {
        return getPastVotes(account, _lastSnapshotId);
    }

    function getTotalSupplyAtLastSnapshot() external view returns (uint256) {
        return getPastTotalSupply(_lastSnapshotId);
    }
}
