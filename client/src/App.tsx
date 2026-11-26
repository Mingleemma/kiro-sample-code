import { Layout } from './components/Layout';
import { useHashRoute } from './hooks/useHashRoute';
import { JournalPage } from './pages/JournalPage';
import { TodayPage } from './pages/TodayPage';
import { TrendsPage } from './pages/TrendsPage';

export function App() {
  const route = useHashRoute();
  return (
    <Layout route={route}>
      {route === 'today' && <TodayPage />}
      {route === 'journal' && <JournalPage />}
      {route === 'trends' && <TrendsPage />}
    </Layout>
  );
}
