import { ethers } from 'ethers'
import { connect } from './providers'
import { contracts } from './constants'

const [, provider, wallet] = connect()
const abi = ['function borrower() public view returns (address)',
                 'function getParameters() external view returns (uint256,uint256,uint256)',
                 'function profit() public view returns (address)',
                 'function status() public view returns (uint8)'
            ]
                
export const getAllLoanCreated = async () => {
    let logInfo = {
        address: contracts.loanFactory,
        topics: [ethers.utils.id('LoanTokenCreated(address)')],
        fromBlock: 0,
        toBlock: "latest"
      }
    
    let loans = []
    const statusType = ['Listed','','Withdrawn','Settled']
    const res = await provider.getLogs(logInfo)
    for(let i=0;i<res.length;i++){
        const loanTokenAddr = '0x' + res[i]['data'].substr(26,44)
        const loanToken = new ethers.Contract(loanTokenAddr, abi, wallet)
        const para = await loanToken.getParameters()
        loans.push({'borrower': await loanToken.borrower(), 
                    'amount': para[0]/1e18,
                    'apy': para[1]/1e2,
                    'term': para[2]/(60*60*24),
                    'profit': await loanToken.profit()/1e18,
                    'blockNumber' : res[i]['blockNumber'],
                    status : statusType[await loanToken.status()]
        })
    }
    return loans
}

export const getAllVoteEvent = async () => {
    let logInfo = {
        address: contracts.creditMarket,
        topics: [ethers.utils.id('Voted(address,address,bool,uint256)')],
        fromBlock: 0,
        toBlock: "latest"
      }
    let result = []
    const res = await provider.getLogs(logInfo)
    for(let i=0;i<res.length;i++){
        const blockNumber = res[i]['blockNumber']
        const staked = parseInt(res[i]['data'].substr(194,258),16)/1e8
        const loanId = '0x'+res[i]['data'].substr(26,40)
        const voter = '0x'+res[i]['data'].substr(90,91).substr(0,40)
        const vote = res[i]['data'].substr(192,193).substr(0,2)
        result.push({vote : (vote === '01')? 'YES':'NO',
                    staked : staked,
                    voter : voter,
                    loanId : loanId,
                    blockNumber : blockNumber
                    })
    }
    return result
}