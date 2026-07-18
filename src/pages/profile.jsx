import { useEffect, useState } from 'react';
import { useLogout } from '@refinedev/core';
import {
  Row, Col, Card, Typography, Descriptions, Tag, Form, Input, Button, message, Space, Avatar,
} from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { ADMIN_API } from '../constants.js';
import { httpClient } from '../httpClient.js';
import { LNP_PRIMARY } from '../components/Brand.jsx';

const { Title, Text } = Typography;

export const AdminProfile = () => {
  const [me, setMe] = useState(null);
  const [savingPw, setSavingPw] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const { mutate: logout } = useLogout();
  const [pwForm] = Form.useForm();
  const [nameForm] = Form.useForm();

  const load = () => httpClient.get(`${ADMIN_API}/auth/me`).then((r) => { setMe(r.data); nameForm.setFieldsValue({ name: r.data.name }); });
  useEffect(() => { load(); }, []);

  const changePassword = async (v) => {
    if (v.newPassword !== v.confirm) return message.error('Пароли не совпадают');
    setSavingPw(true);
    try {
      await httpClient.post(`${ADMIN_API}/auth/change-password`, { currentPassword: v.currentPassword, newPassword: v.newPassword });
      message.success('Пароль изменён. Войдите заново.');
      pwForm.resetFields();
      setTimeout(() => logout(), 1200);
    } catch (e) { message.error(e.response?.data?.error || 'Ошибка'); }
    finally { setSavingPw(false); }
  };

  const saveName = async (v) => {
    setSavingName(true);
    try {
      await httpClient.patch(`${ADMIN_API}/auth/me`, { name: v.name });
      const stored = JSON.parse(localStorage.getItem('billing_admin') || '{}');
      localStorage.setItem('billing_admin', JSON.stringify({ ...stored, name: v.name }));
      message.success('Сохранено');
      load();
    } catch (e) { message.error(e.response?.data?.error || 'Ошибка'); }
    finally { setSavingName(false); }
  };

  if (!me) return null;

  return (
    <div>
      <Title level={3}>Профиль</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card>
            <Space align="center" style={{ marginBottom: 16 }}>
              <Avatar size={56} style={{ background: LNP_PRIMARY }} icon={<UserOutlined />}>
                {(me.name || me.email || '?').slice(0, 1).toUpperCase()}
              </Avatar>
              <div>
                <Title level={4} style={{ margin: 0 }}>{me.name || 'Администратор'}</Title>
                <Tag color="blue">{me.role}</Tag>
              </div>
            </Space>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Email">{me.email}</Descriptions.Item>
              <Descriptions.Item label="Роль">{me.role}</Descriptions.Item>
              <Descriptions.Item label="Последний вход">{me.lastLoginAt ? new Date(me.lastLoginAt).toLocaleString('ru-RU') : '—'}</Descriptions.Item>
            </Descriptions>
            <Form form={nameForm} layout="vertical" onFinish={saveName}>
              <Form.Item name="name" label="Отображаемое имя"><Input placeholder="Ваше имя" /></Form.Item>
              <Button htmlType="submit" loading={savingName}>Сохранить имя</Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<Space><SafetyOutlined />Смена пароля</Space>}>
            <Form form={pwForm} layout="vertical" onFinish={changePassword} requiredMark={false}>
              <Form.Item name="currentPassword" label="Текущий пароль" rules={[{ required: true, message: 'Введите текущий пароль' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="current-password" />
              </Form.Item>
              <Form.Item name="newPassword" label="Новый пароль"
                rules={[{ required: true, message: 'Введите новый пароль' }, { min: 8, message: 'Минимум 8 символов' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="минимум 8 символов" autoComplete="new-password" />
              </Form.Item>
              <Form.Item name="confirm" label="Повторите новый пароль" rules={[{ required: true, message: 'Повторите пароль' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="new-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={savingPw}>Изменить пароль</Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
