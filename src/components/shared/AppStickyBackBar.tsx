import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export type AppStickyBackBarProps =
  | { to: string; onClick?: undefined; children?: React.ReactNode }
  | { onClick: () => void; to?: undefined; children?: React.ReactNode };

export default function AppStickyBackBar(props: AppStickyBackBarProps) {
  const barClass = 'app-sticky-back-bar';
  const label = props.children ?? 'Back to dashboard';
  const inner = (
    <>
      <ArrowLeft aria-hidden className="app-sticky-back-bar__icon" size={18} strokeWidth={2} />
      <span className="app-sticky-back-bar__label">{label}</span>
    </>
  );

  if ('onClick' in props && typeof props.onClick === 'function') {
    return (
      <div className={barClass}>
        <button type="button" className="app-sticky-back-bar__control" onClick={props.onClick}>
          {inner}
        </button>
      </div>
    );
  }

  return (
    <div className={barClass}>
      <Link to={props.to} className="app-sticky-back-bar__control">
        {inner}
      </Link>
    </div>
  );
}
