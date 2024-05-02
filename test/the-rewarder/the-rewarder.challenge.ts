import { ethers } from 'hardhat';
import { expect } from 'chai';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('[Challenge] The rewarder', function () {
  it('should claim most rewards', async function () {
    const TOKENS_IN_LENDER_POOL = 1000000n * 10n ** 18n; // 1 million tokens

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

    const [deployer, alice, bob, charlie, david, player] = await ethers.getSigners();
    const users = [alice, bob, charlie, david];

    const FlashLoanerPoolFactory = await ethers.getContractFactory('FlashLoanerPool', deployer);
    const TheRewarderPoolFactory = await ethers.getContractFactory('TheRewarderPool', deployer);
    const DamnValuableTokenFactory = await ethers.getContractFactory('DamnValuableToken', deployer);

    const liquidityToken = await DamnValuableTokenFactory.deploy();
    const flashLoanPool = await FlashLoanerPoolFactory.deploy(liquidityToken);

    // Set initial token balance of the pool offering flash loans
    await liquidityToken.transfer(flashLoanPool, TOKENS_IN_LENDER_POOL);

    const rewarderPool = await TheRewarderPoolFactory.deploy(liquidityToken);
    const rewardToken = await ethers.getContractAt('RewardToken', await rewarderPool.rewardToken(), deployer);
    const accountingToken = await ethers.getContractAt('AccountingToken', await rewarderPool.accountingToken(), deployer);

    // Check roles in accounting token
    expect(await accountingToken.owner()).to.eq(rewarderPool);
    const minterRole = await accountingToken.MINTER_ROLE();
    const snapshotRole = await accountingToken.SNAPSHOT_ROLE();
    const burnerRole = await accountingToken.BURNER_ROLE();
    expect(await accountingToken.hasAllRoles(rewarderPool, minterRole | snapshotRole | burnerRole)).to.be.true;

    // Alice, Bob, Charlie and David deposit tokens
    let depositAmount = 100n * 10n ** 18n;
    for (let i = 0; i < users.length; i++) {
      await liquidityToken.transfer(users[i], depositAmount);
      await liquidityToken.connect(users[i]).approve(rewarderPool, depositAmount);
      await rewarderPool.connect(users[i]).deposit(depositAmount);
      expect(await accountingToken.balanceOf(users[i])).to.be.eq(depositAmount);
    }
    expect(await accountingToken.totalSupply()).to.be.eq(depositAmount * BigInt(users.length));
    expect(await rewardToken.totalSupply()).to.be.eq(0);

    // Advance time 5 days so that depositors can get rewards
    await time.increase(5 * 24 * 60 * 60) // 5 days

    // Each depositor gets reward tokens
    let rewardsInRound = await rewarderPool.REWARDS();
    for (let i = 0; i < users.length; i++) {
      await rewarderPool.connect(users[i]).distributeRewards();
      expect(await rewardToken.balanceOf(users[i])).to.be.eq(rewardsInRound / BigInt(users.length));
    }
    expect(await rewardToken.totalSupply()).to.be.eq(rewardsInRound);

    // Player starts with zero DVT tokens in balance
    expect(await liquidityToken.balanceOf(player)).to.eq(0);

    // Two rounds must have occurred so far
    expect(await rewarderPool.roundNumber()).to.be.eq(2);

    /** CODE YOUR SOLUTION HERE */

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
    // Only one round must have taken place
    expect(await rewarderPool.roundNumber()).to.be.eq(3);

    // Users should get neglegible rewards this round
    for (let i = 0; i < users.length; i++) {
      await rewarderPool.connect(users[i]).distributeRewards();
      const userRewards = await rewardToken.balanceOf(users[i]);
      const delta = userRewards - (await rewarderPool.REWARDS()) / BigInt(users.length);
      expect(delta).to.be.lt(10n ** 16n);
    }

    // Rewards must have been issued to the player account
    expect(await rewardToken.totalSupply()).to.be.gt(await rewarderPool.REWARDS());
    const playerRewards = await rewardToken.balanceOf(player);
    expect(playerRewards).to.be.gt(0);

    // The amount of rewards earned should be close to total available amount
    const delta = (await rewarderPool.REWARDS()) - playerRewards;
    expect(delta).to.be.lt(10n ** 17n);

    // Balance of DVT tokens in player and lending pool hasn't changed
    expect(await liquidityToken.balanceOf(player)).to.eq(0);
    expect(await liquidityToken.balanceOf(flashLoanPool)).to.eq(TOKENS_IN_LENDER_POOL);
  });
});
