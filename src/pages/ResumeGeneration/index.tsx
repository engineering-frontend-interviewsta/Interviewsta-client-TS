import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routerConstants';
import './ResumeGeneration.css';

export default function ResumeGeneration() {
  return (
    <div className="resume-generation">
      <div className="resume-generation__inner">
        <h1 className="resume-generation__title">Resume Generation</h1>
        <p className="resume-generation__subtitle">
          Create or improve your resume. (To be migrated.)
        </p>
        <Link to={ROUTES.DASHBOARD} className="resume-generation__back">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
