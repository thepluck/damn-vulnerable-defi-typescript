// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUniswapV1Exchange {
    function tokenToEthSwapInput(uint256, uint256, uint256) external returns (uint256);
}
