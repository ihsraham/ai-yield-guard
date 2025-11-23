# Running the Demo

## Running Tests

To verify the logic (configuration validation and agent decision rules), run:

```bash
npm test
```

## Running the Agent

To start the CLI agent:

```bash
npm start
```

### Example Scenarios

**1. Supply Action**
When your wallet has excess USDT:

```text
🤖 Agent-Driven Yield Guard CLI
===============================

📍 Wallet Address: 0x123...abc
💰 Wallet Token Balance: 50.0 USDT
🏦 Aave Token Balance:   0.0 aUSDT

🧠 Agent Intent:
   Action: SUPPLY
   Reason: Wallet balance (50000000) exceeds min idle (1000000) by more than min unit. Supplying excess.
   Amount: 49.0 USDT

❓ Proceed with SUPPLY? [y/N] y

🚀 Executing supply...
Checking allowance...
Approval sent: 0x...
✅ Transaction sent!
🔗 Hash: 0x...
```

**2. No Action Needed**
When balances are balanced:

```text
...
💰 Wallet Token Balance: 1.0 USDT
...

🧠 Agent Intent:
   Action: NONE
   Reason: Wallet balance is within optimal range. No action needed.

✅ No action required. Exiting.
```
