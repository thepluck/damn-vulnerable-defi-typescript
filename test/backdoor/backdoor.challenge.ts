import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('[Challenge] Backdoor', function () {
  it('should take all funds from the registry', async function () {
    const AMOUNT_TOKENS_DISTRIBUTED = 40n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, alice, bob, charlie, david, player] = await ethers.getSigners();
    const users = [alice, bob, charlie, david];

    // Deploy Gnosis Safe master copy and factory contracts
    const masterCopy = await ethers.deployContract('GnosisSafe');
    const walletFactory = await ethers.deployContract('GnosisSafeProxyFactory');
    const token = await ethers.deployContract('DamnValuableToken');

    // Deploy the registry
    const walletRegistry = await ethers.deployContract('WalletRegistry', [masterCopy, walletFactory, token, users]);
    expect(await walletRegistry.owner()).to.eq(deployer);

    for (let i = 0; i < users.length; i++) {
      // Users are registered as beneficiaries
      expect(await walletRegistry.beneficiaries(users[i])).to.be.true;

      // User cannot add beneficiaries
      await expect(
        walletRegistry.connect(await ethers.getSigner(users[i].address)).addBeneficiary(users[i]),
      ).to.be.revertedWithCustomError(walletRegistry, 'Unauthorized');
    }

    // Transfer tokens to be distributed to the registry
    await token.transfer(walletRegistry, AMOUNT_TOKENS_DISTRIBUTED);

    /** CODE YOUR SOLUTION HERE */

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player must have used a single transaction
    expect(await ethers.provider.getTransactionCount(player)).to.eq(1);

    for (let i = 0; i < users.length; i++) {
      let wallet = await walletRegistry.wallets(users[i]);

      // User must have registered a wallet
      expect(wallet).to.not.eq(ethers.ZeroAddress, 'User did not register a wallet');

      // User is no longer registered as a beneficiary
      expect(await walletRegistry.beneficiaries(users[i])).to.be.false;
    }

    // Player must own all tokens
    expect(await token.balanceOf(player)).to.eq(AMOUNT_TOKENS_DISTRIBUTED);
  });
});
