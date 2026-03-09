import { Link } from 'react-router-dom';
import { Bot, Video, MessageCircle, BarChart3 } from 'lucide-react';
import { ROUTES } from '../../constants/routerConstants';
import { useAuth } from '../../context/AuthContext';
import FeatureCard from './components/FeatureCard';

const features = [
  {
    icon: Bot,
    title: 'Meet Glee',
    description: 'Practice with our advanced AI interviewer who adapts to your responses in real-time.',
    details: ['Natural conversation flow', 'Contextual follow-up questions', 'Industry-specific scenarios'],
  },
  {
    icon: Video,
    title: 'Realistic Experience',
    description: 'Full video interview simulation that mirrors actual interview conditions.',
    details: ['Live video feed', 'Camera and audio controls', 'Professional interface'],
  },
  {
    icon: MessageCircle,
    title: 'Dynamic Questions',
    description: 'Questions adapt based on your role, experience level, and previous responses.',
    details: ['Technical deep-dives', 'Behavioral scenarios', 'Leadership challenges'],
  },
  {
    icon: BarChart3,
    title: 'Instant Feedback',
    description: 'Get detailed analysis of your performance immediately after the interview.',
    details: ['Communication assessment', 'Technical evaluation', 'Improvement suggestions'],
  },
];

export default function VideoInterviewsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Video interviews</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Practice with Glee, our AI interviewer. Technical, behavioral, and senior role interviews.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {features.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>

        <div className="text-center flex flex-wrap justify-center gap-4">
          {user ? (
            <Link
              to={ROUTES.VIDEO_INTERVIEW}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Start an interview
            </Link>
          ) : (
            <Link
              to={ROUTES.SIGNUP}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Get started
            </Link>
          )}
          {user && (
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
