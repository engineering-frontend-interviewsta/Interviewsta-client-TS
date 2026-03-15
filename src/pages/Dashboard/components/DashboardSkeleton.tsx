import './DashboardSkeleton.css';

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="dashboard-skeleton__inner">
        <div className="dashboard-skeleton__header" />
        <div className="dashboard-skeleton__grid">
          <div className="dashboard-skeleton__card" />
          <div className="dashboard-skeleton__card dashboard-skeleton__card--delay-1" />
          <div className="dashboard-skeleton__card dashboard-skeleton__card--delay-2" />
          <div className="dashboard-skeleton__card dashboard-skeleton__card--delay-3" />
        </div>
        <div className="dashboard-skeleton__blocks">
          <div className="dashboard-skeleton__block" />
          <div className="dashboard-skeleton__block dashboard-skeleton__block--delay" />
        </div>
      </div>
    </div>
  );
}
