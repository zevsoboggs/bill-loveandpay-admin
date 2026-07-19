import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Segmented, Table, Tag, Button, Spin, Space } from 'antd';
import { DownloadOutlined, RiseOutlined, DollarOutlined, SwapOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ADMIN_API, usdt, SYSTEM_LABEL, SYSTEM_COLOR } from '../constants.js';
import { httpClient } from '../httpClient.js';

const { Title, Text } = Typography;
const SYS_HEX = { SBP: '#2f54eb', PROMPTPAY: '#389e0d', ESIM: '#722ed1', VPN: '#d4380d' };

export const Analytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const to = new Date();
    const from = new Date(to.getTime() - days * 86400 * 1000);
    httpClient.get(`${ADMIN_API}/analytics`, { params: { from: from.toISOString(), to: to.toISOString() } })
      .then((r) => setData(r.data)).finally(() => setLoading(false));
  }, [days]);

  const exportCsv = async () => {
    const { data: blob } = await httpClient.get(`${ADMIN_API}/transactions/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const t = data?.totals;
  const perService = t ? ['SBP', 'PROMPTPAY', 'ESIM', 'VPN'].map((s) => ({ name: SYSTEM_LABEL[s], volume: t.systems[s]?.volume || 0, margin: t.systems[s]?.margin || 0 })) : [];

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Title level={3} style={{ margin: 0 }}>Аналитика</Title>
        <Space>
          <Segmented value={days} onChange={setDays} options={[{ value: 7, label: '7 дней' }, { value: 30, label: '30 дней' }, { value: 90, label: '90 дней' }]} />
          <Button icon={<DownloadOutlined />} onClick={exportCsv}>Экспорт CSV</Button>
        </Space>
      </Space>

      {loading || !data ? <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div> : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}><Card><Statistic title="Оборот" value={t.volume} precision={2} suffix="USDT" prefix={<DollarOutlined />} /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="Прибыль (наценка)" value={t.margin} precision={2} suffix="USDT" valueStyle={{ color: '#3f8600' }} prefix={<RiseOutlined />} /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="Операций" value={t.count} prefix={<SwapOutlined />} /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="Ср. чек" value={t.count ? t.volume / t.count : 0} precision={2} suffix="USDT" /></Card></Col>
          </Row>

          <Card title="Оборот и прибыль по дням" style={{ marginTop: 16 }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.series} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0F4C5C" stopOpacity={0.5} /><stop offset="100%" stopColor="#0F4C5C" stopOpacity={0.05} /></linearGradient>
                  <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3f8600" stopOpacity={0.5} /><stop offset="100%" stopColor="#3f8600" stopOpacity={0.05} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => usdt(v)} />
                <Legend />
                <Area type="monotone" dataKey="volume" name="Оборот" stroke="#0F4C5C" fill="url(#gv)" strokeWidth={2} />
                <Area type="monotone" dataKey="margin" name="Прибыль" stroke="#3f8600" fill="url(#gm)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card title="По услугам">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={perService} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => usdt(v)} /><Legend />
                    <Bar dataKey="volume" name="Оборот" fill="#0F4C5C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="margin" name="Прибыль" fill="#3f8600" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Топ-партнёры">
                <Table dataSource={data.topClients} rowKey="name" size="small" pagination={false}
                  columns={[
                    { title: 'Партнёр', dataIndex: 'name' },
                    { title: 'Оборот', dataIndex: 'volume', align: 'right', render: (v) => usdt(v) },
                    { title: 'Прибыль', dataIndex: 'margin', align: 'right', render: (v) => <Text type="success">{usdt(v)}</Text> },
                    { title: 'Опер.', dataIndex: 'count', align: 'right' },
                  ]}
                  locale={{ emptyText: 'Нет данных за период' }} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};
