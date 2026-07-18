import { List, useTable, DateField } from '@refinedev/antd';
import { Table, Tag, Typography } from 'antd';
import { usdt } from '../../constants.js';

const { Text } = Typography;
const KIND_COLOR = { DEPOSIT: 'blue', ALLOCATION: 'purple', PAYMENT: 'volcano', REFUND: 'gold', ADJUSTMENT: 'default' };
const BAL_COLOR = { DEPOSIT: 'default', SBP: 'geekblue', PROMPTPAY: 'green' };

export const LedgerList = () => {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  return (
    <List title="Ledger (аудит балансов)">
      <Table {...tableProps} rowKey="id" scroll={{ x: 900 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="kind" title="Операция" render={(v) => <Tag color={KIND_COLOR[v]}>{v}</Tag>} />
        <Table.Column dataIndex="balanceType" title="Баланс" render={(v) => <Tag color={BAL_COLOR[v]}>{v}</Tag>} />
        <Table.Column dataIndex="amountUsdt" title="Изменение" align="right" render={(v) => (
          <Text strong type={Number(v) >= 0 ? 'success' : 'danger'}>{Number(v) >= 0 ? '+' : ''}{usdt(v)}</Text>)} />
        <Table.Column dataIndex="balanceAfter" title="Остаток" align="right" render={(v) => usdt(v)} />
        <Table.Column dataIndex="note" title="Комментарий" render={(v) => v || '—'} />
        <Table.Column dataIndex="createdAt" title="Дата" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
      </Table>
    </List>
  );
};
