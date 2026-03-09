import { Link } from 'react-router-dom';
import { Search, Target, Award, TrendingUp } from 'lucide-react';
import { ROUTES } from '../../constants/routerConstants';
import FeatureCard from './components/FeatureCard';
import AnalysisAreasList from './components/AnalysisAreasList';

const features = [
  {
    icon: Search,
    title: 'ATS Optimization',
    description: 'Ensure your resume passes Applicant Tracking Systems with keyword analysis and formatting suggestions.',
  },
  {
    icon: Target,
    title: 'Content Review',
    description: 'Get feedback on your achievements, experience descriptions, and overall narrative.',
  },
  {
    icon: Award,
    title: 'Impact Analysis',
    description: 'Learn how to quantify achievements and demonstrate your value to potential employers.',
  },
  {
    icon: TrendingUp,
    title: 'Industry Alignment',
    description: 'Tailor your resume to match industry standards and role-specific requirements.',
  },
];

const analysisAreas = [
  'Keyword optimization for ATS systems',
  'Formatting and visual hierarchy',
  'Action verb usage and impact statements',
  'Quantifiable achievements and metrics',
  'Skills section relevance',
  'Experience description clarity',
];

export default function ResumeAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Resume analysis</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            AI-powered feedback to improve your resume and pass ATS checks.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {features.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">What we analyze</h2>
          <AnalysisAreasList areas={analysisAreas} />
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
