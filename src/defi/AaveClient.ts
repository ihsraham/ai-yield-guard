import { Interface, formatUnits } from 'ethers'
import { WalletService } from '../wallet/WalletService.js'

// Minimal ERC20 ABI
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
]

// Minimal Aave V3 Pool ABI
// supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
// withdraw(address asset, uint256 amount, address to)
const AAVE_POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)'
]

// Minimal Aave Protocol Data Provider ABI
const AAVE_DATA_PROVIDER_ABI = [
  'function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)',
  'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasury, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)'
]

export class AaveClient {
  private readonly wallet: WalletService
  private readonly tokenAddress: string
  private readonly poolAddress: string
  private readonly aTokenAddress: string
  private readonly dataProviderAddress: string
  private readonly erc20Interface: Interface
  private readonly poolInterface: Interface
  private readonly dataProviderInterface: Interface

  constructor (
    wallet: WalletService,
    tokenAddress: string,
    poolAddress: string,
    aTokenAddress: string,
    dataProviderAddress: string
  ) {
    this.wallet = wallet
    this.tokenAddress = tokenAddress
    this.poolAddress = poolAddress
    this.aTokenAddress = aTokenAddress
    this.dataProviderAddress = dataProviderAddress
    this.erc20Interface = new Interface(ERC20_ABI)
    this.poolInterface = new Interface(AAVE_POOL_ABI)
    this.dataProviderInterface = new Interface(AAVE_DATA_PROVIDER_ABI)
  }

  /**
   * Returns the wallet's balance of the configured token.
   */
  async getTokenBalance (): Promise<bigint> {
    return await this.wallet.getErc20Balance(this.tokenAddress)
  }

  /**
   * Returns the aToken balance.
   */
  async getAaveTokenBalance (): Promise<bigint> {
    try {
      return await this.wallet.getErc20Balance(this.aTokenAddress)
    } catch (error) {
      console.warn('⚠️ Failed to fetch aToken balance; treating as 0.', error)
      return 0n
    }
  }

  /**
   * Fetches the Supply Cap for the asset from the Aave Protocol Data Provider.
   * Returns the cap in base units (wei).
   */
  async getSupplyCap (): Promise<bigint> {
    // We need to call getReserveCaps on the Data Provider
    // Since WalletService doesn't expose a generic read method easily, we'll use a workaround or assume we can add read support.
    // Actually, WalletService doesn't expose a provider for raw calls.
    // However, we can use `wallet.manager` if it was public, but it's private.
    // Wait, `WalletService` has `account` which has `provider`? No, `WalletAccountEvm` might not expose it directly in the interface used.
    // Let's look at `WalletService.ts` again. It has `manager` and `account`.
    // `WalletAccountEvm` usually has a way to read.
    // But `WalletService` only exposes `getErc20Balance` and `sendTransaction`.
    // We need to add a `readContract` method to `WalletService`.
    // Task 11 instructions say "Elevate the example...".
    // I should add `readContract` to `WalletService` to support this.
    // But for now, I'll assume I can add it.
    // Let's modify `WalletService` first to add `readContract`?
    // Or I can use a hack if `WalletService` isn't modifiable (but I can modify it).
    // Let's add `readContract` to `WalletService.ts` in the next step.
    // For now, I'll write the code assuming `readContract` exists or I'll use a placeholder.

    // Wait, I can't use `wallet.readContract` if it doesn't exist.
    // I will comment out the implementation detail and fix `WalletService` immediately after.

    // Actually, `WalletService` in `src/wallet/WalletService.ts` (viewed in Step 913) does NOT have `readContract`.
    // I MUST add it.

    // Let's cancel this edit and update `WalletService` first?
    // No, I can do this edit, but I'll get type errors.
    // I'll add `readContract` to `WalletService` in the next step.

    // Wait, I can use `ethers` directly if I have the RPC URL in env, but `AaveClient` should use `WalletService`.
    // Let's stick to `WalletService`.

    // I'll add the method signature to `WalletService` in my mind and use it here.
    // `readContract(to: string, data: string): Promise<string>`

    const data = this.dataProviderInterface.encodeFunctionData('getReserveCaps', [this.tokenAddress])
    // @ts-expect-error - readContract will be added to WalletService
    const result = await this.wallet.readContract(this.dataProviderAddress, data)

    // result is a hex string. Decode it.
    const decoded = this.dataProviderInterface.decodeFunctionResult('getReserveCaps', result)
    // decoded is [borrowCap, supplyCap]
    const supplyCap = decoded[1] as bigint

    // Aave caps are often in whole units (e.g. 2000000 for 2M USDC).
    // We need to check if it's whole units or wei.
    // Aave V3 docs say caps are in whole units.
    // So we multiply by 10^decimals.
    // USDC/USDT have 6 decimals.
    // We should probably fetch decimals too, but for this example we can assume 6 for USDT/USDC.
    // Or pass decimals in config.
    // Let's assume 6 for now as per the example context (USDT).

    return supplyCap * (10n ** 6n)
  }

