import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RecordCreatePage from './pages/RecordCreatePage';
import RecordDetailPage from './pages/RecordDetailPage';
import RecordListPage from './pages/RecordListPage';
import ReportPage from './pages/ReportPage';
import MyPage from './pages/MyPage';

function App() {
  const { token, initialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!initialized) {
    return null;
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="records" element={<RecordListPage />} />
        <Route path="records/new" element={<RecordCreatePage />} />
        <Route path="records/:id" element={<RecordDetailPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="mypage" element={<MyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
