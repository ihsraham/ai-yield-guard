# Building Step-by-Step

This guide walks through the implementation of the Agent-Driven Yield Guard.

## 1. Wallet Layer (`src/wallet/WalletService.ts`)

We wrap the `wdk-wallet-evm` library to provide a clean interface for our application. This service handles initialization and transaction signing.

```typescript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

export class WalletService {
  // ...
  static async create (env: Env): Promise<WalletService> {
    const manager = new WalletManagerEvm(env.AGENT_SEED_PHRASE, {
      provider: env.RPC_URL
    })
    const account = await manager.getAccount(0)
    return new WalletService(manager, account)
  }

  async sendTransaction (tx: { to: string; data?: string; value?: bigint }) {
    // Delegates to WDK's account.sendTransaction
    return await this.account.sendTransaction({
      to: tx.to,
      value: tx.value ?? 0n,
      data: tx.data
    })
  }
}
```

## 2. DeFi Layer (`src/defi/AaveClient.ts`)

This layer interacts with the Aave V3 protocol. It uses `ethers.Interface` to encode function calls (`supply`, `withdraw`) and sends them via the `WalletService`.

```typescript
// Minimal ABI definition
const AAVE_POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)'
]

export class AaveClient {
  // ...
  async supply (amount: bigint): Promise<string> {
    // 1. Approve if needed
    const approveHash = await this.approveIfNeeded(amount)
    if (approveHash !== null) {
      await this.wallet.waitForTransaction(approveHash)
    }

    // 2. Encode Supply Call
    const data = this.poolInterface.encodeFunctionData('supply', [
      this.tokenAddress,
      amount,
      await this.wallet.getAddress(),
      0
    ])

    // 3. Send Transaction
    const { hash } = await this.wallet.sendTransaction({
      to: this.poolAddress,
      data,
      value: 0n
    })
    return hash
  }
}
```

## 3. Agent Layer (`src/agent/`)

The agent logic is split into a **pure decision engine** and a **service**.

**Engine (`AgentIntentEngine.ts`)**:
Contains the deterministic rules. It takes balances as input and returns an `AgentIntent`.

```typescript
export function decideIntent (params: DecisionParams): AgentIntent {
  if (params.walletTokenBalance > params.minIdleBalance + params.minSupplyUnit) {
    return { action: 'supply', amount: ..., reason: '...' }
  }
  // ... other rules
}
```

**Service (`AgentService.ts`)**:
Fetches real data and calls the engine.

## 4. CLI (`src/cli/runAgent.ts`)

The entry point ties everything together. It initializes the services, fetches state, gets the agent's intent, and prompts the user for confirmation.

```typescript
// ...
const intent = await getAgentIntent({ ... })
console.log(`Proposed Action: ${intent.action}`)

const answer = await promptUser('Proceed? [y/N] ')
if (answer === 'y') {
  // Execute action
}
```
