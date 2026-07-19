import { Refine, Authenticated } from '@refinedev/core';
import { ErrorComponent, useNotificationProvider } from '@refinedev/antd';
import { LNP_PRIMARY } from './components/Brand.jsx';
import { AdminLayout } from './components/AdminLayout.jsx';
import routerBindings, {
  NavigateToResource, CatchAllNavigate, UnsavedChangesNotifier, DocumentTitleHandler,
} from '@refinedev/react-router-v6';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import {
  DashboardOutlined, TeamOutlined, WalletOutlined, SwapOutlined,
  TransactionOutlined, SafetyCertificateOutlined, ProfileOutlined, CreditCardOutlined, MobileOutlined, SafetyOutlined, RiseOutlined,
} from '@ant-design/icons';
import '@refinedev/antd/dist/reset.css';

import { authProvider } from './authProvider.js';
import { dataProvider } from './dataProvider.js';
import { LoginPage } from './pages/login.jsx';
import { Dashboard } from './pages/dashboard.jsx';
import { Analytics } from './pages/analytics.jsx';
import { AdminProfile } from './pages/profile.jsx';
import { ClientList } from './pages/clients/list.jsx';
import { ClientCreate } from './pages/clients/create.jsx';
import { ClientEdit } from './pages/clients/edit.jsx';
import { ClientShow } from './pages/clients/show.jsx';
import { DepositList } from './pages/deposits/list.jsx';
import { DepositCreate } from './pages/deposits/create.jsx';
import { AllocationList } from './pages/allocations/list.jsx';
import { TransactionList } from './pages/transactions/list.jsx';
import { IpWhitelistList } from './pages/ipwhitelist/list.jsx';
import { LedgerList } from './pages/ledger/list.jsx';
import { CardApplicationList } from './pages/cardApplications/list.jsx';
import { EsimList } from './pages/esims/list.jsx';
import { VpnKeyList } from './pages/vpnKeys/list.jsx';
import { AmlCheckList } from './pages/aml/list.jsx';
import { TransitList } from './pages/transit/list.jsx';
import { ApiLogList } from './pages/apiLogs/list.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={{ token: { colorPrimary: LNP_PRIMARY, colorInfo: LNP_PRIMARY, borderRadius: 8 }, components: { Menu: { itemSelectedBg: '#e8f2f4', itemSelectedColor: LNP_PRIMARY } } }}>
        <AntdApp>
          <Refine
            authProvider={authProvider}
            dataProvider={dataProvider}
            routerProvider={routerBindings}
            notificationProvider={useNotificationProvider}
            resources={[
              { name: 'dashboard', list: '/', meta: { label: 'Обзор', icon: <DashboardOutlined /> } },
              { name: 'analytics', list: '/analytics', meta: { label: 'Аналитика', icon: <RiseOutlined /> } },
              { name: 'clients', list: '/clients', create: '/clients/create', edit: '/clients/edit/:id', show: '/clients/show/:id',
                meta: { label: 'Клиенты', icon: <TeamOutlined /> } },
              { name: 'deposits', list: '/deposits', create: '/deposits/create', meta: { label: 'Депозиты (USDT)', icon: <WalletOutlined /> } },
              { name: 'allocations', list: '/allocations', meta: { label: 'Распределение', icon: <SwapOutlined /> } },
              { name: 'transactions', list: '/transactions', meta: { label: 'Транзакции', icon: <TransactionOutlined /> } },
              { name: 'esims', list: '/esims', meta: { label: 'eSIM', icon: <MobileOutlined /> } },
              { name: 'vpn-keys', list: '/vpn-keys', meta: { label: 'VPN-ключи', icon: <SafetyOutlined /> } },
              { name: 'aml-checks', list: '/aml-checks', meta: { label: 'AML-проверки', icon: <SafetyCertificateOutlined /> } },
              { name: 'transit', list: '/transit', meta: { label: 'Транзитные кошельки', icon: <WalletOutlined /> } },
              { name: 'card-applications', list: '/card-applications', meta: { label: 'Заявки на карты', icon: <CreditCardOutlined /> } },
              { name: 'ip-whitelist', list: '/ip-whitelist', meta: { label: 'Белые IP', icon: <SafetyCertificateOutlined /> } },
              { name: 'api-logs', list: '/api-logs', meta: { label: 'API-логи', icon: <ProfileOutlined /> } },
              { name: 'ledger', list: '/ledger', meta: { label: 'Ledger', icon: <ProfileOutlined /> } },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: true, disableTelemetry: true }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="auth" fallback={<CatchAllNavigate to="/login" />}>
                    <AdminLayout />
                  </Authenticated>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<AdminProfile />} />
                <Route path="/clients">
                  <Route index element={<ClientList />} />
                  <Route path="create" element={<ClientCreate />} />
                  <Route path="edit/:id" element={<ClientEdit />} />
                  <Route path="show/:id" element={<ClientShow />} />
                </Route>
                <Route path="/deposits">
                  <Route index element={<DepositList />} />
                  <Route path="create" element={<DepositCreate />} />
                </Route>
                <Route path="/allocations" element={<AllocationList />} />
                <Route path="/transactions" element={<TransactionList />} />
                <Route path="/esims" element={<EsimList />} />
                <Route path="/vpn-keys" element={<VpnKeyList />} />
                <Route path="/aml-checks" element={<AmlCheckList />} />
                <Route path="/transit" element={<TransitList />} />
                <Route path="/card-applications" element={<CardApplicationList />} />
                <Route path="/ip-whitelist" element={<IpWhitelistList />} />
                <Route path="/api-logs" element={<ApiLogList />} />
                <Route path="/ledger" element={<LedgerList />} />
                <Route path="*" element={<ErrorComponent />} />
              </Route>

              <Route
                element={
                  <Authenticated key="no-auth" fallback={<Outlet />}>
                    <NavigateToResource resource="dashboard" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Routes>

            <UnsavedChangesNotifier />
            <DocumentTitleHandler
              handler={({ resource, action }) => {
                const base = 'Love&Pay · Админ';
                const label = resource?.meta?.label;
                const actions = { list: '', create: 'Создание', edit: 'Редактирование', show: 'Просмотр', clone: 'Клон' };
                if (label) return `${actions[action] ? actions[action] + ' · ' : ''}${label} — ${base}`;
                return base;
              }}
            />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}
