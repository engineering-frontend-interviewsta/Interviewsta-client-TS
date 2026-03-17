import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import './TeacherSchedule.css';

export default function TeacherSchedule() {
  return (
    <div className="teacher-schedule">
      <div className="teacher-schedule__inner">
        <h1 className="teacher-schedule__title">Schedule</h1>
        <p className="teacher-schedule__subtitle">Time slots and availability. (To be migrated.)</p>
        <Link to={ROUTES.DASHBOARD} className="teacher-schedule__back">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
