import { ROUTES } from '../../constants/routerConstants';
import AppStickyBackBar from '../../components/shared/AppStickyBackBar';
import './ResumeGeneration.css';

export default function ResumeGeneration() {
  return (
    <div className="resume-generation">
      <div className="resume-generation__inner">
        <AppStickyBackBar to={ROUTES.DASHBOARD}>Back to Dashboard</AppStickyBackBar>
        <h1 className="resume-generation__title">Resume Generation</h1>
        <p className="resume-generation__subtitle">
          Create or improve your resume. (To be migrated.)
        </p>
      </div>
    </div>
  );
}