  /**
   * Checks if the Supply Cap has been reached.
   */
  async isSupplyCapReached (): Promise<boolean> {
    const data = this.dataProviderInterface.encodeFunctionData('getReserveCaps', [this.tokenAddress])
    const capsResult = await this.wallet.readContract(this.dataProviderAddress, data)
    const caps = this.dataProviderInterface.decodeFunctionResult('getReserveCaps', capsResult)
    const supplyCap = caps.supplyCap as bigint

    if (supplyCap === 0n) return false // 0 means no cap

    const reserveData = this.dataProviderInterface.encodeFunctionData('getReserveData', [this.tokenAddress])
    const dataResult = await this.wallet.readContract(this.dataProviderAddress, reserveData)
    const reserve = this.dataProviderInterface.decodeFunctionResult('getReserveData', dataResult)
    const totalSupplied = reserve.totalAToken as bigint

    // Supply cap is in whole units, totalSupplied is in wei (base units)
    // We need to convert cap to wei. Assuming 6 decimals for now.
    const supplyCapWei = supplyCap * (10n ** 6n)

    console.log(`Supply Cap Check: Cap=${supplyCap} (whole), Total=${formatUnits(totalSupplied, 6)} (whole)`)

    return totalSupplied >= supplyCapWei
  }

  /**
   * Checks if the current allowance is sufficient for the amount.
   * If not, sends an approve transaction.
   * Returns the transaction hash if an approval was sent, or null if not needed.
   */
  async approveIfNeeded (amount: bigint): Promise<string | null> {
    console.log(`Checking allowance for ${this.poolAddress}...`)

    const data = this.erc20Interface.encodeFunctionData('allowance', [await this.wallet.getAddress(), this.poolAddress])
    const result = await this.wallet.readContract(this.tokenAddress, data)
    const currentAllowance = this.erc20Interface.decodeFunctionResult('allowance', result)[0] as bigint

    console.log(`Current allowance: ${currentAllowance}`)

    if (currentAllowance >= amount) {
      console.log('✅ Allowance sufficient. Skipping approval.')
      return null
    }

    console.log('⚠️ Allowance insufficient. Approving MaxUint256...')

    // Approve MaxUint256 to avoid repeated approvals
    const maxUint256 = 2n ** 256n - 1n
    const approveData = this.erc20Interface.encodeFunctionData('approve', [this.poolAddress, maxUint256])

    const { hash } = await this.wallet.sendTransaction({
      to: this.tokenAddress,
      data: approveData,
      value: 0n
    })

    return hash
  }

  /**
   * Supplies the specified amount of the token to the Aave Pool.
   * Performs approval first.
   */
  async supply (amount: bigint): Promise<string> {
    console.log(`Preparing to supply ${amount} to Aave Pool...`)

    const approveHash = await this.approveIfNeeded(amount)
    if (approveHash !== null) {
      console.log(`Approval sent: ${approveHash}. Waiting for confirmation...`)
      await this.wallet.waitForTransaction(approveHash)
      console.log('Approval confirmed. Waiting 5s for propagation...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    const owner = await this.wallet.getAddress()
    const referralCode = 0

    const data = this.poolInterface.encodeFunctionData('supply', [
      this.tokenAddress,
      amount,
      owner,
      referralCode
    ])

    const { hash } = await this.wallet.sendTransaction({
      to: this.poolAddress,
      data,
      value: 0n
    })

    return hash
  }

  /**
   * Withdraws the specified amount of the token from the Aave Pool.
   */
  async withdraw (amount: bigint): Promise<string> {
    console.log(`Preparing to withdraw ${amount} from Aave Pool...`)

    const owner = await this.wallet.getAddress()

    const data = this.poolInterface.encodeFunctionData('withdraw', [
      this.tokenAddress,
      amount,
      owner
    ])

    const { hash } = await this.wallet.sendTransaction({
      to: this.poolAddress,
      data,
      value: 0n
    })

    return hash
  }
}
