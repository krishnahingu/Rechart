import { ethers } from 'ethers'
import { connect } from './providers'
import { contracts } from './constants'

const [, , wallet] = connect()
const abi = ['function totalSupply() public view returns (uint256)','function distributed() public view returns (uint256)']
const TrustToken = new ethers.Contract(contracts.tru, abi, wallet)

export const getTruStat = async () => {
    const supply = await TrustToken.totalSupply()/1e8
    const MAX_SUPPLY = 1450000000
    const burned = MAX_SUPPLY - supply
    let distributed = 0
    const linearDistributors = [
        contracts.tfiLpDistributor,
        contracts.uniTusdTfiDistributor,
        contracts.uniEthTruDistributor,
        contracts.balBalTruDistributor,
    ]
    for(let i = 0; i < linearDistributors.length; i++) {
        const distributor = new ethers.Contract(linearDistributors[i], abi, wallet)
        distributed += await distributor.distributed()/1e8
    }
    return {'supply' : supply,
            'burned' : burned,
            'distributed' : distributed
        }
}
