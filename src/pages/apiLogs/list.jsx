import { List, useTable, DateField } from '@refinedev/antd';
import { Table, Tag, Typography, Space, Select } from 'antd';
import { makeSetFilter, ClientFilterSelect } from '../../components/filters.jsx';

const { Text } = Typography;
const statusColor = (v) => (v == null ? 'default' : v < 300 ? 'success' : v < 500 ? 'warning' : 'error');

export const ApiLogList = () => {
  const { tableProps, setFilters } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  const setF = makeSetFilter(setFilters);
  return (
    <List title="API-логи" canCreate={false}>
      <Space wrap style={{ marginBottom: 16 }}>
        <ClientFilterSelect onChange={setF('clientId', 'eq')} />
        <Select allowClear placeholder="Метод" style={{ width: 120 }} onChange={setF('method', 'eq')}
          options={['GET', 'POST', 'PUT', 'DELETE'].map((v) => ({ value: v }))} />
        <Select allowClear placeholder="Статус" style={{ width: 150 }} onChange={setF('status', 'eq')}
          options={[{ value: 200, label: '200 OK' }, { value: 400, label: '400' }, { value: 401, label: '401' }, { value: 402, label: '402' }, { value: 403, label: '403' }, { value: 404, label: '404' }, { value: 500, label: '500' }, { value: 502, label: '502' }]} />
      </Space>
      <Table {...tableProps} rowKey="id" scroll={{ x: 900 }}>
        <Table.Column dataIndex="createdAt" title="Время" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm:ss" />} />
        <Table.Column dataIndex={['client', 'name']} title="Партнёр" render={(v) => v || '—'} />
        <Table.Column dataIndex="method" title="Метод" render={(v) => <Tag>{v}</Tag>} />
        <Table.Column dataIndex="path" title="Путь" render={(v) => <Text code style={{ fontSize: 11 }}>{v}</Text>} />
        <Table.Column dataIndex="status" title="Статус" align="center" render={(v) => v == null ? '—' : <Tag color={statusColor(v)}>{v}</Tag>} />
        <Table.Column dataIndex="durationMs" title="Время отв." align="right" render={(v) => v == null ? '—' : `${v} ms`} />
        <Table.Column dataIndex="ip" title="IP" render={(v) => v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : '—'} />
        <Table.Column dataIndex="sandbox" title="Режим" align="center" render={(v) => v ? <Tag color="blue">sandbox</Tag> : <Tag>live</Tag>} />
      </Table>
    </List>
  );
};
