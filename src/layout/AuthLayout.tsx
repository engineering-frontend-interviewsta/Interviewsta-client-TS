import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/** Full-screen auth flows without marketing header or footer. */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}
