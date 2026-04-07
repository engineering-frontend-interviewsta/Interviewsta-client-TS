import type { ReactNode } from 'react';
import './FeedbackReportSections.css';

type FeedbackReportSectionHeaderProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
};

/** Shared 01–07 style section chrome for rich video feedback (experimental TestFeedback parity). */
export default function FeedbackReportSectionHeader({
  eyebrow,
  title,
  children,
}: FeedbackReportSectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header__eyebrow">{eyebrow}</div>
      <div className="section-header__title">{title}</div>
      {children != null && children !== false ? (
        <div className="section-header__body">{children}</div>
      ) : null}
    </div>
  );
}
