import { ethers } from 'ethers'
import { connect } from './providers'
import { contracts } from './constants'

const [, provider, wallet] = connect()
const abi = ['function totalSupply() public view returns (uint256)','function poolValue() public view returns (uint256)','event Borrow(address borrower, uint256 amount, uint256 fee)']
const tusdAbi = ["event Transfer(address indexed src, address indexed dst, uint val)",'event Funded(address indexed loanToken, uint256 amount)','function totalSupply() public view returns (uint256)','event LoanTokenCreated(address contractAddress)']
const curveGaugeAbi = ['event Deposit(address indexed provider, uint256 value)','event Withdraw(address indexed provider, uint256 value)']
const tfi = new ethers.Contract(contracts.tfi, abi, wallet) 
const tusd = new ethers.Contract(contracts.tusd, tusdAbi, wallet) 
const curveGauge = new ethers.Contract(contracts.curveGauge, curveGaugeAbi, wallet) 
const loan1 = new ethers.Contract(contracts.loan1, tusdAbi, wallet) 
const loan2 = new ethers.Contract(contracts.loan2, tusdAbi, wallet) 
const lender = new ethers.Contract(contracts.lender, tusdAbi, wallet) 

export const getTfiTotalSupply = async () => {
    return await tfi.totalSupply()/1e18
}

export const getPoolValue = async () => {
    return await tfi.poolValue()/1e18
}


const getEventsHelper = async (topic:string,index:number) => {
    let result = []
    let total = 0
    const logInfo = {address: contracts.tfi, topics:[ethers.utils.id(topic)], fromBlock: 0, toBlock: "latest"}    
    const res = await provider.getLogs(logInfo)
    for(let i=0;i<res.length;i++){
        const value = parseInt(res[i]['data'].substr(2+64*index,64),16)/1e18
        const valueNum = Number(value.toFixed(0))
        // if(topic === '1Joined(address,uint256,uint256)'){
        //     console.log('default value: ' + value)
        //     console.log('1:' + parseInt(res[i]['data'].substr(2,64),16)/1e18)
        //     console.log('2:' + parseInt(res[i]['data'].substr(66,64),16)/1e18)
        //     console.log('3:' + parseInt(res[i]['data'].substr(129,64),16)/1e18)
        //     console.log('topics:'+res[i].topics)
        // }
        total += valueNum
        result.push({total: total,
                    marginChange: valueNum,
                    blockNumber: res[i]['blockNumber']})
    }
    return result
}
const mergeArray = (array: any[]) => {
    
    array.sort((a,b) => (a.blockNumber > b.blockNumber) ? 1 : ((b.blockNumber > a.blockNumber) ? -1 : 0)); 
    for(let i=1;i<array.length;i++){
        array[i].total = array[i-1].total + array[i].marginChange
        if(array[i].blockNumber === array[i-1].blockNumber){
            array.splice(i-1,1)
            i--
        }
    }
    return array
}

export const getPoolJoined = async () => {
    return getEventsHelper('Joined(address,uint256,uint256)',0)
}
export const getPoolExited = async () => {
    const array = await getEventsHelper('Exited(address,uint256)',0)
    array.forEach(element => {
      element.marginChange *= -1                       //turn into nagative value
    })
    return array
}

export const getFlushed = async () => {
    return getEventsHelper('Flushed(uint256)',0)
}

export const getPulled = async () => {
    const array = await getEventsHelper('Pulled(uint256)',0)
    array.forEach(element => {
        element.marginChange *= -1                       //turn into nagative value
      })
    return array
}

export const getPoolChart = async () => {
    const array = [...await getPoolJoined(),...await getPoolExited()]
    return mergeArray(array)
}

export const getNetCurve = async () => {
    const array = [...await getFlushed(),...await getPulled()]
    return mergeArray(array)
}

export const getCombined = async () => {
    const pool = await getPoolChart()
    const curve = await getNetCurve()

    return [...pool,...curve]

}


const processArray = (array: any[], name: string) => {
    let newArray = []
    for(let i=1;i<array.length;i++){
        newArray.push({data:{name:name,balance:array[i].total.toFixed(0)},blockNumber:array[i].blockNumber})
    }
    return newArray
}

const mergeArrayNew = (array: any[]) => {
    let newArray:any = []
    array.sort((a,b) => (a.blockNumber > b.blockNumber) ? 1 : ((b.blockNumber > a.blockNumber) ? -1 : 0)); 
    if(array[0].data.name === 'TUSD'){
        newArray[0] = {TUSD:array[0].data.balance,yCRV:0,Loan1:0,Loan2:0,blockNumber:array[0].blockNumber}
    }else if(array[0].data.name === 'yCRV'){
        newArray[0] = {TUSD:0,yCRV:array[0].data.balance,Loan1:0,Loan2:0,blockNumber:array[0].blockNumber}
    }else if(array[0].data.name === 'Loan1'){
        newArray[0] = {TUSD:0,yCRV:0,Loan1:array[0].data.balance,Loan2:0,blockNumber:array[0].blockNumber}
    }
    else{
        newArray[0] = {TUSD:0,yCRV:0,Loan1:0,Loan2:array[0].data.balance,blockNumber:array[0].blockNumber}
    }
    
    for(let i=1;i<array.length;i++){
        if(array[i].data.name === 'TUSD'){
            newArray.push({TUSD:array[i].data.balance,yCRV:newArray[i-1].yCRV,Loan1:newArray[i-1].Loan1,Loan2:newArray[i-1].Loan2,blockNumber:array[i].blockNumber})
        }
        if(array[i].data.name === 'yCRV'){
            newArray.push({TUSD:newArray[i-1].TUSD,yCRV:array[i].data.balance,Loan1:newArray[i-1].Loan1,Loan2:newArray[i-1].Loan2,blockNumber:array[i].blockNumber})
        }
        if(array[i].data.name === 'Loan1'){
            newArray.push({TUSD:newArray[i-1].TUSD,yCRV:newArray[i-1].yCRV,Loan1:array[i].data.balance,Loan2:newArray[i-1].Loan2,blockNumber:array[i].blockNumber})
        }
        if(array[i].data.name === 'Loan2'){
            newArray.push({TUSD:newArray[i-1].TUSD,yCRV:newArray[i-1].yCRV,Loan1:newArray[i-1].Loan1,Loan2:array[i].data.balance,blockNumber:array[i].blockNumber})
        }
    }
    
    return newArray
}

