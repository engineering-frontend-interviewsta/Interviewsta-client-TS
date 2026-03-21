import { X, ChevronRight } from 'lucide-react';
import type { ConsultingTopic } from '../../../constants/interviewTypes';
import './ConsultingTopicSelector.css';

interface ConsultingTopicSelectorProps {
  isOpen: boolean;
  topics: readonly ConsultingTopic[];
  onSelect: (topic: ConsultingTopic) => void;
  onClose: () => void;
}

export default function ConsultingTopicSelector({
  isOpen,
  topics,
  onSelect,
  onClose,
}: ConsultingTopicSelectorProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="topic-selector"
      role="dialog"
      aria-modal="true"
      aria-label="Select a consulting topic"
      onClick={handleBackdropClick}
    >
      <div className="topic-selector__panel">
        <div className="topic-selector__header">
          <div>
            <h2 className="topic-selector__title">Choose a Consulting Topic</h2>
            <p className="topic-selector__subtitle">
              Pick a topic and Glee will present a case tailored to that framework.
            </p>
          </div>
          <button
            type="button"
            className="topic-selector__close"
            onClick={onClose}
            aria-label="Close topic selector"
          >
            <X aria-hidden />
          </button>
        </div>

        <ul className="topic-selector__list" role="list">
          {topics.map((topic) => (
            <li key={topic.slug}>
              <button
                type="button"
                className="topic-selector__item"
                onClick={() => onSelect(topic)}
              >
                <div className="topic-selector__item-body">
                  <span className="topic-selector__item-name">{topic.name}</span>
                  <span className="topic-selector__item-description">{topic.description}</span>
                  <div className="topic-selector__item-frameworks">
                    {topic.frameworks.map((fw) => (
                      <span key={fw} className="topic-selector__framework-tag">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="topic-selector__item-arrow" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
