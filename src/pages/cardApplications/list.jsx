import { useState } from 'react';
import { List, useTable, DateField } from '@refinedev/antd';
import { useInvalidate } from '@refinedev/core';
import { Table, Tag, Typography, Segmented, Button, Modal, Form, Select, Input, message, Space, Descriptions } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ADMIN_API } from '../../constants.js';
import { httpClient } from '../../httpClient.js';

const { Text } = Typography;

const STATUS = {
  NEW: { color: 'blue', label: 'Новая' },
  IN_REVIEW: { color: 'gold', label: 'На рассмотрении' },
  APPROVED: { color: 'green', label: 'Одобрена' },
  REJECTED: { color: 'red', label: 'Отклонена' },
};

export const CardApplicationList = () => {
  const [status, setStatus] = useState('ALL');
  const { tableProps } = useTable({
    syncWithLocation: false,
    sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
    filters: { permanent: status === 'ALL' ? [] : [{ field: 'status', operator: 'eq', value: status }] },
  });
  const invalidate = useInvalidate();
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();

  const open = (row) => { setEditing(row); form.setFieldsValue({ status: row.status, adminNote: row.adminNote }); };

  const save = async (v) => {
    setBusy(true);
    try {
      await httpClient.patch(`${ADMIN_API}/card-applications/${editing.id}`, v);
      message.success('Заявка обновлена');
      setEditing(null);
      invalidate({ resource: 'card-applications', invalidates: ['list'] });
    } catch (e) { message.error(e.response?.data?.error || 'Ошибка'); }
    finally { setBusy(false); }
  };

  return (
    <List title="Заявки на карты" canCreate={false} headerButtons={
      <Segmented value={status} onChange={setStatus} options={[
        { value: 'ALL', label: 'Все' }, { value: 'NEW', label: 'Новые' }, { value: 'IN_REVIEW', label: 'В работе' },
        { value: 'APPROVED', label: 'Одобрены' }, { value: 'REJECTED', label: 'Отклонены' }]} />
    }>
      <Table {...tableProps} rowKey="id" scroll={{ x: 1000 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v, r) => (
          <Space direction="vertical" size={0}><Text strong>{v || '—'}</Text><Text type="secondary" style={{ fontSize: 12 }}>{r.client?.email}</Text></Space>
        )} />
        <Table.Column dataIndex="contact" title="Контакт" render={(v, r) => (
          <Space direction="vertical" size={0}><Text copyable>{v}</Text>{r.contactName && <Text type="secondary" style={{ fontSize: 12 }}>{r.contactName}</Text>}</Space>
        )} />
        <Table.Column dataIndex="cardType" title="Тип" render={(v) => v || '—'} />
        <Table.Column dataIndex="volume" title="Объём" render={(v) => v || '—'} />
        <Table.Column dataIndex="status" title="Статус" render={(v) => <Tag color={STATUS[v]?.color}>{STATUS[v]?.label || v}</Tag>} />
        <Table.Column dataIndex="createdAt" title="Дата" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
        <Table.Column title="" fixed="right" render={(_, r) => <Button size="small" icon={<EditOutlined />} onClick={() => open(r)}>Обработать</Button>} />
      </Table>

      <Modal title="Обработка заявки" open={!!editing} onCancel={() => setEditing(null)} confirmLoading={busy} onOk={() => form.submit()} okText="Сохранить">
        {editing && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Клиент">{editing.client?.name} ({editing.client?.email})</Descriptions.Item>
              <Descriptions.Item label="Контакт">{editing.contact}</Descriptions.Item>
              <Descriptions.Item label="Тип карт">{editing.cardType || '—'}</Descriptions.Item>
              <Descriptions.Item label="Объём">{editing.volume || '—'}</Descriptions.Item>
              <Descriptions.Item label="Комментарий">{editing.comment || '—'}</Descriptions.Item>
            </Descriptions>
            <Form form={form} layout="vertical" onFinish={save}>
              <Form.Item name="status" label="Статус"><Select options={Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label }))} /></Form.Item>
              <Form.Item name="adminNote" label="Ответ клиенту / заметка"><Input.TextArea rows={3} placeholder="Виден клиенту в кабинете" /></Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </List>
  );
};
