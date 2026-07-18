import { List, useTable, DeleteButton, DateField } from '@refinedev/antd';
import { Table, Typography } from 'antd';

const { Text } = Typography;

export const IpWhitelistList = () => {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  return (
    <List title="Белый список IP" canCreate={false}>
      <Table {...tableProps} rowKey="id" scroll={{ x: 700 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="ip" title="IP" render={(v) => <Text code>{v}</Text>} />
        <Table.Column dataIndex="label" title="Метка" render={(v) => v || '—'} />
        <Table.Column dataIndex="createdAt" title="Добавлен" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
        <Table.Column title="" fixed="right" render={(_, r) => <DeleteButton hideText size="small" recordItemId={r.id} />} />
      </Table>
    </List>
  );
};
