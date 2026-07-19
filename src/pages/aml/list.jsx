import { useEffect, useState } from 'react';
import { List, useTable, DateField } from '@refinedev/antd';
import { Table, Tag, Typography, Space, Input, Alert } from 'antd';
import { usdt, ADMIN_API } from '../../constants.js';
import { httpClient } from '../../httpClient.js';
import { makeSetFilter, ClientFilterSelect } from '../../components/filters.jsx';

const { Text } = Typography;

const RISK = { low: { c: 'success', l: 'Низкий' }, medium: { c: 'warning', l: 'Средний' }, high: { c: 'error', l: 'Высокий' } };

export const AmlCheckList = () => {
  const { tableProps, setFilters } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: 'createdAt', order: 'desc' }] } });
  const setF = makeSetFilter(setFilters);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    httpClient.get(`${ADMIN_API}/aml-checks/provider-quota`).then((r) => setQuota(r.data?.checks_remaining ?? null)).catch(() => {});
  }, []);

  return (
    <List title="AML-проверки" canCreate={false}>
      {quota != null && (
        <Alert style={{ marginBottom: 16 }} type={quota < 100 ? 'warning' : 'info'} showIcon
          message={<span>Остаток проверок на нашем ключе провайдера: <b>{quota}</b>{quota < 100 ? ' — пора пополнять квоту' : ''}</span>} />
      )}
      <Space wrap style={{ marginBottom: 16 }}>
        <ClientFilterSelect onChange={setF('clientId', 'eq')} />
        <Input.Search allowClear placeholder="Сеть" style={{ width: 160 }} onSearch={setF('network', 'contains')} />
      </Space>
      <Table {...tableProps} rowKey="id" scroll={{ x: 900 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="address" title="Адрес" render={(v) => <Text code copyable={{ text: v }} style={{ fontSize: 11 }}>{v.slice(0, 10)}…{v.slice(-6)}</Text>} />
        <Table.Column dataIndex="network" title="Сеть" render={(v) => v || '—'} />
        <Table.Column dataIndex="score" title="Балл" align="center" render={(v) => v ?? '—'} />
        <Table.Column dataIndex="riskLevel" title="Риск" align="center" render={(v) => { const r = RISK[v]; return r ? <Tag color={r.c}>{r.l}</Tag> : <Tag>{v || '—'}</Tag>; }} />
        <Table.Column dataIndex="verdict" title="Вердикт" render={(v) => v || '—'} />
        <Table.Column dataIndex="chargedUsdt" title="Списано" align="right" render={(v) => <Text strong>{usdt(v)}</Text>} />
        <Table.Column dataIndex="createdAt" title="Дата" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
      </Table>
    </List>
  );
};
