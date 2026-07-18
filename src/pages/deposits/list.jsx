import { List, useTable, CreateButton, DateField } from '@refinedev/antd';
import { Table, Tag, Typography, Select, Space } from 'antd';
import { usdt } from '../../constants.js';
import { makeSetFilter, ClientFilterSelect } from '../../components/filters.jsx';

const { Text } = Typography;
const DEP_COLOR = { PENDING: 'default', CONFIRMED: 'processing', CREDITED: 'success', FAILED: 'error' };

export const DepositList = () => {
  const { tableProps, setFilters } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  const setF = makeSetFilter(setFilters);
  return (
    <List headerButtons={<CreateButton>Внести депозит</CreateButton>}>
      <Space wrap style={{ marginBottom: 16 }}>
        <ClientFilterSelect onChange={setF('clientId', 'eq')} />
        <Select allowClear placeholder="Статус" style={{ width: 160 }} onChange={setF('status', 'eq')}
          options={[{ value: 'CREDITED' }, { value: 'PENDING' }, { value: 'CONFIRMED' }, { value: 'FAILED' }]} />
        <Select allowClear placeholder="Сеть" style={{ width: 140 }} onChange={setF('network', 'eq')}
          options={[{ value: 'TRC-20' }, { value: 'ERC-20' }, { value: 'BEP-20' }, { value: 'SOL' }]} />
      </Space>
      <Table {...tableProps} rowKey="id" scroll={{ x: 800 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="amountUsdt" title="Сумма" align="right" render={(v) => <Text strong>{usdt(v)}</Text>} />
        <Table.Column dataIndex="network" title="Сеть" render={(v) => <Tag>{v}</Tag>} />
        <Table.Column dataIndex="status" title="Статус" render={(v) => <Tag color={DEP_COLOR[v]}>{v}</Tag>} />
        <Table.Column dataIndex="txHash" title="TxHash" render={(v) => v ? <Text code copyable style={{ fontSize: 11 }}>{v.slice(0, 14)}…</Text> : '—'} />
        <Table.Column dataIndex="createdAt" title="Дата" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
      </Table>
    </List>
  );
};
