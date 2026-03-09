import { Link } from 'react-router-dom';
import { Brain, Target, Heart, Zap, Users } from 'lucide-react';
import { ROUTES } from '../../constants/routerConstants';
import ValueCard from './components/ValueCard';
import MilestoneItem from './components/MilestoneItem';

const values = [
  { icon: Target, title: 'Mission-Driven', description: 'We exist to help people land their dream jobs through better interview preparation' },
  { icon: Heart, title: 'Empathy First', description: 'We understand the stress of interviews and design our tools with compassion' },
  { icon: Zap, title: 'Innovation', description: 'We leverage cutting-edge AI to provide the most realistic practice experience' },
  { icon: Users, title: 'Community', description: 'We build tools that bring people together and celebrate collective success' },
];

const milestones = [
  { year: '2024', title: 'Beginning of the initiative', description: 'Started with a vision to democratize interview prep' },
  { year: 'September, 2025', title: 'Worked on Resume Analysis', description: 'Transformed resume analysis with AI-driven insights' },
  { year: 'October, 2025', title: 'Introduced Glee', description: 'Launched Glee, our revolutionary AI interviewer' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium text-sm">About Interviewsta</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Empowering Careers Through{' '}
            <span className="text-blue-600 block">AI-Powered Preparation</span>
          </h1>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            We help professionals worldwide prepare for interviews with AI-driven practice, feedback,
            and coaching.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Our values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item) => (
              <ValueCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Milestones</h2>
          <div className="space-y-6">
            {milestones.map((item) => (
              <MilestoneItem key={item.year} {...item} />
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link
            to={ROUTES.SIGNUP}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
}
