import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/shared/ThemeToggle';
import './AuthLayout.css';

/** Full-screen auth flows without marketing header or footer. */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__theme">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
}
