import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMenu, useLogout, useGetIdentity } from '@refinedev/core';
import { Menu, Button, Space, Grid, Dropdown, Avatar, Typography, Drawer } from 'antd';
import {
  LogoutOutlined, UserOutlined, DownOutlined, ApiOutlined,
  MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Brand, LNP_PRIMARY } from './Brand.jsx';
import { API_BASE } from '../constants.js';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const GAP = 16;
const SIDE_W = 258;
const SIDE_W_COLLAPSED = 84;
const PAGE_BG = 'linear-gradient(165deg, #e9f0f2 0%, #f3f6f7 42%, #eef3f4 100%)';
const PANEL = { background: '#ffffff', border: '1px solid #eaeef0', boxShadow: '0 8px 30px rgba(15,76,92,0.07)' };

export const AdminLayout = () => {
  const { menuItems, selectedKey } = useMenu();
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity();
  const nav = useNavigate();
  const loc = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [loc.pathname]);

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

  const SidebarBody = ({ mini = false, inDrawer = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: mini ? '22px 0' : '22px 22px 18px' }}>
        <Brand collapsed={mini} height={mini ? 26 : 30} sub="Биллинг · Админ" />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 10px 8px' }}>
        <Menu mode="inline" inlineCollapsed={mini} selectedKeys={[loc.pathname]} items={items}
          onClick={(e) => { nav(e.key); if (inDrawer) setDrawerOpen(false); }}
          style={{ borderInlineEnd: 0, background: 'transparent', fontSize: 14.5 }} />
      </div>
      {!mini && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f4f5' }}>
          <Button block type="text" danger icon={<LogoutOutlined />} onClick={() => logout()}
            style={{ justifyContent: 'flex-start', height: 40, borderRadius: 10, fontWeight: 500 }}>
            Выйти
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, display: 'flex', gap: GAP, padding: isMobile ? 12 : GAP }}>
      {!isMobile && (
        <aside style={{
          width: collapsed ? SIDE_W_COLLAPSED : SIDE_W, flex: '0 0 auto',
          transition: 'width .22s cubic-bezier(.4,0,.2,1)',
          position: 'sticky', top: GAP, alignSelf: 'flex-start',
          height: `calc(100vh - ${GAP * 2}px)`,
          borderRadius: 22, overflow: 'hidden', ...PANEL,
        }}>
          <SidebarBody mini={collapsed} />
        </aside>
      )}

      <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        width={272} closable={false} styles={{ body: { padding: 0 }, content: { borderRadius: '0 20px 20px 0', overflow: 'hidden' } }}>
        <SidebarBody inDrawer />
      </Drawer>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: GAP }}>
        <header style={{
          height: 66, borderRadius: 18, padding: '0 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: isMobile ? 12 : GAP, zIndex: 20, ...PANEL,
        }}>
          <Space size={6}>
            <Button type="text" shape="circle" style={{ width: 40, height: 40 }}
              icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed((c) => !c))} />
            <Text strong style={{ fontSize: 17, letterSpacing: -0.2 }}>{currentLabel}</Text>
          </Space>

          <Dropdown menu={userMenu} trigger={['click']}>
            <Button type="text" style={{ height: 50, padding: isMobile ? '0 6px' : '0 8px', borderRadius: 12 }}>
              <Space size={8}>
                <Avatar size={36} src={identity?.avatar || undefined} style={{ background: LNP_PRIMARY, flex: '0 0 auto' }}>
                  {name.slice(0, 1).toUpperCase()}
                </Avatar>
                {screens.sm && (
                  <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2a30' }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#8a97a0' }}>{identity?.role || 'ADMIN'}</div>
                  </span>
                )}
                {screens.sm && <DownOutlined style={{ fontSize: 10, color: '#9aa5ad' }} />}
              </Space>
            </Button>
          </Dropdown>
        </header>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%' }}><Outlet /></div>
        </main>
      </div>
    </div>
  );
};
