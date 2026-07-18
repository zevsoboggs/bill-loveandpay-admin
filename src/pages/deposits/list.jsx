import { List, useTable, CreateButton, DateField } from '@refinedev/antd';
import { Table, Tag, Typography } from 'antd';
import { usdt } from '../../constants.js';

const { Text } = Typography;
const DEP_COLOR = { PENDING: 'default', CONFIRMED: 'processing', CREDITED: 'success', FAILED: 'error' };

export const DepositList = () => {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  return (
    <List headerButtons={<CreateButton>Внести депозит</CreateButton>}>
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
