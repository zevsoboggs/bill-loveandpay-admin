import { useEffect, useState, useRef } from 'react';
import {
  Card, Table, Tag, Typography, Button, Space, Drawer, Input, Select, Segmented, message,
  Badge, Divider, Spin, Row, Col, Statistic, Checkbox, Empty,
} from 'antd';
import {
  ReloadOutlined, SendOutlined, CustomerServiceOutlined, MessageOutlined, LockOutlined,
} from '@ant-design/icons';
import { ADMIN_API } from '../../constants.js';
import { httpClient } from '../../httpClient.js';
import { ClientFilterSelect } from '../../components/filters.jsx';

const { Title, Text } = Typography;
const { TextArea } = Input;
const T = `${ADMIN_API}/tickets`;

const STATUS = {
  OPEN: { label: 'Открыт', color: 'blue' },
  IN_PROGRESS: { label: 'В работе', color: 'gold' },
  WAITING_CLIENT: { label: 'Ждёт клиента', color: 'orange' },
  RESOLVED: { label: 'Решён', color: 'green' },
  CLOSED: { label: 'Закрыт', color: 'default' },
};
const PRIORITY = { low: { label: 'Низкий', color: 'default' }, normal: { label: 'Обычный', color: 'blue' }, high: { label: 'Высокий', color: 'orange' }, urgent: { label: 'Срочный', color: 'red' } };
const CATEGORIES = { incident: 'Инцидент', payment: 'Платёж', api: 'API', balance: 'Баланс', kyc: 'KYC', feature: 'Пожелание', other: 'Другое' };
const st = (s) => STATUS[s] || { label: s, color: 'default' };

