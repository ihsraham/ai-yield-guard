import { ethers } from 'ethers'

const RPC = 'https://sepolia.base.org'

// User provided addresses
const POOL = '0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27'
const USDT = '0x0a215D8ba66387DCA84B284D18c3B4ec3de6E54a'
const aUSDT = '0xcE3CAae5Ed17A7AafCEEbc897DE843fA6CC0c018'

const POOL_ABI = [
    'function getAddressesProvider() view returns (address)',
    'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))'
]

const ADDRESS_PROVIDER_ABI = [
    'function getPoolDataProvider() view returns (address)'
]

const DATA_PROVIDER_ABI = [
    'function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)',
    'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasury, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)'
]

async function main() {
    console.log('Checking Base Sepolia Manual Addresses...')
    const provider = new ethers.JsonRpcProvider(RPC)

    try {
        // 1. Check Pool
        const pool = new ethers.Contract(POOL, POOL_ABI, provider)
        const addressProviderAddr = await pool.getAddressesProvider()
        console.log(`Pool AddressProvider: ${addressProviderAddr}`)

        // 2. Get DataProvider
        const addressProvider = new ethers.Contract(addressProviderAddr, ADDRESS_PROVIDER_ABI, provider)
        const dataProviderAddress = await addressProvider.getPoolDataProvider()
        console.log(`DataProvider: ${dataProviderAddress}`)

        // 3. Check USDT Caps
        const dataProvider = new ethers.Contract(dataProviderAddress, DATA_PROVIDER_ABI, provider)

        console.log(`Checking USDT: ${USDT}`)
        const caps = await dataProvider.getReserveCaps(USDT)
        const data = await dataProvider.getReserveData(USDT)

        const supplyCap = caps.supplyCap
        const totalSupplied = data.totalAToken

        // USDT has 6 decimals usually
        const supplyCapWei = supplyCap * 10n ** 6n

        console.log(`Supply Cap: ${supplyCap.toString()}`)
        console.log(`Total Supplied: ${totalSupplied.toString()}`)

        if (supplyCap > 0n && totalSupplied >= supplyCapWei) {
            console.log('❌ SUPPLY CAP EXCEEDED')
        } else {
            console.log('✅ CAP AVAILABLE')
            const remaining = supplyCapWei - totalSupplied
            console.log(`Remaining Capacity: ${remaining}`)
        }

    } catch (e) {
        console.log('Error:', e.message)
    }
}

main()
