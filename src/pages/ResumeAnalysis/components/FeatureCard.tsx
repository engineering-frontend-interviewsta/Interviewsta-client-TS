import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
      <Icon className="h-8 w-8 text-blue-600 mb-3" />
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h2>
      <p className="text-neutral-600 text-sm">{description}</p>
    </div>
  );
}
