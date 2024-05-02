import { ethers } from 'hardhat';
import { expect } from 'chai';
import { setBalance, time } from '@nomicfoundation/hardhat-network-helpers';
import UniswapV1FactoryArtifact from '../../external-artifacts/uniswap-v1/UniswapV1Factory.json';
import UniswapV1ExchangeArtifact from '../../external-artifacts/uniswap-v1/UniswapV1Exchange.json';
import { UniswapV1Exchange__factory, UniswapV1Factory } from '../../typechain-types';

// Calculates how much ETH (in wei) Uniswap will pay for the given amount of tokens
function calculateTokenToEthInputPrice(tokensSold: bigint, tokensInReserve: bigint, etherInReserve: bigint) {
  return (tokensSold * 997n * etherInReserve) / (tokensInReserve * 1000n + tokensSold * 997n);
}

describe('[Challenge] Puppet', function () {
  it('should take all tokens from the lending pool', async function () {
    const UNISWAP_INITIAL_TOKEN_RESERVE = 10n * 10n ** 18n;
    const UNISWAP_INITIAL_ETH_RESERVE = 10n * 10n ** 18n;

    const PLAYER_INITIAL_TOKEN_BALANCE = 1000n * 10n ** 18n;
    const PLAYER_INITIAL_ETH_BALANCE = 25n * 10n ** 18n;

    const POOL_INITIAL_TOKEN_BALANCE = 100000n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player] = await ethers.getSigners();
    const uniswapFactory = (await (
      await ethers.getContractFactory(UniswapV1FactoryArtifact.abi, UniswapV1FactoryArtifact.bytecode, deployer)
    ).deploy()) as UniswapV1Factory;
    const UniswapExchangeFactory = await ethers.getContractFactory(
      UniswapV1ExchangeArtifact.abi,
      UniswapV1ExchangeArtifact.bytecode,
      deployer
    ) as UniswapV1Exchange__factory;

    setBalance(player.address, PLAYER_INITIAL_ETH_BALANCE);
    expect(await ethers.provider.getBalance(player)).to.equal(PLAYER_INITIAL_ETH_BALANCE);

    // Deploy token to be traded in Uniswap
    const token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();

    // Deploy a exchange that will be used as the factory template
    const exchangeTemplate = await UniswapExchangeFactory.deploy();

    // Deploy factory, initializing it with the address of the template exchange

    await uniswapFactory.initializeFactory(exchangeTemplate);

    // Create a new exchange for the token, and retrieve the deployed exchange's address
    let tx = await uniswapFactory.createExchange(token, { gasLimit: 1e6 });
    const receipt = await tx.wait();
    const uniswapExchange = await ethers.getContractAt('UniswapV1Exchange', receipt!.logs[0].topics[1]);

    // Deploy the lending pool
    const lendingPool = await (await ethers.getContractFactory('PuppetPool', deployer)).deploy(token, uniswapExchange);

    // Add initial token and ETH liquidity to the pool
    await token.approve(uniswapExchange, UNISWAP_INITIAL_TOKEN_RESERVE);
    await uniswapExchange.addLiquidity(
      0, // min_liquidity
      UNISWAP_INITIAL_TOKEN_RESERVE,
      (await time.latest()) * 2, // deadline
      { value: UNISWAP_INITIAL_ETH_RESERVE, gasLimit: 1e6 }
    );

    // Ensure Uniswap exchange is working as expected
    expect(await uniswapExchange.getTokenToEthInputPrice(10n ** 18n, { gasLimit: 1e6 })).to.be.eq(
      calculateTokenToEthInputPrice(10n ** 18n, UNISWAP_INITIAL_TOKEN_RESERVE, UNISWAP_INITIAL_ETH_RESERVE)
    );

    // Setup initial token balances of pool and player accounts
    await token.transfer(player, PLAYER_INITIAL_TOKEN_BALANCE);
    await token.transfer(lendingPool, POOL_INITIAL_TOKEN_BALANCE);

    // Ensure correct setup of pool. For example, to borrow 1 need to deposit 2
    expect(await lendingPool.calculateDepositRequired(10n ** 18n)).to.be.eq(2n * 10n ** 18n);

    expect(await lendingPool.calculateDepositRequired(POOL_INITIAL_TOKEN_BALANCE)).to.be.eq(
      POOL_INITIAL_TOKEN_BALANCE * 2n
    );

    /** CODE YOUR SOLUTION HERE */

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
    // Player executed a single transaction
    expect(await ethers.provider.getTransactionCount(player)).to.eq(1);

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(lendingPool)).to.be.eq(0, 'Pool still has tokens');

    expect(await token.balanceOf(player)).to.be.gte(POOL_INITIAL_TOKEN_BALANCE, 'Not enough token balance in player');
  });
});
