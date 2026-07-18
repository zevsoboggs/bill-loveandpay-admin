import { List, useTable, EditButton, ShowButton, CreateButton } from '@refinedev/antd';
import { Table, Tag, Space, Typography } from 'antd';
import { CLIENT_STATUS_COLOR, usdt } from '../../constants.js';

const { Text } = Typography;

export const ClientList = () => {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });

  return (
    <List headerButtons={<CreateButton>Новый клиент</CreateButton>}>
      <Table {...tableProps} rowKey="id" scroll={{ x: 900 }}>
        <Table.Column dataIndex="name" title="Клиент" render={(v, r) => (
          <Space direction="vertical" size={0}>
            <Text strong>{v}</Text>
            {r.company && <Text type="secondary" style={{ fontSize: 12 }}>{r.company}</Text>}
            {r.email && <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>}
          </Space>
        )} />
        <Table.Column dataIndex="status" title="Статус" render={(v) => <Tag color={CLIENT_STATUS_COLOR[v]}>{v}</Tag>} />
        <Table.Column dataIndex="depositBalance" title="Депозит" align="right" render={(v) => usdt(v)} />
        <Table.Column dataIndex="sbpBalance" title="СБП" align="right" render={(v) => <Tag color="geekblue">{usdt(v)}</Tag>} />
        <Table.Column dataIndex="promptpayBalance" title="PromptPay" align="right" render={(v) => <Tag color="green">{usdt(v)}</Tag>} />
        <Table.Column dataIndex="ipRestricted" title="IP-защита" align="center" render={(v) => v ? <Tag color="success">Вкл</Tag> : <Tag>Выкл</Tag>} />
        <Table.Column title="" fixed="right" render={(_, r) => (
          <Space><ShowButton hideText size="small" recordItemId={r.id} /><EditButton hideText size="small" recordItemId={r.id} /></Space>
        )} />
      </Table>
    </List>
  );
};
