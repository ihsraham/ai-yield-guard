import { ethers } from 'ethers'

const RPC = 'https://sepolia.base.org'
const POOL = '0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27'
const USDT = '0x0a215D8ba66387DCA84B284D18c3B4ec3de6E54a'
const USER = '0x42c1f4Ab7233695eF5B7f2225DeC616cF2c15dbD'

const ERC20_ABI = [
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)'
]

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC)
    const token = new ethers.Contract(USDT, ERC20_ABI, provider)

    console.log(`Checking allowance for user ${USER}`)
    console.log(`Spender (Pool): ${POOL}`)
    console.log(`Token: ${USDT}`)

    const allowance = await token.allowance(USER, POOL)
    const balance = await token.balanceOf(USER)

    console.log(`Balance: ${balance.toString()}`)
    console.log(`Allowance: ${allowance.toString()}`)
}

main()
