import React from 'react';
import {Typography, Tabs, Layout} from 'antd';
import 'antd/dist/antd.css';


import {PoolPage} from './component/poolPage'
import {LoanPage} from './component/loanPage'
import {FarmPage} from './component/farmPage'
import {PricePage} from './component/pricePage'

const { TabPane } = Tabs;
const { Title } = Typography;
const { Content } = Layout;


function App() {

  return (    
    <Content style={{ padding: '25px 25px' }}>
      <Title>TrueFi Info</Title>
      <Tabs tabPosition='left'>
        <TabPane tab="Pool Value" key="2">
          <PoolPage />
        </TabPane>
        <TabPane tab="Loan Stat" key="1">
          <LoanPage />
        </TabPane>
        <TabPane tab="Farm" key="3">
          <FarmPage />
        </TabPane>
        <TabPane tab="Price Info" key="4">
          <PricePage />
        </TabPane>
      </Tabs>
    </Content>
      
  )

}

export default App;




