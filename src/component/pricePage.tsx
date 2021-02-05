import React, { useState, useEffect } from 'react'
import { useAsync } from 'react-async'
import { Statistic, Card, Row, Col, Spin } from 'antd'
import { getTruPrice, getTfiPrice } from '../hooks/price'


export const PricePage: React.FC = () => {

    const [truPrice, setTruPrice] = useState({ priceInEth: 0, priceInUsd: 0, poolValue: 0 })
    const [tfiPrice, setTfiPrice] = useState({ price: 0, poolValue: 0 })

    const { data: truPriceData, isLoading: truPriceIsLoading } = useAsync({ promiseFn: getTruPrice });
    const { data: tfiPriceData, isLoading: tfiPriceIsLoading } = useAsync({ promiseFn: getTfiPrice });

    useEffect(() => {
        if (truPriceData) {
            setTruPrice(truPriceData)
        }
        if (tfiPriceData) {
            setTfiPrice(tfiPriceData)
        }
    }, [truPriceData, tfiPriceData]);

    return (
        <>
            <Row gutter={16}>
                <Col span={8}>
                    <Spin spinning={truPriceIsLoading} delay={0}>
                        <Card>
                            <Statistic title="TRU in USD" value={truPrice.priceInUsd} precision={3} valueStyle={{ color: '#3f8600' }} prefix="$" />
                        </Card>
                    </Spin>
                </Col>
                <Col span={8}>
                    <Spin spinning={truPriceIsLoading} delay={0}>
                        <Card>
                            <Statistic title="TRU in ETH" value={truPrice.priceInEth} precision={6} valueStyle={{ color: '#3f8600' }} />
                        </Card>
                    </Spin>
                </Col>
                <Col span={8}>
                    <Spin spinning={tfiPriceIsLoading} delay={0}>
                        <Card>
                            <Statistic title="TFI in TUSD" value={tfiPrice.price} precision={4} valueStyle={{ color: '#3f8600' }} prefix="$" />
                        </Card>
                    </Spin>
                </Col>
                <Col span={8}>
                    <Spin spinning={tfiPriceIsLoading} delay={0}>
                        <Card>
                            <Statistic title="Uniswap TUSD/TFI Pool Value" value={tfiPrice.poolValue} precision={0} valueStyle={{ color: 'red' }} prefix="$" />
                        </Card>
                    </Spin>
                </Col>
                <Col span={8}>
                    <Spin spinning={truPriceIsLoading} delay={0}>
                        <Card>
                            <Statistic title="Uniswap TRU/ETH Pool Value" value={truPrice.poolValue} precision={0} valueStyle={{ color: 'red' }} prefix="$" />
                        </Card>
                    </Spin>
                </Col>
            </Row>
        </>
    )
};

