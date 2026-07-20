import { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Typography, Button, Space, Modal, Form, Select, Input, InputNumber, message,
  Statistic, Row, Col, Spin, Descriptions, Alert, Empty, Tooltip,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, CreditCardOutlined, DollarOutlined, EyeOutlined, SyncOutlined, ProfileOutlined, CopyOutlined,
} from '@ant-design/icons';
import { ADMIN_API } from '../../constants.js';
import { httpClient } from '../../httpClient.js';

const { Title, Text, Paragraph } = Typography;
const C = `${ADMIN_API}/corporate-cards`;
const copy = (v) => { navigator.clipboard.writeText(String(v || '')); message.success('Скопировано'); };
const usd = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_COLOR = { active: 'success', ACTIVE: 'success', frozen: 'warning', blocked: 'error', closed: 'default' };

export const CorporateCardList = () => {
  const [account, setAccount] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [issueOpen, setIssueOpen] = useState(false);
  const [topup, setTopup] = useState(null);   // card being topped up
  const [detail, setDetail] = useState(null); // { card, txs, reveal }
  const [iForm] = Form.useForm();
  const [tForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [acc, prog, list] = await Promise.all([
        httpClient.get(`${C}/account`).then((r) => r.data).catch(() => null),
        httpClient.get(`${C}/programs`).then((r) => r.data).catch(() => []),
        httpClient.get(`${C}`, { params: { _start: 0, _end: 200, _sort: 'createdAt', _order: 'DESC' } }).then((r) => r.data).catch(() => []),
      ]);
      setAccount(acc); setPrograms(prog); setCards(Array.isArray(list) ? list : []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const issue = async (v) => {
    setBusy(true);
    try {
      await httpClient.post(`${C}`, v);
      message.success('Карта выпущена');
      setIssueOpen(false); iForm.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.error || 'Не удалось выпустить карту'); }
    finally { setBusy(false); }
  };

  const doTopup = async (v) => {
    setBusy(true);
    try {
      await httpClient.post(`${C}/${topup.id}/topup`, { amount: Number(v.amount) });
      message.success('Карта пополнена');
      setTopup(null); tForm.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.error || 'Пополнение не прошло'); }
    finally { setBusy(false); }
  };

  const sync = async (card) => {
    try { await httpClient.post(`${C}/${card.id}/sync`); message.success('Обновлено'); load(); }
    catch (e) { message.error(e.response?.data?.error || 'Ошибка'); }
  };

  const openDetail = async (card) => {
    setDetail({ card, txs: null, reveal: null, loading: true });
    try {
      const [txsR, revealR] = await Promise.all([
        httpClient.get(`${C}/${card.id}/transactions`).then((r) => r.data).catch(() => null),
        httpClient.get(`${C}/${card.id}/reveal`).then((r) => r.data).catch(() => null),
      ]);
      const txs = Array.isArray(txsR) ? txsR : (txsR?.transactions || txsR?.list || []);
      setDetail({ card, txs, reveal: revealR, loading: false });
    } catch { setDetail((d) => ({ ...d, loading: false })); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={3}>Корпоративные карты</Title>
      <Paragraph type="secondary">
        Виртуальные крипто-карты для оплаты расходов платформы (хостинги, подписки). Выпуск и пополнение списываются с нашего баланса PaySpace.
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}>
          <Card><Statistic title="Доступно на счёте (float)" value={Number(account?.balance ?? 0)} precision={2} prefix={<DollarOutlined />} suffix={account?.currency || 'USD'} /></Card>
        </Col>
        <Col xs={12} md={8}>
          <Card><Statistic title="В обработке (pending)" value={Number(account?.pending ?? 0)} precision={2} suffix={account?.currency || 'USD'} valueStyle={{ color: '#8a97a0' }} /></Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIssueOpen(true)} disabled={!programs.length}>Выпустить карту</Button>
              <Button icon={<ReloadOutlined />} onClick={load}>Обновить</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {Number(account?.balance ?? 0) < 20 && (
        <Alert style={{ marginBottom: 16 }} type="warning" showIcon message="Низкий баланс PaySpace — выпуск/пополнение могут не пройти. Пополните счёт провайдера." />
      )}

      <Card>
        <Table dataSource={cards} rowKey="id" size="middle" pagination={{ pageSize: 15 }} scroll={{ x: 900 }}
          locale={{ emptyText: <Empty description="Карт пока нет — выпустите первую" /> }}
          columns={[
            { title: 'Назначение', dataIndex: 'label', render: (v) => v || <Text type="secondary">—</Text> },
            { title: 'Программа', dataIndex: 'title', render: (v, r) => <span>{v || r.programCode} <Tag>{r.programCode}</Tag></span> },
            { title: 'Номер', dataIndex: 'maskedNumber', render: (v, r) => v || (r.last4 ? `•••• ${r.last4}` : '—') },
            { title: 'Тип', dataIndex: 'cardType', render: (v) => v || '—' },
            { title: 'Баланс', dataIndex: 'balanceUsd', align: 'right', render: (v) => <Text strong>{usd(v)}</Text> },
            { title: 'Статус', dataIndex: 'status', render: (v) => <Tag color={STATUS_COLOR[v] || 'default'}>{v}</Tag> },
            { title: '', align: 'right', width: 210, render: (_, r) => (
              <Space size={4}>
                <Tooltip title="Данные карты и транзакции"><Button size="small" icon={<ProfileOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                <Tooltip title="Пополнить"><Button size="small" type="primary" ghost icon={<DollarOutlined />} onClick={() => setTopup(r)} /></Tooltip>
                <Tooltip title="Синхронизировать баланс"><Button size="small" icon={<SyncOutlined />} onClick={() => sync(r)} /></Tooltip>
              </Space>
            ) },
          ]} />
      </Card>

      {/* Issue modal */}
      <Modal title="Выпуск корпоративной карты" open={issueOpen} onCancel={() => setIssueOpen(false)}
        confirmLoading={busy} onOk={() => iForm.submit()} okText="Выпустить">
        <Alert style={{ marginBottom: 16 }} type="info" showIcon
          message="Выпуск спишет комиссию программы и начальную сумму с баланса PaySpace." />
        <Form form={iForm} layout="vertical" onFinish={issue} initialValues={{ programCode: programs[0]?.code, initialAmount: 0 }}>
          <Form.Item name="programCode" label="Программа" rules={[{ required: true }]}>
            <Select options={programs.map((p) => ({ value: p.code, label: `${p.title} · ${p.subtitle} (комиссия $${p.fee})` }))} />
          </Form.Item>
          <Form.Item name="label" label="Назначение" tooltip="Для чего карта — попадёт в список">
            <Input placeholder="напр. Хостинг / Railway" />
          </Form.Item>
          <Form.Item name="initialAmount" label="Начальное пополнение, USD" tooltip="0 — выпустить без загрузки, пополнить позже">
            <InputNumber min={0} step={5} style={{ width: '100%' }} addonBefore="$" />
          </Form.Item>
          <Form.Item name="email" label="Email на карте (необязательно)">
            <Input type="email" placeholder="billing@loveandpay.io" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Top-up modal */}
      <Modal title={`Пополнение карты ${topup?.maskedNumber || topup?.last4 || ''}`} open={!!topup} onCancel={() => setTopup(null)}
        confirmLoading={busy} onOk={() => tForm.submit()} okText="Пополнить">
        <Alert style={{ marginBottom: 16 }} type="warning" showIcon message="Сумма спишется с баланса PaySpace и зачислится на карту." />
        <Form form={tForm} layout="vertical" onFinish={doTopup}>
          <Form.Item name="amount" label="Сумма, USD" rules={[{ required: true, message: 'Укажите сумму' }]}>
            <InputNumber min={1} step={10} style={{ width: '100%' }} addonBefore="$" placeholder="50" autoFocus />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail modal */}
      <Modal title="Карта" open={!!detail} onCancel={() => setDetail(null)} footer={null} width={720}>
        {detail?.loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : detail && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Назначение" span={2}>{detail.card.label || '—'}</Descriptions.Item>
              <Descriptions.Item label="Номер карты" span={2}>
                {detail.reveal?.cardNo
                  ? <Space><Text code style={{ fontSize: 14 }}>{detail.reveal.cardNo}</Text><Button size="small" icon={<CopyOutlined />} onClick={() => copy(detail.reveal.cardNo)} /></Space>
                  : (detail.card.maskedNumber || '—')}
              </Descriptions.Item>
              <Descriptions.Item label="Срок">{detail.reveal?.expDate || detail.card.expDate || '—'}</Descriptions.Item>
              <Descriptions.Item label="CVV">{detail.reveal?.cvv ? <Space><Text code>{detail.reveal.cvv}</Text><Button size="small" icon={<CopyOutlined />} onClick={() => copy(detail.reveal.cvv)} /></Space> : '—'}</Descriptions.Item>
              <Descriptions.Item label="Тип">{detail.reveal?.cardType || detail.card.cardType || '—'}</Descriptions.Item>
              <Descriptions.Item label="Баланс">{usd(detail.reveal?.balanceUsd ?? detail.card.balanceUsd)}</Descriptions.Item>
            </Descriptions>
            <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Полный номер и CVV — конфиденциальны. Не пересылайте по открытым каналам." />
            <Text strong>Транзакции по карте</Text>
            <Table style={{ marginTop: 8 }} size="small" rowKey={(r, i) => r.id || r.transaction_id || i}
              dataSource={detail.txs || []} pagination={{ pageSize: 8 }} scroll={{ x: 480 }}
              locale={{ emptyText: 'Транзакций нет' }}
              columns={[
                { title: 'Дата', dataIndex: 'created_at', render: (v, r) => { const d = v || r.date || r.createdAt; return d ? new Date(d).toLocaleString('ru-RU') : '—'; } },
                { title: 'Мерчант', dataIndex: 'merchant', render: (v, r) => v || r.merchant_name || r.merchantName || r.description || '—' },
                { title: 'Сумма', align: 'right', render: (_, r) => { const a = r.amount ?? r.value; return a != null ? usd(a) : '—'; } },
                { title: 'Статус', dataIndex: 'status', render: (v) => v ? <Tag>{v}</Tag> : '—' },
              ]} />
          </>
        )}
      </Modal>
    </div>
  );
};
