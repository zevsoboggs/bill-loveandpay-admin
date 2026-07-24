import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Tag, Spin, Divider, Space, List, Timeline, Empty } from 'antd';
import {
  TeamOutlined, WalletOutlined, DollarOutlined, RiseOutlined, SwapOutlined,
  ThunderboltOutlined, CheckCircleOutlined, MobileOutlined, SafetyOutlined, SafetyCertificateOutlined, CustomerServiceOutlined,
} from '@ant-design/icons';
import { ADMIN_API, usdt, SYSTEM_LABEL } from '../constants.js';
import { httpClient } from '../httpClient.js';

const { Title, Text } = Typography;

const FEED_ICON = {
  deposit: <WalletOutlined style={{ color: '#0f4c5c' }} />,
  payment: <CheckCircleOutlined style={{ color: '#3f8600' }} />,
  esim: <MobileOutlined style={{ color: '#722ed1' }} />,
  vpn: <SafetyOutlined style={{ color: '#d4380d' }} />,
  aml: <SafetyCertificateOutlined style={{ color: '#08979c' }} />,
  ticket: <CustomerServiceOutlined style={{ color: '#0f4c5c' }} />,
};

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'только что';
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  if (s < 86400) return `${Math.floor(s / 3600)} ч назад`;
  return new Date(d).toLocaleString('ru-RU');
}

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient.get(`${ADMIN_API}/dashboard/stats`)
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    httpClient.get(`${ADMIN_API}/dashboard/activity`, { params: { limit: 25 } })
      .then((r) => setActivity(r.data)).catch(() => setActivity([]));
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
        <Col xs={12} md={6}>
          <Card>
            <Space style={{ marginBottom: 8 }}><Tag color="geekblue">{SYSTEM_LABEL.SBP}</Tag></Space>
            <Statistic title="Баланс клиентов" value={b.sbpUsdt} precision={2} suffix="USDT" />
            <Text type="success">+{usdt(sys.SBP.marginUsdt)} прибыль</Text>
            <br /><Text type="secondary">Транзакций: {sys.SBP.count}</Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Space style={{ marginBottom: 8 }}><Tag color="green">{SYSTEM_LABEL.PROMPTPAY}</Tag></Space>
            <Statistic title="Баланс клиентов" value={b.promptpayUsdt} precision={2} suffix="USDT" />
            <Text type="success">+{usdt(sys.PROMPTPAY.marginUsdt)} прибыль</Text>
            <br /><Text type="secondary">Транзакций: {sys.PROMPTPAY.count}</Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Space style={{ marginBottom: 8 }}><Tag color="purple">{SYSTEM_LABEL.ESIM}</Tag></Space>
            <Statistic title="Баланс клиентов" value={b.esimUsdt} precision={2} suffix="USDT" />
            <Text type="success">+{usdt(sys.ESIM?.marginUsdt)} прибыль</Text>
            <br /><Text type="secondary">Транзакций: {sys.ESIM?.count || 0}</Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Space style={{ marginBottom: 8 }}><Tag color="volcano">{SYSTEM_LABEL.VPN}</Tag></Space>
            <Statistic title="Баланс клиентов" value={b.vpnUsdt} precision={2} suffix="USDT" />
            <Text type="success">+{usdt(sys.VPN?.marginUsdt)} прибыль</Text>
            <br /><Text type="secondary">Транзакций: {sys.VPN?.count || 0}</Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Space style={{ marginBottom: 8 }}><Tag color="cyan">{SYSTEM_LABEL.AML}</Tag></Space>
            <Statistic title="Баланс клиентов" value={b.amlUsdt} precision={2} suffix="USDT" />
            <Text type="success">+{usdt(sys.AML?.marginUsdt)} прибыль</Text>
            <br /><Text type="secondary">Проверок: {sys.AML?.count || 0}</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Divider orientation="left">Лента активности</Divider>
          <Card styles={{ body: { maxHeight: 440, overflow: 'auto' } }}>
            {activity === null
              ? <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
              : activity.length === 0
                ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Событий пока нет" />
                : (
                  <Timeline
                    items={activity.map((a) => ({
                      dot: FEED_ICON[a.kind],
                      children: (
                        <div>
                          <Space size={6} wrap>
                            <Text strong style={{ fontSize: 13 }}>{a.client || '—'}</Text>
                            {a.system && <Tag style={{ marginInlineEnd: 0 }}>{SYSTEM_LABEL[a.system] || a.system}</Tag>}
                            {a.amountUsdt != null && <Text type="secondary" style={{ fontSize: 12 }}>{usdt(a.amountUsdt)}</Text>}
                          </Space>
                          <div style={{ fontSize: 12, color: '#59636b' }}>{a.text}</div>
                          <div style={{ fontSize: 11, color: '#9aa5ad' }}>{timeAgo(a.at)}</div>
                        </div>
                      ),
                    }))}
                  />
                )}
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Divider orientation="left">Статусы транзакций</Divider>
          <Card>
            <Space wrap>
              {Object.entries(stats.transactions.byStatus).map(([k, v]) => (
                <Tag key={k} icon={<SwapOutlined />}>{k}: {v}</Tag>
              ))}
              {Object.keys(stats.transactions.byStatus).length === 0 && <Text type="secondary">Транзакций пока нет</Text>}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
