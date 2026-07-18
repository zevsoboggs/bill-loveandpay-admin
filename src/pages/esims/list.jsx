import { List, useTable, DateField } from '@refinedev/antd';
import { Table, Tag, Typography } from 'antd';
import { usdt } from '../../constants.js';

const { Text } = Typography;

export const EsimList = () => {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  return (
    <List title="Выпущенные eSIM" canCreate={false}>
      <Table {...tableProps} rowKey="id" scroll={{ x: 1000 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="planName" title="Тариф" render={(v, r) => (
          <span><Text strong>{v || '—'}</Text> {r.country && <Tag>{r.country}</Tag>}</span>
        )} />
        <Table.Column dataIndex="iccid" title="ICCID" render={(v) => v ? <Text code copyable style={{ fontSize: 11 }}>{v}</Text> : '—'} />
        <Table.Column dataIndex="dataAmount" title="Трафик" render={(v, r) => v ? `${v} GB · ${r.days}д` : '—'} />
        <Table.Column dataIndex="priceEur" title="Цена EUR" align="right" render={(v) => v ? `€${v}` : '—'} />
        <Table.Column dataIndex="chargedUsdt" title="Списано" align="right" render={(v) => <Text strong>{usdt(v)}</Text>} />
        <Table.Column dataIndex="status" title="Статус" render={(v) => <Tag color="purple">{v || '—'}</Tag>} />
        <Table.Column dataIndex="createdAt" title="Дата" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
      </Table>
    </List>
  );
};
