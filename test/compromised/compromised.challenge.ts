import { expect } from 'chai';
import { ethers } from 'hardhat';
import { setBalance } from '@nomicfoundation/hardhat-network-helpers';

describe('Compromised challenge', function () {
  it('should obtain all ETH available in the exchange', async function () {
    const sources = [
      '0xA73209FB1a42495120166736362A1DfA9F95A105',
      '0xe92401A4d3af5E446d93D11EEc806b1462b39D15',
      '0x81A5D6E50C214044bE44cA0CB057fe119097850c',
    ];

    const EXCHANGE_INITIAL_ETH_BALANCE = 999n * 10n ** 18n;
    const INITIAL_NFT_PRICE = 999n * 10n ** 18n;
    const PLAYER_INITIAL_ETH_BALANCE = 1n * 10n ** 17n;
    const TRUSTED_SOURCE_INITIAL_ETH_BALANCE = 2n * 10n ** 18n;

    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    const [deployer, player] = await ethers.getSigners();

    // Initialize balance of the trusted source addresses
    for (let i = 0; i < sources.length; i++) {
      setBalance(sources[i], TRUSTED_SOURCE_INITIAL_ETH_BALANCE);
      expect(await ethers.provider.getBalance(sources[i])).to.equal(TRUSTED_SOURCE_INITIAL_ETH_BALANCE);
    }

    // Player starts with limited balance
    setBalance(player.address, PLAYER_INITIAL_ETH_BALANCE);
    expect(await ethers.provider.getBalance(player)).to.equal(PLAYER_INITIAL_ETH_BALANCE);

    // Deploy the oracle and setup the trusted sources with initial prices
    const oracleInitializer = await ethers.deployContract('TrustfulOracleInitializer', [
      sources,
      ['DVNFT', 'DVNFT', 'DVNFT'],
      [INITIAL_NFT_PRICE, INITIAL_NFT_PRICE, INITIAL_NFT_PRICE],
    ]);
    const oracle = await ethers.getContractAt('TrustfulOracle', await oracleInitializer.oracle());

    // Deploy the exchange and get an instance to the associated ERC721 token
    const exchangeFactory = await ethers.getContractFactory('Exchange');
    const exchange = await exchangeFactory.deploy(oracle, { value: EXCHANGE_INITIAL_ETH_BALANCE });
    const nftToken = await ethers.getContractAt('DamnValuableNFT', await exchange.token());
    expect(await nftToken.owner()).to.equal(ethers.ZeroAddress); // ownership renounced
    expect(await nftToken.rolesOf(exchange)).to.eq(await nftToken.MINTER_ROLE());

    /** CODE YOUR SOLUTION HERE */

    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Exchange must have lost all ETH
    expect(await ethers.provider.getBalance(exchange)).to.be.eq(0);

    // Player's ETH balance must have significantly increased
    expect(await ethers.provider.getBalance(player)).to.be.gt(EXCHANGE_INITIAL_ETH_BALANCE);

    // Player must not own any NFT
    expect(await nftToken.balanceOf(player)).to.be.eq(0);

    // NFT price shouldn't have changed
    expect(await oracle.getMedianPrice('DVNFT')).to.eq(INITIAL_NFT_PRICE);
  });
});
