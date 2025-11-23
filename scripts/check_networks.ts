import { ethers } from 'ethers'

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'
const ARBITRUM_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc'

const BASE_POOL_ADDRESS = '0x207ABAcEa9C55C6b18974aA179c5D0401b659B050'

const POOL_ABI = [
    'function getAddressesProvider() view returns (address)',
    'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))'
]

const ADDRESS_PROVIDER_ABI = [
    'function getPoolDataProvider() view returns (address)'
]

const DATA_PROVIDER_ABI = [
    'function getAllReservesTokens() view returns (tuple(string symbol, address tokenAddress)[])',
    'function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)',
    'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasury, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)'
]

async function checkNetworkFromPool(name: string, rpcUrl: string, poolAddress: string) {
    console.log(`\n--- Checking ${name} (via Pool) ---`)
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    try {
        const match = poolAddress.match(/(0x[a-fA-F0-9]{40})/)
        if (!match) throw new Error("Invalid address format")
        const safePoolAddr = ethers.getAddress(match[1].toLowerCase())
        console.log(`Pool Address: ${safePoolAddr}`)

        const pool = new ethers.Contract(safePoolAddr, POOL_ABI, provider)

        // 1. Get AddressProvider from Pool
        const addressProviderAddr = await pool.getAddressesProvider()
        console.log(`AddressProvider: ${addressProviderAddr}`)

        // 2. Get DataProvider from AddressProvider
        const addressProvider = new ethers.Contract(addressProviderAddr, ADDRESS_PROVIDER_ABI, provider)
        const dataProviderAddress = await addressProvider.getPoolDataProvider()
        console.log(`DataProvider: ${dataProviderAddress}`)

        // 3. Check Caps
        const dataProvider = new ethers.Contract(dataProviderAddress, DATA_PROVIDER_ABI, provider)
        const tokens = await dataProvider.getAllReservesTokens()
        console.log(`Found ${tokens.length} reserves.`)

        const USDT = tokens.find((t: any) => t.symbol === 'USDT' || t.symbol === 'USDbC')
        if (USDT) {
            console.log(`Found USDT: ${USDT.symbol} (${USDT.tokenAddress})`)
            const caps = await dataProvider.getReserveCaps(USDT.tokenAddress)
            const data = await dataProvider.getReserveData(USDT.tokenAddress)

            const supplyCap = caps.supplyCap
            const totalSupplied = data.totalAToken

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
        } else {
            console.log('❌ USDT not found in reserves')
        }

    } catch (e) {
        console.log(`Error checking ${name}:`, e.message)
    }
}

async function checkNetworkFromAddressProvider(name: string, rpcUrl: string, addressProviderAddr: string) {
    console.log(`\n--- Checking ${name} (via AddressProvider) ---`)
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    try {
        const match = addressProviderAddr.match(/(0x[a-fA-F0-9]{40})/)
        if (!match) throw new Error("Invalid address format")
        const safeAddr = ethers.getAddress(match[1].toLowerCase())
        console.log(`AddressProvider: ${safeAddr}`)

        const addressProvider = new ethers.Contract(safeAddr, ADDRESS_PROVIDER_ABI, provider)
        const dataProviderAddress = await addressProvider.getPoolDataProvider()
        console.log(`DataProvider: ${dataProviderAddress}`)

        const dataProvider = new ethers.Contract(dataProviderAddress, DATA_PROVIDER_ABI, provider)
        const tokens = await dataProvider.getAllReservesTokens()
        console.log(`Found ${tokens.length} reserves.`)

        const USDT = tokens.find((t: any) => t.symbol === 'USDT' || t.symbol === 'USDbC')
        if (USDT) {
            console.log(`Found USDT: ${USDT.symbol} (${USDT.tokenAddress})`)
            const caps = await dataProvider.getReserveCaps(USDT.tokenAddress)
            const data = await dataProvider.getReserveData(USDT.tokenAddress)

            const supplyCap = caps.supplyCap
            const totalSupplied = data.totalAToken

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
        } else {
            console.log('❌ USDT not found in reserves')
        }

    } catch (e) {
        console.log(`Error checking ${name}:`, e.message)
    }
}

async function main() {
    // await checkNetworkFromPool('Base Sepolia', BASE_SEPOLIA_RPC, BASE_POOL_ADDRESS)
    await checkNetworkFromPool('Arbitrum Sepolia', ARBITRUM_SEPOLIA_RPC, '0x57347a35b1d3d62337d1245037E90B0107fAA24a1f')
}

main()
