import { ethers } from 'hardhat';
import { expect } from 'chai';
import { time, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import factoryJson from '@uniswap/v2-core/build/UniswapV2Factory.json';
import pairJson from '@uniswap/v2-core/build/UniswapV2Pair.json';
import routerJson from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import { UniswapV2Factory, UniswapV2Pair, UniswapV2Router02 } from '../../typechain-types';

describe('[Challenge] Free Rider', function () {
  it('??', async function () {
    // The NFT marketplace will have 6 tokens, at 15 ETH each
    const NFT_PRICE = 15n * 10n ** 18n;
    const AMOUNT_OF_NFTS = 6;
    const MARKETPLACE_INITIAL_ETH_BALANCE = 90n * 10n ** 18n;

    const PLAYER_INITIAL_ETH_BALANCE = 1n * 10n ** 17n;

    const BOUNTY = 45n * 10n ** 18n;

    // Initial reserves for the Uniswap v2 pool
    const UNISWAP_INITIAL_TOKEN_RESERVE = 15000n * 10n ** 18n;
    const UNISWAP_INITIAL_WETH_RESERVE = 9000n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player, devs] = await ethers.getSigners();

    // Player starts with limited ETH balance
    setBalance(player.address, PLAYER_INITIAL_ETH_BALANCE);
    expect(await ethers.provider.getBalance(player)).to.eq(PLAYER_INITIAL_ETH_BALANCE);

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
    const uniswapPair = (await ethers.getContractAt(
      pairJson.abi,
      await uniswapFactory.getPair(token, weth)
    )) as unknown as UniswapV2Pair;

    expect(await uniswapPair.token0()).to.eq(weth);
    expect(await uniswapPair.token1()).to.eq(token);
    expect(await uniswapPair.balanceOf(deployer)).to.be.gt(0);

    // Deploy the marketplace and get the associated ERC721 token
    // The marketplace will automatically mint AMOUNT_OF_NFTS to the deployer (see `FreeRiderNFTMarketplace::constructor`)
    const marketplace = await ethers.deployContract('FreeRiderNFTMarketplace', [AMOUNT_OF_NFTS], {
      value: MARKETPLACE_INITIAL_ETH_BALANCE,
    });

    // Deploy NFT contract
    const nft = await ethers.getContractAt('DamnValuableNFT', await marketplace.token());
    expect(await nft.owner()).to.eq(ethers.ZeroAddress); // ownership renounced
    expect(await nft.rolesOf(marketplace)).to.eq(await nft.MINTER_ROLE());

    // Ensure deployer owns all minted NFTs. Then approve the marketplace to trade them.
    for (let id = 0; id < AMOUNT_OF_NFTS; id++) {
      expect(await nft.ownerOf(id)).to.be.eq(deployer);
    }
    await nft.setApprovalForAll(marketplace, true);

    // Open offers in the marketplace
    await marketplace.offerMany([0, 1, 2, 3, 4, 5], [NFT_PRICE, NFT_PRICE, NFT_PRICE, NFT_PRICE, NFT_PRICE, NFT_PRICE]);
    expect(await marketplace.offersCount()).to.be.eq(6);

    // Deploy devs' contract, adding the player as the beneficiary
    const devsContract = await (
      await ethers.getContractFactory('FreeRiderRecovery', devs)
    ).deploy(
      player, // beneficiary
      nft,
      { value: BOUNTY }
    );

    /** CODE YOUR SOLUTION HERE */

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // The devs extract all NFTs from its associated contract
    for (let tokenId = 0; tokenId < AMOUNT_OF_NFTS; tokenId++) {
      await nft.connect(devs).transferFrom(devsContract, devs, tokenId);
      expect(await nft.ownerOf(tokenId)).to.be.eq(devs);
    }

    // Exchange must have lost NFTs and ETH
    expect(await marketplace.offersCount()).to.be.eq(0);
    expect(await ethers.provider.getBalance(marketplace)).to.be.lt(MARKETPLACE_INITIAL_ETH_BALANCE);

    // Player must have earned all ETH
    expect(await ethers.provider.getBalance(player)).to.be.gt(BOUNTY);
    expect(await ethers.provider.getBalance(devsContract)).to.be.eq(0);
  });
});
