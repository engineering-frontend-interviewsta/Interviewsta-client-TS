import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ROUTES } from '../../constants/routerConstants';
import './Learning.css';

const TOPICS = [
  { to: ROUTES.LEARNING_ARRAYS, title: 'Arrays', description: 'Two pointers, sliding window, prefix sum' },
];

export default function Learning() {
  return (
    <div className="learning">
      <div className="learning__inner">
        <header className="learning__header">
          <h1 className="learning__title">Learning</h1>
          <p className="learning__subtitle">
            Concepts, practice, and video solutions for interview prep.
          </p>
        </header>
        <div className="learning__grid">
          {TOPICS.map((t) => (
            <Link key={t.to} to={t.to} className="learning__card">
              <span className="learning__card-icon" aria-hidden>
                <BookOpen />
              </span>
              <div>
                <h2 className="learning__card-title">{t.title}</h2>
                <p className="learning__card-description">{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link to={ROUTES.STUDENT_DASHBOARD} className="learning__back">
          <ArrowLeft aria-hidden />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
