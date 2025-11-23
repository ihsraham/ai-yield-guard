import { ethers } from 'ethers'

const RPC = 'https://sepolia.base.org'
const ADDR = '0x2f39d218133b52d8b884d34ad94e9e03cf4e9e'

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC)
    const safeAddr = ethers.getAddress(ADDR.toLowerCase())
    console.log('Checking', safeAddr)
    try {
        const code = await provider.getCode(safeAddr)
        console.log('Code length:', code.length)
        if (code === '0x') {
            console.log('❌ No code at address')
        } else {
            console.log('✅ Contract exists!')
        }
    } catch (e) {
        console.log('Error:', e.message)
    }
}

main()
