import { ROUTES } from '../../../constants/routerConstants';
import AppStickyBackBar from '../../../components/shared/AppStickyBackBar';
import './StudentInterviewHistory.css';

export default function StudentInterviewHistory() {
  return (
    <div className="student-interview-history">
      <div className="student-interview-history__inner">
        <AppStickyBackBar to={ROUTES.DASHBOARD}>Back to Dashboard</AppStickyBackBar>
        <h1 className="student-interview-history__title">Interview History</h1>
        <p className="student-interview-history__subtitle">Past video interviews and reports. (To be migrated.)</p>
      </div>
    </div>
  );
}
