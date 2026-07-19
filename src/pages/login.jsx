import { useState } from 'react';
import { useLogin } from '@refinedev/core';
import { Card, Form, Input, Button, Typography, Alert } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { LogoMark, LNP_ACCENT } from '../components/Brand.jsx';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const { mutate: login, isLoading } = useLogin();
  const [needTotp, setNeedTotp] = useState(false);
  const [totpError, setTotpError] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    login(values, {
      onSuccess: (data) => {
        if (data?.success === false && data?.error?.name === '2fa') {
          setNeedTotp(true);
          setTotpError(data.error.code === 'TOTP_INVALID');
        }
      },
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0b2b34 0%, #0F4C5C 55%, #14708a 100%)', padding: 16 }}>
      <Card style={{ width: 410, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <LogoMark height={52} color="#0F4C5C" />
          </div>
          <Title level={3} style={{ marginBottom: 0, letterSpacing: -0.5 }}>
            Love<span style={{ color: LNP_ACCENT }}>&amp;</span>Pay
          </Title>
          <Text type="secondary">Панель администратора платформы</Text>
        </div>
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Введите email' }]}>
            <Input size="large" prefix={<MailOutlined />} placeholder="admin@loveandpay.io" autoComplete="username" disabled={needTotp} />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" autoComplete="current-password" disabled={needTotp} />
          </Form.Item>
          {needTotp && (
            <>
              {totpError && <Alert type="error" showIcon style={{ marginBottom: 12 }} message="Неверный код, попробуйте ещё раз" />}
              <Form.Item name="totp" label="Код из Google Authenticator" rules={[{ required: true, message: 'Введите 6-значный код' }]}>
                <Input size="large" prefix={<SafetyOutlined />} placeholder="123456" inputMode="numeric" maxLength={6} autoFocus autoComplete="one-time-code" />
              </Form.Item>
            </>
          )}
          <Button type="primary" htmlType="submit" size="large" block loading={isLoading} style={{ marginTop: 8 }}>
            {needTotp ? 'Подтвердить' : 'Войти'}
          </Button>
          {needTotp && (
            <Button type="link" block style={{ marginTop: 8 }} onClick={() => { setNeedTotp(false); setTotpError(false); form.setFieldValue('totp', undefined); }}>
              ← Назад
            </Button>
          )}
        </Form>
      </Card>
    </div>
  );
};
