import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'hardhat-dependency-compiler';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.5.16',
      },
      {
        version: '0.6.6',
      },
      {
        version: '0.8.24',
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },
  typechain: {
    externalArtifacts: ['uniswap-v1-build/**/*.json'],
  },
  dependencyCompiler: {
    paths: [
      '@safe-global/safe-contracts/contracts/Safe.sol',
      '@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol',
      'solmate/src/tokens/WETH.sol',
      '@uniswap/v2-core/contracts/UniswapV2Factory.sol',
      '@uniswap/v2-core/contracts/UniswapV2Pair.sol',
      '@uniswap/v2-periphery/contracts/UniswapV2Router02.sol',
    ],
  },
};

export default config;
