import { ethers } from 'ethers'
import { AaveV3BaseSepolia } from '@bgd-labs/aave-address-book'

const RPC = 'https://sepolia.base.org'

const DATA_PROVIDER_ABI = [
    'function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)',
    'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasury, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
    'function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)'
]

async function main() {
    console.log('Checking Base Sepolia Caps (Official)...')
    const provider = new ethers.JsonRpcProvider(RPC)

    const POOL = AaveV3BaseSepolia.POOL
    const USDC = AaveV3BaseSepolia.ASSETS.USDC.UNDERLYING
    const USDT = AaveV3BaseSepolia.ASSETS.USDT.UNDERLYING
    const DATA_PROVIDER = AaveV3BaseSepolia.AAVE_PROTOCOL_DATA_PROVIDER

    console.log(`Pool: ${POOL}`)
    console.log(`USDC: ${USDC}`)
    console.log(`USDT: ${USDT}`)
    console.log(`DataProvider: ${DATA_PROVIDER}`)

    const dataProvider = new ethers.Contract(DATA_PROVIDER, DATA_PROVIDER_ABI, provider)

    async function checkAsset(name: string, address: string) {
        console.log(`\nChecking ${name} (${address})...`)
        try {
            const caps = await dataProvider.getReserveCaps(address)
            const data = await dataProvider.getReserveData(address)
            const tokens = await dataProvider.getReserveTokensAddresses(address)

            const supplyCap = caps.supplyCap
            const totalSupplied = data.totalAToken
            const aTokenAddress = tokens.aTokenAddress

            console.log(`aToken Address: ${aTokenAddress}`)

            const supplyCapWei = supplyCap * 10n ** 6n // Assuming 6 decimals

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
            console.log(`Error checking ${name}:`, e.message)
        }
    }

    await checkAsset('USDC', USDC)
    await checkAsset('USDT', USDT)
}

main()
