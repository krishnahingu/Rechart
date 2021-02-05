import { ethers } from 'ethers'
import { connect } from './providers'
import { contracts } from './constants'

const [, , wallet] = connect()
const abi = ['function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)']

export const getTfiPrice = async() => {
    const uniswapTfi = new ethers.Contract(contracts.uniswapTusdTfi, abi, wallet)
    const reserves = await uniswapTfi.getReserves()
    const price = reserves["_reserve0"]/reserves["_reserve1"]
    const poolValue = (reserves["_reserve0"]/1e18+reserves["_reserve1"]/1e18)*price
    return {price:price,poolValue:poolValue}
}

export const getTruPrice = async() => {
    const uniswapEthTru = new ethers.Contract(contracts.uniswapEthTru, abi, wallet)
    const reserves = await uniswapEthTru.getReserves()
    const res0 = reserves["_reserve0"]/1e8
    const res1 = reserves["_reserve1"]/1e18
    const priceInEth = res1/res0
    const ethPrice = await getEthPrice()
    const priceInUsd = priceInEth*ethPrice
    const poolValue = res0*priceInUsd+res1*ethPrice
    return {priceInEth : priceInEth,
            priceInUsd : priceInUsd,
            poolValue : poolValue}
}

export const getEthPrice = async() => {
    const uniswapEthUsdc = new ethers.Contract(contracts.uniswapEthUsdc, abi, wallet)
    const reserves = await uniswapEthUsdc.getReserves()
    const res0 = reserves["_reserve0"]/1e6
    const res1 = reserves["_reserve1"]/1e18
    const price = res0/res1
    return price;
}
