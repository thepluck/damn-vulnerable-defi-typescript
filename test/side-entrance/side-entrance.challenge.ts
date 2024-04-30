import { ethers } from 'hardhat';
import { expect } from 'chai';
import { setBalance } from '@nomicfoundation/hardhat-network-helpers';

describe('[Challenge] Side entrance', function () {
  it('should take all ETH out of the pool', async function () {
    const ETHER_IN_POOL = 1000n * 10n ** 18n;
    const PLAYER_INITIAL_ETH_BALANCE = 1n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player] = await ethers.getSigners();

    // Deploy pool and fund it
    const pool = await (await ethers.getContractFactory('SideEntranceLenderPool', deployer)).deploy();
    await pool.deposit({ value: ETHER_IN_POOL });
    expect(await ethers.provider.getBalance(pool)).to.equal(ETHER_IN_POOL);

    // Player starts with limited ETH in balance
    await setBalance(await player.getAddress(), PLAYER_INITIAL_ETH_BALANCE);
    expect(await ethers.provider.getBalance(player)).to.eq(PLAYER_INITIAL_ETH_BALANCE);

    /** CODE YOUR SOLUTION HERE */

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player took all ETH from the pool
    expect(await ethers.provider.getBalance(pool)).to.be.equal(0);
    expect(await ethers.provider.getBalance(player)).to.be.gt(ETHER_IN_POOL);
  });
});
