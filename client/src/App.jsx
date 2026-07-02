import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import SimilarityCheckPage from './pages/SimilarityCheckPage.jsx';
import SimilarityDetailPage from './pages/SimilarityDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminProjectsPage from './pages/admin/AdminProjectsPage.jsx';
import AdminLogsPage from './pages/admin/AdminLogsPage.jsx';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--surface-canvas)',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '2px solid var(--color-mist)',
          borderTopColor: 'var(--color-deep-indigo)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/similarity-check" element={<SimilarityCheckPage />} />

        {/* Authenticated */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        } />
        <Route path="/similarity/:id" element={
          <ProtectedRoute>
            <SimilarityDetailPage />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly>
            <AdminUsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/projects" element={
          <ProtectedRoute adminOnly>
            <AdminProjectsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute adminOnly>
            <AdminLogsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute adminOnly>
            <AdminDepartmentsPage />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
