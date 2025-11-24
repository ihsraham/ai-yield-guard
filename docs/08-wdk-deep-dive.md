# WDK Deep Dive: Under the Hood

> "Sovereignty is not a feature; it's the architecture."

This document explains exactly how the **WDK (Wallet Development Kit)** turns your 12-word seed phrase into a usable Ethereum address. Understanding this process is key to trusting the "Sovereign Financial Node" model.

## 1. The Seed (BIP-39)
Everything starts with your **Seed Phrase**. This is a human-readable representation of a massive random number.

*   **Standard**: [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
*   **Input**: 12 words (e.g., `wolf gadget...`)
*   **Process**: The words are hashed (PBKDF2) to generate a binary **Seed**.
*   **Code**:
    ```javascript
    // src/wallet-account-evm.js
    import * as bip39 from 'bip39'

    if (!bip39.validateMnemonic(seed)) {
      throw new Error('The seed phrase is invalid.')
    }
    seed = bip39.mnemonicToSeedSync(seed)
    ```

## 2. The Path (BIP-44)
From that single binary seed, we can derive infinite accounts using a "Derivation Path". WDK follows the standard Ethereum path.

*   **Standard**: [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
*   **Prefix**: `m/44'/60'` (Purpose: 44, Coin Type: 60 for ETH)
*   **Full Path**: `m/44'/60'/0'/0/0` (Account 0, Change 0, Address 0)

**How WDK constructs it:**
The `WalletManagerEvm` handles the path construction automatically.

```javascript
// src/wallet-manager-evm.js
async getAccount (index = 0) {
  // Appends the specific account index to the prefix
  return await this.getAccountByPath(`0'/0/${index}`)
}
```

```javascript
// src/wallet-account-evm.js
const BIP_44_ETH_DERIVATION_PATH_PREFIX = "m/44'/60'"

// ... inside constructor ...
path = BIP_44_ETH_DERIVATION_PATH_PREFIX + '/' + path
// Result: m/44'/60'/0'/0/0
```

## 3. The Derivation (HD Wallet)
Once the path is defined, WDK uses a **Hierarchical Deterministic (HD)** algorithm to derive the private key and address.

*   **Engine**: `ethers.js` (via `MemorySafeHDNodeWallet`)
*   **Result**: A `WalletAccountEvm` instance containing the private key in memory.

```javascript
// src/wallet-account-evm.js
const account = MemorySafeHDNodeWallet.fromSeed(seed)
  .derivePath(path)

this._account = account
```

## 4. Why This Matters for Sovereignty
This architecture ensures that your agent is **truly sovereign**:

1.  **No External Dependencies**: The address generation is pure math. It doesn't ask a server "what is my address?".
2.  **Portable**: You can take your seed phrase to Metamask, Ledger, or any other BIP-39/44 compliant wallet, and you will see the exact same address and funds.
3.  **Self-Contained**: The private key lives only in the memory of your running agent process. It is never saved to disk (unless you explicitly code it to) and never sent over the network.

## 5. Security Note
WDK uses a `MemorySafeHDNodeWallet` wrapper to handle sensitive key material, adding an extra layer of safety over raw buffer manipulation.

---
*This deep dive is based on the source code of `@tetherto/wdk-wallet-evm` v1.0.0.*
