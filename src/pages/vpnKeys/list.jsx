import { List, useTable, DateField } from '@refinedev/antd';
import { Table, Tag, Typography, Space, Input } from 'antd';
import { usdt } from '../../constants.js';
import { makeSetFilter, ClientFilterSelect } from '../../components/filters.jsx';

const { Text } = Typography;

export const VpnKeyList = () => {
  const { tableProps, setFilters } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  const setF = makeSetFilter(setFilters);
  return (
    <List title="VPN-ключи" canCreate={false}>
      <Space wrap style={{ marginBottom: 16 }}>
        <ClientFilterSelect onChange={setF('clientId', 'eq')} />
        <Input.Search allowClear placeholder="Страна" style={{ width: 180 }} onSearch={setF('country', 'contains')} />
      </Space>
      <Table {...tableProps} rowKey="id" scroll={{ x: 1000 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="locationLabel" title="Локация" render={(v) => v || '—'} />
        <Table.Column dataIndex="protocol" title="Протокол" render={(v) => <Tag color={v === 'shadowsocks' ? 'gold' : 'volcano'}>{v}</Tag>} />
        <Table.Column dataIndex="config" title="Ключ" render={(v) => v ? <Text code copyable={{ text: v }} style={{ fontSize: 11 }}>{v.slice(0, 24)}…</Text> : '—'} />
        <Table.Column dataIndex="chargedUsdt" title="Списано" align="right" render={(v) => <Text strong>{usdt(v)}</Text>} />
        <Table.Column dataIndex="status" title="Статус" render={(v) => <Tag color="volcano">{v}</Tag>} />
        <Table.Column dataIndex="expiresAt" title="Действует до" render={(v) => v ? <DateField value={v} format="DD.MM.YYYY" /> : '—'} />
        <Table.Column dataIndex="createdAt" title="Создан" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
      </Table>
    </List>
  );
};
