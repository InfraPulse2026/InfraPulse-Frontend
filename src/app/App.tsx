import { Component, lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, Protected } from '../features/auth/auth';
import Login from '../features/auth/auth';
import { retryRead } from '../api/client';
import { Loading, Empty } from '../components/shared';
import Shell from './Shell';
const Overview = lazy(() => import('../features/overview/Overview'));
const Sources = lazy(() => import('../features/sources/Sources'));
const SourceDetail = lazy(() =>
  import('../features/sources/Sources').then((m) => ({ default: m.SourceDetail })),
);
const Collectors = lazy(() => import('../features/collectors/Collectors'));
const CollectorDetail = lazy(() =>
  import('../features/collectors/Collectors').then((m) => ({ default: m.CollectorDetail })),
);
const Assets = lazy(() => import('../features/assets/Assets'));
const AssetDetail = lazy(() => import('../features/assets/AssetDetail'));
const Topology = lazy(() => import('../features/topology/Topology'));
const Locations = lazy(() => import('../features/locations/Locations'));
const LocationDetail = lazy(() =>
  import('../features/locations/Locations').then((m) => ({ default: m.LocationDetail })),
);
const Incidents = lazy(() => import('../features/incidents/Incidents'));
const IncidentDetail = lazy(() =>
  import('../features/incidents/Incidents').then((m) => ({ default: m.IncidentDetail })),
);
const SignalDetail = lazy(() =>
  import('../features/incidents/Incidents').then((m) => ({ default: m.SignalDetail })),
);
const Logs = lazy(() => import('../features/logs/Logs'));
const Telephony = lazy(() => import('../features/telephony/Telephony'));
const TelephonyDetail = lazy(() =>
  import('../features/telephony/Telephony').then((m) => ({ default: m.TelephonyDetail })),
);
const Configuration = lazy(() => import('../features/configuration/Configuration'));
const RemediationDetail = lazy(() =>
  import('../features/configuration/Configuration').then((m) => ({ default: m.RemediationDetail })),
);
const Automation = lazy(() => import('../features/automation/Automation'));
const AutomationDetail = lazy(() =>
  import('../features/automation/Automation').then((m) => ({ default: m.AutomationDetail })),
);
const Reports = lazy(() => import('../features/reports/Reports'));
const Admin = lazy(() => import('../features/admin/Admin'));
const PKI = lazy(() => import('../features/collectors/PKI'));
const Account = lazy(() => import('../features/auth/Account'));
const Commands = lazy(() => import('../features/automation/Commands'));
const CommandDetail = lazy(() =>
  import('../features/automation/Commands').then((m) => ({ default: m.CommandDetail })),
);
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        gcTime: 5 * 60_000,
        retry: retryRead,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
      },
      mutations: { retry: false, gcTime: 0 },
    },
  });
}
const client = createQueryClient();
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  element={
                    <Protected>
                      <Shell />
                    </Protected>
                  }
                >
                  <Route index element={<Navigate to="/overview" replace />} />
                  <Route path="/overview" element={<Overview />} />
                  <Route path="/sources" element={<Sources />} />
                  <Route path="/sources/:sourceId" element={<SourceDetail />} />
                  <Route path="/collectors" element={<Collectors />} />
                  <Route path="/collectors/:collectorId" element={<CollectorDetail />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/assets/:assetId" element={<AssetDetail />} />
                  <Route path="/topology" element={<Topology />} />
                  <Route path="/locations" element={<Locations />} />
                  <Route path="/locations/:locationId" element={<LocationDetail />} />
                  <Route path="/incidents" element={<Incidents />} />
                  <Route path="/incidents/:incidentId" element={<IncidentDetail />} />
                  <Route path="/incidents/signals/:incidentId" element={<SignalDetail />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/telephony" element={<Telephony />} />
                  <Route path="/telephony/:targetId" element={<TelephonyDetail />} />
                  <Route path="/configuration/drift" element={<Configuration />} />
                  <Route path="/configuration/:assetId" element={<Configuration />} />
                  <Route path="/automation/jobs" element={<Automation />} />
                  <Route path="/automation/jobs/:jobId" element={<AutomationDetail />} />
                  <Route path="/automation/commands" element={<Commands />} />
                  <Route path="/automation/commands/:commandId" element={<CommandDetail />} />
                  <Route
                    path="/automation/remediations/:remediationId"
                    element={<RemediationDetail />}
                  />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/admin/users" element={<Admin />} />
                  <Route path="/security/pki" element={<PKI />} />
                  <Route path="/account" element={<Account />} />
                  <Route
                    path="/403"
                    element={
                      <Empty title="Доступ запрещён">
                        Обратитесь к администратору за необходимой ролью.
                      </Empty>
                    }
                  />
                  <Route
                    path="/503"
                    element={
                      <Empty title="Backend недоступен">
                        Проверьте подключение и состояние сервера.
                      </Empty>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Empty title="Страница не найдена">
                        <Link to="/overview">Вернуться в обзор</Link>
                      </Empty>
                    }
                  />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="boot">
        <Empty title="Не удалось отобразить страницу">
          Данные могут отличаться от согласованного API.{' '}
          <button onClick={() => window.location.reload()}>Перезагрузить интерфейс</button>
        </Empty>
      </div>
    ) : (
      this.props.children
    );
  }
}
