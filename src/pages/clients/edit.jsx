import { useEffect } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, Switch, InputNumber, Row, Col, Divider, Alert } from 'antd';

// Margins are stored as fractions (0.033) but shown/entered as percent (3.3).
const pctToFraction = (p) => (p === undefined || p === null || p === '' ? null : Number(p) / 100);
const fractionToPct = (f) => (f === undefined || f === null ? undefined : Number(f) * 100);

export const ClientEdit = () => {
  const { formProps, saveButtonProps, query, onFinish } = useForm();
  const record = query?.data?.data;
  const hasPassword = record?.hasPassword;

  // Populate percent fields from the fetched fractional margins.
  useEffect(() => {
    if (record) formProps.form?.setFieldsValue({
      sbpMarginPct: fractionToPct(record.sbpMargin),
      promptpayMarginPct: fractionToPct(record.promptpayMargin),
      esimMarginPct: fractionToPct(record.esimMargin),
    });
  }, [record]);

  const submit = ({ sbpMarginPct, promptpayMarginPct, esimMarginPct, ...rest }) =>
    onFinish({ ...rest, sbpMargin: pctToFraction(sbpMarginPct), promptpayMargin: pctToFraction(promptpayMarginPct), esimMargin: pctToFraction(esimMarginPct) });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактирование клиента">
      <Form {...formProps} onFinish={submit} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}><Form.Item name="name" label="Название" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="company" label="Компания"><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="email" label="Email"><Input type="email" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="status" label="Статус"><Select options={[
            { value: 'ACTIVE', label: 'ACTIVE' }, { value: 'PENDING', label: 'PENDING' }, { value: 'SUSPENDED', label: 'SUSPENDED' }]} /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="sbpMarginPct" label="Наценка СБП, %" tooltip="Пусто = дефолт (4%)"><InputNumber min={0} max={100} step={0.1} addonAfter="%" placeholder="3.3" style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="promptpayMarginPct" label="Наценка PromptPay, %" tooltip="Пусто = дефолт (4%)"><InputNumber min={0} max={100} step={0.1} addonAfter="%" placeholder="4" style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="esimMarginPct" label="Наценка eSIM, %" tooltip="Пусто = дефолт (15%)"><InputNumber min={0} max={100} step={0.5} addonAfter="%" placeholder="15" style={{ width: '100%' }} /></Form.Item></Col>
        </Row>

        <Divider orientation="left">Доступ к услугам</Divider>
        <Row gutter={16}>
          <Col xs={24} md={8}><Form.Item name="sbpEnabled" label="СБП (USDT)" valuePropName="checked"><Switch /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="promptpayEnabled" label="PromptPay (Тай QR)" valuePropName="checked"><Switch /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="esimEnabled" label="eSIM" valuePropName="checked"><Switch /></Form.Item></Col>
        </Row>

        <Form.Item name="ipRestricted" label="Ограничение по белому списку IP" valuePropName="checked"><Switch /></Form.Item>

        <Divider orientation="left">Доступ в кабинет клиента</Divider>
        <Alert style={{ marginBottom: 16 }} type={hasPassword ? 'success' : 'warning'} showMessage
          message={hasPassword ? 'Пароль установлен — клиент может входить в кабинет.' : 'Пароль не задан — клиент не сможет войти в кабинет.'} />
        <Form.Item name="portalEnabled" label="Кабинет клиента включён" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="password" label={hasPassword ? 'Задать новый пароль' : 'Задать пароль'}
          tooltip="Оставьте пустым, чтобы не менять текущий пароль"
          rules={[{ min: 8, message: 'Минимум 8 символов' }]}>
          <Input.Password placeholder="оставьте пустым чтобы не менять" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Edit>
  );
};
