import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMenu, useLogout, useGetIdentity } from '@refinedev/core';
import { Layout, Menu, Button, Space, Grid, Dropdown, Avatar, Typography } from 'antd';
import {
  LogoutOutlined, UserOutlined, DownOutlined, ApiOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Brand, LNP_PRIMARY } from './Brand.jsx';
import { API_BASE } from '../constants.js';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export const AdminLayout = () => {
  const { menuItems, selectedKey } = useMenu();
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity();
  const nav = useNavigate();
  const loc = useLocation();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);

  // Map Refine menu → AntD menu items.
  const items = menuItems.map((m) => ({ key: m.route ?? m.key, icon: m.icon, label: m.label ?? m.name }));

  const currentLabel =
    menuItems.find((m) => (m.route ?? m.key) === loc.pathname)?.label ||
    (loc.pathname.startsWith('/profile') ? 'Профиль' : menuItems.find((m) => m.key === selectedKey)?.label) || '';

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Профиль и пароль' },
      { key: 'docs', icon: <ApiOutlined />, label: 'API Docs (Swagger)' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') logout();
      else if (key === 'profile') nav('/profile');
      else if (key === 'docs') window.open(`${API_BASE}/docs`, '_blank');
    },
  };

  const name = identity?.name || identity?.email || 'Admin';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="lg"
        width={256} collapsedWidth={screens.md ? 80 : 0} theme="light"
        style={{ borderRight: '1px solid #eef1f3', boxShadow: '2px 0 12px rgba(15,76,92,0.05)', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>
        <div style={{ padding: collapsed ? '20px 8px' : '20px 20px', borderBottom: '1px solid #f5f6f7' }}>
          <Brand collapsed={collapsed} height={collapsed ? 32 : 28} sub="Биллинг · Админ" />
        </div>
        <Menu mode="inline" selectedKeys={[loc.pathname]} items={items} onClick={(e) => nav(e.key)}
          style={{ borderInlineEnd: 0, marginTop: 12, fontSize: 14.5 }} />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', height: 64, lineHeight: 'normal', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid #e8ecef', position: 'sticky', top: 0, zIndex: 10,
          boxShadow: '0 1px 8px rgba(15,76,92,0.05)' }}>
          <Text strong style={{ fontSize: 18 }}>{currentLabel}</Text>
          <Dropdown menu={userMenu} trigger={['click']}>
            <Button type="text" style={{ height: 48, padding: '0 10px' }}>
              <Space>
                <Avatar size={34} style={{ background: LNP_PRIMARY }}>{name.slice(0, 1).toUpperCase()}</Avatar>
                {screens.sm && (
                  <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#8a97a0' }}>{identity?.role || 'ADMIN'}</div>
                  </span>
                )}
                <DownOutlined style={{ fontSize: 10, color: '#8a97a0' }} />
              </Space>
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24, background: '#f4f6f8' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}><Outlet /></div>
        </Content>
      </Layout>
    </Layout>
  );
};
