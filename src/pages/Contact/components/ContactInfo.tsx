import type { LucideIcon } from 'lucide-react';

interface ContactItem {
  icon: LucideIcon;
  title: string;
  details: string;
  description: string;
}

interface ContactInfoProps {
  items: ContactItem[];
}

export default function ContactInfo({ items }: ContactInfoProps) {
  return (
    <div className="space-y-4">
      {items.map(({ icon: Icon, title, details, description }) => (
        <div key={title} className="flex gap-3">
          <Icon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-neutral-900">{title}</p>
            <p className="text-neutral-600 text-sm">{details}</p>
            <p className="text-neutral-500 text-xs mt-1">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
