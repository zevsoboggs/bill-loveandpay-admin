import { Create, useForm, useSelect } from '@refinedev/antd';
import { Form, Select, InputNumber, Input, Alert } from 'antd';

export const DepositCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  const { selectProps: clientSelect } = useSelect({ resource: 'clients', optionLabel: 'name', optionValue: 'id', pagination: { pageSize: 100 } });

  return (
    <Create saveButtonProps={saveButtonProps} title="Внести USDT-депозит">
      <Form {...formProps} layout="vertical" initialValues={{ network: 'TRC-20', status: 'CREDITED' }}>
        <Form.Item name="clientId" label="Клиент" rules={[{ required: true }]}><Select {...clientSelect} showSearch placeholder="Выберите клиента" /></Form.Item>
        <Form.Item name="amountUsdt" label="Сумма (USDT)" rules={[{ required: true }]}><InputNumber min={0} step={10} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="network" label="Сеть"><Select options={[{ value: 'TRC-20' }, { value: 'ERC-20' }, { value: 'BEP-20' }, { value: 'SOL' }]} /></Form.Item>
        <Form.Item name="txHash" label="TxHash (необязательно)"><Input /></Form.Item>
        <Form.Item name="status" label="Статус" tooltip="CREDITED — сразу зачислить на баланс депозита клиента">
          <Select options={[{ value: 'CREDITED', label: 'CREDITED — зачислить' }, { value: 'PENDING', label: 'PENDING' }, { value: 'CONFIRMED', label: 'CONFIRMED' }]} /></Form.Item>
        <Form.Item name="note" label="Комментарий"><Input.TextArea rows={2} /></Form.Item>
        <Alert type="info" showMessage message="При статусе CREDITED сумма мгновенно зачисляется в депозитный пул клиента (в ledger)." />
      </Form>
    </Create>
  );
};
