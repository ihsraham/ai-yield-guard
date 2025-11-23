# Challenges and Resolutions Log

This document maintains a record of significant challenges, debugging steps, and resolutions encountered during the development of the `ai-yield-guard` example.

## CH-1: Supply Transaction Race Condition

- **Date**: 2025-11-22
- **Area**: `src/defi/AaveClient.ts`
- **Environment**: Sepolia Testnet

### Symptom
The `supply` transaction failed during gas estimation with a `CALL_EXCEPTION`. This occurred immediately after the `approve` transaction was sent.

### Investigation
- Observed that `approve` and `supply` were called in rapid succession.
- Suspected that the `approve` transaction was not yet mined when `supply` (which requires allowance) was simulated for gas estimation.
- Verified by adding a delay/wait.

### Root cause
Race condition: The `supply` transaction's gas estimation depends on the `approve` transaction being mined and the allowance being updated on-chain. Sending them back-to-back without waiting causes the estimation to fail.

### Solution or Workaround
- Implemented `waitForTransaction` in `WalletService` to poll for transaction receipts.
- Updated `AaveClient.supply` to await the `approve` transaction receipt before initiating the `supply` transaction.

### Status
Resolved

### Follow ups
- Implement a proper `getAllowance` check to avoid unnecessary approval transactions if allowance is already sufficient.

---

## CH-2: Incorrect Aave Pool Address (ERC20 Mismatch)

- **Date**: 2025-11-22
- **Area**: Configuration / `.env`
- **Environment**: Sepolia Testnet

### Symptom
Transactions failed with `CALL_EXCEPTION` when interacting with the configured `AAVE_POOL_ADDRESS`.

### Investigation
- Checked the address `0x1f8...` provided in `.env`.
- Found it was an ERC-20 token contract, not the Aave V3 Pool contract.

### Root cause
User configuration error: The user provided a token address instead of the Aave V3 Pool contract address.

### Solution or Workaround
- Updated `.env` with the correct Aave V3 Pool address for Sepolia (`0x8787...` at the time, later found to be empty/deprecated, see CH-4).

### Status
Resolved

---

## CH-3: Bad Address Checksum in Configuration

- **Date**: 2025-11-22
- **Area**: Configuration / `.env`
- **Environment**: Local / Sepolia

### Symptom
Application failed to start with a "bad address checksum" error from `ethers` or `zod` validation.

### Investigation
- The address `0x87870Bca...` in `.env` had mixed casing that did not match the EIP-55 checksum standard.

### Root cause
The address string was not properly checksummed.

### Solution or Workaround
- Regenerated the checksummed address using `ethers.getAddress()`.
- Updated `.env` with the valid checksummed address.

### Status
Resolved

---

## CH-4: Zero aToken Balance & "Ghost" Transactions

- **Date**: 2025-11-22
- **Area**: `src/defi/AaveClient.ts` / Configuration
- **Environment**: Sepolia Testnet

### Symptom
- `Aave Token Balance` remained `0.0` despite multiple "successful" supply transactions.
- Etherscan showed transactions to the Pool address with "0 ETH" value and NO ERC-20 transfer logs.
- `check_reserves.ts` script returned `BAD_DATA` (value="0x").

### Investigation
- Wrote `check_reserves.ts` to query `getReserveData`.
- Discovered `0x8787...` (the Pool address we were using) had NO CODE (empty account).
- Queried `PoolAddressesProvider` to find the official Pool address (`0x6Ae4...`).
- Checked reserves on the official pool: User's USDT (`0x1c7...`) was listed but inactive (no aToken). Faucet USDT (`0x94a9...`) was active.

### Root cause
Twofold:
1. We were sending transactions to an empty/deprecated address (`0x8787...`), so they didn't revert but did nothing.
2. The user's USDT token was not the active USDT asset for the Aave V3 Sepolia market.

### Solution or Workaround
- Updated `.env` with the official Pool address (`0x6Ae4...`).
- Updated `.env` to use Aave Faucet USDT (`0x94a9...`) and its corresponding aToken (`0x16dA...`).
- Advised user to acquire Faucet USDT.

### Status
Resolved

---

## CH-5: Ethers v6 Address Handling in Scripts

- **Date**: 2025-11-22
- **Area**: `check_caps.ts` script
- **Environment**: Local (Node.js)

### Symptom
Diagnostic script failed with `UNCONFIGURED_NAME` and `INVALID_ARGUMENT` errors when passing address strings to `ethers.Contract`.

### Investigation
- `ethers` v6 seems strict about address formatting or context when passed directly.
- Tried passing the string directly -> `UNCONFIGURED_NAME`.
- Tried `ethers.getAddress()` -> `INVALID_ARGUMENT` (likely due to hidden char or casing issue in copy-paste).