export const TusdHistoricalBal = async () => {

    
    const tusdOutFilter = {address: contracts.tusd, topics:tusd.filters.Transfer(contracts.tfi).topics, fromBlock: 0, toBlock: "latest"}    
    const tusdInFilter = {address: contracts.tusd, topics:tusd.filters.Transfer(null,contracts.tfi).topics, fromBlock: 0, toBlock: "latest"}    

    const curveOutFilter = {address: contracts.curveGauge, topics:curveGauge.filters.Withdraw(contracts.tfi).topics, fromBlock: 0, toBlock: "latest"}    
    const curveInFilter = {address: contracts.curveGauge, topics:curveGauge.filters.Deposit(contracts.tfi).topics, fromBlock: 0, toBlock: "latest"}

    const loan1OutFilter = {address: contracts.loan1, topics:loan1.filters.Transfer(contracts.lender).topics, fromBlock: 0, toBlock: "latest"}    
    const loan1InFilter = {address: contracts.loan1, topics:loan1.filters.Transfer(null,contracts.lender).topics, fromBlock: 0, toBlock: "latest"}

    const loan2OutFilter = {address: contracts.loan2, topics:loan2.filters.Transfer(contracts.lender).topics, fromBlock: 0, toBlock: "latest"}    
    const loan2InFilter = {address: contracts.loan2, topics:loan2.filters.Transfer(null,contracts.lender).topics, fromBlock: 0, toBlock: "latest"}

    const tusdArray = mergeArray([...await eventHelper(tusdOutFilter,-1),...await eventHelper(tusdInFilter,1)])
    const curveArray = mergeArray([...await eventHelper(curveOutFilter,-1),...await eventHelper(curveInFilter,1)])
    const loan1Array = mergeArray([...await loanTokenHelper(contracts.loan1),...await eventHelper(loan1OutFilter,-1),...await eventHelper(loan1InFilter,1)])
    const loan2Array = mergeArray([...await loanTokenHelper(contracts.loan2),...await eventHelper(loan2OutFilter,-1),...await eventHelper(loan2InFilter,1)])
    
    const combined = mergeArrayNew([...processArray(tusdArray,'TUSD'),...processArray(curveArray,'yCRV'),...processArray(loan1Array,'Loan1'),...processArray(loan2Array,'Loan2')])


    return combined
}

const eventHelper = async (filter: ethers.providers.Filter, sign:number) => {
    let result: { total: number; marginChange: number; blockNumber: number }[] = []
    await provider.getLogs(filter).then(res => {
        for(let i=0;i<res.length;i++){
            const value = parseInt(res[i]['data'].substr(2,64),16)/1e18
            result.push({total: 0,
                        marginChange: value*sign,
                        blockNumber: res[i]['blockNumber']})
        }
    })
    
    return result
}

const loanTokenHelper = async(address:string) => {

    let result: { total: number; marginChange: number; blockNumber: number }[] = []
    const loanContract = new ethers.Contract(address, tusdAbi, wallet) 
    const value = await loanContract.totalSupply()/1e18
    await provider.getLogs({address: contracts.lender, topics:lender.filters.Funded(address).topics, fromBlock: 0, toBlock: "latest"}).then(res => {
            result.push({total: 0,marginChange: value,blockNumber: res[0]['blockNumber']})
    })
    return result
}


// export const loanTokenFinder = async() => {
//     let result:string[] = []
    
//     await provider.getLogs({address: contracts.loanFactory, topics:lender.filters.LoanTokenCreated().topics, fromBlock: 0, toBlock: "latest"}).then(res => {
//         res.map(res => {
//             const addr = '0x'+res['data'].substr(2+24,40)
//             result.push(addr)
//         })
//     })
//     return result
// }

// export const loanTokenBal = async() => {
//     let loanTokenArray: { [x: number]: any; blockNumber: any }[] = []
//     const loanTokens = await loanTokenFinder()
//     loanTokens.map(async (address,index) => {
//         const loanOutFilter = {address: address, topics:loan1.filters.Transfer(contracts.lender).topics, fromBlock: 0, toBlock: "latest"}    
//         const loanInFilter = {address: address, topics:loan1.filters.Transfer(null,contracts.lender).topics, fromBlock: 0, toBlock: "latest"}
//         const loanArray = mergeArray([...await loanTokenHelper(address),...await eventHelper(loanOutFilter,-1),...await eventHelper(loanInFilter,1)])
//         loanArray.map(res => {
//             const result = {[index]:res.total,
//             blockNumber: res.blockNumber}
//             loanTokenArray.push(result)
//         })
//     })
//     return loanTokenArray
// }