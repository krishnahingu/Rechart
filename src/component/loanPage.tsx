import React, { useState, useEffect } from 'react'
import { useAsync } from 'react-async';
import { Table, Tag, Typography, Spin } from 'antd'
import { getAllLoanCreated, getAllVoteEvent } from '../hooks/loan'
const { Title, Text, Link } = Typography;

export const LoanPage: React.FC = () => {

  const [loan, setLoan] = useState([{ 'borrower': '', 'amount': 0, 'term': 0, 'apy': 0, 'profit': 0, 'blockNumber': 0, status: '' }])
  const [vote, setVote] = useState([{ vote: '', staked: 0, voter: '', loanId: '', blockNumber: 0 }])

  const { data: loanData, isLoading: loanIsLoading } = useAsync({ promiseFn: getAllLoanCreated });
  const { data: voteData, isLoading: voteIsLoading } = useAsync({ promiseFn: getAllVoteEvent });

  useEffect(() => {
    if (loanData) {
      setLoan(loanData)
    }
    if (voteData) {
      setVote(voteData)
    }
  }, [loanData, voteData]);

  const loanColumns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: any[]) => <Text>${text}</Text>,
    },
    {
      title: 'Term',
      dataIndex: 'term',
      key: 'term',
      render: (text: number) => <Tag color='geekblue' key={text}>{text.toFixed(0)} Days</Tag>,
    },
    {
      title: 'Apy',
      dataIndex: 'apy',
      key: 'apy',
      render: (text: number) => <Tag color='geekblue' key={text}>{text.toFixed(2)} %</Tag>,
    },
    {
      title: 'Borrower',
      key: 'borrower',
      dataIndex: 'borrower',
      render: (text: string) => <Link href={'https://etherscan.io/address/' + text} target="_blank">{text}</Link>,
    },
    {
      title: 'Blocknumber',
      key: 'blockNumber',
      dataIndex: 'blockNumber',
    },
    {
      title: 'Profit',
      key: 'profit',
      dataIndex: 'profit',
      render: (text: number) => <Text>${text.toFixed(0)}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (text: string) => <Tag color='volcano' key={text}>{text}</Tag>,
    }
  ];

  const voteColumns = [
    {
      title: 'Vote',
      dataIndex: 'vote',
      key: 'vote',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Staked',
      key: 'staked',
      dataIndex: 'staked',
      render: (text: number) => <Text>{text.toFixed(2)} TRU</Text>,
    },
    {
      title: 'Voter',
      key: 'voter',
      dataIndex: 'voter',
      render: (text: string) => <Link href={'https://etherscan.io/address/' + text} target="_blank">{text}</Link>,
    },
    {
      title: 'Loan Token Address',
      key: 'loanId',
      dataIndex: 'loanId',
      render: (text: string) => <Link href={'https://etherscan.io/address/' + text} target="_blank">{text}</Link>,
    },
    {
      title: 'Blocknumber',
      key: 'blockNumber',
      dataIndex: 'blockNumber',
    }
  ];
  getAllVoteEvent()
  return (
    <div>
      <Title level={4}>Outstanding Loans</Title>
      <Spin spinning={loanIsLoading} delay={0}>
        <Table columns={loanColumns} dataSource={loan} />
      </Spin>
      <Title level={4}>Historical Votes</Title>
      <Spin spinning={voteIsLoading} delay={0}>
        <Table columns={voteColumns} dataSource={vote} />
      </Spin>
    </div>
  )
};

