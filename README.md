# Alchemy Gelato NFT

## Summary

NFT powered by Stable diffusion AI & Web3 functions:

- Each user can mint 1 NFT
- A Web3 function is listening to every new mint and generate a new art using Stable Diffusion
- The NFT pic is published on IPFS and revealed on-chain via Gelato Web3 Fucntion

## How to run

1. Install project dependencies:

```
yarn install
```

2. Create a `.env` file with your private config:

```
cp .env.example .env
```

You will need to create free accounts and get Api Keys from [Stable Diffusion](https://stablediffusionapi.com/) and [Nft.Storage](https://nft.storage/)

## Deploy your smart contract and web3 function

```
yarn run deploy --network mumbai
```

## Verify

```
npx hardhat verify ContractAddr 0x2e4d6bec6cd616f71274fae0fbfaceb5188b55c2 --network mumbai
```

## Test W3F

```
npx hardhat w3f-run stable-diffusion-nft --logs
```

## Deploy W3F

```
npx hardhat w3f-deploy stable-diffusion-nft
```
