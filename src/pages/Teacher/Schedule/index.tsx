import { ROUTES } from '../../../constants/routerConstants';
import AppStickyBackBar from '../../../components/shared/AppStickyBackBar';
import './TeacherSchedule.css';

export default function TeacherSchedule() {
  return (
    <div className="teacher-schedule">
      <div className="teacher-schedule__inner">
        <AppStickyBackBar to={ROUTES.DASHBOARD}>Back to Dashboard</AppStickyBackBar>
        <h1 className="teacher-schedule__title">Schedule</h1>
        <p className="teacher-schedule__subtitle">Time slots and availability. (To be migrated.)</p>
      </div>
    </div>
  );
}
