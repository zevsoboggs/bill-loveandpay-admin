import { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Typography, Button, Space, Modal, Form, Input, InputNumber, message,
  Statistic, Row, Col, Spin, Alert, Empty, Tooltip, Popconfirm,
} from 'antd';
import {
  ReloadOutlined, DollarOutlined, SendOutlined, CopyOutlined, WalletOutlined,
} from '@ant-design/icons';
import { ADMIN_API, usdt } from '../../constants.js';
import { httpClient } from '../../httpClient.js';

const { Title, Text, Paragraph } = Typography;
const W = `${ADMIN_API}/deposit-wallets`;
const LAST_DEST = 'lnp_sweep_dest';
const copy = (v) => { navigator.clipboard.writeText(String(v || '')); message.success('Скопировано'); };

export const DepositWalletList = () => {
  const [rows, setRows] = useState([]);
  const [sweeps, setSweeps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sweep, setSweep] = useState(null); // wallet row being swept
  const [form] = Form.useForm();

  const load = async (live = true) => {
    setLoading(true);
    try {
      const [w, s] = await Promise.all([
        httpClient.get(`${W}`, { params: { live: live ? 1 : 0 } }).then((r) => r.data).catch(() => []),
        httpClient.get(`${W}/sweeps`).then((r) => r.data).catch(() => []),
      ]);
      setRows(Array.isArray(w) ? w : []);
      setSweeps(Array.isArray(s) ? s : []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openSweep = (row) => {
    setSweep(row);
    form.setFieldsValue({ toAddress: localStorage.getItem(LAST_DEST) || '', amount: row.onchainUsdt ?? undefined });
  };

  const doSweep = async (v) => {
    setBusy(true);
    try {
      const { data } = await httpClient.post(`${W}/${sweep.clientId}/sweep`, { toAddress: v.toAddress.trim(), amount: v.amount });
      localStorage.setItem(LAST_DEST, v.toAddress.trim());
      message.success(`Выведено ${usdt(data.amountUsdt)} → ${v.toAddress.slice(0, 8)}…`);
      setSweep(null); form.resetFields(); load();
    } catch (e) {
      message.error(e.response?.data?.error || 'Вывод не прошёл');
    } finally { setBusy(false); }
  };

  const totalOnchain = rows.reduce((s, r) => s + (Number(r.onchainUsdt) || 0), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={3}>Вывод депозитов</Title>
      <Paragraph type="secondary">
        Сбор реального USDT с депозитных кошельков клиентов на указанный вами адрес. Это <b>не меняет</b> расходный баланс клиента
        (его оплату за API) — вы забираете физические средства, зачисленные депозиты остаются доступны клиенту.
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}><Card><Statistic title="Всего на кошельках (on-chain)" value={totalOnchain} precision={2} prefix={<WalletOutlined />} suffix="USDT" /></Card></Col>
        <Col xs={12} md={8}><Card><Statistic title="Кошельков" value={rows.length} /></Card></Col>
        <Col xs={24} md={8}><Card style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <Button icon={<ReloadOutlined />} onClick={() => load(true)}>Обновить балансы</Button>
        </Card></Col>
      </Row>

      <Alert style={{ marginBottom: 16 }} type="info" showIcon
        message="Комиссия сети TRON оплачивается энергией/TRX кошелька. Если вывод падает с ошибкой TRX — пополните кошелёк TRX и повторите." />

      <Card title="Депозитные кошельки клиентов">
        <Table dataSource={rows} rowKey="clientId" size="middle" pagination={{ pageSize: 20 }} scroll={{ x: 800 }}
          locale={{ emptyText: <Empty description="Нет клиентов с депозитными кошельками" /> }}
          columns={[
            { title: 'Клиент', dataIndex: 'name', render: (v, r) => <span>{v} {r.status !== 'ACTIVE' && <Tag color="warning">{r.status}</Tag>}</span> },
            { title: 'Адрес кошелька', dataIndex: 'address', render: (v) => v ? <Space><Text code style={{ fontSize: 11 }}>{v.slice(0, 8)}…{v.slice(-6)}</Text><Button size="small" icon={<CopyOutlined />} onClick={() => copy(v)} /></Space> : '—' },
            { title: 'На кошельке (on-chain)', dataIndex: 'onchainUsdt', align: 'right', render: (v) => v == null ? <Text type="secondary">—</Text> : <Text strong>{usdt(v)}</Text> },
            { title: 'Расходный баланс', dataIndex: 'depositBalance', align: 'right', render: (v) => <Text type="secondary">{usdt(v)}</Text> },
            { title: '', align: 'right', width: 130, render: (_, r) => (
              <Tooltip title={Number(r.onchainUsdt) > 0 ? 'Вывести средства' : 'Нечего выводить'}>
                <Button type="primary" size="small" icon={<SendOutlined />} disabled={!(Number(r.onchainUsdt) > 0)} onClick={() => openSweep(r)}>Вывести</Button>
              </Tooltip>
            ) },
          ]} />
      </Card>

      <Card style={{ marginTop: 16 }} title="История выводов">
        <Table dataSource={sweeps} rowKey="id" size="small" pagination={{ pageSize: 10 }} scroll={{ x: 700 }}
          locale={{ emptyText: 'Выводов пока не было' }}
          columns={[
            { title: 'Дата', dataIndex: 'createdAt', render: (v) => new Date(v).toLocaleString('ru-RU') },
            { title: 'Клиент', dataIndex: ['client', 'name'], render: (v) => v || '—' },
            { title: 'Сумма', dataIndex: 'amountUsdt', align: 'right', render: (v) => <Text strong>{usdt(v)}</Text> },
            { title: 'Куда', dataIndex: 'toAddress', render: (v) => <Text code style={{ fontSize: 11 }} copyable={{ text: v }}>{v.slice(0, 8)}…{v.slice(-6)}</Text> },
            { title: 'Статус', dataIndex: 'status', render: (v) => <Tag color={v === 'SENT' ? 'success' : 'error'}>{v === 'SENT' ? 'Отправлено' : 'Ошибка'}</Tag> },
            { title: 'TX', dataIndex: 'txRef', render: (v) => v ? <Text code style={{ fontSize: 11 }} copyable={{ text: v }}>{v.slice(0, 10)}…</Text> : '—' },
          ]} />
      </Card>

      {/* Sweep modal */}
      <Modal title={`Вывод с кошелька — ${sweep?.name || ''}`} open={!!sweep} onCancel={() => setSweep(null)}
        confirmLoading={busy} onOk={() => form.submit()} okText="Вывести" okButtonProps={{ danger: true }}>
        <Alert style={{ marginBottom: 16 }} type="warning" showIcon
          message="Реальный перевод USDT (TRC-20)"
          description="Средства уйдут на указанный адрес безвозвратно. Проверьте адрес — ошибку в адресе отменить нельзя." />
        <Descriptionsish row={sweep} />
        <Form form={form} layout="vertical" onFinish={doSweep} style={{ marginTop: 12 }}>
          <Form.Item name="toAddress" label="Адрес получателя (TRON, TRC-20)"
            rules={[{ required: true, message: 'Укажите адрес' }, { pattern: /^T[1-9A-HJ-NP-Za-km-z]{33}$/, message: 'Некорректный TRON-адрес' }]}>
            <Input placeholder="T..." autoComplete="off" />
          </Form.Item>
          <Form.Item name="amount" label="Сумма, USDT" tooltip="По умолчанию — весь баланс кошелька"
            rules={[{ required: true, message: 'Укажите сумму' }]}>
            <InputNumber min={0.5} step={10} style={{ width: '100%' }} addonAfter="USDT"
              max={sweep?.onchainUsdt ?? undefined} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

function Descriptionsish({ row }) {
  if (!row) return null;
  return (
    <Space direction="vertical" size={2} style={{ width: '100%' }}>
      <Text type="secondary" style={{ fontSize: 12 }}>Кошелёк клиента</Text>
      <Text code copyable style={{ fontSize: 12, wordBreak: 'break-all' }}>{row.address}</Text>
      <Text type="secondary" style={{ fontSize: 12 }}>Доступно на кошельке: <b>{usdt(row.onchainUsdt)}</b></Text>
    </Space>
  );
}
