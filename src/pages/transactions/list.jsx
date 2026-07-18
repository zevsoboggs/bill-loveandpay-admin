import { List, useTable, DateField } from '@refinedev/antd';
import { Table, Tag, Typography, Segmented, Space } from 'antd';
import { useState } from 'react';
import { SYSTEM_LABEL, SYSTEM_COLOR, TX_STATUS_COLOR, usdt } from '../../constants.js';

const { Text } = Typography;

export const TransactionList = () => {
  const [system, setSystem] = useState('ALL');
  const { tableProps } = useTable({
    syncWithLocation: false,
    sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
    filters: { permanent: system === 'ALL' ? [] : [{ field: 'system', operator: 'eq', value: system }] },
  });

  return (
    <List title="Транзакции" headerButtons={
      <Segmented value={system} onChange={setSystem} options={[
        { value: 'ALL', label: 'Все' }, { value: 'SBP', label: SYSTEM_LABEL.SBP }, { value: 'PROMPTPAY', label: SYSTEM_LABEL.PROMPTPAY }]} />
    }>
      <Table {...tableProps} rowKey="id" scroll={{ x: 1000 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="system" title="Система" render={(v) => <Tag color={SYSTEM_COLOR[v]}>{SYSTEM_LABEL[v]}</Tag>} />
        <Table.Column title="Сумма (источник)" render={(_, r) => r.sourceAmount ? `${Number(r.sourceAmount).toLocaleString('ru-RU')} ${r.sourceCurrency}` : '—'} />
        <Table.Column dataIndex="chargedUsdt" title="Списано" align="right" render={(v) => <Text strong>{usdt(v)}</Text>} />
        <Table.Column dataIndex="marginUsdt" title="Прибыль" align="right" render={(v) => <Text type="success">+{usdt(v)}</Text>} />
        <Table.Column dataIndex="status" title="Статус" render={(v) => <Tag color={TX_STATUS_COLOR[v]}>{v}</Tag>} />
        <Table.Column dataIndex="providerRef" title="Ref провайдера" render={(v) => v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : '—'} />
        <Table.Column dataIndex="createdAt" title="Дата" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
      </Table>
    </List>
  );
};
