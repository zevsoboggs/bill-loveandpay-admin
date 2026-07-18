import { useLogin } from '@refinedev/core';
import { Card, Form, Input, Button, Typography, theme } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { LogoMark, LNP_ACCENT } from '../components/Brand.jsx';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const { mutate: login, isLoading } = useLogin();
  const { token } = theme.useToken();

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
        <Form layout="vertical" onFinish={(values) => login(values)} requiredMark={false}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Введите email' }]}>
            <Input size="large" prefix={<MailOutlined />} placeholder="admin@loveandpay.io" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={isLoading} style={{ marginTop: 8 }}>
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
};
