import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'hardhat-spdx-license-identifier';

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
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  }
};

export default config;
