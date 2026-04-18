import { ROUTES } from '../../../constants/routerConstants';
import AppStickyBackBar from '../../../components/shared/AppStickyBackBar';
import './TeacherStudents.css';

export default function TeacherStudents() {
  return (
    <div className="teacher-students">
      <div className="teacher-students__inner">
        <AppStickyBackBar to={ROUTES.DASHBOARD}>Back to Dashboard</AppStickyBackBar>
        <h1 className="teacher-students__title">Students</h1>
        <p className="teacher-students__subtitle">Student list and performance. (To be migrated.)</p>
      </div>
    </div>
  );
}
