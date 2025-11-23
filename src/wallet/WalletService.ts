import WalletManagerEvm, { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'
import { Env } from '../config/env.js'

export class WalletService {
  private readonly manager: WalletManagerEvm
  private readonly account: WalletAccountEvm
  private readonly rpcUrl: string

  private constructor (manager: WalletManagerEvm, account: WalletAccountEvm, rpcUrl: string) {
    this.manager = manager
    this.account = account
    this.rpcUrl = rpcUrl
  }

  /**
       * Factory method to create a WalletService instance.
       * Initializes the WDK manager and derives the primary account (index 0).
       */
  static async create (env: Env): Promise<WalletService> {
    const manager = new WalletManagerEvm(env.AGENT_SEED_PHRASE, {
      provider: env.RPC_URL
    })

    // Derive the primary account at index 0 (m/44'/60'/0'/0/0)
    const account = await manager.getAccount(0)

    return new WalletService(manager, account, env.RPC_URL)
  }

  /**
       * Returns the EVM address of the primary account.
       */
  async getAddress (): Promise<string> {
    return this.account.getAddress()
  }

  /**
       * Returns the native token balance (ETH/MATIC/etc) in wei.
       */
  async getNativeBalance (): Promise<bigint> {
    return this.account.getBalance()
  }

  /**
       * Returns the balance of a specific ERC20 token in raw units.
       */
  async getErc20Balance (tokenAddress: string): Promise<bigint> {
    return this.account.getTokenBalance(tokenAddress)
  }

  /**
       * Sends a generic transaction.
       */
  async sendTransaction (tx: { to: string, data?: string, value?: bigint }): Promise<{ hash: string }> {
    const result = await this.account.sendTransaction({
      to: tx.to,
      value: tx.value ?? 0n,
      data: tx.data
    })
    return { hash: result.hash }
  }

  /**
       * Waits for a transaction to be mined.
       * Polls getTransactionReceipt every 2 seconds.
       */
  async waitForTransaction (hash: string): Promise<void> {
    let receipt: any = null
    while (receipt === null || receipt === undefined || receipt.status === 0) {
      receipt = await this.account.getTransactionReceipt(hash)
      if (receipt === null || receipt === undefined || receipt.status === 0) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }

  /**
   * Performs a read-only call to a contract.
   */
  async readContract (to: string, data: string): Promise<string> {
    const { JsonRpcProvider } = await import('ethers')
    const provider = new JsonRpcProvider(this.rpcUrl)
    return await provider.call({ to, data })
  }
}
