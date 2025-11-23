import { Interface } from 'ethers'
import { WalletService } from '../wallet/WalletService.js'

// Minimal ERC-8004 Registry ABI
// register(string tokenURI) external returns (uint256)
// balanceOf(address owner) view returns (uint256)
const REGISTRY_ABI = [
  'function register(string tokenURI) external returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)'
]

export class IdentityClient {
  private readonly wallet: WalletService
  private readonly registryAddress: string
  private readonly registryInterface: Interface

  constructor (wallet: WalletService, registryAddress: string) {
    this.wallet = wallet
    this.registryAddress = registryAddress
    this.registryInterface = new Interface(REGISTRY_ABI)
  }

  /**
       * Checks if the current wallet address is already registered.
       * Returns true if registered (balance > 0), false otherwise.
       */
  async checkRegistration (): Promise<boolean> {
    try {
      const owner = await this.wallet.getAddress()
      const data = this.registryInterface.encodeFunctionData('balanceOf', [owner])
      const result = await this.wallet.readContract(this.registryAddress, data)
      const balance = this.registryInterface.decodeFunctionResult('balanceOf', result)[0] as bigint
      return balance > 0n
    } catch (error) {
      console.warn('⚠️ Failed to check registration status:', error)
      return false
    }
  }

  /**
       * Registers the agent with the given name.
       * Creates a simple data URI for metadata.
       */
  async register (agentName: string): Promise<string> {
    console.log(`Preparing to register agent "${agentName}"...`)

    // Create simple metadata
    const metadata = {
      name: agentName,
      description: 'AI Yield Guard Agent',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzRCAFMyIiAvPjwvc3ZnPg==' // Simple blue circle
    }

    const metadataString = JSON.stringify(metadata)
    // Encode as data URI
    const tokenURI = `data:application/json;base64,${Buffer.from(metadataString).toString('base64')}`

    const data = this.registryInterface.encodeFunctionData('register', [tokenURI])

    const { hash } = await this.wallet.sendTransaction({
      to: this.registryAddress,
      data,
      value: 0n
    })

    return hash
  }
}