export const TicketList = () => {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ open: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState('active');
  const [clientF, setClientF] = useState(null);
  const [active, setActive] = useState(null); // opened ticket
  const [reply, setReply] = useState('');
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const threadRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { _start: 0, _end: 300, _sort: 'lastMessageAt', _order: 'DESC' };
      if (statusF !== 'all' && statusF !== 'active') params.status = statusF;
      if (clientF) params.clientId = clientF;
      const [list, s] = await Promise.all([
        httpClient.get(T, { params }).then((r) => r.data).catch(() => []),
        httpClient.get(`${T}/stats`).then((r) => r.data).catch(() => ({ open: 0, unread: 0 })),
      ]);
      let data = Array.isArray(list) ? list : [];
      if (statusF === 'active') data = data.filter((t) => ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT'].includes(t.status));
      setRows(data); setStats(s);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusF, clientF]);

  const openTicket = async (row) => {
    setActive({ loading: true, id: row.id });
    try { const { data } = await httpClient.get(`${T}/${row.id}`); setActive(data); load(); }
    catch { message.error('Ошибка'); setActive(null); }
  };
  useEffect(() => { if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight; }, [active]);

  const sendReply = async () => {
    const body = reply.trim();
    if (!body) return;
    setBusy(true);
    try {
      await httpClient.post(`${T}/${active.id}/messages`, { body, internal });
      setReply(''); setInternal(false);
      const { data } = await httpClient.get(`${T}/${active.id}`); setActive(data); load();
    } catch (e) { message.error(e.response?.data?.error || 'Не отправлено'); }
    finally { setBusy(false); }
  };

  const patch = async (field, value) => {
    try {
      await httpClient.patch(`${T}/${active.id}`, { [field]: value });
      setActive((a) => ({ ...a, [field]: value })); load();
      message.success('Обновлено');
    } catch (e) { message.error(e.response?.data?.error || 'Ошибка'); }
  };

  return (
    <div>
      <Title level={3}>Обращения / тикеты</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><Card><Statistic title="Открытых" value={stats.open} prefix={<MessageOutlined />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Непрочитанных" value={stats.unread} valueStyle={{ color: stats.unread ? '#cf1322' : undefined }} /></Card></Col>
      </Row>

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Segmented value={statusF} onChange={setStatusF} options={[
            { value: 'active', label: 'Активные' }, { value: 'all', label: 'Все' },
            { value: 'OPEN', label: 'Открыт' }, { value: 'IN_PROGRESS', label: 'В работе' },
            { value: 'WAITING_CLIENT', label: 'Ждёт клиента' }, { value: 'RESOLVED', label: 'Решён' }, { value: 'CLOSED', label: 'Закрыт' },
          ]} />
          <ClientFilterSelect onChange={setClientF} />
          <Button icon={<ReloadOutlined />} onClick={load}>Обновить</Button>
        </Space>
        <Table dataSource={rows} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 15 }} scroll={{ x: 820 }}
          onRow={(r) => ({ onClick: () => openTicket(r), style: { cursor: 'pointer' } })}
          locale={{ emptyText: <Empty description="Обращений нет" /> }}
          columns={[
            { title: '#', dataIndex: 'number', width: 70, render: (v, r) => <Space size={6}>{r.adminUnread && <Badge status="error" />}<Text strong>#{v}</Text></Space> },
            { title: 'Клиент', dataIndex: ['client', 'name'], render: (v) => v || '—' },
            { title: 'Тема', dataIndex: 'subject', render: (v, r) => <span><Text strong={r.adminUnread}>{v}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{CATEGORIES[r.category] || r.category} · {r._count?.messages} сообщ.</Text></span> },
            { title: 'Приоритет', dataIndex: 'priority', render: (v) => <Tag color={PRIORITY[v]?.color}>{PRIORITY[v]?.label || v}</Tag> },
            { title: 'Статус', dataIndex: 'status', render: (v) => <Tag color={st(v).color}>{st(v).label}</Tag> },
            { title: 'Источник', dataIndex: 'source', render: (v) => v === 'api' ? <Tag color="geekblue">API</Tag> : <Tag>кабинет</Tag> },
            { title: 'Обновлён', dataIndex: 'lastMessageAt', render: (v) => new Date(v).toLocaleString('ru-RU') },
          ]} />
      </Card>

      <Drawer width={640} open={!!active} onClose={() => setActive(null)}
        title={active && !active.loading ? `#${active.number} · ${active.subject}` : 'Обращение'}>
        {!active || active.loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
          <>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">Клиент: </Text><Text strong>{active.client?.name}</Text>
              {active.client?.email && <Text type="secondary"> · {active.client.email}</Text>}
            </div>
            <Space wrap style={{ marginBottom: 16 }}>
              <Select size="small" value={active.status} style={{ width: 160 }} onChange={(v) => patch('status', v)}
                options={Object.entries(STATUS).map(([k, v]) => ({ value: k, label: v.label }))} />
              <Select size="small" value={active.priority} style={{ width: 130 }} onChange={(v) => patch('priority', v)}
                options={Object.entries(PRIORITY).map(([k, v]) => ({ value: k, label: v.label }))} />
              <Tag>{CATEGORIES[active.category] || active.category}</Tag>
            </Space>

            <div ref={threadRef} style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto', padding: '4px 2px', marginBottom: 12 }}>
              {(active.messages || []).map((m) => {
                if (m.authorType === 'system') return <Divider key={m.id} plain style={{ fontSize: 11 }}>{m.body}</Divider>;
                const staff = m.authorType === 'admin';
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: staff ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                    <div style={{ maxWidth: '80%', background: m.internal ? '#fffbe6' : staff ? '#e8f2f4' : '#f5f6f8',
                      border: m.internal ? '1px solid #ffe58f' : '1px solid #eef1f3', borderRadius: 12, padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, color: '#59636b', fontWeight: 600, marginBottom: 2 }}>
                        {m.internal && <LockOutlined style={{ marginRight: 4, color: '#d48806' }} />}
                        {staff ? (m.authorName || 'Поддержка') : (m.authorName || 'Клиент')}{m.internal ? ' · внутренняя заметка' : ''} · {new Date(m.createdAt).toLocaleString('ru-RU')}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: 13.5 }}>{m.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid #eef1f3', paddingTop: 12 }}>
              <TextArea value={reply} onChange={(e) => setReply(e.target.value)} rows={3}
                placeholder={internal ? 'Внутренняя заметка (клиент не увидит)…' : 'Ответ клиенту…'}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply(); }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Checkbox checked={internal} onChange={(e) => setInternal(e.target.checked)}>Внутренняя заметка</Checkbox>
                <Button type="primary" icon={<SendOutlined />} loading={busy} onClick={sendReply} disabled={!reply.trim()}>
                  {internal ? 'Сохранить заметку' : 'Ответить'}
                </Button>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};
