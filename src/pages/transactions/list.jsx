import { List, useTable, DateField } from '@refinedev/antd';
import { Table, Tag, Typography, Segmented, Space, Select, Button, Modal, Descriptions, Spin, Empty } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { SYSTEM_LABEL, SYSTEM_COLOR, TX_STATUS_COLOR, usdt, ADMIN_API } from '../../constants.js';
import { httpClient } from '../../httpClient.js';
import { makeSetFilter, ClientFilterSelect } from '../../components/filters.jsx';

const { Text } = Typography;

export const TransactionList = () => {
  const [system, setSystem] = useState('ALL');
  const { tableProps, setFilters } = useTable({
    syncWithLocation: false,
    sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
    filters: { permanent: system === 'ALL' ? [] : [{ field: 'system', operator: 'eq', value: system }] },
  });
  const setF = makeSetFilter(setFilters);

  // PromptPay slip/receipt viewer
  const [slip, setSlip] = useState(null); // { tx, loading, receipt, imgUrl, error }
  const openSlip = async (tx) => {
    setSlip({ tx, loading: true });
    const [rcp, img] = await Promise.all([
      httpClient.get(`${ADMIN_API}/transactions/${tx.id}/receipt`).then((r) => r.data).catch(() => null),
      httpClient.get(`${ADMIN_API}/transactions/${tx.id}/slip`, { responseType: 'blob' }).then((r) => URL.createObjectURL(r.data)).catch(() => null),
    ]);
    setSlip({ tx, loading: false, receipt: rcp, imgUrl: img });
  };
  const closeSlip = () => { if (slip?.imgUrl) URL.revokeObjectURL(slip.imgUrl); setSlip(null); };
  const r = slip?.receipt || {};

  return (
    <List title="Транзакции" headerButtons={
      <Segmented value={system} onChange={setSystem} options={[
        { value: 'ALL', label: 'Все' }, { value: 'SBP', label: SYSTEM_LABEL.SBP }, { value: 'PROMPTPAY', label: SYSTEM_LABEL.PROMPTPAY }, { value: 'ESIM', label: SYSTEM_LABEL.ESIM }, { value: 'VPN', label: SYSTEM_LABEL.VPN }]} />
    }>
      <Space wrap style={{ marginBottom: 16 }}>
        <ClientFilterSelect onChange={setF('clientId', 'eq')} />
        <Select allowClear placeholder="Статус" style={{ width: 170 }} onChange={setF('status', 'eq')}
          options={['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'].map((v) => ({ value: v }))} />
      </Space>
      <Table {...tableProps} rowKey="id" scroll={{ x: 1100 }}>
        <Table.Column dataIndex={['client', 'name']} title="Клиент" render={(v) => v || '—'} />
        <Table.Column dataIndex="system" title="Система" render={(v) => <Tag color={SYSTEM_COLOR[v]}>{SYSTEM_LABEL[v]}</Tag>} />
        <Table.Column title="Сумма (источник)" render={(_, row) => row.sourceAmount ? `${Number(row.sourceAmount).toLocaleString('ru-RU')} ${row.sourceCurrency}` : '—'} />
        <Table.Column dataIndex="chargedUsdt" title="Списано" align="right" render={(v) => <Text strong>{usdt(v)}</Text>} />
        <Table.Column dataIndex="marginUsdt" title="Прибыль" align="right" render={(v) => <Text type="success">+{usdt(v)}</Text>} />
        <Table.Column dataIndex="status" title="Статус" render={(v) => <Tag color={TX_STATUS_COLOR[v]}>{v}</Tag>} />
        <Table.Column dataIndex="providerRef" title="Ref провайдера" render={(v) => v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : '—'} />
        <Table.Column title="Чек" align="center" render={(_, row) => (
          row.system === 'PROMPTPAY' && row.providerRef
            ? <Button size="small" icon={<FileImageOutlined />} onClick={() => openSlip(row)}>Слип</Button>
            : <Text type="secondary">—</Text>
        )} />
        <Table.Column dataIndex="createdAt" title="Дата" render={(v) => <DateField value={v} format="DD.MM.YYYY HH:mm" />} />
      </Table>

      <Modal open={!!slip} onCancel={closeSlip} footer={null} width={520}
        title={slip ? `Чек PromptPay · ${slip.tx.providerRef}` : 'Чек'}>
        {slip?.loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : slip && (
          <>
            {(r.получатель || r.статус) && (
              <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
                {r.статус && <Descriptions.Item label="Статус"><Tag color={r.статус === 'completed' ? 'success' : 'processing'}>{r.статус}</Tag></Descriptions.Item>}
                {r.получатель && <Descriptions.Item label="Получатель">{r.получатель}</Descriptions.Item>}
                {r.счёт && <Descriptions.Item label="Счёт">{r.счёт}</Descriptions.Item>}
                {r.банк && <Descriptions.Item label="Банк">{r.банк}</Descriptions.Item>}
                {(r.сумма_thb != null) && <Descriptions.Item label="Сумма">{r.сумма_thb} THB{r.сумма_usdt ? ` · ${r.сумма_usdt} USDT` : ''}</Descriptions.Item>}
                {r.метод && <Descriptions.Item label="Метод">{r.метод}</Descriptions.Item>}
                {r.референс && <Descriptions.Item label="Референс"><Text code copyable style={{ fontSize: 11 }}>{r.референс}</Text></Descriptions.Item>}
                {r.дата && <Descriptions.Item label="Дата">{new Date(r.дата).toLocaleString('ru-RU')}</Descriptions.Item>}
                {r.bsc_hash && <Descriptions.Item label="BSC hash"><Text code copyable style={{ fontSize: 10 }}>{r.bsc_hash}</Text></Descriptions.Item>}
              </Descriptions>
            )}
            {slip.imgUrl
              ? <div style={{ textAlign: 'center' }}><img src={slip.imgUrl} alt="slip" style={{ maxWidth: '100%', borderRadius: 10, border: '1px solid #eee' }} /></div>
              : <Empty description={slip.error || 'Слип ещё формируется — повторите через ~1 минуту'} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          </>
        )}
      </Modal>
    </List>
  );
};
