import { useEffect, useState } from 'react';
import { useLogout } from '@refinedev/core';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Row, Col, Card, Typography, Descriptions, Tag, Form, Input, Button, message, Space, Avatar, Upload, Alert, Steps, Popconfirm,
} from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, CameraOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ADMIN_API } from '../constants.js';
import { httpClient } from '../httpClient.js';
import { LNP_PRIMARY } from '../components/Brand.jsx';

const { Title, Text, Paragraph } = Typography;

// Resize an uploaded image to a compact square JPEG data URL (client-side).
function fileToAvatar(file, size = 160) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Google Authenticator (TOTP) setup + management card.
function TwoFactorCard({ me, reload }) {
  const [setup, setSetup] = useState(null); // { secret, otpauth }
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    try { const { data } = await httpClient.post(`${ADMIN_API}/auth/2fa/setup`); setSetup(data); }
    catch (e) { message.error(e.response?.data?.error || 'Ошибка'); } finally { setBusy(false); }
  };
  const enable = async () => {
    setBusy(true);
    try { await httpClient.post(`${ADMIN_API}/auth/2fa/enable`, { totp: code }); message.success('2FA включена'); setSetup(null); setCode(''); reload(); }
    catch (e) { message.error(e.response?.data?.error || 'Неверный код'); } finally { setBusy(false); }
  };
  const disable = async (v) => {
    setBusy(true);
    try { await httpClient.post(`${ADMIN_API}/auth/2fa/disable`, v); message.success('2FA отключена'); reload(); }
    catch (e) { message.error(e.response?.data?.error || 'Ошибка'); } finally { setBusy(false); }
  };

  return (
    <Card style={{ marginTop: 16 }} title={<Space><SafetyOutlined />Двухфакторная аутентификация (2FA)</Space>}
      extra={me.totpEnabled ? <Tag color="success" icon={<CheckCircleOutlined />}>Включена</Tag> : <Tag>Выключена</Tag>}>
      {me.totpEnabled ? (
        <>
          <Alert type="success" showIcon style={{ marginBottom: 12 }} message="Вход защищён кодом из Google Authenticator." />
          <Form layout="vertical" onFinish={disable} requiredMark={false}>
            <Text type="secondary">Чтобы отключить 2FA, подтвердите пароль и текущий код:</Text>
            <Row gutter={8} style={{ marginTop: 8 }}>
              <Col xs={24} sm={12}><Form.Item name="password" rules={[{ required: true, message: 'Пароль' }]}><Input.Password placeholder="Пароль" /></Form.Item></Col>
              <Col xs={24} sm={8}><Form.Item name="totp" rules={[{ required: true, message: 'Код' }]}><Input placeholder="Код 2FA" maxLength={6} inputMode="numeric" /></Form.Item></Col>
              <Col xs={24} sm={4}><Button danger htmlType="submit" loading={busy} block>Отключить</Button></Col>
            </Row>
          </Form>
        </>
      ) : !setup ? (
        <>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Защитите вход в админку одноразовыми кодами. Понадобится приложение Google Authenticator, Authy или 1Password.
          </Paragraph>
          <Button type="primary" icon={<SafetyOutlined />} onClick={start} loading={busy}>Включить 2FA</Button>
        </>
      ) : (
        <>
          <Steps direction="vertical" size="small" current={1}
            items={[
              { title: 'Отсканируйте QR-код', description: (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eee', display: 'inline-block' }}>
                    <QRCodeCanvas value={setup.otpauth} size={168} />
                  </div>
                  <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Или введите ключ вручную:</Text><br />
                    <Text code copyable>{setup.secret}</Text>
                  </Paragraph>
                </div>
              ) },
              { title: 'Введите код из приложения', description: (
                <Space style={{ marginTop: 8 }}>
                  <Input placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} inputMode="numeric" style={{ width: 140 }} />
                  <Button type="primary" onClick={enable} loading={busy} disabled={code.length < 6}>Подтвердить</Button>
                  <Button onClick={() => { setSetup(null); setCode(''); }}>Отмена</Button>
                </Space>
              ) },
            ]} />
        </>
      )}
    </Card>
  );
}

export const AdminProfile = () => {
  const [me, setMe] = useState(null);
  const [savingPw, setSavingPw] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const { mutate: logout } = useLogout();
  const [pwForm] = Form.useForm();
  const [nameForm] = Form.useForm();

  const load = () => httpClient.get(`${ADMIN_API}/auth/me`).then((r) => { setMe(r.data); nameForm.setFieldsValue({ name: r.data.name }); });
  useEffect(() => { load(); }, []);

  const uploadAvatar = async (file) => {
    if (!file.type.startsWith('image/')) { message.error('Только изображения'); return false; }
    try {
      const dataUrl = await fileToAvatar(file);
      await httpClient.patch(`${ADMIN_API}/auth/me`, { avatarUrl: dataUrl });
      const stored = JSON.parse(localStorage.getItem('billing_admin') || '{}');
      localStorage.setItem('billing_admin', JSON.stringify({ ...stored, avatarUrl: dataUrl }));
      message.success('Аватар обновлён'); load();
    } catch (e) { message.error(e.response?.data?.error || 'Ошибка загрузки'); }
    return false;
  };
  const removeAvatar = async () => {
    try { await httpClient.patch(`${ADMIN_API}/auth/me`, { avatarUrl: '' }); message.success('Аватар удалён'); load(); }
    catch { message.error('Ошибка'); }
  };

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
              <Avatar size={64} src={me.avatarUrl || undefined} style={{ background: LNP_PRIMARY }} icon={<UserOutlined />}>
                {(me.name || me.email || '?').slice(0, 1).toUpperCase()}
              </Avatar>
              <div>
                <Title level={4} style={{ margin: 0 }}>{me.name || 'Администратор'}</Title>
                <Tag color="blue">{me.role}</Tag>
              </div>
            </Space>
            <Space wrap style={{ marginBottom: 16 }}>
              <Upload showUploadList={false} accept="image/*" beforeUpload={uploadAvatar}>
                <Button size="small" icon={<CameraOutlined />}>Загрузить аватар</Button>
              </Upload>
              {me.avatarUrl && <Button size="small" danger onClick={removeAvatar}>Удалить</Button>}
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
          <TwoFactorCard me={me} reload={load} />
        </Col>
      </Row>
    </div>
  );
};
