![](cover.png)

# Damn Vulnerable DeFi - Typescript version <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/240px-Typescript_logo_2020.svg.png" width=34>

## Acknowledgements 🙏

*Thanks to [Tincho](https://twitter.com/tinchoabbate) for creating the original [Damn Vulnerable DeFi](damnvulnerabledefi.xyz).*

Damn Vulnerable DeFi is the wargame to learn offensive security of DeFi smart contracts in Ethereum.

Featuring flash loans, price oracles, governance, NFTs, DEXs, lending pools, smart contract wallets, timelocks, and more!

## How to play 🕹️

1. Visit [damnvulnerabledefi.xyz](https://damnvulnerabledefi.xyz) for challenges' descriptions.
2. Install [yarn](https://yarnpkg.com/getting-started/install) package manager.
3. Clone this repository and install dependencies.
```bash
git clone https://github.com/thepluck/damn-vulnerable-defi-typescript
cd damn-vulnerable-defi-typescript
yarn
```
4. Code your solution in the `[CHALLENGE_NAME].challenge.ts` file (inside each challenge's folder in the `test` folder).
5. Run the challenge. If the test is successful, you have passed the challenge!
```bash
yarn [CHALLENGE_NAME]
```

## Tips and tricks ✨
- To code the solutions, you may need to read [Ethers](https://docs.ethers.io/v6/) and [Hardhat](https://hardhat.org/docs) documentation.
- In all challenges you must use the account called player. In Ethers, that may translate to using [.connect(player)](https://docs.ethers.org/v6/api/contract/#BaseContract-connect).
- Some challenges require you to code and deploy custom smart contracts.

## Solutions
- Take a look at the [`solutions`](https://github.com/thepluck/damn-vulnerable-defi-typescript/tree/solutions) branch to see the solutions to all challenges.