### Root cause
Likely a combination of `ethers` v6 strictness and a potential copy-paste artifact (invisible character) or casing mismatch in the hardcoded address string.

### Solution or Workaround
- Implemented robust address handling: `ethers.getAddress(ADDRESS.toLowerCase())`.
- Switched to dynamically fetching the `AaveProtocolDataProvider` address from the `PoolAddressesProvider` to ensure correctness and avoid hardcoding errors.

### Status
Resolved

---

## CH-6: Supply Cap Exceeded (Error 51)

- **Date**: 2025-11-22
- **Area**: `examples/ai-yield-guard`
- **Environment**: Sepolia Testnet

### Symptom
Supply transactions failing with `execution reverted: "51"`.

### Investigation
- Identified Error 51 as "Supply Cap Exceeded" via documentation.
- Wrote `check_caps.ts` to query `AaveProtocolDataProvider`.
- Confirmed that Supply Caps for USDT, DAI, and USDT on Sepolia are all 100% utilized (e.g., USDT Cap 2B, Supplied >2B).

### Root cause
External protocol limitation: The Aave V3 Sepolia testnet pools for major stablecoins are full.

### Solution or Workaround
- **Fix implemented**: Switched the AI Yield Guard example from Ethereum Sepolia to **Base Sepolia USDT** using the official Aave V3 Base Sepolia pool + aUSDT addresses (see current `.env` for exact values).
- **Result**:
    - First run on Base Sepolia successfully SUPPLY’d `1.0 USDT` (wallet 2.0 → 1.0, aUSDT 0 → ~1.0).
    - Second run showed `Action: NONE` with wallet balance `1.0 USDT` and Aave balance `~1.0 aUSDT`, confirming the policy and on-chain flow behave as expected.

### Behavior validation
We validated the full SUPPLY → WITHDRAW → NONE loop on Aave V3 Base Sepolia using USDT:
- **Initial run**: wallet 2.0 USDT, Aave 0 → **SUPPLY** 1.0 USDT, ending at wallet 1.0, Aave ~1.0.
- **After raising MIN_IDLE_BALANCE** from 1.0 to 1.1 USDT, next run: wallet 1.0, Aave ~1.0 → **WITHDRAW** 0.1 USDT, ending at wallet 1.1, Aave ~0.9.
- **Final run**: wallet 1.1, Aave ~0.9 → **Action NONE**, since wallet is within the idle band.

Note that this gives us clean examples of all three agent intents (SUPPLY, WITHDRAW, NONE) for use in the written guide and video walkthrough.

### Status
Resolved

### If this happens again
1. Check Aave V3 pool caps for the chosen asset/network in the official Aave UI.
2. If the cap is full, either:
    - Switch to another supported test network (e.g. Base Sepolia / Arbitrum Sepolia), or
    - Switch to another asset on the same network whose supply cap is not exhausted.

---

---

## CH-7: Identity Registry Integration (ERC-8004)

- **Date**: 2025-11-23
- **Area**: `src/agent/IdentityClient.ts`
- **Environment**: Base Sepolia

### Symptom
The agent needed a way to prove its identity on-chain to align with the "Sovereign Financial Node" narrative, but no standard existed in the initial codebase.

### Investigation
- Researched ERC-8004 (Smart Agent Standard).
- Located the Base Sepolia Registry: `0x8004AA63c570c570eBF15376c0dB199918BFe9Fb`.

### Root cause
Missing feature: The agent was anonymous.

### Solution or Workaround
- Implemented `IdentityClient` to interact with the registry.
- Added a check at startup: `balanceOf(agentAddress) > 0`.
- Added a registration flow: `register(metadata)`.
- **Result**: The agent now mints an NFT upon first run, establishing on-chain provenance.

### Status
Resolved

---

## CH-8: Watch Mode Logic & Locking

- **Date**: 2025-11-23
- **Area**: `src/cli/runAgent.ts`
- **Environment**: Local CLI

### Symptom
The agent was a "one-shot" script. To be a true "Node", it needed to run continuously, but simple loops risk overlapping transactions if the network is slow.

### Investigation
- `setInterval` fires regardless of whether the previous callback finished.
- If a transaction takes 45s and the interval is 30s, the next cycle starts, potentially trying to spend the same nonce.

### Root cause
Concurrency model of `setInterval` vs async transactions.

### Solution or Workaround
- Refactored `main` into `runCycle`.
- Implemented a `isRunning` lock (boolean flag).
- If `isRunning` is true, the new interval tick is skipped with a warning log.
- **Result**: Robust, non-overlapping autonomous execution.

### Status
Resolved
