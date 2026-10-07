import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AgentsPage } from './pages/AgentsPage'
import { DashboardPage } from './pages/DashboardPage'
import { DevicesPage } from './pages/DevicesPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}