import { Navigate, Route, Routes } from 'react-router-dom';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { CustomerProvider } from './store/CustomerStore';
import { ToastProvider } from './store/ToastProvider';

export function App() {
  return (
    <CustomerProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<DirectoryPage />} />
          <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="*" element={<Navigate to="/customers" replace />} />
        </Routes>
      </ToastProvider>
    </CustomerProvider>
  );
}
