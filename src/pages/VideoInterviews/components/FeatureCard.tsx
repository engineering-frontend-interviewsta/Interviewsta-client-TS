import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  details?: string[];
}

export default function FeatureCard({ icon: Icon, title, description, details = [] }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
      <Icon className="h-8 w-8 text-blue-600 mb-3" />
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h2>
      <p className="text-neutral-600 text-sm mb-3">{description}</p>
      {details.length > 0 && (
        <ul className="text-neutral-500 text-sm space-y-1">
          {details.map((d) => (
            <li key={d}>• {d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
