import type { LucideIcon } from 'lucide-react';

interface TermsSectionProps {
  icon: LucideIcon;
  title: string;
  items: string[];
}

export default function TermsSection({ icon: Icon, title, items }: TermsSectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
      </div>
      <ul className="list-disc list-inside space-y-2 text-neutral-600 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
