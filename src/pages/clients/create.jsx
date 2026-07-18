import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, Switch, InputNumber, Alert, Row, Col, Divider } from 'antd';

// Margins are stored as fractions (0.033) but entered as percent (3.3).
const pctToFraction = (p) => (p === undefined || p === null || p === '' ? null : Number(p) / 100);

export const ClientCreate = () => {
  const { formProps, saveButtonProps, onFinish } = useForm();

  const submit = ({ sbpMarginPct, promptpayMarginPct, ...rest }) =>
    onFinish({ ...rest, sbpMargin: pctToFraction(sbpMarginPct), promptpayMargin: pctToFraction(promptpayMarginPct) });

  return (
    <Create saveButtonProps={saveButtonProps} title="Новый клиент-реселлер">
      <Form {...formProps} onFinish={submit} layout="vertical" initialValues={{ status: 'ACTIVE', ipRestricted: true, createWallet: true, portalEnabled: true }}>
        <Row gutter={16}>
          <Col xs={24} md={12}><Form.Item name="name" label="Название" rules={[{ required: true }]}><Input placeholder="ACME Reseller" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="company" label="Компания"><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="email" label="Email"><Input type="email" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="status" label="Статус"><Select options={[
            { value: 'ACTIVE', label: 'ACTIVE' }, { value: 'PENDING', label: 'PENDING' }, { value: 'SUSPENDED', label: 'SUSPENDED' }]} /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="sbpMarginPct" label="Наценка СБП, %" tooltip="Например 3.3. Пусто = дефолт платформы (4%)"><InputNumber min={0} max={100} step={0.1} addonAfter="%" placeholder="напр. 3.3" style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="promptpayMarginPct" label="Наценка PromptPay, %" tooltip="Например 3.3. Пусто = дефолт платформы (4%)"><InputNumber min={0} max={100} step={0.1} addonAfter="%" placeholder="напр. 3.3" style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Form.Item name="ipRestricted" label="Ограничение по белому списку IP" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="createWallet" label="Создать депозитный USDT-кошелёк (CryptoOffice)" valuePropName="checked"
          tooltip="Создаёт транзитный TRON-кошелёк для приёма USDT-депозитов клиента"><Switch /></Form.Item>

        <Divider orientation="left">Доступ в кабинет клиента</Divider>
        <Form.Item name="portalEnabled" label="Включить кабинет клиента (вход на портал)" valuePropName="checked"
          tooltip="Клиент сможет входить на портал (localhost:5174) по email и паролю"><Switch /></Form.Item>
        <Form.Item name="password" label="Пароль для входа в кабинет"
          tooltip="Минимум 8 символов. Клиент сможет сменить его сам в профиле."
          rules={[({ getFieldValue }) => ({
            validator(_, v) {
              if (getFieldValue('portalEnabled') && !v) return Promise.reject(new Error('Задайте пароль для кабинета'));
              if (v && v.length < 8) return Promise.reject(new Error('Минимум 8 символов'));
              return Promise.resolve();
            },
          })]}>
          <Input.Password placeholder="минимум 8 символов" autoComplete="new-password" />
        </Form.Item>
        <Alert type="info" showMessage message="API-ключ и секрет будут сгенерированы автоматически. Секрет виден на карточке клиента. Для входа в кабинет нужны email + пароль." />
      </Form>
    </Create>
  );
};
