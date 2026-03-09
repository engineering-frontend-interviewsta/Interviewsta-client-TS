interface MilestoneItemProps {
  year: string;
  title: string;
  description: string;
}

export default function MilestoneItem({ year, title, description }: MilestoneItemProps) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-neutral-200">
      <span className="font-semibold text-blue-600 shrink-0">{year}</span>
      <div>
        <h3 className="font-medium text-neutral-900">{title}</h3>
        <p className="text-neutral-600 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}
