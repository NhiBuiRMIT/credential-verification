# Decentralized Academic Credential Verification System
INTE264 Blockchain Technology Fundamentals — Assignment 3

## Overview
A decentralized application (DApp) built on Ethereum that allows educational institutions 
to issue tamper-proof academic credentials as Soulbound Tokens (SBTs) on-chain.

## Tech Stack
- **Smart Contract:** Solidity 0.8.28 + OpenZeppelin
- **Framework:** Hardhat 3
- **Blockchain:** Ethereum Sepolia Testnet
- **Frontend:** React + Ethers.js + MetaMask
- **Storage:** IPFS via Pinata

## Deployed Contract
- **Network:** Ethereum Sepolia Testnet
- **Contract Address:** `0xf2A4aB23Eaf3C041cd00d377F4505b313A0a3214`
- **Etherscan:** https://sepolia.etherscan.io/address/0xf2A4aB23Eaf3C041cd00d377F4505b313A0a3214

## Setup & Run

### Prerequisites
- Node.js v20+
- MetaMask wallet
- Sepolia testnet ETH

### Installation
```bash
npm install
```

### Run Tests
```bash
npx hardhat test
```

### Deploy to Sepolia
```bash
# Create .env file first (see .env.example)
npx hardhat run scripts/deploy.ts --network sepolia
```

## Project Structure
contracts/
CredentialSBT.sol     # Main smart contract
scripts/
deploy.ts             # Deployment script
test/
CredentialSBT.ts      # Test suite (15 tests)
frontend/               # React DApp (teammate)
## Smart Contract Functions
| Function | Access | Description |
|---|---|---|
| `issueCredential()` | Issuer | Mint SBT to graduate wallet |
| `verifyCredential()` | Public | Check credential validity on-chain |
| `revokeCredential()` | Issuer | Revoke an issued credential |
| `authorizeIssuer()` | Owner | Whitelist an institution |