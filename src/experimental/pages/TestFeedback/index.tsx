import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ROUTES } from '../../../constants/routerConstants';
import feedbackInnerHtml from './feedback-inner.html?raw';
import './TestFeedback.css';

/**
 * Experimental static mock of a rich interview feedback report.
 * Styles use site CSS variables (purple theme) via `TestFeedback.css`.
 */
export default function TestFeedback() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const fills = root.querySelectorAll<HTMLElement>('.metric-bar-fill');
    fills.forEach((el) => {
      const w = el.style.width;
      el.style.width = '0%';
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          el.style.width = w;
        }, 200);
      });
    });
  }, []);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const btn = root.querySelector<HTMLButtonElement>('[data-tf-book]');
    if (!btn) return;
    const onBook = () => {
      navigate(ROUTES.VIDEO_INTERVIEW);
    };
    btn.addEventListener('click', onBook);
    return () => btn.removeEventListener('click', onBook);
  }, [navigate]);

  return (
    <div
      className="exp-test-feedback-root exp-test-feedback flex min-h-0 min-w-0 w-full flex-1 flex-col text-left"
      data-page="experimental-test-feedback"
    >
      <nav className="topbar" aria-label="Report">
        <Link className="topbar__back" to={ROUTES.STUDENT_DASHBOARD}>
          <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
          Dashboard
        </Link>
        <div className="topbar__right">
          <span className="topbar__date">14 Jul 2025 · 11:42 AM</span>
          <span className="topbar__badge">FAANG · Technical</span>
        </div>
      </nav>
      <div ref={contentRef} dangerouslySetInnerHTML={{ __html: feedbackInnerHtml }} />
    </div>
  );
}
