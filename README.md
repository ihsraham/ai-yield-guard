# AI Yield Guard: The Sovereign Financial Node

> "An autonomous, self-custodial financial agent designed for the machine economy."

In a future of trillions of AI agents, every digital entity needs a wallet. This project demonstrates a **Minimum Viable Autonomous Agent** that holds its own keys, mints its own identity (ERC-8004), and manages its own yield strategies.

Built with [@tetherto/wdk-wallet-evm](https://github.com/tetherto/wdk-wallet-evm).

## 🚀 Quick Links

| Resource | Description |
| :--- | :--- |
| [**Getting Started**](./docs/02-setup.md) | Setup guide, env configuration, and first run. |
| [**Architecture**](./docs/01-architecture.md) | System design, layers, and data flow diagrams. |
| [**System Flows**](./docs/06-flows.md) | Visual maps of Initialization, Decision, and Execution flows. |
| [**Troubleshooting**](./docs/07-troubleshooting.md) | Solutions for common errors (Error 51, RPC Timeout). |

To view the full documentation site locally:
```bash
npm run docs:serve
```

## 📦 Installation & Usage

### Option A: Run as a Tool (Recommended)
You can run the agent directly without cloning the repo if it were published to npm.
```bash
npx ai-yield-guard --watch
```

### Option B: Clone & Build
For developers who want to modify the source code.

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd ai-yield-guard
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your SEED_PHRASE and RPC_URL
   ```

3. **Run the Agent**
   ```bash
   # Manual Mode
   npm start

   # Watch Mode (Autonomous)
   npm start -- --watch --interval 60
   ```

### Future Vision (P2P)
In the future, this agent will be distributed via [Pear Runtime](https://pears.com) as a serverless, peer-to-peer application. See [Future Work](./docs/05-future-work.md) for details.

## 🛡️ Sovereign Features
*   **Self-Custody**: Keys never leave your device (WDK).
*   **Identity**: Mints an on-chain ID via ERC-8004.
*   **Robustness**: Checks Supply Caps and Allowances off-chain to prevent failed transactions.