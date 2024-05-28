import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('[Challenge] Selfie', function () {
  it('should take all the tokens', async function () {
    const TOKEN_INITIAL_SUPPLY = 2000000n * 10n ** 18n;
    const TOKENS_IN_POOL = 1500000n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player] = await ethers.getSigners();

    // Deploy Damn Valuable Token Snapshot
    const token = await ethers.deployContract('DamnValuableTokenSnapshot', [TOKEN_INITIAL_SUPPLY]);

    // Deploy governance contract
    const governance = await ethers.deployContract('SimpleGovernance', [token]);
    expect(await governance.getActionCounter()).to.eq(1);

    // Deploy the pool
    const pool = await ethers.deployContract('SelfiePool', [token, governance]);
    expect(await pool.token()).to.eq(token);
    expect(await pool.governance()).to.eq(governance);

    // Fund the pool
    await token.transfer(pool, TOKENS_IN_POOL);
    await token.snapshot();
    expect(await token.balanceOf(pool)).to.be.equal(TOKENS_IN_POOL);
    expect(await pool.maxFlashLoan(token)).to.eq(TOKENS_IN_POOL);
    expect(await pool.flashFee(token, 0)).to.eq(0);

    /** CODE YOUR SOLUTION HERE */

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(player)).to.be.equal(TOKENS_IN_POOL);
    expect(await token.balanceOf(pool)).to.be.equal(0);
  });
});
