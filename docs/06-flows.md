# System Flows: The Map

This document maps the lifecycle of the Sovereign Financial Node, from initialization to execution.

## 1. Initialization Flow
**Goal**: Establish a secure, identity-aware environment before any financial action.

```mermaid
graph LR
    A[Start] --> B["Load Env & Config"]
    B --> C["Initialize WDK Wallet"]
    C --> D["Connect to Aave V3"]
    D --> E{"Check Identity"}
    E -- Not Registered --> F["Prompt Mint (ERC-8004)"]
    E -- Registered --> G[Ready]
    F --> G
```

**Why this flow?**
*   **WDK First**: We establish self-custody immediately.
*   **Identity Check**: We verify on-chain status (ERC-8004) to ensure the agent is a "citizen" of the protocol ecosystem.

## 2. Decision Flow (The "Brain")
**Goal**: Determine the optimal action without risking funds.

```mermaid
sequenceDiagram
    participant Agent
    participant Aave
    participant Engine

    Agent->>Aave: Get Wallet Balance
    Agent->>Aave: Get Protocol Position
    Agent->>Aave: "Get Supply Caps (Error 51 Check)"
    
    Agent->>Engine: "decideIntent(balances, caps)"
    Note over Engine: "Pure Logic (No Side Effects)"
    Engine-->>Agent: "Intent (Supply/Withdraw/None)"
```

**Why this flow?**
*   **Off-Chain Intelligence**: We fetch data *first*, then reason about it offline. This saves gas and prevents failed transactions.
*   **Supply Cap Check**: We explicitly check Aave's supply caps to avoid "Error 51" reverts.

## 3. Execution Flow (The "Hands")
**Goal**: Execute the intent trustlessly.

```mermaid
sequenceDiagram
    participant Agent
    participant Wallet
    participant Blockchain

    alt Intent = Supply
        Agent->>Wallet: Check Allowance
        opt Allowance < Amount
            Agent->>Wallet: Sign & Broadcast Approve
            Wallet->>Blockchain: Approve Tx
            Blockchain-->>Agent: Confirmed
        end
        Agent->>Wallet: Sign & Broadcast Supply
        Wallet->>Blockchain: Supply Tx
    else Intent = Withdraw
        Agent->>Wallet: Sign & Broadcast Withdraw
        Wallet->>Blockchain: Withdraw Tx
    end
```

**Why this flow?**
*   **Optimistic Approval**: We only approve if the allowance is insufficient, saving gas on subsequent runs.
*   **WDK Signing**: The private key never leaves the `WalletService` memory space.
