import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import './TeacherStudents.css';

export default function TeacherStudents() {
  return (
    <div className="teacher-students">
      <div className="teacher-students__inner">
        <h1 className="teacher-students__title">Students</h1>
        <p className="teacher-students__subtitle">Student list and performance. (To be migrated.)</p>
        <Link to={ROUTES.DASHBOARD} className="teacher-students__back">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
