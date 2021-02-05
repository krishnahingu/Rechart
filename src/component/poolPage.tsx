import React, { useState, useEffect } from 'react'
import { Statistic, Card, Row, Col, Typography } from 'antd'
import { getTfiTotalSupply, getPoolValue, getPoolChart, getNetCurve, TusdHistoricalBal } from '../hooks/pool'
import { LineChart, Area, AreaChart, ComposedChart, Line, XAxis, YAxis, Bar, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useAsync } from 'react-async';
import { Spin } from 'antd';
const { Title } = Typography;

export const PoolPage: React.FC = () => {

  const [tfi, setTfi] = useState({ supply: 0, poolValue: 0 })
  const [poolChart, setPoolChart] = useState([{ total: 0, marginChange: 0, blockNumber: 0 }])
  const [curveChart, setCurveChart] = useState([{ total: 0, marginChange: 0, blockNumber: 0 }])
  const [combinedChart, setCombinedChart] = useState([{ TUSD: 0, yCRV: 0, Loan1: 0, Loan2: 0, blockNumber: 0 }])

  const { data: TfiSupply, isLoading: TfiSupplyIsLoading
  } = useAsync({ promiseFn: getTfiTotalSupply });
  const { data: PoolValue, isLoading: PoolValueIsLoading
  } = useAsync({ promiseFn: getPoolValue });
  const { data: PoolValueChart, isLoading: PoolValueChartIsLoading
  } = useAsync({ promiseFn: getPoolChart });
  const { data: CurveChart, isLoading: CurveChartIsLoading
  } = useAsync({ promiseFn: getNetCurve });
  const { data: CombinedChart, isLoading: CombinedChartIsLoading
  } = useAsync({ promiseFn: TusdHistoricalBal });

  useEffect(() => {
    if (TfiSupply) {
      setTfi(prev => {
        return { ...prev, supply: TfiSupply }
      })
    }
    if (PoolValue) {
      setTfi(prev => {
        return { ...prev, poolValue: PoolValue }
      })
    }
    if (PoolValueChart) {
      setPoolChart(PoolValueChart);
    }
    if (CurveChart) {
      setCurveChart(CurveChart)
    }
    if (CombinedChart) {
      setCombinedChart(CombinedChart)
    }

  }, [TfiSupply, PoolValue, PoolValueChart, CurveChart, CombinedChart]);

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Spin spinning={TfiSupplyIsLoading} delay={0}>
            <Card>
              <Statistic title="Pool Value" value={tfi.poolValue} precision={2} suffix=" TUSD" />
            </Card>
          </Spin>
        </Col>
        <Col span={12}>
          <Spin spinning={PoolValueIsLoading} delay={0}>
            <Card>
              <Statistic title="TFI-LP Total Supply" value={tfi.supply} precision={2} />
            </Card>
          </Spin>
        </Col>
      </Row>
      <Title level={2}>Pool Value Chart</Title>
      <Spin spinning={PoolValueChartIsLoading} delay={0}>
        <ComposedChart width={1200} height={500} data={poolChart} margin={{ top: 30, right: 30, bottom: 30, left: 30, }}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="blockNumber" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="total" fill="#ffc658" stroke="#8884d8" />
          <Bar dataKey="marginChange" barSize={20} fill="#413ea0" />
        </ComposedChart>
      </Spin>

      <Title level={2}>Pool Composition Chart</Title>
      <Spin spinning={CombinedChartIsLoading} delay={0}>
        <AreaChart width={1200} height={500} data={combinedChart}
          margin={{ top: 30, right: 30, left: 30, bottom: 30, }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="blockNumber" />
          <YAxis type="number" tickMargin={10} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="TUSD" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="yCRV" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="Loan1" stackId="1" stroke="#ffc658" fill="#ffc658" />
          <Area type="monotone" dataKey="Loan2" stackId="1" stroke="#ffc658" fill="#ffc658" />
        </AreaChart>
      </Spin>
      <Title level={2}>Pool Interaction with Curve.fi</Title>
      <Spin spinning={CurveChartIsLoading} delay={0}>
        <LineChart width={1000} height={300} data={curveChart} margin={{ top: 30, right: 30, left: 30, bottom: 30, }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="blockNumber" />
          <YAxis type="number" tickMargin={10} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#8884d8" />
          <Line type="monotone" dataKey="marginChange" stroke="#82ca9d" />
        </LineChart>
      </Spin>
    </div>
  )
};

