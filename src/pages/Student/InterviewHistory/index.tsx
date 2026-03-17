import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routerConstants';
import './StudentInterviewHistory.css';

export default function StudentInterviewHistory() {
  return (
    <div className="student-interview-history">
      <div className="student-interview-history__inner">
        <h1 className="student-interview-history__title">Interview History</h1>
        <p className="student-interview-history__subtitle">Past video interviews and reports. (To be migrated.)</p>
        <Link to={ROUTES.DASHBOARD} className="student-interview-history__back">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
