import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Tag, Spin, Divider, Space } from 'antd';
import {
  TeamOutlined, WalletOutlined, DollarOutlined, RiseOutlined, SwapOutlined,
} from '@ant-design/icons';
import { ADMIN_API, usdt, SYSTEM_LABEL } from '../constants.js';
import { httpClient } from '../httpClient.js';

const { Title, Text } = Typography;

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient.get(`${ADMIN_API}/dashboard/stats`)
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!stats) return <Text type="danger">Не удалось загрузить статистику</Text>;

  const b = stats.balances;
  const sys = stats.transactions.bySystem;

  return (
    <div>
      <Title level={3}>Обзор платформы</Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card><Statistic title="Клиентов" value={stats.clients.total}
            prefix={<TeamOutlined />} suffix={<Text type="secondary" style={{ fontSize: 13 }}>/ {stats.clients.active} активн.</Text>} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Депозит (нераспред.)" value={b.depositUsdt} precision={2} suffix="USDT" prefix={<WalletOutlined />} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Всего внесено" value={stats.totalDepositedUsdt} precision={2} suffix="USDT" prefix={<DollarOutlined />} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Прибыль (наценка)" value={stats.transactions.totalMarginUsdt} precision={2} suffix="USDT"
            valueStyle={{ color: '#3f8600' }} prefix={<RiseOutlined />} /></Card>
        </Col>
      </Row>

      <Divider orientation="left">Балансы систем</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Space style={{ marginBottom: 8 }}><Tag color="geekblue">{SYSTEM_LABEL.SBP}</Tag></Space>
            <Statistic title="Баланс клиентов" value={b.sbpUsdt} precision={2} suffix="USDT" />
            <Text type="success">+{usdt(sys.SBP.marginUsdt)} прибыль</Text>
            <br /><Text type="secondary">Оборот {usdt(sys.SBP.volumeUsdt)} · Транзакций: {sys.SBP.count}</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Space style={{ marginBottom: 8 }}><Tag color="green">{SYSTEM_LABEL.PROMPTPAY}</Tag></Space>
            <Statistic title="Баланс клиентов" value={b.promptpayUsdt} precision={2} suffix="USDT" />
            <Text type="success">+{usdt(sys.PROMPTPAY.marginUsdt)} прибыль</Text>
            <br /><Text type="secondary">Оборот {usdt(sys.PROMPTPAY.volumeUsdt)} · Транзакций: {sys.PROMPTPAY.count}</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Space style={{ marginBottom: 8 }}><Tag color="purple">{SYSTEM_LABEL.ESIM}</Tag></Space>
            <Statistic title="Баланс клиентов" value={b.esimUsdt} precision={2} suffix="USDT" />
            <Text type="success">+{usdt(sys.ESIM?.marginUsdt)} прибыль</Text>
            <br /><Text type="secondary">Оборот {usdt(sys.ESIM?.volumeUsdt)} · Транзакций: {sys.ESIM?.count || 0}</Text>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Статусы транзакций</Divider>
      <Space wrap>
        {Object.entries(stats.transactions.byStatus).map(([k, v]) => (
          <Tag key={k} icon={<SwapOutlined />}>{k}: {v}</Tag>
        ))}
        {Object.keys(stats.transactions.byStatus).length === 0 && <Text type="secondary">Транзакций пока нет</Text>}
      </Space>
    </div>
  );
};
