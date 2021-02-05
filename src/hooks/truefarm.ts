import { ethers } from 'ethers'
import { contracts } from './constants'
import { connect } from './providers'
import {getTruPrice, getTfiPrice} from './price'


const [, , wallet] = connect()
const abi = ['function totalFarmRewards() public view returns (uint256)',
            'function totalStaked() public view returns (uint256)',
            'function totalClaimedRewards() public view returns (uint256)']

export const getAPY = async () => {
    let APYs = []
    const pools = [ {name: 'TFI-LP',address: contracts.trueFarmTfi,dailyDistribution:17113800000000},
                    {name: 'UNI-ETH/TRU',address: contracts.trueFarmUniEth,dailyDistribution:20216600000000},
                    {name: 'UNI-TUSD/TFI',address: contracts.trueFarmUniTfi,dailyDistribution:15669000000000}]

    for(let i=0;i<pools.length;i++){
        const truefarm = new ethers.Contract(pools[i]['address'], abi, wallet)
        const totalFarmRewards = await truefarm.totalFarmRewards()/1e30/1e8
        const totalClaimedRewards = await truefarm.totalClaimedRewards()/1e8
        let totalStakedValue = 0

        switch (i) {
            case 0:
                totalStakedValue = (await truefarm.totalStaked()/1e18)*(await getTfiPrice()).price
                break
            case 1:
                totalStakedValue = (await getTruPrice()).poolValue
                break
            case 2:
                totalStakedValue = (await getTfiPrice()).poolValue
                break
        }
    
        const annualTruRewardValue = pools[i].dailyDistribution*365*0.14/1e8
        const APY = annualTruRewardValue/totalStakedValue*100
        const dailyRate = APY/365
        const weeklyRate = dailyRate*7

        APYs.push({'pool':pools[i]['name'],'dailyRate':dailyRate,'weeklyRate':weeklyRate,'APY':APY,'totalFarmRewards':totalFarmRewards,totalStakedValue:totalStakedValue,'totalClaimedRewards':totalClaimedRewards})
    }
    return APYs
}



