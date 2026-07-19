import { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Typography, Button, Space, Modal, Form, Select, Input, InputNumber, message, Statistic, Row, Col, Popconfirm, Spin,
} from 'antd';
import { PlusOutlined, ReloadOutlined, WalletOutlined, SendOutlined, EditOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import { ADMIN_API } from '../../constants.js';
import { httpClient } from '../../httpClient.js';

const { Title, Text } = Typography;
const T = `${ADMIN_API}/transit`;
const copy = (v) => { navigator.clipboard.writeText(v); message.success('Скопировано'); };
const bal = (w) => (w.balances || []).map((b) => `${b.amount} ${b.shortName || b.symbol || ''}`).join(' · ') || '—';

export const TransitList = () => {
  const [master, setMaster] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [action, setAction] = useState(null); // {type:'topup'|'transfer'|'rename', wallet}
  const [cForm] = Form.useForm();
  const [aForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [m, n, w] = await Promise.all([
        httpClient.get(`${T}/master`).then((r) => r.data).catch(() => null),
        httpClient.get(`${T}/networks`).then((r) => r.data.networks || []).catch(() => []),
        httpClient.get(`${T}/wallets`, { params: { balances: 1 } }).then((r) => r.data.wallets || []).catch(() => []),
      ]);
      setMaster(m); setNetworks(n); setWallets(w);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createWallet = async (v) => {
    setBusy(true);
    try { await httpClient.post(`${T}/wallets`, v); message.success('Кошелёк выпущен'); setCreateOpen(false); cForm.resetFields(); load(); }
    catch (e) { message.error(e.response?.data?.error || 'Ошибка'); } finally { setBusy(false); }
  };

  const runAction = async (v) => {
    setBusy(true);
    const { type, wallet } = action;
    try {
      if (type === 'topup') await httpClient.post(`${T}/wallets/${wallet.id}/topup`, { amount: Number(v.amount), coin: v.coin });
      if (type === 'transfer') await httpClient.post(`${T}/wallets/${wallet.id}/transfer`, { coin: v.coin ?? 1, toAddress: v.toAddress, amount: Number(v.amount) });
      if (type === 'rename') await httpClient.post(`${T}/wallets/${wallet.id}/rename`, { label: v.label });
      message.success('Готово'); setAction(null); aForm.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.error || 'Ошибка'); } finally { setBusy(false); }
  };

  const coinOptions = (w) => {
    const net = networks.find((n) => n.network === w?.network);
    return (net?.coins || [{ id: 1, symbol: 'USDT' }]).map((c) => ({ value: c.id, label: `${c.symbol} (id ${c.id})` }));
  };

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Title level={3} style={{ margin: 0 }}>Транзитные кошельки</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load}>Обновить</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>Выпустить кошелёк</Button>
        </Space>
      </Space>

      {master && (
        <Card style={{ marginBottom: 16 }}>
          <Space wrap size="large">
            <Statistic title="Мастер-кошелёк (фандинг)" value={master.address} valueStyle={{ fontSize: 13, fontFamily: 'monospace' }} />
            {(master.balances || []).map((b) => (
              <Statistic key={b.key} title={b.shortName} value={b.amount} precision={b.isUsdt ? 2 : 4} valueStyle={{ fontSize: 16, color: b.isUsdt ? '#0F4C5C' : '#888' }} />
            ))}
          </Space>
        </Card>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
        <Card>
          <Table dataSource={wallets} rowKey="id" size="small" pagination={{ pageSize: 15 }} scroll={{ x: 900 }}
            columns={[
              { title: 'Метка', dataIndex: 'label', render: (v) => v || '—' },
              { title: 'Сеть', dataIndex: 'networkLabel', render: (v, r) => <Tag color="geekblue">{v || r.network}</Tag> },
              { title: 'Адрес', dataIndex: 'address', render: (v) => <Space><Text code style={{ fontSize: 11 }}>{v?.slice(0, 16)}…</Text><Button size="small" icon={<CopyOutlined />} onClick={() => copy(v)} /></Space> },
              { title: 'Проект', dataIndex: 'project', render: (v) => v ? <Tag>{v}</Tag> : '—' },
              { title: 'Баланс', render: (_, r) => <Text>{bal(r)}</Text> },
              { title: '', fixed: 'right', width: 220, render: (_, r) => (
                <Space size={4}>
                  <Button size="small" icon={<DownloadOutlined />} onClick={() => { setAction({ type: 'topup', wallet: r }); }}>Пополнить</Button>
                  <Button size="small" icon={<SendOutlined />} onClick={() => { setAction({ type: 'transfer', wallet: r }); }}>Вывод</Button>
                  <Button size="small" icon={<EditOutlined />} onClick={() => { setAction({ type: 'rename', wallet: r }); aForm.setFieldsValue({ label: r.label }); }} />
                </Space>
              ) },
            ]}
            locale={{ emptyText: 'Нет кошельков' }} />
        </Card>
      )}

      {/* Create */}
      <Modal title="Выпустить транзитный кошелёк" open={createOpen} onCancel={() => setCreateOpen(false)} confirmLoading={busy} onOk={() => cForm.submit()} okText="Выпустить">
        <Form form={cForm} layout="vertical" onFinish={createWallet} initialValues={{ network: 'tron' }}>
          <Form.Item name="network" label="Сеть" rules={[{ required: true }]}>
            <Select options={networks.map((n) => ({ value: n.network, label: `${n.label} (${n.usdtNet})` }))} />
          </Form.Item>
          <Form.Item name="label" label="Метка"><Input placeholder="напр. payout-1" /></Form.Item>
          <Form.Item name="project" label="Проект (необязательно)"><Input placeholder="напр. proj2" /></Form.Item>
        </Form>
      </Modal>

      {/* Actions */}
      <Modal title={action?.type === 'topup' ? 'Пополнить с мастера' : action?.type === 'transfer' ? 'Вывод средств' : 'Переименовать'}
        open={!!action} onCancel={() => setAction(null)} confirmLoading={busy} onOk={() => aForm.submit()} okText="Выполнить">
        <Form form={aForm} layout="vertical" onFinish={runAction}>
          {action?.type === 'topup' && <>
            <Form.Item name="amount" label="Сумма" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} step={1} /></Form.Item>
            <Form.Item name="coin" label="Монета"><Select allowClear options={coinOptions(action?.wallet)} placeholder="по умолчанию USDT" /></Form.Item>
          </>}
          {action?.type === 'transfer' && <>
            <Form.Item name="coin" label="Монета" initialValue={1}><Select options={coinOptions(action?.wallet)} /></Form.Item>
            <Form.Item name="toAddress" label="Адрес получателя" rules={[{ required: true }]}><Input placeholder="T... / 0x..." /></Form.Item>
            <Form.Item name="amount" label="Сумма" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} step={1} /></Form.Item>
          </>}
          {action?.type === 'rename' && <Form.Item name="label" label="Новая метка" rules={[{ required: true }]}><Input /></Form.Item>}
        </Form>
      </Modal>
    </div>
  );
};
