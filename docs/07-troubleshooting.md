# Troubleshooting: The Lifeboat

This guide addresses common issues you might encounter while running the AI Yield Guard.

## 1. "Error 51" (Supply Cap Exceeded)
**Symptom**: The transaction reverts with `Error 51` or the agent logs "Supply Cap Reached".
**Cause**: Aave V3 sets limits on how much of a specific asset can be supplied to the pool. On testnets like Sepolia, these caps are often low and fill up quickly.
**Solution**:
*   **Wait**: Other users may withdraw, opening up space.
*   **Switch Assets**: Configure the agent to use a different token (e.g., DAI instead of USDT) in `.env`.
*   **Autonomous Mode**: Run the agent in Watch Mode (`--watch`). It will automatically supply as soon as space becomes available.

## 2. RPC Timeout / Rate Limit
**Symptom**: `Error: 429 Too Many Requests` or connection timeouts.
**Cause**: The default public RPC URL (`https://sepolia.base.org`) has strict rate limits.
**Solution**:
1.  Get a free API key from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/).
2.  Update your `.env` file:
    ```bash
    RPC_URL="https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
    ```

## 3. Gas Estimation Failed
**Symptom**: `Error: cannot estimate gas; transaction may fail or may require manual gas limit`.
**Cause**: This usually means the transaction *will* revert on-chain. Common reasons:
*   **Zero ETH**: You have no ETH to pay for gas.
*   **Zero Balance**: You are trying to supply more tokens than you have.
*   **No Allowance**: The Aave Pool is not approved to spend your tokens (The agent handles this, but manual interference can break it).
**Solution**:
*   Check your wallet balance on [Base Sepolia Etherscan](https://sepolia.basescan.org/).
*   Use a faucet to get more ETH or Testnet Tokens.

## 4. "Identity Not Found"
**Symptom**: The agent prompts to mint an identity every time.
**Cause**: The transaction to register identity failed or hasn't propagated yet.
**Solution**:
*   Check the transaction hash provided in the logs on Etherscan.
*   Ensure you have enough ETH for the registration fee (gas).
