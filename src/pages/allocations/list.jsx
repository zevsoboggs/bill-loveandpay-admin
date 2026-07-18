import { useState } from 'react';
import { List, useTable, DateField } from '@refinedev/antd';
import { useInvalidate } from '@refinedev/core';
import { Table, Tag, Typography, Button, Modal, Form, Select, Segmented, InputNumber, Input, message } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useSelect } from '@refinedev/antd';
import { SYSTEM_LABEL, SYSTEM_COLOR, usdt, ADMIN_API } from '../../constants.js';
import { httpClient } from '../../httpClient.js';

const { Text } = Typography;

export const AllocationList = () => {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  const { selectProps: clientSelect } = useSelect({ resource: 'clients', optionLabel: 'name', optionValue: 'id', pagination: { pageSize: 100 } });
  const invalidate = useInvalidate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();

  const submit = async (v) => {
    setBusy(true);
    try {
      await httpClient.post(`${ADMIN_API}/allocations`, { clientId: v.clientId, system: v.system, amount: Number(v.amount), note: v.note });
      message.success('Распределено');
      setOpen(false); form.resetFields();
      invalidate({ resource: 'allocations', invalidates: ['list'] });
    } catch (e) { message.error(e.response?.data?.error || 'Ошибка'); }
    finally { setBusy(false); }
  };

  return (
    <List headerButtons={<Button type="primary" icon={<SwapOutlined />} onClick={() => setOpen(true)}>Распределить депозит</Button>}>
      <Table {...tableProps} rowKey="id" scroll={{ x: 800 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="system" title="Система" render={(v) => <Tag color={SYSTEM_COLOR[v]}>{SYSTEM_LABEL[v]}</Tag>} />
        <Table.Column dataIndex="amount" title="Сумма" align="right" render={(v) => (
          <Text strong type={Number(v) >= 0 ? 'success' : 'danger'}>{Number(v) >= 0 ? '+' : ''}{usdt(v)}</Text>)} />
        <Table.Column dataIndex="balanceAfter" title="Баланс после" align="right" render={(v) => usdt(v)} />
        <Table.Column dataIndex={['admin', 'email']} title="Админ" render={(v) => v || '—'} />
        <Table.Column dataIndex="note" title="Комментарий" render={(v) => v || '—'} />
        <Table.Column dataIndex="createdAt" title="Дата" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
      </Table>

      <Modal title="Распределение депозита между системами" open={open} onCancel={() => setOpen(false)}
        confirmLoading={busy} onOk={() => form.submit()} okText="Распределить">
        <Form form={form} layout="vertical" onFinish={submit} initialValues={{ system: 'SBP' }}>
          <Form.Item name="clientId" label="Клиент" rules={[{ required: true }]}><Select {...clientSelect} showSearch placeholder="Выберите клиента" /></Form.Item>
          <Form.Item name="system" label="Система"><Segmented block options={[
            { value: 'SBP', label: SYSTEM_LABEL.SBP }, { value: 'PROMPTPAY', label: SYSTEM_LABEL.PROMPTPAY }]} /></Form.Item>
          <Form.Item name="amount" label="Сумма (USDT)" tooltip="Отрицательная — вернуть из системы на депозит" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} step={10} placeholder="напр. 500 или -100" /></Form.Item>
          <Form.Item name="note" label="Комментарий"><Input /></Form.Item>
        </Form>
      </Modal>
    </List>
  );
};
