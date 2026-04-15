import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardPage from './pages/DashboardPage';
import QuizConfigPage from './pages/QuizConfigPage';
import QuizPage from './pages/QuizPage';
import UserOverviewPage from './pages/admin/UserOverviewPage';
import ResultsPage from './pages/ResultsPage';
import SessionsPage from './pages/SessionsPage';
import SessionReviewPage from './pages/SessionReviewPage';
import BookmarksPage from './pages/BookmarksPage';
import AdminLayout from './pages/admin/AdminLayout';
import ManageTopicsPage from './pages/admin/ManageTopicsPage';
import ImportQuestionsPage from './pages/admin/ImportQuestionsPage';
import ErrorReportsPage from './pages/admin/ErrorReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          }/>
          <Route path="/quiz/config" element={
            <ProtectedRoute><QuizConfigPage /></ProtectedRoute>
          }/>
          <Route path="/quiz/play" element={
            <ProtectedRoute><QuizPage /></ProtectedRoute>
          }/>
          <Route path="/quiz/results" element={
            <ProtectedRoute><ResultsPage /></ProtectedRoute>
          }/>
          <Route path="/sessions" element={
            <ProtectedRoute><SessionsPage /></ProtectedRoute>
          }/>
          <Route path="/admin/users" element={<UserOverviewPage />} />
          <Route path="/sessions/:id" element={
            <ProtectedRoute><SessionReviewPage /></ProtectedRoute>
          }/>
          <Route path="/bookmarks" element={
            <ProtectedRoute><BookmarksPage /></ProtectedRoute>
          }/>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
          }>
            <Route path="topics" element={<ManageTopicsPage />} />
            <Route path="import" element={<ImportQuestionsPage />} />
            <Route path="errors" element={<ErrorReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}