import { useState } from 'react';
import { useShow, useInvalidate } from '@refinedev/core';
import { Show, EditButton, ListButton } from '@refinedev/antd';
import {
  Row, Col, Card, Statistic, Descriptions, Tag, Typography, Button, Space, Modal, Form,
  InputNumber, Segmented, Input, message, Table, Popconfirm, Divider, Alert,
} from 'antd';
import {
  SwapOutlined, ReloadOutlined, CopyOutlined, PlusOutlined, DeleteOutlined, WalletOutlined,
} from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react';
import { ADMIN_API, usdt, CLIENT_STATUS_COLOR, SYSTEM_LABEL } from '../../constants.js';
import { httpClient } from '../../httpClient.js';

const { Title, Text, Paragraph } = Typography;

const copy = (v) => { navigator.clipboard.writeText(v); message.success('Скопировано'); };

export const ClientShow = () => {
  const { query } = useShow();
  const client = query?.data?.data;
  const invalidate = useInvalidate();
  const [distOpen, setDistOpen] = useState(false);
  const [ipOpen, setIpOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [distForm] = Form.useForm();
  const [ipForm] = Form.useForm();

  if (!client) return <Show isLoading />;

  const refresh = () => {
    invalidate({ resource: 'clients', invalidates: ['detail'], id: client.id });
    invalidate({ resource: 'ip-whitelist', invalidates: ['list'] });
  };

  const distribute = async (v) => {
    setBusy(true);
    try {
      await httpClient.post(`${ADMIN_API}/allocations`, {
        clientId: client.id, system: v.system, amount: Number(v.amount), note: v.note,
      });
      message.success('Депозит распределён');
      setDistOpen(false); distForm.resetFields(); refresh();
    } catch (e) { message.error(e.response?.data?.error || 'Ошибка'); }
    finally { setBusy(false); }
  };

  const rotateKeys = async () => {
    setBusy(true);
    try { await httpClient.post(`${ADMIN_API}/clients/${client.id}/rotate-keys`); message.success('Ключи обновлены'); refresh(); }
    catch { message.error('Ошибка'); } finally { setBusy(false); }
  };

  const createWallet = async () => {
    setBusy(true);
    try { await httpClient.post(`${ADMIN_API}/clients/${client.id}/wallet`); message.success('Кошелёк создан'); refresh(); }
    catch (e) { message.error(e.response?.data?.error || 'Ошибка'); } finally { setBusy(false); }
  };

  const addIp = async (v) => {
    setBusy(true);
    try { await httpClient.post(`${ADMIN_API}/ip-whitelist`, { clientId: client.id, ip: v.ip, label: v.label });
      message.success('IP добавлен'); setIpOpen(false); ipForm.resetFields(); refresh(); }
    catch (e) { message.error(e.response?.data?.error || 'Ошибка'); } finally { setBusy(false); }
  };

  const delIp = async (id) => {
    try { await httpClient.delete(`${ADMIN_API}/ip-whitelist/${id}`); message.success('IP удалён'); refresh(); }
    catch { message.error('Ошибка'); }
  };

  return (
    <Show
      isLoading={false}
      title={<Space>{client.name} <Tag color={CLIENT_STATUS_COLOR[client.status]}>{client.status}</Tag></Space>}
      headerButtons={<><ListButton /><EditButton /></>}
    >
      {/* Balances */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card><Statistic title="Депозит (нераспределён)" value={client.depositBalance} precision={2} suffix="USDT" prefix={<WalletOutlined />} />
          <Button type="primary" icon={<SwapOutlined />} block style={{ marginTop: 12 }} onClick={() => setDistOpen(true)}>Распределить депозит</Button>
        </Card></Col>
        <Col xs={12} md={8}><Card><Statistic title={SYSTEM_LABEL.SBP} value={client.sbpBalance} precision={2} suffix="USDT" valueStyle={{ color: '#2f54eb' }} /></Card></Col>
        <Col xs={12} md={8}><Card><Statistic title={SYSTEM_LABEL.PROMPTPAY} value={client.promptpayBalance} precision={2} suffix="USDT" valueStyle={{ color: '#389e0d' }} /></Card></Col>
      </Row>

      <Divider orientation="left">Реквизиты и API-доступ</Divider>
      <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
        <Descriptions.Item label="ID">{client.id}</Descriptions.Item>
        <Descriptions.Item label="Email">{client.email || '—'}</Descriptions.Item>
        <Descriptions.Item label="Наценка СБП">{client.sbpMargin != null ? `${(client.sbpMargin * 100).toFixed(2)}%` : 'дефолт'}</Descriptions.Item>
        <Descriptions.Item label="Наценка PromptPay">{client.promptpayMargin != null ? `${(client.promptpayMargin * 100).toFixed(2)}%` : 'дефолт'}</Descriptions.Item>
        <Descriptions.Item label="X-API-Key" span={2}>
          <Space><Text code>{client.apiKey}</Text><Button size="small" icon={<CopyOutlined />} onClick={() => copy(client.apiKey)} /></Space>
        </Descriptions.Item>
        <Descriptions.Item label="X-API-Secret" span={2}>
          <Space><Text code>{client.apiSecret}</Text><Button size="small" icon={<CopyOutlined />} onClick={() => copy(client.apiSecret)} />
            <Popconfirm title="Перевыпустить ключи? Старые перестанут работать." onConfirm={rotateKeys}>
              <Button size="small" danger icon={<ReloadOutlined />} loading={busy}>Ротация</Button></Popconfirm></Space>
        </Descriptions.Item>
        <Descriptions.Item label="Депозитный кошелёк (USDT TRC-20)" span={2}>
          {client.depositWalletAddress ? (
            <Space align="start" size="large" wrap>
              <div style={{ background: '#fff', padding: 8, borderRadius: 8, border: '1px solid #eee' }}>
                <QRCodeCanvas value={client.depositWalletAddress} size={120} />
              </div>
              <Space direction="vertical">
                <Text type="secondary" style={{ fontSize: 12 }}>Адрес для пополнения (только USDT TRC-20)</Text>
                <Space><Text code>{client.depositWalletAddress}</Text><Button size="small" icon={<CopyOutlined />} onClick={() => copy(client.depositWalletAddress)} /></Space>
              </Space>
            </Space>
          ) : (
            <Button size="small" icon={<PlusOutlined />} onClick={createWallet} loading={busy}>Создать кошелёк</Button>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Белый список IP {client.ipRestricted ? <Tag color="success">включён</Tag> : <Tag>выключен</Tag>}</Divider>
      {!client.ipRestricted && <Alert style={{ marginBottom: 12 }} type="warning" showMessage message="IP-ограничение выключено — API доступен с любого адреса." />}
      <Button icon={<PlusOutlined />} style={{ marginBottom: 12 }} onClick={() => setIpOpen(true)}>Добавить IP</Button>
      <Table dataSource={client.ipWhitelist || []} rowKey="id" size="small" pagination={false}
        columns={[
          { title: 'IP', dataIndex: 'ip', render: (v) => <Text code>{v}</Text> },
          { title: 'Метка', dataIndex: 'label', render: (v) => v || '—' },
          { title: '', width: 60, render: (_, r) => (
            <Popconfirm title="Удалить IP?" onConfirm={() => delIp(r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>) },
        ]}
        locale={{ emptyText: 'Нет разрешённых IP' }} />

      {/* Distribute modal */}
      <Modal title="Распределение депозита между системами" open={distOpen} onCancel={() => setDistOpen(false)}
        confirmLoading={busy} onOk={() => distForm.submit()} okText="Распределить">
        <Alert style={{ marginBottom: 16 }} type="info" showMessage
          message={`Доступно на депозите: ${usdt(client.depositBalance)}`}
          description="Положительная сумма переносит с депозита в систему. Отрицательная — возвращает из системы на депозит." />
        <Form form={distForm} layout="vertical" onFinish={distribute} initialValues={{ system: 'SBP' }}>
          <Form.Item name="system" label="Система"><Segmented options={[
            { value: 'SBP', label: SYSTEM_LABEL.SBP }, { value: 'PROMPTPAY', label: SYSTEM_LABEL.PROMPTPAY }]} block /></Form.Item>
          <Form.Item name="amount" label="Сумма (USDT)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={10} placeholder="напр. 500 или -100" /></Form.Item>
          <Form.Item name="note" label="Комментарий"><Input placeholder="необязательно" /></Form.Item>
        </Form>
      </Modal>

      {/* Add IP modal */}
      <Modal title="Добавить IP в белый список" open={ipOpen} onCancel={() => setIpOpen(false)}
        confirmLoading={busy} onOk={() => ipForm.submit()} okText="Добавить">
        <Form form={ipForm} layout="vertical" onFinish={addIp}>
          <Form.Item name="ip" label="IP-адрес" rules={[{ required: true }]}><Input placeholder="203.0.113.10" /></Form.Item>
          <Form.Item name="label" label="Метка"><Input placeholder="прод-сервер" /></Form.Item>
        </Form>
      </Modal>
    </Show>
  );
};
