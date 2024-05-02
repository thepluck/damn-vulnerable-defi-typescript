import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },
  typechain: {
    externalArtifacts: ['external-artifacts/**/*.json'],
  },
};

export default config;
