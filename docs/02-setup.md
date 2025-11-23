# Setup Guide

## Prerequisites

*   **Node.js**: v20 or higher.
*   **npm**: Installed with Node.js.
*   **Testnet Funds**:
    *   **ETH** (Sepolia or chosen network) for gas.
    *   **USDT** (or chosen ERC-20 token) for testing supply.

## Installation

1.  Clone the repository and navigate to the example directory:
    ```bash
    git clone <repo-url>
    cd wdk-wallet-evm/examples/ai-yield-guard
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the `examples/ai-yield-guard` directory. **Do not commit this file.**

```bash
# .env
AGENT_SEED_PHRASE="your twelve word mnemonic phrase here..."
RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
TOKEN_ADDRESS="0x..."      # Address of the ERC-20 token (e.g. USDT)
AAVE_POOL_ADDRESS="0x..."  # Address of the Aave V3 Pool contract
```

### Environment Variables Explained

*   `AGENT_SEED_PHRASE`: The BIP-39 mnemonic used to derive your wallet. The agent will use the account at index 0 (`m/44'/60'/0'/0/0`).
*   `RPC_URL`: A JSON-RPC endpoint for the blockchain network you are connecting to.
*   `TOKEN_ADDRESS`: The contract address of the asset you want to manage.
*   `AAVE_POOL_ADDRESS`: The main entry point for Aave V3 interactions on your chosen network.
