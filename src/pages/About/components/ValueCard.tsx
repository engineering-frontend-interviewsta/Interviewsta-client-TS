import type { LucideIcon } from 'lucide-react';

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function ValueCard({ icon: Icon, title, description }: ValueCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
      <Icon className="h-8 w-8 text-blue-600 mb-3" />
      <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm">{description}</p>
    </div>
  );
}
