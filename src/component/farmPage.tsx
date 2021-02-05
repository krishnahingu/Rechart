import React, { useState, useEffect } from 'react'
import { useAsync } from 'react-async'
import { Statistic, Card, Row, Col, Table, Tag, Typography, Spin } from 'antd'
import { getTruStat } from '../hooks/tru'
import { getAPY } from '../hooks/truefarm'

const { Text } = Typography;

export const FarmPage: React.FC = () => {

  const [tru, setTru] = useState({ supply: 0, burned: 0, distributed: 0 })
  const [apy, setApy] = useState([{ 'pool': '', 'dailyRate': 0, 'weeklyRate': 0, 'APY': 0, 'totalFarmRewards': 0, 'totalStakedValue': 0, 'totalClaimedRewards': 0 }])

  const { data: setTruData, isLoading: setTruIsLoading } = useAsync({ promiseFn: getTruStat });
  const { data: setApyData, isLoading: setApyIsLoading } = useAsync({ promiseFn: getAPY });

  useEffect(() => {
    if (setTruData) {
      setTru(setTruData)
    }
    if (setApyData) {
      setApy(setApyData)
    }
  }, [setTruData, setApyData]);

  const columns = [
    {
      title: 'Pool',
      dataIndex: 'pool',
      key: 'pool',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'DailyRate',
      dataIndex: 'dailyRate',
      key: 'dailyRate',
      render: (text: number) => <Tag color='geekblue' key={text}>{text.toFixed(2)} %</Tag>,
    },
    {
      title: 'WeeklyRate',
      dataIndex: 'weeklyRate',
      key: 'weeklyRate',
      render: (text: number) => <Tag color='geekblue' key={text}>{text.toFixed(2)} %</Tag>,
    },
    {
      title: 'APY',
      dataIndex: 'APY',
      key: 'APY',
      render: (text: number) => <Tag color='volcano' key={text}>{text.toFixed(2)} %</Tag>,
    },
    {
      title: 'totalFarmRewards',
      dataIndex: 'totalFarmRewards',
      key: 'totalFarmRewards',
      render: (text: number) => <Text>{text.toFixed(0)} TRU</Text>,
    },
    {
      title: 'Pool Value',
      dataIndex: 'totalStakedValue',
      key: 'totalStakedValue',
      render: (text: number) => <Text>${text.toFixed(0)}</Text>,
    },
    {
      title: 'totalClaimedRewards',
      dataIndex: 'totalClaimedRewards',
      key: 'totalClaimedRewards',
      render: (text: number) => <Text>{text.toFixed(0)} TRU</Text>,
    },
  ];

  return (
    <>
      <Spin spinning={setTruIsLoading} delay={0}>
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic title="TRU Total Supply" value={tru.supply} precision={2} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="TRU Burned" value={tru.burned} precision={2} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="TRU Distributed" value={tru.distributed} precision={2} />
            </Card>
          </Col>
        </Row>
      </Spin>
      <Spin spinning={setApyIsLoading} delay={0}>
        <Table columns={columns} dataSource={apy} />
      </Spin>
    </>

  )
};

